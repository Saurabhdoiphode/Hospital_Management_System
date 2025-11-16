# Firebase Integration

This directory contains Firebase configuration and services for the Hospital Management System.

## Files

- `config.js` - Firebase initialization and configuration
- `auth.js` - Firebase Authentication services
- `firestore.js` - Firestore database operations
- `storage.js` - Firebase Storage for file uploads

## Setup

1. Firebase is already configured with your project credentials in `config.js`
2. Make sure Firebase Authentication and Firestore are enabled in your Firebase Console
3. Set up Firestore security rules in Firebase Console

## Usage

### Authentication

```javascript
import { loginUser, registerUser, logoutUser } from '../firebase/auth';

// Login
const result = await loginUser(email, password);

// Register
const result = await registerUser(email, password, {
  firstName: 'John',
  lastName: 'Doe',
  role: 'patient'
});

// Logout
await logoutUser();
```

### Firestore

```javascript
import { createPatient, getPatients } from '../firebase/firestore';

// Create patient
const result = await createPatient(patientData);

// Get patients
const result = await getPatients();
```

### Storage

```javascript
import { uploadProfilePicture } from '../firebase/storage';

// Upload file
const result = await uploadProfilePicture(file, userId);
```

## Switching Between Firebase and Backend API

In `AuthContext.js`, set `USE_FIREBASE` to `true` to use Firebase Auth, or `false` to use the backend API authentication.

## Firestore Security Rules

Make sure to set up proper security rules in Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /patients/{patientId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin' ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'receptionist');
    }
    
    // Add more rules for other collections
  }
}
```

