# Firebase Configuration Instructions

To enable Firebase mode:
1. Open `client/src/context/AuthContext.jsx` and set `USE_FIREBASE = true`.
2. Replace credentials in `client/src/firebase/config.js` with your Firebase Console web app settings.
3. In Firebase Console:
   - Enable Authentication (Email/Password).
   - Create a Firestore Database.
   - Configure Firestore Rules:
     ```
     rules_version = '2';
     service cloud.firestore {
       match /databases/{database}/documents {
         match /{document=**} {
           allow read, write: if request.auth != null;
         }
       }
     }
     ```
