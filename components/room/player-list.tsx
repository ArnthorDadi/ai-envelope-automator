'use client'

import { Player } from '@/lib/rooms'
import { db } from '@/lib/db'

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
  const shouldShowMenu = isHost && currentUserId === hostId

  const handleToggleDead = async (playerId: string) => {
    try {
      await db.rooms.togglePlayerDead(roomId, playerId)
    } catch (error) {
      console.error('Failed to toggle dead state:', error)
    }
  }

  return (
    <section className="space-y-4">
      <h3 className="font-stamp-text text-stamp-text text-on-surface border-b border-outline-variant pb-2">
        ENLISTED PERSONNEL
      </h3>
      <div className="space-y-3">
        {players.map((player) => {
          const isCurrentUser = player.id === currentUserId
          const isHostPlayer = player.id === hostId
          const isClickable = !isCurrentUser && shouldShowMenu

          return (
            <div
              key={player.id}
              onClick={() => {
                if (isClickable && onMenuOpen) {
                  onMenuOpen(player.id)
                }
              }}
              className={`flex items-center gap-4 p-3 border rounded-lg ${
                isCurrentUser
                  ? 'bg-primary-container/10 border-primary-container shadow-xl'
                  : 'bg-surface-container-low border-outline-variant opacity-80'
              } ${isClickable ? 'cursor-pointer hover:bg-surface-container transition-colors' : ''} ${player.isDead ? 'opacity-60' : ''}`}
            >
              <div className="w-14 h-14 bg-warm-cream p-1 border border-outline shadow-sm overflow-hidden flex-shrink-0 flex items-center justify-center">
                <span className="material-symbols-outlined text-surface-dim text-3xl" style={{ fontVariationSettings: '"FILL" 1' }}>
                  person
                </span>
              </div>
              <div className="flex-grow min-w-0">
                <p className={`font-body-lg font-bold truncate ${isCurrentUser ? 'text-primary' : 'text-on-surface'}`}>
                  {player.name}
                  {isCurrentUser && (
                    <span className="text-label-caps text-on-surface-variant opacity-70 font-normal"> (YOU)</span>
                  )}
                  {player.isDead && (
                    <span className="text-label-caps text-error font-normal"> (dead)</span>
                  )}
                </p>
                <p className="text-label-caps text-on-surface-variant">
                  {isCurrentUser ? 'OPERATIVE READY' : 'READY'}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {isHostPlayer && (
                  <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: '"FILL" 1' }}>
                    star
                  </span>
                )}
                {!player.isDead && (
                  <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: '"FILL" 1' }}>
                    check_circle
                  </span>
                )}
                {showDeadToggle && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleToggleDead(player.id)
                    }}
                    className="text-lg hover:scale-110 transition"
                    title={player.isDead ? 'Revive player' : 'Kill player'}
                  >
                    {player.isDead ? '🔄' : '💀'}
                  </button>
                )}
                {isClickable && (
                  <span className="material-symbols-outlined text-on-surface-variant">more_vert</span>
                )}
              </div>
            </div>
          )
        })}

      </div>
    </section>
  )
}
