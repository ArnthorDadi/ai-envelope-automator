import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PlayerMenu } from '@/components/room/player-menu'
import { Player } from '@/lib/rooms'

const mockTransferHostTo = vi.fn()
const mockAddToast = vi.fn()

vi.mock('@/contexts/auth-context', () => ({
  useAuth: () => ({
    user: { uid: 'host-1', name: 'Alice' },
  }),
}))

vi.mock('@/contexts/toast-context', () => ({
  useToast: () => ({
    addToast: mockAddToast,
  }),
}))

vi.mock('@/lib/db', () => ({
  db: {
    rooms: {
      transferHostTo: (...args: unknown[]) => mockTransferHostTo(...args),
    },
  },
}))

const mockPlayer: Player = {
  id: 'player-2',
  name: 'Bob',
  role: null,
  joinedAt: Date.now(),
  leftAt: null,
  isDead: false,
}

describe('PlayerMenu', () => {
  const onClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders TRANSFER COMMAND heading', () => {
    render(
      <PlayerMenu
        player={mockPlayer}
        roomId="TEST01"
        currentHostId="host-1"
        onClose={onClose}
      />
    )

    expect(screen.getByRole('heading', { name: 'TRANSFER COMMAND' })).toBeInTheDocument()
  })

  it('renders player name', () => {
    render(
      <PlayerMenu
        player={mockPlayer}
        roomId="TEST01"
        currentHostId="host-1"
        onClose={onClose}
      />
    )

    expect(screen.getByText('Bob')).toBeInTheDocument()
  })

  it('renders primary TRANSFER COMMAND button', () => {
    render(
      <PlayerMenu
        player={mockPlayer}
        roomId="TEST01"
        currentHostId="host-1"
        onClose={onClose}
      />
    )

    const buttons = screen.getAllByText('TRANSFER COMMAND')
    expect(buttons).toHaveLength(2)
  })

  it('renders Cancel button', () => {
    render(
      <PlayerMenu
        player={mockPlayer}
        roomId="TEST01"
        currentHostId="host-1"
        onClose={onClose}
      />
    )

    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })

  it('calls onClose when Cancel is clicked', () => {
    render(
      <PlayerMenu
        player={mockPlayer}
        roomId="TEST01"
        currentHostId="host-1"
        onClose={onClose}
      />
    )

    fireEvent.click(screen.getByText('Cancel'))

    expect(onClose).toHaveBeenCalled()
  })

  it('calls transferHostTo on primary button click', () => {
    mockTransferHostTo.mockResolvedValueOnce(undefined)

    render(
      <PlayerMenu
        player={mockPlayer}
        roomId="TEST01"
        currentHostId="host-1"
        onClose={onClose}
      />
    )

    const primaryButtons = screen.getAllByText('TRANSFER COMMAND')
    fireEvent.click(primaryButtons[1])

    expect(mockTransferHostTo).toHaveBeenCalledWith('TEST01', 'host-1', 'player-2')
  })

  it('shows transferring state while loading', async () => {
    mockTransferHostTo.mockImplementationOnce(() => new Promise(() => {}))

    render(
      <PlayerMenu
        player={mockPlayer}
        roomId="TEST01"
        currentHostId="host-1"
        onClose={onClose}
      />
    )

    const primaryButtons = screen.getAllByText('TRANSFER COMMAND')
    fireEvent.click(primaryButtons[1])

    expect(await screen.findByText('TRANSFERRING COMMAND...')).toBeInTheDocument()
  })

  it('calls onClose on successful transfer', async () => {
    mockTransferHostTo.mockResolvedValueOnce(undefined)

    render(
      <PlayerMenu
        player={mockPlayer}
        roomId="TEST01"
        currentHostId="host-1"
        onClose={onClose}
      />
    )

    const primaryButtons = screen.getAllByText('TRANSFER COMMAND')
    fireEvent.click(primaryButtons[1])

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled()
    })
  })

  it('shows error toast on transfer failure', async () => {
    mockTransferHostTo.mockRejectedValueOnce(new Error('fail'))

    render(
      <PlayerMenu
        player={mockPlayer}
        roomId="TEST01"
        currentHostId="host-1"
        onClose={onClose}
      />
    )

    const primaryButtons = screen.getAllByText('TRANSFER COMMAND')
    fireEvent.click(primaryButtons[1])

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith('Failed to transfer host', 'error')
    })
  })

  it('closes on overlay backdrop click', () => {
    render(
      <PlayerMenu
        player={mockPlayer}
        roomId="TEST01"
        currentHostId="host-1"
        onClose={onClose}
      />
    )

    const overlay = screen.getByTestId('player-menu-overlay')
    fireEvent.click(overlay)

    expect(onClose).toHaveBeenCalled()
  })
})
