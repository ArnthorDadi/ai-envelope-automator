'use client'

import { useState, useEffect } from 'react'
import { db } from '@/lib/db'
import { Room } from '@/lib/rooms'

export function useRoom(roomId: string) {
  const [room, setRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const unsubscribe = db.rooms.subscribeToRoom(roomId, (roomData) => {
      setRoom(roomData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [roomId])

  return { room, loading }
}
