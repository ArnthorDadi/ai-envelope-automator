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
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-xs flex flex-col gap-3"
    >
      <div className="flex flex-col gap-1">
        <input
          ref={roomCodeRef}
          type="text"
          value={roomCode}
          onChange={handleRoomCodeChange}
          placeholder="ROOM CODE"
          maxLength={6}
          className={`w-full p-3 border rounded-lg text-center text-lg font-mono uppercase tracking-widest ${
            errors.roomCode ? 'border-red-500' : ''
          }`}
          disabled={loading}
          autoComplete="off"
          autoCapitalize="characters"
        />
        {errors.roomCode && (
          <span className="text-red-500 text-sm">{errors.roomCode}</span>
        )}
      </div>

      <button
        type="submit"
        disabled={!roomCode.trim() || loading}
        className="w-full p-3 bg-blue-500 text-white rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? <Spinner size="sm" /> : null}
        {loading ? 'JOINING' : 'JOIN ROOM'}
      </button>
    </form>
  )
}
