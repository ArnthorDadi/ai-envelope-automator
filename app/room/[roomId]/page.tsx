'use client'

import { use, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useRoom, usePlayers } from '@/hooks/room'
import { Lobby } from '@/components/room'
import { useAuth } from '@/contexts/auth-context'
import { Spinner } from '@/components/shared'
import { AuthPrompt } from '@/components/auth'

interface RoomPageProps {
  params: Promise<{ roomId: string }>
}

export default function RoomPage({ params }: RoomPageProps) {
  const { roomId } = use(params)
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { room, loading: roomLoading } = useRoom(roomId)
  const { players, loading: playersLoading } = usePlayers(roomId)

  useEffect(() => {
    if (room?.status === 'started') {
      router.push(`/room/${roomId}/game`)
    }
  }, [room?.status, router, roomId])

  if (authLoading) {
    return (
      <main className="flex items-center justify-center flex-1">
        <Spinner size="md" />
      </main>
    )
  }

  if (!user) {
    return (
      <main className="flex items-center justify-center flex-1">
        <AuthPrompt />
      </main>
    )
  }

  if (roomLoading || playersLoading) {
    return (
      <main className="flex items-center justify-center flex-1">
        <Spinner size="md" />
      </main>
    )
  }

  if (!room) {
    return (
      <main className="flex items-center justify-center flex-1 p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Room not found</h1>
          <p className="text-muted-foreground mb-4">
            This room does not exist or has been deleted.
          </p>
          <a
            href="/"
            className="inline-block px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            Go Back Home
          </a>
        </div>
      </main>
    )
  }

  return (
    <main className="flex items-center justify-center flex-1">
      <Lobby room={room} players={players} />
    </main>
  )
}
