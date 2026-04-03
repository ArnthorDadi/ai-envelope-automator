'use client';

import { ToastProvider } from '@/contexts/toast-context';
import { AuthProvider } from '@/contexts/auth-context';
import { Navbar } from '@/components/layout';
import { Toast } from '@/components/shared';
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
