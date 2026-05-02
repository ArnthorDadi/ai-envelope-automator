import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { RoleReveal } from './role-reveal'

vi.mock('@/hooks/room', () => ({
  usePlayer: vi.fn(() => ({
    player: null,
    loading: false,
  })),
  usePlayers: vi.fn(() => ({
    players: [],
    loading: false,
  })),
}))

vi.mock('@/contexts/toast-context', () => ({
  useToast: () => ({
    addToast: vi.fn(),
  }),
}))

describe('RoleReveal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders without error', () => {
    const { container } = render(<RoleReveal roomId="ABC123" />)
    expect(container).toBeTruthy()
  })
})
