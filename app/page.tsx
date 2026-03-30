'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useToast } from '@/contexts/ToastContext';
import { db } from '@/lib/firebase';
import { createRoom } from '@/lib/rooms';

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const { addToast } = useToast();

  const handleCreateRoom = async () => {
    if (!user) {
      addToast('Please log in first.', 'error');
      return;
    }

    setCreating(true);
    try {
      const { roomId } = await createRoom({
        db,
        hostId: user.uid,
        hostName: user.name,
      });
      router.push(`/room/${roomId}`);
    } catch (error) {
      console.error('Failed to create room:', error);
      addToast('Failed to create room. Please try again.', 'error');
      setCreating(false);
    }
  };

  if (authLoading) {
    return (
      <main className="flex items-center justify-center flex-1">
        <div className="w-8 h-8 border-4 border-gray-400 border-t-blue-500 rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center justify-center flex-1 p-4">
      <p className="text-lg mb-8">Digital Roles</p>

      {user ? (
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <button
            onClick={handleCreateRoom}
            disabled={creating}
            className="w-full p-3 bg-blue-500 text-white rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {creating && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {creating ? 'CREATING' : 'CREATE ROOM'}
          </button>
        </div>
      ) : (
        <p className="text-gray-600">Please login to play</p>
      )}
    </main>
  );
}
