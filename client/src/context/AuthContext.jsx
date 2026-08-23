import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';
import { auth } from '../firebase/config';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';

// Toggle between Firebase and Express Backend API
export const USE_FIREBASE = true;

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage first
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        setLoading(false);
        return;
      } catch (e) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }

    if (USE_FIREBASE) {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          setUser({
            id: firebaseUser.uid,
            name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
            email: firebaseUser.email,
            role: 'admin' // Default firebase role fallback
          });
        } else if (!storedUser) {
          setUser(null);
        }
        setLoading(false);
      });
      return unsubscribe;
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    // Try Express Backend API first for demo accounts or instant login
    try {
      const response = await API.post('/auth/login', { email, password });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      return user;
    } catch (backendErr) {
      // If backend fails, try Firebase if USE_FIREBASE is true
      if (USE_FIREBASE) {
        try {
          const creds = await signInWithEmailAndPassword(auth, email, password);
          const fbUser = {
            id: creds.user.uid,
            name: creds.user.displayName || email.split('@')[0],
            email: creds.user.email,
            role: 'admin'
          };
          localStorage.setItem('user', JSON.stringify(fbUser));
          setUser(fbUser);
          return fbUser;
        } catch (fbErr) {
          throw new Error(backendErr.response?.data?.message || fbErr.message || 'Invalid credentials');
        }
      }
      throw backendErr;
    }
  };

  const register = async (userData) => {
    // Register in Express Backend first to ensure persistence & RBAC role assignment
    try {
      const response = await API.post('/auth/register', userData);
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);

      // Optionally register in Firebase as well
      if (USE_FIREBASE) {
        try {
          await createUserWithEmailAndPassword(auth, userData.email, userData.password);
        } catch (fbErr) {
          console.warn("Firebase Auth create user notice:", fbErr.message);
        }
      }
      return user;
    } catch (backendErr) {
      if (USE_FIREBASE) {
        try {
          const creds = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
          const fbUser = {
            id: creds.user.uid,
            name: userData.name,
            email: creds.user.email,
            role: userData.role || 'patient'
          };
          localStorage.setItem('user', JSON.stringify(fbUser));
          setUser(fbUser);
          return fbUser;
        } catch (fbErr) {
          throw new Error(backendErr.response?.data?.message || fbErr.message || 'Registration failed');
        }
      }
      throw backendErr;
    }
  };

  const logout = async () => {
    if (USE_FIREBASE) {
      try {
        await signOut(auth);
      } catch (e) {
        console.warn('Firebase signout warning:', e);
      }
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, USE_FIREBASE }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
