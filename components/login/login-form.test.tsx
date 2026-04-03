import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginForm } from '@/components/login';
import { AuthContext } from '@/contexts/auth-context';
import { ToastProvider } from '@/contexts/toast-context';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock('@/lib/firebase', () => ({
  app: {},
}));

const { mockSignIn } = vi.hoisted(() => ({
  mockSignIn: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  db: {
    user: {
      onAuthStateChanged: vi.fn(),
      signIn: mockSignIn,
      signOut: vi.fn(),
      getStoredUser: vi.fn(),
      setStoredUser: vi.fn(),
    },
  },
}));

const renderWithAuth = () => {
  return render(
    <ToastProvider>
      <AuthContext.Provider value={{ user: null, loading: false, signIn: mockSignIn, signOut: vi.fn() } as any}>
        <LoginForm />
      </AuthContext.Provider>
    </ToastProvider>
  );
};

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders name input and submit button', () => {
    renderWithAuth();
    expect(screen.getByPlaceholderText('Your name')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'SUBMIT' })).toBeInTheDocument();
  });

  it('submit button is disabled when name is empty', () => {
    renderWithAuth();
    expect(screen.getByRole('button', { name: 'SUBMIT' })).toBeDisabled();
  });

  it('submit button is enabled when name is entered', () => {
    renderWithAuth();
    const input = screen.getByPlaceholderText('Your name');
    fireEvent.change(input, { target: { value: 'TestUser' } });
    expect(screen.getByRole('button', { name: 'SUBMIT' })).not.toBeDisabled();
  });

  it('calls signIn on successful submit', async () => {
    mockSignIn.mockResolvedValue({ uid: '123', name: 'TestUser' });
    renderWithAuth();

    const input = screen.getByPlaceholderText('Your name');
    fireEvent.change(input, { target: { value: 'TestUser' } });

    fireEvent.click(screen.getByRole('button', { name: 'SUBMIT' }));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('TestUser');
    });
  });

  it('shows loading state during submission', async () => {
    mockSignIn.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));
    renderWithAuth();

    const input = screen.getByPlaceholderText('Your name');
    fireEvent.change(input, { target: { value: 'TestUser' } });

    fireEvent.click(screen.getByRole('button', { name: 'SUBMIT' }));

    expect(screen.getByRole('button', { name: 'SUBMITTING' })).toBeInTheDocument();
  });

  it('limits input to 20 characters', () => {
    renderWithAuth();
    const input = screen.getByPlaceholderText('Your name') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'this is a very long name that exceeds 20 chars' } });
    expect(input.value).toHaveLength(20);
  });
});
