'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export function Navbar() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/');
    } catch {
      // Error handled in context
    }
  };

  return (
    <nav className="flex flex-row items-center justify-between w-full p-4 bg-gray-100 dark:bg-gray-800">
      <h1 className="text-xl font-bold">Secret Hitler</h1>
      <div>
        {loading ? (
          <div className="w-5 h-5 border-2 border-gray-400 border-t-blue-500 rounded-full animate-spin" />
        ) : user ? (
          <div className="flex items-center gap-4">
            <span>{user.name}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Logout
            </button>
          </div>
        ) : (
          <button
            onClick={() => router.push('/login')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Login
          </button>
        )}
      </div>
    </nav>
  );
}
