'use client'

import { ToastProvider } from '@/contexts/toast-context'
import { AuthProvider } from '@/contexts/auth-context'
import { Navbar } from '@/components/layout'
import { Toast } from '@/components/shared'
import { ReactNode } from 'react'
import { usePathname } from 'next/navigation'

export function Providers({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const hideNavbar = pathname === '/' || pathname.startsWith('/login')

  return (
    <ToastProvider>
      <AuthProvider>
        <div className={`flex flex-col min-h-screen ${hideNavbar ? '' : 'pt-16'}`}>
          {!hideNavbar && <Navbar />}
          <Toast />
          <div className="flex-1 flex flex-col">{children}</div>
        </div>
      </AuthProvider>
    </ToastProvider>
  )
}
