'use client';

import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';

export function LogoutButton() {
  const { signOut } = useAuth();
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
    <button
      onClick={handleLogout}
      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
    >
      Logout
    </button>
  );
}
