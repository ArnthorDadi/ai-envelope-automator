import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { LogoutButton } from '@/components/auth'
import { AuthContext } from '@/contexts/auth-context'
import { ToastProvider } from '@/contexts/toast-context'

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

vi.mock('@/lib/firebase', () => ({
  app: {},
}))

vi.mock('@/lib/db', () => ({
  db: {
    user: {
      onAuthStateChanged: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
      getStoredUser: vi.fn(),
      setStoredUser: vi.fn(),
    },
  },
}))

describe('LogoutButton', () => {
  it('renders Logout button', () => {
    render(
      <ToastProvider>
        <AuthContext.Provider
          value={
            {
              user: null,
              loading: false,
              signIn: vi.fn(),
              signOut: vi.fn(),
            } as any
          }
        >
          <LogoutButton />
        </AuthContext.Provider>
      </ToastProvider>
    )
    expect(screen.getByRole('button', { name: 'Logout' })).toBeInTheDocument()
  })
})
