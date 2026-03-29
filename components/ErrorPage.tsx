'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/Button';
import { RoomErrorType, getErrorMessage } from '@/lib/types';

interface ErrorPageProps {
  type: RoomErrorType;
  roomCode?: string;
}

export function ErrorPage({ type, roomCode }: ErrorPageProps) {
  const router = useRouter();

  useEffect(() => {
    if (type === 'ROOM_DELETED') {
      router.replace('/');
    }
  }, [type, router]);

  const message = roomCode 
    ? `Room "${roomCode}" ${getErrorMessage(type).toLowerCase()}`
    : getErrorMessage(type);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-md mx-auto p-6 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-gray-800">
            {type === 'ROOM_NOT_FOUND' && 'Room Not Found'}
            {type === 'ROOM_FULL' && 'Room Full'}
            {type === 'GAME_STARTED' && 'Game Already Started'}
            {type === 'ROOM_DELETED' && 'Room Deleted'}
            {type === 'NETWORK_ERROR' && 'Connection Error'}
            {type === 'AUTH_ERROR' && 'Authentication Error'}
          </h1>
          <p className="text-gray-600 mb-8">{message}</p>
          <Button onClick={() => router.push('/')}>
            Go Back Home
          </Button>
        </div>
      </main>
    </div>
  );
}
