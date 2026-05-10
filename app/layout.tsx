import type { Metadata } from 'next'
import { Poiret_One, Inter, Bebas_Neue, Courier_Prime } from 'next/font/google'
import { Providers } from '@/components/layout'
import './globals.css'

const poiretOne = Poiret_One({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-poiret-one',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const bebasNeue = Bebas_Neue({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-bebas-neue',
})

const courierPrime = Courier_Prime({
  subsets: ['latin'],
  weight: '700',
  variable: '--font-courier-prime',
})

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
    <html
      lang="en"
      className={`dark ${poiretOne.variable} ${inter.variable} ${bebasNeue.variable} ${courierPrime.variable}`}
    >
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-surface text-on-surface leather-texture min-h-dvh flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
