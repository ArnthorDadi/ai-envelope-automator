'use client'

import { useState } from 'react'
import { db } from '@/lib/db'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/contexts/toast-context'
import { Spinner } from '@/components/shared'

interface ResetGameButtonProps {
  roomId: string
  playerCount: number
  disabled: boolean
}

export function ResetGameButton({
  roomId,
  playerCount,
  disabled,
}: ResetGameButtonProps) {
  const { user } = useAuth()
  const { addToast } = useToast()
  const [resetting, setResetting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleReset = async () => {
    if (!user) return

    setResetting(true)
    try {
      await db.rooms.resetGame(roomId, user.uid)
      addToast('Game reset! New roles assigned.', 'success')
      setShowConfirm(false)
    } catch (error) {
      console.error('Failed to reset game:', error)
      addToast('Failed to reset game', 'error')
    } finally {
      setResetting(false)
    }
  }

  if (showConfirm) {
    return (
      <div className="flex flex-col gap-3 p-4 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
        <p className="text-sm font-medium text-center">
          Start a new round with the same players?
        </p>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            disabled={resetting}
            className="flex-1 p-2 bg-red-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center justify-center gap-2"
          >
            {resetting ? <Spinner size="sm" /> : null}
            {resetting ? 'RESETTING...' : 'YES, RESET'}
          </button>
          <button
            onClick={() => setShowConfirm(false)}
            disabled={resetting}
            className="flex-1 p-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            CANCEL
          </button>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      disabled={disabled || resetting}
      className="w-full p-3 bg-orange-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      RESET GAME
    </button>
  )
}
