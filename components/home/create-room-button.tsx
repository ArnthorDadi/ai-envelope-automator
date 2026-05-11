'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { useToast } from '@/contexts/toast-context'
import { db } from '@/lib/db'
import { Spinner } from '@/components/shared'

export function CreateRoomButton() {
  const { user } = useAuth()
  const router = useRouter()
  const { addToast } = useToast()
  const [creating, setCreating] = useState(false)

  const handleCreateRoom = async () => {
    if (!user) {
      router.push('/login?createRoom=true')
      return
    }

    setCreating(true)
    try {
      const { roomId } = await db.rooms.createRoom({
        hostId: user.uid,
        hostName: user.name,
      })
      router.push(`/room/${roomId}`)
    } catch (error) {
      console.error('Failed to create room:', error)
      addToast('Failed to create room. Please try again.', 'error')
      setCreating(false)
    }
  }

  return (
    <section className="w-full">
      <button
        onClick={handleCreateRoom}
        disabled={creating}
        className="w-full py-8 border-4 border-dashed border-primary text-primary bg-primary/5 rounded-xl stamp-effect flex flex-col items-center justify-center gap-2 hover:bg-primary/10 hover:border-solid transition-all duration-300 group disabled:opacity-50"
      >
        {creating ? (
          <Spinner size="sm" />
        ) : (
          <>
            <span className="font-stamp-text text-[40px] tracking-widest group-hover:scale-105 transition-transform ink-bleed">
              CREATE ROOM
            </span>
            <span className="font-label-caps text-label-caps tracking-[0.3em] opacity-60">
              AUTHORIZE NEW SESSION
            </span>
          </>
        )}
      </button>
    </section>
  )
}
