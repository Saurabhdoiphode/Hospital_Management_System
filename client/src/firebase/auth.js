import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail
} from "firebase/auth";
import { auth } from "./config";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "./config";

// Register new user with Firebase Auth and create user document
export const registerUser = async (email, password, userData) => {
  try {
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update profile with display name
    if (userData.firstName && userData.lastName) {
      await updateProfile(user, {
        displayName: `${userData.firstName} ${userData.lastName}`
      });
    }

    // Create user document in Firestore
    const userDoc = {
      uid: user.uid,
      email: user.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role || 'patient',
      phone: userData.phone || '',
      address: userData.address || '',
      specialization: userData.specialization || '',
      licenseNumber: userData.licenseNumber || '',
      department: userData.department || '',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await setDoc(doc(db, "users", user.uid), userDoc);

    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        ...userDoc
      }
    };
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
};

// Login user with Firebase Auth
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid));
    
    if (!userDoc.exists()) {
      return {
        success: false,
        message: "User data not found"
      };
    }

    const userData = userDoc.data();

    if (!userData.isActive) {
      await signOut(auth);
      return {
        success: false,
        message: "Account is deactivated"
      };
    }

    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        ...userData
      }
    };
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
};

// Logout user
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
};

// Get current user
export const getCurrentUser = () => {
  return auth.currentUser;
};

// Listen to auth state changes
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Get user data from Firestore
export const getUserData = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      return {
        success: true,
        data: userDoc.data()
      };
    }
    return {
      success: false,
      message: "User not found"
    };
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
};

// Reset password
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return {
      success: true,
      message: "Password reset email sent"
    };
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
};

