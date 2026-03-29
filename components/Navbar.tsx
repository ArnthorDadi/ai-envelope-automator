'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export function Navbar() {
  const { user, signOut, loading } = useAuth();

  return (
    <nav className="flex items-center justify-between p-4 border-b">
      <Link href="/" className="text-xl font-bold">
        SECRET HITLER
      </Link>
      <div>
        {loading ? (
          <span className="text-gray-500">Loading...</span>
        ) : user ? (
          <div className="flex items-center gap-4">
            <span>{user.name || 'Player'}</span>
            <button
              onClick={signOut}
              className="px-3 py-1 border rounded hover:bg-gray-100 transition-colors"
            >
              Logout
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="px-3 py-1 border rounded hover:bg-gray-100 transition-colors"
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
