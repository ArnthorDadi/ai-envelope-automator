'use client'

import { useState } from 'react'
import { Player } from '@/lib/rooms'
import { db } from '@/lib/db'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/contexts/toast-context'
import { Spinner } from '@/components/shared'

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
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />
      <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-2xl p-4 pb-8 animate-slide-up">
        <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-4" />
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">👤</span>
          <div>
            <p className="font-semibold">{player.name}</p>
            <p className="text-sm text-muted-foreground">
              Will be able to start the game
            </p>
          </div>
        </div>
        <button
          onClick={handleTransfer}
          disabled={transferring}
          className="w-full p-4 bg-blue-500 text-white rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {transferring ? (
            <>
              <Spinner size="sm" />
              TRANSFERRING...
            </>
          ) : (
            'Transfer Host'
          )}
        </button>
      </div>
    </div>
  )
}
