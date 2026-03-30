'use client';

import { ToastProvider } from '@/contexts/ToastContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toast } from '@/components/Toast';
import { Navbar } from '@/components/Navbar';
import { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <Toast />
          <div className="flex-1 flex flex-col">{children}</div>
        </div>
      </AuthProvider>
    </ToastProvider>
  );
}
