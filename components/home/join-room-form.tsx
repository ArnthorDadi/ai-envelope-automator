'use client'

import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { useToast } from '@/contexts/toast-context'
import { db } from '@/lib/db'
import { Spinner } from '@/components/shared'
import { isValidRoomCode } from '@/lib/utils'

export function JoinRoomForm() {
  const [roomCode, setRoomCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ roomCode?: string }>({})
  const roomCodeRef = useRef<HTMLInputElement>(null)
  const { user } = useAuth()
  const router = useRouter()
  const { addToast } = useToast()

  useEffect(() => {
    roomCodeRef.current?.focus()
  }, [])

  const validateInputs = (): boolean => {
    const newErrors: { roomCode?: string } = {}
    const trimmedCode = roomCode.toUpperCase().trim()

    if (!trimmedCode) {
      newErrors.roomCode = 'Room code is required'
    } else if (!isValidRoomCode(trimmedCode)) {
      newErrors.roomCode = 'Invalid room code'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleRoomCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
      .toUpperCase()
      .replace(/[^ABCDEFGHJKLMNPQRSTUVWXYZ23456789]/g, '')
      .slice(0, 6)
    setRoomCode(value)
    if (errors.roomCode) {
      setErrors((prev) => ({ ...prev, roomCode: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      addToast('Please log in first.', 'error')
      return
    }

    if (!validateInputs()) {
      return
    }

    setLoading(true)
    try {
      const { roomId } = await db.rooms.joinRoom(roomCode, {
        playerId: user.uid,
        playerName: user.name,
      })
      router.push(`/room/${roomId}`)
    } catch (error: any) {
      if (error.code === 'ROOM_NOT_FOUND') {
        setErrors((prev) => ({ ...prev, roomCode: 'Room not found' }))
      } else if (error.code === 'ROOM_FULL') {
        setErrors((prev) => ({ ...prev, roomCode: 'Room is full' }))
      } else if (error.code === 'GAME_STARTED') {
        setErrors((prev) => ({ ...prev, roomCode: 'Game already started' }))
      } else if (error.code === 'INVALID_CODE') {
        setErrors((prev) => ({ ...prev, roomCode: 'Invalid room code' }))
      } else {
        addToast('Failed to join room. Please try again.', 'error')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="w-full bg-warm-cream p-8 rounded-sm paper-texture shadow-2xl relative overflow-hidden flex flex-col gap-6">
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-hitler-accent/10 rounded-full blur-2xl" />
      <div className="flex items-center gap-3 border-b-2 border-outline/30 pb-2 mb-2">
        <span className="material-symbols-outlined text-warm-cream">assignment_ind</span>
        <h3 className="font-stamp-text text-2xl tracking-wide text-warm-cream">
          JOIN EXISTING ROOM
        </h3>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label className="font-label-caps italic text-warm-cream opacity-90">
            CLASSIFIED ROOM CODE
          </label>
          <div className="relative">
            <input
              ref={roomCodeRef}
              type="text"
              value={roomCode}
              onChange={handleRoomCodeChange}
              placeholder="______"
              maxLength={6}
              className={`w-full bg-transparent border-b-2 font-code-display text-code-display py-2 tracking-[0.5em] focus:outline-none placeholder-surface-dim/20 uppercase text-center text-warm-cream border-warm-cream/50 placeholder-warm-cream/30 ${
                errors.roomCode ? 'border-error' : ''
              }`}
              disabled={loading}
              autoComplete="off"
              autoCapitalize="characters"
            />
          </div>
          {errors.roomCode && (
            <span className="text-error text-sm font-body-md">{errors.roomCode}</span>
          )}
        </div>

        <button
          type="submit"
          disabled={!roomCode.trim() || loading}
          className="w-full bg-surface-dim text-warm-cream py-4 font-stamp-text text-xl tracking-widest hover:bg-surface-bright transition-colors mt-4 shadow-lg active:scale-95 duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <Spinner size="sm" /> : null}
          {loading ? 'INFILTRATING...' : 'infiltrate Room'}
        </button>
      </form>
    </section>
  )
}
