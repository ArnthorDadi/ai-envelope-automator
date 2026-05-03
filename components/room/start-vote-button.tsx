'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { db } from '@/lib/db'

interface StartVoteButtonProps {
  roomId: string
  disabled?: boolean
}

export function StartVoteButton({ roomId, disabled }: StartVoteButtonProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleStartVote = async () => {
    if (!user) return
    setLoading(true)
    try {
      await db.rooms.startVote(roomId, user.uid)
    } catch (error) {
      console.error('Failed to start vote:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleStartVote}
      disabled={disabled || loading}
      className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
    >
      {loading ? 'Starting...' : 'Start Vote'}
    </button>
  )
}
