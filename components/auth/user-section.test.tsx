import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UserSection } from '@/components/auth';
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
}));

const renderWithAuth = (user: { name: string; uid: string } | null, loading = false) => {
  return render(
    <ToastProvider>
      <AuthContext.Provider value={{ user, loading, signIn: vi.fn(), signOut: vi.fn() } as any}>
        <UserSection />
      </AuthContext.Provider>
    </ToastProvider>
  );
};

describe('UserSection', () => {
  it('shows LoginButton when not authenticated', () => {
    renderWithAuth(null);
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
  });

  it('shows username and LogoutButton when authenticated', () => {
    renderWithAuth({ name: 'TestUser', uid: 'test-123' });
    expect(screen.getByText('TestUser')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Logout' })).toBeInTheDocument();
  });

  it('shows spinner when loading', () => {
    renderWithAuth(null, true);
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });
});
