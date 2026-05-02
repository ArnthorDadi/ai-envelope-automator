'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { db } from '@/lib/db'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/contexts/toast-context'
import { Spinner } from '@/components/shared'

interface StartGameButtonProps {
  roomId: string
  playerCount: number
  disabled: boolean
}

export function StartGameButton({
  roomId,
  playerCount,
  disabled,
}: StartGameButtonProps) {
  const { user } = useAuth()
  const router = useRouter()
  const { addToast } = useToast()
  const [starting, setStarting] = useState(false)

  const handleStartGame = async () => {
    if (!user) return

    setStarting(true)
    try {
      await db.rooms.startGame(roomId, user.uid)
      addToast('Game started!', 'success')
      router.push(`/room/${roomId}/game`)
    } catch (error) {
      console.error('Failed to start game:', error)
      addToast('Failed to start game', 'error')
      setStarting(false)
    }
  }

  return (
    <button
      onClick={handleStartGame}
      disabled={disabled || starting}
      className="w-full p-3 bg-green-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      {starting ? <Spinner size="sm" /> : null}
      {starting ? 'STARTING' : 'START GAME'}
    </button>
  )
}
