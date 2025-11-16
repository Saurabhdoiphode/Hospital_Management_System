# Firebase Setup Guide

This guide will help you set up Firebase for the Hospital Management System.

## Step 1: Enable Firebase Services

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `hospital-management-syst-87670`
3. Enable the following services:

### Authentication
- Go to **Authentication** → **Get Started**
- Enable **Email/Password** sign-in method
- (Optional) Enable other sign-in methods as needed

### Firestore Database
- Go to **Firestore Database** → **Create Database**
- Start in **test mode** for development (you'll set up security rules later)
- Choose a location closest to your users

### Storage
- Go to **Storage** → **Get Started**
- Start in **test mode** for development
- Choose the same location as Firestore

## Step 2: Set Up Firestore Security Rules

Go to **Firestore Database** → **Rules** and add:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to get user role
    function getUserRole() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role;
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && request.auth.uid == userId;
      allow create: if isAuthenticated();
    }
    
    // Patients collection
    match /patients/{patientId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && 
        (getUserRole() == 'admin' || getUserRole() == 'receptionist');
      allow update, delete: if isAuthenticated() && 
        (getUserRole() == 'admin' || getUserRole() == 'receptionist');
    }
    
    // Appointments collection
    match /appointments/{appointmentId} {
      allow read: if isAuthenticated();
      allow create, update, delete: if isAuthenticated();
    }
    
    // Medical Records collection
    match /medicalRecords/{recordId} {
      allow read: if isAuthenticated() && 
        (getUserRole() == 'admin' || getUserRole() == 'doctor' || getUserRole() == 'nurse');
      allow create, update: if isAuthenticated() && 
        (getUserRole() == 'admin' || getUserRole() == 'doctor');
      allow delete: if isAuthenticated() && getUserRole() == 'admin';
    }
    
    // Billing collection
    match /billing/{billId} {
      allow read: if isAuthenticated();
      allow create, update: if isAuthenticated() && 
        (getUserRole() == 'admin' || getUserRole() == 'receptionist');
      allow delete: if isAuthenticated() && getUserRole() == 'admin';
    }
    
    // Inventory collection
    match /inventory/{itemId} {
      allow read: if isAuthenticated();
      allow create, update: if isAuthenticated() && 
        (getUserRole() == 'admin' || getUserRole() == 'receptionist');
      allow delete: if isAuthenticated() && getUserRole() == 'admin';
    }
  }
}
```

## Step 3: Set Up Storage Security Rules

Go to **Storage** → **Rules** and add:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Profile pictures
    match /profile-pictures/{userId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Medical documents
    match /medical-documents/{patientId}/{documentType}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'doctor', 'nurse']);
    }
  }
}
```

## Step 4: Create Indexes (Optional but Recommended)

For better query performance, create composite indexes in Firestore:

1. Go to **Firestore Database** → **Indexes**
2. Create indexes for:
   - `appointments`: `appointmentDate` (Ascending)
   - `appointments`: `doctor` + `appointmentDate` (Ascending)
   - `appointments`: `patient` + `appointmentDate` (Ascending)
   - `medicalRecords`: `patient` + `visitDate` (Descending)
   - `medicalRecords`: `doctor` + `visitDate` (Descending)
   - `billing`: `patient` + `invoiceDate` (Descending)

## Step 5: Enable Firebase in Your App

1. Open `client/src/context/AuthContext.js`
2. Change `USE_FIREBASE` from `false` to `true`:
   ```javascript
   const USE_FIREBASE = true;
   ```

## Step 6: Install Dependencies

Make sure Firebase is installed:
```bash
cd client
npm install firebase
```

## Step 7: Test Your Setup

1. Start the application:
   ```bash
   npm run dev
   ```

2. Try registering a new user through the app
3. Check Firebase Console to verify:
   - User appears in Authentication
   - User document created in Firestore `users` collection

## Troubleshooting

### Authentication Errors
- Make sure Email/Password is enabled in Firebase Console
- Check that your Firebase config in `config.js` is correct

### Firestore Permission Errors
- Verify security rules are properly set
- Check that user documents have the correct `role` field
- Ensure indexes are created for complex queries

### Storage Upload Errors
- Verify Storage is enabled
- Check Storage security rules
- Ensure file size limits are appropriate

## Next Steps

- Set up Firebase Cloud Messaging for push notifications
- Configure Firebase Hosting for production deployment
- Set up Firebase Functions for serverless operations
- Enable Firebase Analytics for usage tracking

For more information, see the [Firebase Documentation](https://firebase.google.com/docs).

