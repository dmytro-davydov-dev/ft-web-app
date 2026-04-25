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
import type { ReactNode } from 'react';
import {
  onIdTokenChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import type { User, UserCredential } from 'firebase/auth';
import { auth } from '../firebase/config';

interface AuthContextType {
  user: User | null;
  customerId: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<UserCredential>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user,       setUser]       = useState<User | null>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Decode custom claims from the ID token
        const tokenResult = await firebaseUser.getIdTokenResult();
        setCustomerId((tokenResult.claims['customerId'] as string) ?? null);
        setUser(firebaseUser);
      } else {
        setUser(null);
        setCustomerId(null);
      }
      setLoading(false);
    });

    return unsubscribe; // cleanup on unmount
  }, []);

  async function signIn(email: string, password: string): Promise<UserCredential> {
    return signInWithEmailAndPassword(auth, email, password);
  }

  async function signOut(): Promise<void> {
    return firebaseSignOut(auth);
  }

  const value: AuthContextType = { user, customerId, loading, signIn, signOut };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
