'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { db } from '@/lib/db'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/contexts/toast-context'
import { Spinner } from '@/components/shared'

interface LeaveRoomButtonProps {
  roomId: string
}

export function LeaveRoomButton({ roomId }: LeaveRoomButtonProps) {
  const { user } = useAuth()
  const router = useRouter()
  const { addToast } = useToast()
  const [leaving, setLeaving] = useState(false)

  const handleLeave = async () => {
    if (!user) return

    setLeaving(true)
    try {
      await db.rooms.leaveRoom(roomId, user.uid)
      router.push('/')
    } catch (error) {
      console.error('Failed to leave room:', error)
      addToast('Failed to leave room', 'error')
      setLeaving(false)
    }
  }

  return (
    <button
      onClick={handleLeave}
      disabled={leaving}
      className="w-full py-2 text-on-surface font-label-caps uppercase flex items-center justify-center gap-2 hover:bg-error-container/10 transition-colors disabled:opacity-50"
    >
      {leaving ? (
        <Spinner size="sm" />
      ) : (
        <span className="material-symbols-outlined text-[16px]">logout</span>
      )}
      {leaving ? 'LEAVING' : 'LEAVE GAME'}
    </button>
  )
}
