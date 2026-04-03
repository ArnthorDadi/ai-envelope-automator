import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BackButton } from './back-button'

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

vi.mock('@/lib/firebase', () => ({
  app: {},
}))

describe('BackButton', () => {
  it('renders back button with arrow', () => {
    render(<BackButton />)
    expect(screen.getByText('← Back')).toBeInTheDocument()
  })
})
