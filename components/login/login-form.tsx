'use client'

import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { Spinner } from '@/components/shared'
import { db } from '@/lib/db'

export function LoginForm({
  createRoomOnLogin,
  joinRoomCode,
}: {
  createRoomOnLogin?: boolean
  joinRoomCode?: string
}) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { signIn } = useAuth()
  const router = useRouter()

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)
    try {
      const userData = await signIn(name.trim())

      if (createRoomOnLogin) {
        const { roomId } = await db.rooms.createRoom({
          hostId: userData.uid,
          hostName: name.trim(),
        })
        router.push(`/room/${roomId}`)
      } else if (joinRoomCode) {
        try {
          const { roomId } = await db.rooms.joinRoom(joinRoomCode, {
            playerId: userData.uid,
            playerName: name.trim(),
          })
          router.push(`/room/${roomId}`)
        } catch {
          router.push(`/?joinError=${joinRoomCode}`)
        }
      } else {
        router.push('/')
      }
    } catch {
      // Error handled in context
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-2 mb-12">
      <label
        className="font-stamp-text text-stamp-text block ml-1 text-warm-cream"
        htmlFor="agent-name"
      >
        AGENT SIGNATURE
      </label>
      <div className="relative group">
        <input
          ref={inputRef}
          id="agent-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value.slice(0, 20))}
          placeholder="Type name..."
          disabled={loading}
          maxLength={20}
          className="w-full bg-transparent border-t-0 border-x-0 border-b-2 focus:border-primary-container focus:ring-0 font-code-display text-code-display transition-colors uppercase placeholder:text-warm-cream/10 border-primary px-4 py-1"
        />
        <span className="absolute -right-2 top-0 material-symbols-outlined rotate-12 text-warm-cream/40">
          edit_note
        </span>
      </div>
      <p className="font-label-caps text-[10px] tracking-tight text-warm-cream/40">
        * BY SIGNING, YOU ACKNOWLEDGE THE SECRECY OF THE LEGISLATIVE SESSION.
      </p>

      <button
        type="submit"
        disabled={!name.trim() || loading}
        className="group relative w-full h-touch-target bg-primary-container text-on-primary-container font-stamp-text text-stamp-text tracking-widest rounded-sm border-2 border-primary shadow-lg active:scale-95 transition-all flex items-center justify-center overflow-hidden hover:bg-primary mt-4"
      >
        <span className="relative z-10">
          {loading ? 'SUBMITTING' : 'CONTINUE'}
        </span>
        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent pointer-events-none" />
        <div className="absolute -right-4 -top-4 w-12 h-12 bg-on-primary-container opacity-5 rounded-full blur-xl group-hover:scale-150 transition-transform" />
        {loading && <Spinner size="sm" />}
      </button>
    </form>
  )
}
