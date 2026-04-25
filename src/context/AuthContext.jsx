/**
 * AuthContext — Firebase Auth state via React Context.
 *
 * No Redux, no localStorage. Auth state is owned by Firebase SDK;
 * this context just exposes it to the component tree.
 *
 * Exposes:
 *   user          — Firebase User object (or null when signed out)
 *   customerId    — extracted from the JWT custom claim "customerId"
 *   loading       — true until the first onAuthStateChanged fires
 *   signIn(email, password) → Promise
 *   signOut()     → Promise
 */
import { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth } from '../firebase/config';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,       setUser]       = useState(null);
  const [customerId, setCustomerId] = useState(null);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Decode custom claims from the ID token
        const tokenResult = await firebaseUser.getIdTokenResult();
        setCustomerId(tokenResult.claims.customerId ?? null);
        setUser(firebaseUser);
      } else {
        setUser(null);
        setCustomerId(null);
      }
      setLoading(false);
    });

    return unsubscribe; // cleanup on unmount
  }, []);

  async function signIn(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  async function signOut() {
    return firebaseSignOut(auth);
  }

  const value = { user, customerId, loading, signIn, signOut };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
