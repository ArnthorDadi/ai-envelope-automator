'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { useRoom, usePlayers, usePlayer } from '@/hooks/useRoom';
import { startGame } from '@/lib/startGame';
import { leaveRoom } from '@/lib/leaveRoom';
import { transferHost } from '@/lib/transferHost';
import { joinRoom } from '@/lib/joinRoom';
import { resetGame } from '@/lib/resetGame';
import { deleteRoom } from '@/lib/deleteRoom';
import { Button } from '@/components/Button';
import { Navbar } from '@/components/Navbar';
import { RoleCard } from '@/components/RoleCard';
import { PlayerList } from '@/components/PlayerList';
import { ShareButton } from '@/components/ShareButton';
import { ErrorPage } from '@/components/ErrorPage';
import { MIN_PLAYERS, RoomErrorType } from '@/lib/types';

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;
  const { user, loading: authLoading } = useAuth();
  const { addToast } = useToast();
  
  const { room, loading: roomLoading, error } = useRoom(roomId);
  const { players, loading: playersLoading } = usePlayers(roomId);
  const { player: currentPlayer } = usePlayer(roomId, user?.uid || '');
  
  const [isStarting, setIsStarting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isQuitting, setIsQuitting] = useState(false);
  const [showRoleCard, setShowRoleCard] = useState(false);
  const [joinError, setJoinError] = useState<RoomErrorType | null>(null);
  const [roomDeleted, setRoomDeleted] = useState(false);
  const [leavingPlayerIds, setLeavingPlayerIds] = useState<Set<string>>(new Set());
  const [joiningPlayerIds, setJoiningPlayerIds] = useState<Set<string>>(new Set());
  const prevPlayersRef = useRef<string[]>([]);
  const hasJoinedRef = useRef(false);

  const isHost = room?.hostId === user?.uid;
  const playerCount = players.length;
  const needsMorePlayers = MIN_PLAYERS - playerCount;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (room?.status === 'started' && currentPlayer?.role) {
      setShowRoleCard(true);
    }
  }, [room?.status, currentPlayer?.role]);

  useEffect(() => {
    if (user && room && !currentPlayer && !playersLoading && !hasJoinedRef.current) {
      hasJoinedRef.current = true;
      joinRoom({
        roomId,
        playerId: user.uid,
        playerName: user.name || 'Player',
      }).then((result) => {
        if (!result.success) {
          if (result.error === 'ROOM_FULL') {
            setJoinError('ROOM_FULL');
          } else if (result.error === 'GAME_STARTED') {
            setJoinError('GAME_STARTED');
          } else if (result.error === 'ROOM_NOT_FOUND') {
            setRoomDeleted(true);
          } else {
            addToast('Failed to join room');
          }
        }
      });
    }
  }, [user, room, currentPlayer, playersLoading, roomId, addToast]);

  useEffect(() => {
    if (error || !room) {
      if (joinError === 'ROOM_FULL') {
        return;
      }
      if (joinError === 'GAME_STARTED') {
        return;
      }
      if (roomDeleted) {
        return;
      }
    }
  }, [error, room, joinError, roomDeleted]);

  useEffect(() => {
    const currentPlayerIds = players.map(p => p.id);
    const prevPlayerIds = prevPlayersRef.current;

    const joined = currentPlayerIds.filter(id => !prevPlayerIds.includes(id));
    const left = prevPlayerIds.filter(id => !currentPlayerIds.includes(id));

    if (joined.length > 0) {
      setJoiningPlayerIds(new Set(joined));
      setTimeout(() => setJoiningPlayerIds(new Set()), 300);
    }

    if (left.length > 0) {
      setLeavingPlayerIds(new Set(left));
      setTimeout(() => setLeavingPlayerIds(new Set()), 200);
    }

    prevPlayersRef.current = currentPlayerIds;
  }, [players]);

  const handleStartGame = async () => {
    if (!isHost || playerCount < MIN_PLAYERS) return;

    setIsStarting(true);
    try {
      const result = await startGame(roomId, players);
      if (result.success) {
        addToast('Game started!');
      } else if (result.error === 'NOT_ENOUGH_PLAYERS') {
        addToast('Need more players');
        setIsStarting(false);
      }
    } catch (err) {
      addToast('Failed to start game');
      setIsStarting(false);
    }
  };

  const handleLeaveRoom = async () => {
    if (!user) return;
    
    const wasHost = isHost;
    
    try {
      await leaveRoom(roomId, user.uid);
      
      if (wasHost && playerCount > 1) {
        const result = await transferHost(roomId);
        if (result.success && result.newHostName) {
          addToast(`${result.newHostName} is now the host`);
        }
      }
      
      router.push('/');
    } catch (err) {
      addToast('Failed to leave room');
    }
  };

  const handleResetGame = async () => {
    if (!isHost) return;
    
    const confirmed = window.confirm('Are you sure you want to reset the game? All roles will be randomized.');
    if (!confirmed) return;

    setIsResetting(true);
    try {
      await resetGame(roomId, players);
      addToast('New round started');
    } catch (err) {
      addToast('Failed to reset game');
      setIsResetting(false);
    }
  };

  const handleQuitGame = async () => {
    if (!isHost) return;

    const confirmed = window.confirm('Are you sure you want to quit? This will delete the room for all players.');
    if (!confirmed) return;

    setIsQuitting(true);
    try {
      await deleteRoom(roomId);
      addToast('Room has been deleted');
      router.push('/');
    } catch (err) {
      addToast('Failed to delete room');
      setIsQuitting(false);
    }
  };

  if (authLoading || roomLoading || playersLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-md mx-auto px-6 py-6 flex items-center justify-center">
          <p>Loading room...</p>
        </main>
      </div>
    );
  }

  if (joinError) {
    return <ErrorPage type={joinError} roomCode={roomId} />;
  }

  if (roomDeleted || (error && !room)) {
    return <ErrorPage type="ROOM_DELETED" roomCode={roomId} />;
  }

  if (!room) {
    return <ErrorPage type="ROOM_NOT_FOUND" roomCode={roomId} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
        <main className="max-w-[480px] mx-auto px-6 py-6 pb-[max(env(safe-area-inset-bottom),1.5rem)]">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold">Room: {roomId}</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              {room.status === 'started' ? 'Started' : 'Lobby'}
            </span>
            <ShareButton roomCode={roomId} />
          </div>
        </div>

        <div className="mb-6">
          <h2 className="font-semibold mb-3">
            Players ({playerCount}{room.status === 'lobby' && `, need ${needsMorePlayers} more`}):
          </h2>
          <PlayerList
            players={players}
            hostId={room.hostId}
            currentUserId={user?.uid}
            joiningPlayerIds={joiningPlayerIds}
            leavingPlayerIds={leavingPlayerIds}
          />
        </div>

        {room.status === 'lobby' && (
          <div className="space-y-3">
            {isHost ? (
              <>
                {needsMorePlayers > 0 ? (
                  <p className="text-center text-gray-600">
                    Need {needsMorePlayers} more player{needsMorePlayers > 1 ? 's' : ''} to start
                  </p>
                ) : (
                  <p className="text-center text-green-600">
                    Ready to start!
                  </p>
                )}
                <Button
                  onClick={handleStartGame}
                  loading={isStarting}
                  disabled={needsMorePlayers > 0}
                >
                  Start Game
                </Button>
              </>
            ) : (
              <p className="text-center text-gray-600">
                Waiting for host to start...
              </p>
            )}
          </div>
        )}

        {room.status === 'started' && (
          <div className="space-y-3">
            <Button
              variant="secondary"
              onClick={() => setShowRoleCard(true)}
            >
              View My Role
            </Button>
            {isHost && (
              <>
                <Button
                  variant="secondary"
                  onClick={handleResetGame}
                  loading={isResetting}
                >
                  Reset Game
                </Button>
                <Button
                  variant="danger"
                  onClick={handleQuitGame}
                  loading={isQuitting}
                >
                  Quit Game
                </Button>
              </>
            )}
          </div>
        )}

        <div className="mt-6">
          <Button
            variant="secondary"
            onClick={handleLeaveRoom}
          >
            Leave Room
          </Button>
        </div>

        {showRoleCard && currentPlayer?.role && (
          <RoleCard
            role={currentPlayer.role}
            onClose={() => setShowRoleCard(false)}
          />
        )}
      </main>
    </div>
  );
}
