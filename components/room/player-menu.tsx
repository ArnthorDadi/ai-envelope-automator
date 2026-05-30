'use client'

import { useState } from 'react'
import { Player } from '@/lib/rooms'
import { db } from '@/lib/db'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/contexts/toast-context'
import { Spinner } from '@/components/shared'

function hashName(name: string): number {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return Math.abs(hash) % 10 + 1
}

interface PlayerMenuProps {
  player: Player
  roomId: string
  currentHostId: string
  onClose: () => void
}

export function PlayerMenu({
  player,
  roomId,
  currentHostId,
  onClose,
}: PlayerMenuProps) {
  const { user } = useAuth()
  const { addToast } = useToast()
  const [transferring, setTransferring] = useState(false)

  const handleTransfer = async () => {
    if (!user || transferring) return

    setTransferring(true)
    try {
      await db.rooms.transferHostTo(roomId, currentHostId, player.id)
      onClose()
    } catch (error) {
      console.error('Failed to transfer host:', error)
      addToast('Failed to transfer host', 'error')
      setTransferring(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50"
      onClick={onClose}
      data-testid="player-menu-overlay"
    >
      <div
        className="stitch-paper-texture w-full max-w-sm mx-4 rounded-lg shadow-2xl relative overflow-hidden p-6"
        style={{
          border: '12px double #4d4635',
          outline: '4px solid #4d4635',
          outlineOffset: '4px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-3 right-3 opacity-10 pointer-events-none">
          <span
            className="material-symbols-outlined text-4xl text-surface-dim rotate-12"
            style={{ fontVariationSettings: '"FILL" 0' }}
          >
            star
          </span>
        </div>

        <h2 className="font-stamp-text text-stamp-text text-primary text-center mb-6 tracking-widest">
          TRANSFER COMMAND
        </h2>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-14 h-14 bg-warm-cream overflow-hidden flex-shrink-0 flex items-center justify-center">
            <img
              src={`/images/silhouettes/identity-silhouette-${hashName(player.name)}.png`}
              alt={player.name}
              className="w-full h-full object-cover grayscale opacity-80"
            />
          </div>
          <div>
            <p className="font-body-lg font-bold text-on-surface">{player.name}</p>
            <p className="text-label-caps text-on-surface-variant">
              Will be able to start the game
            </p>
          </div>
        </div>

        <button
          onClick={handleTransfer}
          disabled={transferring}
          className="w-full bg-primary-container text-on-primary-container h-touch-target font-stamp-text text-stamp-text border-2 border-primary shadow-lg rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 hover:brightness-110 transition-all"
        >
          {transferring ? (
            <>
              <Spinner size="sm" />
              TRANSFERRING COMMAND...
            </>
          ) : (
            'TRANSFER COMMAND'
          )}
        </button>

        <button
          onClick={onClose}
          disabled={transferring}
          className="w-full mt-3 text-on-surface-variant font-label-caps text-label-caps h-touch-target hover:text-on-surface transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
