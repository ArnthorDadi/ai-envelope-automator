'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@/lib/types';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signInAnonymously, User as FirebaseUser } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  updateName: (name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);

  useEffect(() => {
    if (!auth || !db) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setFirebaseUser(fbUser);
        const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
        const userData = userDoc.exists() ? userDoc.data() : null;
        setUser({
          uid: fbUser.uid,
          name: userData?.name || '',
        });
      } else {
        setFirebaseUser(null);
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async () => {
    if (!auth || !db) return;
    const result = await signInAnonymously(auth);
    const userDoc = await getDoc(doc(db, 'users', result.user.uid));
    if (!userDoc.exists()) {
      await setDoc(doc(db, 'users', result.user.uid), {
        name: '',
        createdAt: serverTimestamp(),
      });
    }
  };

  const signOut = async () => {
    if (!auth) return;
    const { signOut: fbSignOut } = await import('firebase/auth');
    await fbSignOut(auth);
  };

  const updateName = async (name: string) => {
    if (!firebaseUser || !db) return;
    
    await setDoc(doc(db, 'users', firebaseUser.uid), {
      name,
      createdAt: serverTimestamp(),
    }, { merge: true });
    
    setUser({ uid: firebaseUser.uid, name });
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, updateName }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
