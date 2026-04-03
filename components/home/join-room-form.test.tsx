import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { JoinRoomForm } from '@/components/home'
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

const { mockJoinRoom } = vi.hoisted(() => ({
  mockJoinRoom: vi.fn(),
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
    rooms: {
      createRoom: vi.fn(),
      joinRoom: mockJoinRoom,
    },
  },
}))

const renderWithAuth = (user: { name: string; uid: string } | null) => {
  return render(
    <ToastProvider>
      <AuthContext.Provider
        value={
          {
            user,
            loading: false,
            signIn: vi.fn(),
            signOut: vi.fn(),
          } as any
        }
      >
        <JoinRoomForm />
        <div id="toast-container" />
      </AuthContext.Provider>
    </ToastProvider>
  )
}

describe('JoinRoomForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders room code and name inputs', () => {
    renderWithAuth({ name: 'TestUser', uid: 'test-123' })
    expect(screen.getByPlaceholderText('ROOM CODE')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('YOUR NAME')).toBeInTheDocument()
  })

  it('renders JOIN ROOM button', () => {
    renderWithAuth({ name: 'TestUser', uid: 'test-123' })
    expect(
      screen.getByRole('button', { name: 'JOIN ROOM' })
    ).toBeInTheDocument()
  })

  it('auto-uppercases room code input', () => {
    renderWithAuth({ name: 'TestUser', uid: 'test-123' })
    const input = screen.getByPlaceholderText('ROOM CODE') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'abc' } })
    expect(input.value).toBe('ABC')
  })

  it('limits room code to 6 characters', () => {
    renderWithAuth({ name: 'TestUser', uid: 'test-123' })
    const input = screen.getByPlaceholderText('ROOM CODE') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'ABCDEFGHI' } })
    expect(input.value).toBe('ABCDEF')
  })

  it('only allows valid room code characters', () => {
    renderWithAuth({ name: 'TestUser', uid: 'test-123' })
    const input = screen.getByPlaceholderText('ROOM CODE') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'ABC1OI' } })
    expect(input.value).toBe('ABC')
  })

  it('limits name to 20 characters', () => {
    renderWithAuth({ name: 'TestUser', uid: 'test-123' })
    const input = screen.getByPlaceholderText('YOUR NAME') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'A'.repeat(25) } })
    expect(input.value).toBe('A'.repeat(20))
  })

  it('disables button when inputs are empty', () => {
    renderWithAuth({ name: 'TestUser', uid: 'test-123' })
    const button = screen.getByRole('button', { name: 'JOIN ROOM' })
    expect(button).toBeDisabled()
  })

  it('enables button when both inputs are filled', () => {
    renderWithAuth({ name: 'TestUser', uid: 'test-123' })
    fireEvent.change(screen.getByPlaceholderText('ROOM CODE'), {
      target: { value: 'ABCDEF' },
    })
    fireEvent.change(screen.getByPlaceholderText('YOUR NAME'), {
      target: { value: 'TestName' },
    })
    const button = screen.getByRole('button', { name: 'JOIN ROOM' })
    expect(button).not.toBeDisabled()
  })

  it('shows error when room code is invalid on submit', async () => {
    renderWithAuth({ name: 'TestUser', uid: 'test-123' })
    fireEvent.change(screen.getByPlaceholderText('ROOM CODE'), {
      target: { value: 'ABC10' },
    })
    fireEvent.change(screen.getByPlaceholderText('YOUR NAME'), {
      target: { value: 'TestName' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'JOIN ROOM' }))
    await waitFor(() => {
      expect(screen.getByText('Invalid room code')).toBeInTheDocument()
    })
  })

  it('calls joinRoom with correct parameters on submit', async () => {
    const user = { name: 'TestUser', uid: 'test-123' }
    mockJoinRoom.mockResolvedValue({ roomId: 'ABCDEF' })
    renderWithAuth(user)

    fireEvent.change(screen.getByPlaceholderText('ROOM CODE'), {
      target: { value: 'abcdef' },
    })
    fireEvent.change(screen.getByPlaceholderText('YOUR NAME'), {
      target: { value: 'TestName' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'JOIN ROOM' }))

    await waitFor(() => {
      expect(mockJoinRoom).toHaveBeenCalledWith('ABCDEF', {
        playerId: user.uid,
        playerName: user.name,
      })
    })
  })

  it('shows error when room is not found', async () => {
    const error = new Error('Room not found')
    ;(error as any).code = 'ROOM_NOT_FOUND'
    mockJoinRoom.mockRejectedValue(error)

    renderWithAuth({ name: 'TestUser', uid: 'test-123' })

    fireEvent.change(screen.getByPlaceholderText('ROOM CODE'), {
      target: { value: 'ABCDEF' },
    })
    fireEvent.change(screen.getByPlaceholderText('YOUR NAME'), {
      target: { value: 'TestName' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'JOIN ROOM' }))

    await waitFor(() => {
      expect(screen.getByText('Room not found')).toBeInTheDocument()
    })
  })

  it('shows error when room is full', async () => {
    const error = new Error('Room is full')
    ;(error as any).code = 'ROOM_FULL'
    mockJoinRoom.mockRejectedValue(error)

    renderWithAuth({ name: 'TestUser', uid: 'test-123' })

    fireEvent.change(screen.getByPlaceholderText('ROOM CODE'), {
      target: { value: 'ABCDEF' },
    })
    fireEvent.change(screen.getByPlaceholderText('YOUR NAME'), {
      target: { value: 'TestName' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'JOIN ROOM' }))

    await waitFor(() => {
      expect(screen.getByText('Room is full')).toBeInTheDocument()
    })
  })

  it('shows error when game has already started', async () => {
    const error = new Error('Game already started')
    ;(error as any).code = 'GAME_STARTED'
    mockJoinRoom.mockRejectedValue(error)

    renderWithAuth({ name: 'TestUser', uid: 'test-123' })

    fireEvent.change(screen.getByPlaceholderText('ROOM CODE'), {
      target: { value: 'ABCDEF' },
    })
    fireEvent.change(screen.getByPlaceholderText('YOUR NAME'), {
      target: { value: 'TestName' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'JOIN ROOM' }))

    await waitFor(() => {
      expect(screen.getByText('Game already started')).toBeInTheDocument()
    })
  })

  it('shows loading state during join', async () => {
    mockJoinRoom.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ roomId: 'ABCDEF' }), 100)
        )
    )

    renderWithAuth({ name: 'TestUser', uid: 'test-123' })

    fireEvent.change(screen.getByPlaceholderText('ROOM CODE'), {
      target: { value: 'ABCDEF' },
    })
    fireEvent.change(screen.getByPlaceholderText('YOUR NAME'), {
      target: { value: 'TestName' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'JOIN ROOM' }))

    expect(screen.getByRole('button', { name: 'JOINING' })).toBeInTheDocument()
  })
})
