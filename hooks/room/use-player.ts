'use client'

import { useState, useEffect } from 'react'
import { db } from '@/lib/db'
import { Player } from '@/lib/rooms'
import { useAuth } from '@/contexts/auth-context'

export function usePlayer(roomId: string) {
  const { user } = useAuth()
  const [player, setPlayer] = useState<Player | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.uid || !roomId) {
      setLoading(false)
      return
    }

    setLoading(true)
    const unsubscribe = db.rooms.subscribeToPlayer(
      roomId,
      user.uid,
      (playerData) => {
        setPlayer(playerData)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [roomId, user?.uid])

  return { player, loading }
}
