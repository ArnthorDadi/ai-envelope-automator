import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LoginButton } from './login-button'

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

vi.mock('@/lib/firebase', () => ({
  app: {},
}))

describe('LoginButton', () => {
  it('renders Login button', () => {
    render(<LoginButton />)
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument()
  })
})
