'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, signInAnonymously, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { AuthState, UserData } from '@/types';
import { useToast } from './ToastContext';

export const AuthContext = createContext<AuthState | null>(null);

const STORAGE_KEY = 'secret-hitler-user';

function getStoredUser(): UserData | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }
  return null;
}

function setStoredUser(user: UserData | null): void {
  if (typeof window === 'undefined') return;
  if (user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    const stored = getStoredUser();
    if (stored) {
      setUser(stored);
    }
    setLoading(false);

    const unsubscribe = onAuthStateChanged(auth, () => {});
    return () => unsubscribe();
  }, []);

  const signIn = async (name: string) => {
    try {
      setLoading(true);
      await signInAnonymously(auth);
      const userData = { name, createdAt: new Date() };
      setUser(userData);
      setStoredUser(userData);
      addToast(`Welcome, ${name}!`, 'success');
    } catch (error) {
      addToast('Login failed, please try again', 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setStoredUser(null);
    } catch (error) {
      addToast('Logout failed, please try again', 'error');
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
