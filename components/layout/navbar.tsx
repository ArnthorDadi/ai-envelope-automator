'use client'

import { UserSection } from '@/components/auth'

export function Navbar() {
  return (
    <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-margin-mobile md:px-margin-desktop bg-surface-container-low border-b border-outline-variant shadow-md h-16">
      <div className="flex items-center gap-4">
        <h1 className="font-headline-lg text-headline-lg tracking-widest uppercase text-primary drop-shadow-sm whitespace-nowrap">
          SECRET HITLER
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden md:flex gap-8 items-center h-full">
          <a className="text-primary border-b-2 border-primary pb-1 font-label-caps text-label-caps uppercase hover:text-primary-container transition-all" href="#">
            Lobby
          </a>
          <a className="text-on-surface-variant font-label-caps text-label-caps uppercase hover:text-primary-container transition-all" href="#">
            Rules
          </a>
          <a className="text-on-surface-variant font-label-caps text-label-caps uppercase hover:text-primary-container transition-all" href="#">
            Archive
          </a>
        </div>
        <UserSection />
      </div>
    </header>
  )
}
