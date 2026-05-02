'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { usePlayer } from '@/hooks/room'
import { usePlayers } from '@/hooks/room'
import { getVisibleAllies, Role, VisibleAlly } from '@/lib/rooms'
import { GAME_CONSTANTS } from '@/lib/utils'

interface RoleRevealProps {
  roomId: string
  onDismiss?: () => void
  mode?: 'auto' | 'button'
}

const ROLE_CONFIG = {
  liberal: {
    label: 'Liberal',
    icon: '💙',
    color: 'bg-blue-500',
    message:
      'Your mission: Enact 5 liberal policies or find and eliminate Hitler.',
  },
  fascist: {
    label: 'Fascist',
    icon: '👤',
    color: 'bg-red-500',
    message: 'Work with your team to enact fascist policies.',
  },
  hitler: {
    label: 'Hitler',
    icon: '🕵️',
    color: 'bg-red-700',
    message: 'Act like a liberal to survive.',
  },
} as const

export function RoleReveal({
  roomId,
  onDismiss,
  mode = 'auto',
}: RoleRevealProps) {
  const { player } = usePlayer(roomId)
  const { players } = usePlayers(roomId)

  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const pauseRef = useRef(false)
  const hasShownRef = useRef(false)

  const role = player?.role as Role | null

  const otherPlayers = players.filter((p) => p.id !== player?.id)
  const allies = getVisibleAllies(role, otherPlayers, players.length)

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const handleDismiss = useCallback(() => {
    setIsAnimating(true)
    setTimeout(() => {
      setIsVisible(false)
      setIsAnimating(false)
    }, 300)
  }, [])

  const startTimer = useCallback(() => {
    clearTimer()
    if (!role) return

    timerRef.current = setTimeout(() => {
      if (!pauseRef.current) {
        handleDismiss()
      }
    }, 5000)
  }, [clearTimer, role, handleDismiss])

  const handleShow = useCallback(() => {
    if (!role) return
    pauseRef.current = false
    setIsVisible(true)
    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 500)
    startTimer()
  }, [role, startTimer])

  const handleInteractionStart = useCallback(() => {
    pauseRef.current = true
    clearTimer()
  }, [clearTimer])

  const handleInteractionEnd = useCallback(() => {
    pauseRef.current = false
    startTimer()
  }, [startTimer])

  useEffect(() => {
    if (mode === 'auto' && role && !hasShownRef.current && !isVisible) {
      hasShownRef.current = true
      handleShow()
    }
  }, [role, handleShow, isVisible, mode])

  useEffect(() => {
    return () => clearTimer()
  }, [clearTimer])

  if (!role) return null

  const config = ROLE_CONFIG[role]

  return (
    <>
      {isVisible && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={handleDismiss}
        >
          <div
            className={`w-full max-w-sm rounded-xl p-6 shadow-2xl ${config.color} text-white ${isAnimating ? 'animate-in fade-in zoom-in duration-300' : 'animate-out fade-out duration-300'}`}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={handleInteractionStart}
            onMouseUp={handleInteractionEnd}
            onTouchStart={handleInteractionStart}
            onTouchEnd={handleInteractionEnd}
          >
            <div className="mb-4 text-center">
              <p className="mb-2 text-lg font-semibold">
                YOU ARE A {config.label}
              </p>
              <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-white/20 text-5xl">
                {config.icon}
              </div>
              <p className="text-sm text-white/90">{config.message}</p>
            </div>

            {allies.length > 0 && (
              <div className="mb-4">
                <p className="mb-2 text-center text-sm font-medium text-white/80">
                  Your teammates:
                </p>
                <div className="space-y-2 rounded-lg bg-black/10 p-3">
                  {allies.map((ally) => (
                    <div
                      key={ally.id}
                      className="flex items-center justify-between px-2 py-1"
                    >
                      <span>{ally.name}</span>
                      <span className="text-xs">
                        ({ally.role === 'hitler' ? 'Hitler' : 'Fascist'})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {role === 'hitler' &&
              players.length >
                GAME_CONSTANTS.HITLER_SEES_FASCISTS_THRESHOLD && (
                <p className="mb-4 text-center text-sm text-white/80">
                  You do NOT know who your teammates are.
                </p>
              )}

            <button
              onClick={handleShow}
              className="w-full rounded-lg bg-white/20 py-2 text-center text-sm font-medium transition hover:bg-white/30"
            >
              View Role
            </button>
          </div>
        </div>
      )}

      {role && !isVisible && (
        <button
          onClick={handleShow}
          className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-600"
        >
          View My Role
        </button>
      )}
    </>
  )
}
