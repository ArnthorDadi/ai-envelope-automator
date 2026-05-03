'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { db } from '@/lib/db'
import { Room, Player } from '@/lib/rooms'

const VOTE_DURATION = 3 * 60 * 1000 // 3 minutes

interface VotingModalProps {
  roomId: string
  playerId: string
  isHost: boolean
  room: Room
  players: Player[]
  onVoteEnded: () => void
}

export function VotingModal({
  roomId,
  playerId,
  isHost,
  room,
  players,
  onVoteEnded,
}: VotingModalProps) {
  const [timeLeft, setTimeLeft] = useState(VOTE_DURATION)
  const endedRef = useRef(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const vote = room.votes?.[playerId] || null
  const result = room.lastVoteResult
  const showResult = !!result && room.isVoting

  const endVote = useCallback(async () => {
    if (endedRef.current) return
    endedRef.current = true

    const votes = room.votes || {}
    const yesVotes = Object.values(votes).filter((v) => v === 'yes').length
    const noVotes = Object.values(votes).filter((v) => v === 'no').length

    const voteResult: 'passed' | 'failed' = yesVotes > noVotes ? 'passed' : 'failed'

    try {
      await db.rooms.endVote(roomId, voteResult)
    } catch (error) {
      console.error('Failed to end vote:', error)
      endedRef.current = false
    }
  }, [room.votes, roomId])

  // Timer and all-voted check
  useEffect(() => {
    if (!room.isVoting || showResult || endedRef.current) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    const checkEndConditions = () => {
      if (endedRef.current) return

      const startedAt = room.votingStartedAt
      if (!startedAt) return

      const elapsed = Date.now() - startedAt
      const remaining = Math.max(0, VOTE_DURATION - elapsed)
      setTimeLeft(remaining)

      if (remaining === 0) {
        endVote()
        return
      }

      const activePlayers = players.filter((p) => !p.leftAt)
      const allVoted = activePlayers.every(
        (p) => room.votes && room.votes[p.id] !== null && room.votes[p.id] !== undefined
      )

      if (allVoted && activePlayers.length > 0) {
        endVote()
      }
    }

    checkEndConditions()
    intervalRef.current = setInterval(checkEndConditions, 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [room.isVoting, room.votingStartedAt, room.votes, players, showResult, endVote])

  // Result display timeout
  useEffect(() => {
    if (showResult && !timeoutRef.current) {
      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = null
        onVoteEnded()
      }, 5000)

      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
          timeoutRef.current = null
        }
      }
    }
  }, [showResult, onVoteEnded])

  const handleVote = useCallback(
    async (choice: 'yes' | 'no') => {
      try {
        await db.rooms.submitVote(roomId, playerId, choice)
      } catch (error) {
        console.error('Failed to submit vote:', error)
      }
    },
    [roomId, playerId]
  )

  const handleChangeMind = useCallback(async () => {
    try {
      await db.rooms.clearPlayerVote(roomId, playerId)
    } catch (error) {
      console.error('Failed to clear vote:', error)
    }
  }, [roomId, playerId])

  const handleCancelVote = useCallback(async () => {
    try {
      await db.rooms.cancelVote(roomId, playerId)
    } catch (error) {
      console.error('Failed to cancel vote:', error)
    }
  }, [roomId, playerId])

  const formatTime = (ms: number) => {
    const seconds = Math.ceil(ms / 1000)
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!room.isVoting) return null

  if (showResult && result) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
        <div className="bg-white dark:bg-gray-900 rounded-lg p-8 max-w-sm w-full mx-4 text-center">
          <h2 className="text-2xl font-bold mb-4">
            Vote {result === 'passed' ? 'Passed' : 'Failed'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {result === 'passed'
              ? 'The vote has passed.'
              : 'The vote has failed.'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="bg-white dark:bg-gray-900 rounded-lg p-8 max-w-sm w-full mx-4">
        <h2 className="text-2xl font-bold text-center mb-2">Vote</h2>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
          Time left: {formatTime(timeLeft)}
        </p>

        {vote === null ? (
          <div className="flex gap-4">
            <button
              onClick={() => handleVote('yes')}
              className="flex-1 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
            >
              Yes
            </button>
            <button
              onClick={() => handleVote('no')}
              className="flex-1 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
            >
              No
            </button>
          </div>
        ) : (
          <div className="text-center">
            <p className="mb-4">You voted: {vote === 'yes' ? 'Yes' : 'No'}</p>
            <button
              onClick={handleChangeMind}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition"
            >
              Changed my mind
            </button>
          </div>
        )}

        {isHost && (
          <button
            onClick={handleCancelVote}
            className="mt-6 w-full py-3 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-semibold hover:bg-gray-400 dark:hover:bg-gray-600 transition"
          >
            Cancel Vote
          </button>
        )}
      </div>
    </div>
  )
}
