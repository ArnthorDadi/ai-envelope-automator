import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Navbar } from '@/components/Navbar';
import { AuthContext } from '@/contexts/AuthContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { useRouter } from 'next/navigation';

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
      onAuthChange: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
      getStoredUser: vi.fn(),
      setStoredUser: vi.fn(),
    },
  },
}));

describe('Navbar', () => {
  const renderWithAuth = (user: { name: string; uid: string } | null, loading = false) => {
    return render(
      <ToastProvider>
        <AuthContext.Provider value={{ user, loading, signIn: vi.fn(), signOut: vi.fn() } as any}>
          <Navbar />
        </AuthContext.Provider>
      </ToastProvider>
    );
  };

  it('shows Login button when not authenticated', () => {
    renderWithAuth(null);
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  it('shows username and Logout button when authenticated', () => {
    renderWithAuth({ name: 'TestUser', uid: 'test-123' });
    expect(screen.getByText('TestUser')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('shows spinner when loading', () => {
    renderWithAuth(null, true);
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });
});
