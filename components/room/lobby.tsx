'use client'

import { useEffect, useRef } from 'react'
import { Room, Player } from '@/lib/rooms'
import { useToast } from '@/contexts/toast-context'
import { useAuth } from '@/contexts/auth-context'
import { PlayerList } from './player-list'
import { ShareButton } from './share-button'
import { LeaveRoomButton } from './leave-room-button'
import { StartGameButton } from './start-game-button'
import { GAME_CONSTANTS } from '@/lib/utils'

interface LobbyProps {
  room: Room
  players: Player[]
}

export function Lobby({ room, players }: LobbyProps) {
  const { user } = useAuth()
  const { addToast } = useToast()
  const previousPlayersRef = useRef<Player[]>([])
  const isHost = user?.uid === room.hostId

  useEffect(() => {
    const previousPlayers = previousPlayersRef.current
    const currentPlayerIds = new Set(players.map((p) => p.id))

    for (const player of players) {
      if (!previousPlayers.find((p) => p.id === player.id)) {
        if (player.id !== user?.uid) {
          addToast(`${player.name} joined`, 'info')
        }
      }
    }

    for (const prevPlayer of previousPlayers) {
      if (!currentPlayerIds.has(prevPlayer.id) && prevPlayer.id !== user?.uid) {
        addToast(`${prevPlayer.name} left`, 'info')
      }
    }

    previousPlayersRef.current = players
  }, [players, user, addToast])

  return (
    <div className="flex flex-col gap-6 w-full max-w-md p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Room: {room.id}</h1>
        <ShareButton roomId={room.id} />
      </div>

      <PlayerList
        players={players}
        hostId={room.hostId}
        currentUserId={user?.uid || null}
      />

      <div className="flex flex-col gap-3">
        {isHost ? (
          <>
            <StartGameButton
              roomId={room.id}
              playerCount={players.length}
              disabled={players.length < GAME_CONSTANTS.MIN_PLAYERS}
            />
            <p className="text-center text-sm text-muted-foreground">
              {players.length < GAME_CONSTANTS.MIN_PLAYERS
                ? `Need ${GAME_CONSTANTS.MIN_PLAYERS - players.length} more player${
                    GAME_CONSTANTS.MIN_PLAYERS - players.length > 1 ? 's' : ''
                  } to start`
                : 'Ready to start!'}
            </p>
          </>
        ) : (
          <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-center">
            Waiting for host to start...
          </div>
        )}

        <LeaveRoomButton roomId={room.id} />
      </div>
    </div>
  )
}
