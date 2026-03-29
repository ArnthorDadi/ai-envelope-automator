'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { createRoom } from '@/lib/createRoom';
import { joinRoom } from '@/lib/joinRoom';
import { Button } from '@/components/Button';
import { Navbar } from '@/components/Navbar';

export default function Home() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { addToast } = useToast();
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const handleCreateRoom = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    setIsCreating(true);
    try {
      const { roomId } = await createRoom({
        hostId: user.uid,
        hostName: user.name || 'Host',
      });
      router.push(`/room/${roomId}`);
    } catch (error) {
      addToast('Failed to create room');
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!user || !roomCode || !playerName) return;

    setIsJoining(true);
    try {
      const result = await joinRoom({
        roomId: roomCode,
        playerId: user.uid,
        playerName,
      });

      if (result.success) {
        router.push(`/room/${roomCode.toUpperCase()}`);
      } else if (result.error === 'ROOM_NOT_FOUND') {
        addToast('Room not found');
        setIsJoining(false);
      } else if (result.error === 'ROOM_FULL') {
        addToast('Room is full');
        setIsJoining(false);
      } else if (result.error === 'GAME_STARTED') {
        addToast('Game already started');
        setIsJoining(false);
      }
    } catch (error) {
      addToast('Failed to join room');
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-md mx-auto px-6 py-6 pb-[max(env(safe-area-inset-bottom),1.5rem)]">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">SECRET HITLER</h1>
          <p className="text-gray-600">Digital Roles</p>
        </div>

        <div className="space-y-6">
          <Button
            onClick={handleCreateRoom}
            loading={isCreating || authLoading}
          >
            Create Room
          </Button>

          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold mb-4 text-center">Join Existing Room</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Room Code</label>
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase().slice(0, 6))}
                  placeholder="ABC123"
                  className="w-full px-4 py-3 border rounded-lg uppercase tracking-wider text-center text-xl"
                  maxLength={6}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Your Name</label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value.slice(0, 20))}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 border rounded-lg"
                  maxLength={20}
                />
              </div>
              <Button
                onClick={handleJoinRoom}
                loading={isJoining}
                disabled={!roomCode || !playerName}
                variant="secondary"
              >
                Join Room
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
