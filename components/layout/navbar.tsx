'use client'

import { Logo } from '@/components/layout'
import { UserSection } from '@/components/auth'

export function Navbar() {
  return (
    <nav className="flex flex-row items-center justify-between w-full p-4 bg-gray-100 dark:bg-gray-800">
      <Logo />
      <UserSection />
    </nav>
  )
}
