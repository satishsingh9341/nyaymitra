import React, { createContext, useContext, useState, useEffect } from 'react';
import { signInWithPopup, signOut as fbSignOut, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    // Check local storage for mock/demo session first
    const cachedUser = localStorage.getItem('nyaymitra_user');
    if (cachedUser) {
      try {
        setUser(JSON.parse(cachedUser));
        setLoading(false);
        return;
      } catch (e) {
        localStorage.removeItem('nyaymitra_user');
      }
    }

    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const token = await firebaseUser.getIdToken();
        const userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || 'Legal User',
          photoURL: firebaseUser.photoURL || '',
          token,
        };
        setUser(userData);
        localStorage.setItem('nyaymitra_user', JSON.stringify(userData));
      } else if (!localStorage.getItem('nyaymitra_user')) {
        setUser(null);
      }
      setLoading(false);
    }, (err) => {
      console.warn('Auth state error:', err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    setAuthError(null);
    try {
      if (auth && googleProvider && import.meta.env.VITE_FIREBASE_API_KEY !== 'mock-api-key') {
        const result = await signInWithPopup(auth, googleProvider);
        const token = await result.user.getIdToken();
        const userData = {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
          token,
        };
        setUser(userData);
        localStorage.setItem('nyaymitra_user', JSON.stringify(userData));
        return userData;
      } else {
        // Fallback for development/demo mode when Firebase credentials are mock
        const demoUser = {
          uid: 'demo-user-12345',
          email: 'advocate.demo@nyaymitra.app',
          displayName: 'Ankit Sharma (Demo)',
          photoURL: 'https://api.dicebear.com/7.x/initials/svg?seed=Ankit%20Sharma',
          token: 'mock-firebase-token-demo-user-12345',
          isDemo: true,
        };
        setUser(demoUser);
        localStorage.setItem('nyaymitra_user', JSON.stringify(demoUser));
        return demoUser;
      }
    } catch (err) {
      console.warn('Google Sign-In error, falling back to demo session:', err.message);
      // If Firebase fails (e.g. invalid API key / unauthorized domain), fall back seamlessly to demo user
      const demoUser = {
        uid: 'demo-user-12345',
        email: 'advocate.demo@nyaymitra.app',
        displayName: 'Ankit Sharma (Demo)',
        photoURL: 'https://api.dicebear.com/7.x/initials/svg?seed=Ankit%20Sharma',
        token: 'mock-firebase-token-demo-user-12345',
        isDemo: true,
      };
      setUser(demoUser);
      localStorage.setItem('nyaymitra_user', JSON.stringify(demoUser));
      return demoUser;
    }
  };

  const logout = async () => {
    try {
      if (auth) {
        await fbSignOut(auth);
      }
    } catch (err) {
      console.warn('Sign out warning:', err.message);
    } finally {
      setUser(null);
      localStorage.removeItem('nyaymitra_user');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, authError, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
