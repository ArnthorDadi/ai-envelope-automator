'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db, AuthService } from '@/lib/db';
import { UserData } from '@/lib/auth';
import { useToast } from './ToastContext';

interface AuthState {
  user: UserData | null;
  loading: boolean;
  signIn: (name: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    setLoading(true);
    const unsubscribe = db.user.onAuthChange((userData) => {
      setUser(userData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (name: string) => {
    try {
      setLoading(true);
      const userData = await db.user.signIn({ name });
      setUser(userData);
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
      await db.user.signOut();
      setUser(null);
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
