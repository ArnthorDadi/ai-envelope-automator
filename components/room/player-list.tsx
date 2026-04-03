'use client'

import { Player } from '@/lib/rooms'
import { GAME_CONSTANTS } from '@/lib/utils'

interface PlayerListProps {
  players: Player[]
  hostId: string
  currentUserId: string | null
}

export function PlayerList({
  players,
  hostId,
  currentUserId,
}: PlayerListProps) {
  const playersNeeded = GAME_CONSTANTS.MIN_PLAYERS - players.length

  return (
    <div className="w-full">
      <h2 className="text-lg font-semibold mb-3 text-center">
        Players ({players.length}/{GAME_CONSTANTS.MIN_PLAYERS} needed)
      </h2>
      <ul className="space-y-2 mb-4">
        {players.map((player) => (
          <li
            key={player.id}
            className="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
          >
            <span className="text-lg">👤</span>
            <span className="flex-1">
              {player.name}
              {player.id === currentUserId && ' (You)'}
            </span>
            {player.id === hostId && (
              <span className="text-yellow-500">⭐ Host</span>
            )}
          </li>
        ))}
      </ul>
      {playersNeeded > 0 && (
        <p className="text-center text-muted-foreground">
          Waiting for {playersNeeded} more player{playersNeeded > 1 ? 's' : ''}
          ...
        </p>
      )}
    </div>
  )
}
