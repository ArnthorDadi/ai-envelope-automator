'use client'

import { useAuth } from '@/contexts/auth-context'
import { Spinner } from '@/components/shared'
import { LoginButton } from '@/components/login'
import { LogoutButton } from '@/components/auth'

export function UserSection() {
  const { user, loading } = useAuth()

  if (loading) {
    return <Spinner size="sm" />
  }

  return user ? (
    <div className="flex items-center gap-4">
      <span>{user.name}</span>
      <LogoutButton />
    </div>
  ) : (
    <LoginButton />
  )
}
