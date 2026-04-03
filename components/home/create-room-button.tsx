'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useToast } from '@/contexts/toast-context';
import { db } from '@/lib/db';
import { Spinner } from '@/components/shared';

export function CreateRoomButton() {
  const { user } = useAuth();
  const router = useRouter();
  const { addToast } = useToast();
  const [creating, setCreating] = useState(false);

  const handleCreateRoom = async () => {
    if (!user) {
      addToast('Please log in first.', 'error');
      return;
    }

    setCreating(true);
    try {
      const { roomId } = await db.rooms.createRoom({
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

  return (
    <button
      onClick={handleCreateRoom}
      disabled={creating}
      className="w-full p-3 bg-blue-500 text-white rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
    >
      {creating ? <Spinner size="sm" /> : null}
      {creating ? 'CREATING' : 'CREATE ROOM'}
    </button>
  );
}
