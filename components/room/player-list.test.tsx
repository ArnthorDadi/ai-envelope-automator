import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PlayerList } from '@/components/room/player-list'
import { ShareButton } from '@/components/room/share-button'
import { Player } from '@/lib/rooms'

vi.mock('@/contexts/toast-context', () => ({
  useToast: () => ({
    addToast: vi.fn(),
  }),
}))

vi.mock('@/lib/db', () => ({
  db: {
    rooms: {
      togglePlayerDead: vi.fn().mockResolvedValue(undefined),
    },
  },
}))

describe('PlayerList', () => {
  const mockPlayers: Player[] = [
    {
      id: 'host-1',
      name: 'Alice',
      role: null,
      joinedAt: Date.now(),
      leftAt: null,
      isDead: false,
    },
    {
      id: 'player-2',
      name: 'Bob',
      role: null,
      joinedAt: Date.now(),
      leftAt: null,
      isDead: false,
    },
    {
      id: 'player-3',
      name: 'Charlie',
      role: null,
      joinedAt: Date.now(),
      leftAt: null,
      isDead: false,
    },
  ]

  const fivePlayers: Player[] = [
    ...mockPlayers,
    {
      id: 'player-4',
      name: 'Diana',
      role: null,
      joinedAt: Date.now(),
      leftAt: null,
      isDead: false,
    },
    {
      id: 'player-5',
      name: 'Eve',
      role: null,
      joinedAt: Date.now(),
      leftAt: null,
      isDead: false,
    },
  ]

  it('displays all players', () => {
    render(
      <PlayerList
        roomId="TEST01"
        players={mockPlayers}
        hostId="host-1"
        currentUserId="player-2"
      />
    )

    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob (You)')).toBeInTheDocument()
    expect(screen.getByText('Charlie')).toBeInTheDocument()
  })

  it('shows host badge for host player', () => {
    render(
      <PlayerList
        roomId="TEST01"
        players={mockPlayers}
        hostId="host-1"
        currentUserId="player-2"
      />
    )

    expect(screen.getByText(/⭐ Host/)).toBeInTheDocument()
  })

  it('shows (You) for current user', () => {
    render(
      <PlayerList
        roomId="TEST01"
        players={mockPlayers}
        hostId="host-1"
        currentUserId="player-2"
      />
    )

    expect(screen.getByText(/Bob \(You\)/)).toBeInTheDocument()
  })

  it('displays player count', () => {
    render(
      <PlayerList
        roomId="TEST01"
        players={mockPlayers}
        hostId="host-1"
        currentUserId="player-2"
      />
    )

    expect(screen.getByText(/3\/5 needed/)).toBeInTheDocument()
  })

  it('shows waiting message when not enough players', () => {
    render(
      <PlayerList
        roomId="TEST01"
        players={mockPlayers}
        hostId="host-1"
        currentUserId="player-2"
      />
    )

    expect(screen.getByText(/Waiting for 2 more players/)).toBeInTheDocument()
  })

  it('shows waiting message for 1 player', () => {
    render(
      <PlayerList
        roomId="TEST01"
        players={mockPlayers}
        hostId="host-1"
        currentUserId="player-2"
      />
    )

    expect(screen.getByText(/Waiting for 2 more players/)).toBeInTheDocument()
  })

  it('shows ready message when enough players', () => {
    render(
      <PlayerList
        roomId="TEST01"
        players={fivePlayers}
        hostId="host-1"
        currentUserId="player-2"
      />
    )

    expect(screen.queryByText(/Waiting for/)).not.toBeInTheDocument()
  })
})

describe('ShareButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders share button', () => {
    render(<ShareButton roomId="ABC123" />)

    expect(screen.getByRole('button', { name: 'Share' })).toBeInTheDocument()
  })

  it('copies URL to clipboard when share is not supported', async () => {
    const mockWriteText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: mockWriteText },
      writable: true,
    })
    Object.defineProperty(navigator, 'share', {
      value: undefined,
      writable: true,
    })

    render(<ShareButton roomId="ABC123" />)

    fireEvent.click(screen.getByRole('button', { name: 'Share' }))
  })
})
