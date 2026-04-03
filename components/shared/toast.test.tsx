import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Toast } from '@/components/shared'
import { ToastProvider, useToast } from '@/contexts/toast-context'

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

function TestComponent() {
  const { addToast, toasts } = useToast()

  return (
    <div>
      <button onClick={() => addToast('Test message', 'info')}>
        Add Toast
      </button>
      <p data-testid="toast-count">{toasts.length}</p>
    </div>
  )
}

describe('Toast', () => {
  it('renders toast message when added', async () => {
    render(
      <ToastProvider>
        <TestComponent />
        <Toast />
      </ToastProvider>
    )

    const button = screen.getByText('Add Toast')
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText('Test message')).toBeInTheDocument()
    })
  })

  it('removes toast on click', async () => {
    render(
      <ToastProvider>
        <TestComponent />
        <Toast />
      </ToastProvider>
    )

    const button = screen.getByText('Add Toast')
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText('Test message')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Test message'))

    await waitFor(() => {
      expect(screen.queryByText('Test message')).not.toBeInTheDocument()
    })
  })
})
