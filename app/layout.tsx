import type { Metadata } from 'next'
import { Providers } from '@/components/layout'
import './globals.css'

export const metadata: Metadata = {
  title: 'Secret Hitler - Digital Roles',
  description: 'Digital roles for Secret Hitler board game',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
