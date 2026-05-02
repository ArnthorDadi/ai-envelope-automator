'use client'

import { useState } from 'react'
import { db } from '@/lib/db'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/contexts/toast-context'
import { Spinner } from '@/components/shared'
import { Player } from '@/lib/rooms'

interface InvestigateButtonProps {
  roomId: string
  players: Player[]
}

export function InvestigateButton({ roomId, players }: InvestigateButtonProps) {
  const { user } = useAuth()
  const { addToast } = useToast()
  const [showModal, setShowModal] = useState(false)
  const [investigatingId, setInvestigatingId] = useState<string | null>(null)

  const otherPlayers = players.filter((p) => p.id !== user?.uid && !p.leftAt)

  const handleInvestigate = async (targetId: string, targetName: string) => {
    if (!user) return

    setInvestigatingId(targetId)
    try {
      const result = await db.investigate.investigate(
        roomId,
        user.uid,
        targetId
      )
      addToast(`${targetName} is a ${result.toUpperCase()}`, 'info')
      setShowModal(false)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Investigation failed'
      addToast(message, 'error')
    } finally {
      setInvestigatingId(null)
    }
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="w-full p-3 bg-purple-500 text-white rounded-lg flex items-center justify-center gap-2"
      >
        INVESTIGATE
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Select Player</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Choose a player to investigate
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {otherPlayers.map((player) => (
                <button
                  key={player.id}
                  onClick={() => handleInvestigate(player.id, player.name)}
                  disabled={investigatingId !== null}
                  className="w-full p-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex items-center justify-between"
                >
                  <span>{player.name}</span>
                  {investigatingId === player.id ? (
                    <Spinner size="sm" />
                  ) : (
                    <span className="text-gray-400">→</span>
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowModal(false)}
              disabled={investigatingId !== null}
              className="w-full mt-4 p-3 bg-gray-200 dark:bg-gray-700 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  )
}
