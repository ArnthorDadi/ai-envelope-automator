'use client'

import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'

export function LogoutButton() {
  const { signOut } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await signOut()
      router.push('/')
    } catch {
      // Error handled in context
    }
  }

  return (
    <button
      onClick={handleLogout}
      className="px-5 py-2 font-stamp-text text-stamp-text text-on-surface-variant border border-outline-variant hover:bg-surface-bright active:scale-95 transition-all rounded"
    >
      SIGN OUT
    </button>
  )
}
