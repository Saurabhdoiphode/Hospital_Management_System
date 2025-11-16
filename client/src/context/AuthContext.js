import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { onAuthStateChange, getUserData, loginUser as firebaseLogin, logoutUser as firebaseLogout, registerUser as firebaseRegister } from '../firebase/auth';

const AuthContext = createContext();

// Set to true to use Firebase Auth, false to use backend API
const USE_FIREBASE = false;

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (USE_FIREBASE) {
      // Firebase Auth listener
      const unsubscribe = onAuthStateChange(async (firebaseUser) => {
        if (firebaseUser) {
          const result = await getUserData(firebaseUser.uid);
          if (result.success) {
            setUser({ uid: firebaseUser.uid, ...result.data });
          }
        } else {
          setUser(null);
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      // Backend API authentication
      const token = localStorage.getItem('token');
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        fetchUser();
      } else {
        setLoading(false);
      }
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await axios.get('/api/auth/me');
      if (response.data) {
        setUser(response.data);
      } else {
        throw new Error('No user data received');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    if (USE_FIREBASE) {
      const result = await firebaseLogin(email, password);
      if (result.success) {
        setUser(result.user);
      }
      return result;
    } else {
      try {
        console.log('Attempting login with email:', email);
        console.log('API endpoint: /api/auth/login');
        
        const response = await axios.post('/api/auth/login', { email, password });
        const { token, user } = response.data;
        
        if (!token || !user) {
          return {
            success: false,
            message: 'Invalid response from server'
          };
        }
        
        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Map user.id to _id for consistency
        const userData = {
          ...user,
          _id: user.id || user._id
        };
        
        setUser(userData);
        return { success: true };
      } catch (error) {
        console.error('Full Login error:', error);
        console.error('Error status:', error.response?.status);
        console.error('Error data:', error.response?.data);
        
        let errorMessage = 'Login failed';
        
        if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
          errorMessage = 'Network error: Please check if server is running on port 5000';
        } else if (error.response) {
          errorMessage = error.response?.data?.message || 
                        error.response?.data?.errors?.[0]?.msg || 
                        `Server error: ${error.response.status}`;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        console.error('Final error message:', errorMessage);
        return {
          success: false,
          message: errorMessage
        };
      }
    }
  };

  const register = async (email, password, userData) => {
    if (USE_FIREBASE) {
      return await firebaseRegister(email, password, userData);
    } else {
      try {
        const response = await axios.post('/api/auth/register', { email, password, ...userData });
        const { token, user } = response.data;
        
        if (!token || !user) {
          return {
            success: false,
            message: 'Invalid response from server'
          };
        }
        
        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Map user.id to _id for consistency
        const userDataMapped = {
          ...user,
          _id: user.id || user._id
        };
        
        setUser(userDataMapped);
        return { success: true };
      } catch (error) {
        console.error('Registration error:', error);
        let errorMessage = 'Registration failed';
        
        if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
          errorMessage = 'Network error: Please check if server is running on port 5000';
        } else if (error.response) {
          errorMessage = error.response?.data?.message || 
                        error.response?.data?.errors?.[0]?.msg || 
                        `Server error: ${error.response.status}`;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        return {
          success: false,
          message: errorMessage
        };
      }
    }
  };

  const logout = async () => {
    if (USE_FIREBASE) {
      await firebaseLogout();
      setUser(null);
    } else {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

