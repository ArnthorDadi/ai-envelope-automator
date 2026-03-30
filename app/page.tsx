'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center justify-center flex-1 p-4">
      <p className="text-lg mb-8">Digital Roles</p>
      
      {user ? (
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <button
            onClick={() => {}}
            className="w-full p-3 bg-blue-500 text-white rounded-lg"
          >
            CREATE ROOM
          </button>
        </div>
      ) : (
        <p className="text-gray-600">Please login to play</p>
      )}
    </main>
  );
}
