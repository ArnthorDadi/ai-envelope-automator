'use client'

import { Player } from '@/lib/rooms'
import { db } from '@/lib/db'
import { GAME_CONSTANTS } from '@/lib/utils'

interface PlayerListProps {
  roomId: string
  players: Player[]
  hostId: string
  currentUserId: string | null
  isHost?: boolean
  onMenuOpen?: (playerId: string) => void
  showDeadToggle?: boolean
}

export function PlayerList({
  roomId,
  players,
  hostId,
  currentUserId,
  isHost = false,
  onMenuOpen,
  showDeadToggle = false,
}: PlayerListProps) {
  const playersNeeded = GAME_CONSTANTS.MIN_PLAYERS - players.length

  const shouldShowMenu = isHost && currentUserId === hostId

  const handleToggleDead = async (playerId: string) => {
    try {
      await db.rooms.togglePlayerDead(roomId, playerId)
    } catch (error) {
      console.error('Failed to toggle dead state:', error)
    }
  }

  return (
    <div className="w-full">
      <h2 className="text-lg font-semibold mb-3 text-center">
        Players ({players.length}/{GAME_CONSTANTS.MIN_PLAYERS} needed)
      </h2>
      <ul className="space-y-2 mb-4">
        {players.map((player) => {
          const isCurrentUser = player.id === currentUserId
          const isCurrentHost = isCurrentUser && shouldShowMenu
          const isClickable = !isCurrentHost && shouldShowMenu

          return (
            <li
              key={player.id}
              onClick={() => {
                if (isClickable && onMenuOpen) {
                  onMenuOpen(player.id)
                }
              }}
              className={`flex items-center gap-2 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${
                isClickable ? 'cursor-pointer' : ''
              } ${player.isDead ? 'opacity-60' : ''}`}
            >
              <span className="text-lg">👤</span>
              <span className="flex-1">
                {player.name}
                {isCurrentUser && ' (You)'}
                {player.isDead && ' (dead)'}
              </span>
              {player.id === hostId && (
                <span className="text-yellow-500">⭐ Host</span>
              )}
              {showDeadToggle && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleToggleDead(player.id)
                  }}
                  className={`text-lg hover:scale-110 transition ${player.isDead ? 'text-red-500' : 'text-gray-400'}`}
                  title={player.isDead ? 'Revive player' : 'Kill player'}
                >
                  💀
                </button>
              )}
              {isClickable && <span className="text-gray-400">⋮</span>}
            </li>
          )
        })}
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
