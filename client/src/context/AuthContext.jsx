/**
 * Auth Context — manages user login state across the entire app.
 * Supports both Firebase Auth and demo API authentication.
 */
import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';
import { auth, isFirebaseEnabled } from '../services/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen for Firebase auth state changes
  useEffect(() => {
    if (isFirebaseEnabled && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          const token = await firebaseUser.getIdToken();
          localStorage.setItem('shopwave_token', token);
          try {
            const profile = await authApi.me();
            setUser(profile);
          } catch {
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
            });
          }
        } else {
          setUser(null);
          localStorage.removeItem('shopwave_token');
        }
        setLoading(false);
      });
      return unsubscribe;
    }

    // Demo mode — restore session from localStorage
    const token = localStorage.getItem('shopwave_token');
    if (token) {
      authApi
        .me()
        .then(setUser)
        .catch(() => localStorage.removeItem('shopwave_token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  /** Register a new account */
  async function register(email, password, displayName) {
    if (isFirebaseEnabled && auth) {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      const token = await credential.user.getIdToken();
      localStorage.setItem('shopwave_token', token);
      const profile = await authApi.me();
      setUser(profile);
      return profile;
    }

    const result = await authApi.register({ email, password, displayName });
    localStorage.setItem('shopwave_token', result.token);
    setUser(result.user);
    return result.user;
  }

  /** Log in with email and password */
  async function login(email, password) {
    if (isFirebaseEnabled && auth) {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const token = await credential.user.getIdToken();
      localStorage.setItem('shopwave_token', token);
      const profile = await authApi.me();
      setUser(profile);
      return profile;
    }

    const result = await authApi.login({ email, password });
    localStorage.setItem('shopwave_token', result.token);
    setUser(result.user);
    return result.user;
  }

  /** Log out and clear session */
  async function logout() {
    if (isFirebaseEnabled && auth) {
      await signOut(auth);
    }
    localStorage.removeItem('shopwave_token');
    setUser(null);
  }

  const value = {
    user,
    loading,
    register,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.isAdmin || false,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Hook to access auth state anywhere in the app */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
