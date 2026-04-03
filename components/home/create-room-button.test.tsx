import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CreateRoomButton } from '@/components/home'
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

const { mockCreateRoom } = vi.hoisted(() => ({
  mockCreateRoom: vi.fn(),
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
      createRoom: mockCreateRoom,
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
        <CreateRoomButton />
        <Toast />
      </AuthContext.Provider>
    </ToastProvider>
  )
}

import { Toast } from '@/components/shared'

describe('CreateRoomButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders CREATE ROOM button', () => {
    renderWithAuth({ name: 'TestUser', uid: 'test-123' })
    expect(
      screen.getByRole('button', { name: 'CREATE ROOM' })
    ).toBeInTheDocument()
  })

  it('calls createRoom and navigates on successful creation', async () => {
    const user = { name: 'TestUser', uid: 'test-123' }
    mockCreateRoom.mockResolvedValue({ roomId: 'room-456' })
    renderWithAuth(user)

    fireEvent.click(screen.getByRole('button', { name: 'CREATE ROOM' }))

    await waitFor(() => {
      expect(mockCreateRoom).toHaveBeenCalledWith({
        hostId: user.uid,
        hostName: user.name,
      })
    })
  })

  it('shows error toast when room creation fails', async () => {
    const user = { name: 'TestUser', uid: 'test-123' }
    mockCreateRoom.mockRejectedValue(new Error('Network error'))
    renderWithAuth(user)

    fireEvent.click(screen.getByRole('button', { name: 'CREATE ROOM' }))

    await waitFor(() => {
      expect(
        screen.getByText('Failed to create room. Please try again.')
      ).toBeInTheDocument()
    })
  })

  it('button shows CREATING state while creating', async () => {
    const user = { name: 'TestUser', uid: 'test-123' }
    mockCreateRoom.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ roomId: 'room-456' }), 100)
        )
    )
    renderWithAuth(user)

    fireEvent.click(screen.getByRole('button', { name: 'CREATE ROOM' }))

    expect(screen.getByRole('button', { name: 'CREATING' })).toBeInTheDocument()
  })
})
