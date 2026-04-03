'use client'

import { useState, useEffect, useRef } from 'react'
import { db } from '@/lib/db'
import { Player } from '@/lib/rooms'

export function usePlayers(roomId: string) {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const previousPlayersRef = useRef<Player[]>([])

  useEffect(() => {
    setLoading(true)
    const unsubscribe = db.rooms.subscribeToPlayers(roomId, (playersData) => {
      previousPlayersRef.current = playersData
      setPlayers(playersData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [roomId])

  return { players, loading, previousPlayers: previousPlayersRef.current }
}
