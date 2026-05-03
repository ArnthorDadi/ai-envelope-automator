'use client'

import { use } from 'react'
import { useState, useCallback } from 'react'
import { useRoom, usePlayers } from '@/hooks/room'
import { PlayerList } from '@/components/room/player-list'
import { RoleReveal } from '@/components/room/role-reveal'
import { InvestigateButton } from '@/components/room/investigate-button'
import { ResetGameButton } from '@/components/room/reset-game-button'
import { StartVoteButton } from '@/components/room/start-vote-button'
import { LeaveRoomButton } from '@/components/room/leave-room-button'
import { VotingModal } from '@/components/room/voting-modal'
import { useAuth } from '@/contexts/auth-context'
import { Spinner } from '@/components/shared'
import { AuthPrompt } from '@/components/auth'

interface GamePageProps {
  params: Promise<{ roomId: string }>
}

export default function GamePage({ params }: GamePageProps) {
  const { roomId } = use(params)
  const { user, loading: authLoading } = useAuth()
  const { room, loading: roomLoading } = useRoom(roomId)
  const { players, loading: playersLoading } = usePlayers(roomId)
  const [voteEnded, setVoteEnded] = useState(false)

  const handleVoteEnded = useCallback(() => {
    setVoteEnded((prev) => !prev)
  }, [])

  if (authLoading) {
    return (
      <main className="flex items-center justify-center flex-1">
        <Spinner size="md" />
      </main>
    )
  }

  if (!user) {
    return (
      <main className="flex items-center justify-center flex-1">
        <AuthPrompt />
      </main>
    )
  }

  if (roomLoading || playersLoading) {
    return (
      <main className="flex items-center justify-center flex-1">
        <Spinner size="md" />
      </main>
    )
  }

  if (!room) {
    return (
      <main className="flex items-center justify-center flex-1 p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Room not found</h1>
          <p className="text-muted-foreground mb-4">
            This room does not exist or has been deleted.
          </p>
          <a
            href="/"
            className="inline-block px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            Go Back Home
          </a>
        </div>
      </main>
    )
  }

  if (room.status !== 'started') {
    return (
      <main className="flex items-center justify-center flex-1 p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Game not started</h1>
          <p className="text-muted-foreground mb-4">
            The game hasn't started yet.
          </p>
          <a
            href={`/room/${roomId}`}
            className="inline-block px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            Go to Lobby
          </a>
        </div>
      </main>
    )
  }

  return (
    <main className="flex flex-col items-center justify-center flex-1 p-4">
      <h1 className="text-2xl font-bold mb-6">Game Started</h1>
      <PlayerList
        players={players}
        hostId={room.hostId}
        currentUserId={user?.uid || null}
        isHost={user?.uid === room.hostId}
      />
      <div className="mt-6">
        <RoleReveal roomId={roomId} mode="button" />
      </div>
      <div className="mt-4 w-full max-w-md">
        <InvestigateButton roomId={roomId} players={players} />
      </div>
      {user?.uid === room.hostId && (
        <div className="mt-4 w-full max-w-md space-y-4">
          <StartVoteButton
            roomId={roomId}
            disabled={room.isVoting}
          />
          <ResetGameButton
            roomId={roomId}
            playerCount={players.length}
            disabled={players.length < 2}
          />
        </div>
      )}
      <div className="mt-6">
        <LeaveRoomButton roomId={roomId} />
      </div>
      {room.isVoting && (
        <VotingModal
          roomId={roomId}
          playerId={user?.uid || ''}
          isHost={user?.uid === room.hostId}
          room={room}
          players={players}
          onVoteEnded={handleVoteEnded}
        />
      )}
    </main>
  )
}
