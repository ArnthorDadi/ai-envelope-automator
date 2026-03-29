import type { Metadata } from 'next'
import { AuthProvider } from '@/contexts/AuthContext'
import { ToastProvider } from '@/contexts/ToastContext'
import { Toast } from '@/components/Toast'
import './globals.css'

export const metadata: Metadata = {
  title: 'Secret Hitler',
  description: 'Digital Roles - Secret Hitler',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ToastProvider>
            {children}
            <Toast />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
