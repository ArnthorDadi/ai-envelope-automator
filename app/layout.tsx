import type { Metadata } from 'next'
import { AuthProvider } from '@/contexts/AuthContext'
import { ToastProvider } from '@/contexts/ToastContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
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
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              {children}
              <Toast />
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
