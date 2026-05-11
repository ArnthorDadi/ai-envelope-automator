'use client'

import { useEffect, useRef, useState } from 'react'
import { Room, Player } from '@/lib/rooms'
import { useToast } from '@/contexts/toast-context'
import { useAuth } from '@/contexts/auth-context'
import { PlayerList } from './player-list'
import { PlayerMenu } from './player-menu'
import { ShareButton } from './share-button'
import { LeaveRoomButton } from './leave-room-button'
import { StartGameButton } from './start-game-button'
import { GAME_CONSTANTS } from '@/lib/utils'

interface LobbyProps {
  room: Room
  players: Player[]
}

export function Lobby({ room, players }: LobbyProps) {
  const { user } = useAuth()
  const { addToast } = useToast()
  const previousPlayersRef = useRef<Player[]>([])
  const previousHostIdRef = useRef<string | null>(null)
  const isHost = user?.uid === room.hostId
  const [menuOpenFor, setMenuOpenFor] = useState<string | null>(null)

  const openPlayer = players.find((p) => p.id === menuOpenFor) || null
  const gameStarted = room.status === 'started'
  const playersNeeded = Math.max(0, GAME_CONSTANTS.MIN_PLAYERS - players.length)
  const progressPercent = Math.min(
    100,
    (players.length / GAME_CONSTANTS.MAX_PLAYERS) * 100
  )

  useEffect(() => {
    const previousPlayers = previousPlayersRef.current
    const currentPlayerIds = new Set(players.map((p) => p.id))

    for (const player of players) {
      if (!previousPlayers.find((p) => p.id === player.id)) {
        if (player.id !== user?.uid) {
          addToast(`${player.name} joined`, 'info')
        }
      }
    }

    for (const prevPlayer of previousPlayers) {
      if (!currentPlayerIds.has(prevPlayer.id) && prevPlayer.id !== user?.uid) {
        addToast(`${prevPlayer.name} left`, 'info')
      }
    }

    previousPlayersRef.current = players
  }, [players, user, addToast])

  useEffect(() => {
    const previousHostId = previousHostIdRef.current

    if (previousHostId && previousHostId !== room.hostId) {
      const newHost = players.find((p) => p.id === room.hostId)
      if (newHost) {
        addToast(`${newHost.name} is now the host`, 'info')
      }
    }

    previousHostIdRef.current = room.hostId
  }, [room.hostId, players, addToast])

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(room.id)
      addToast('Code copied!', 'success')
    } catch {
      addToast('Failed to copy code', 'error')
    }
  }

  return (
    <div className="flex flex-col flex-1 relative">
      <div className="flex-1 overflow-y-auto px-margin-mobile pt-12 pb-52 space-y-8">
        <section className="text-center space-y-4">
          <h1 className="font-headline-xl text-headline-xl text-primary tracking-[0.3em] uppercase ink-bleed mb-8">
            SECRET ROOM
          </h1>
          <div className="inline-block relative">
            <div
              onClick={handleCopyCode}
              className="-rotate-3 paper-texture bg-warm-cream text-on-primary-container px-8 py-4 border-2 border-primary-container shadow-sm ink-bleed cursor-pointer active:scale-95 transition-transform"
              title="Click to copy room code"
            >
              <p className="font-label-caps text-label-caps text-outline pt-1">
                ACCESS CODE
              </p>
              <p className="font-code-display text-code-display text-outline">
                {room.id}
              </p>
            </div>
          </div>
        </section>

        <section className="bg-surface-container border border-outline-variant p-6 space-y-4 rounded-lg relative overflow-hidden">
          <div className="flex justify-between items-center">
            <h2 className="font-stamp-text text-stamp-text text-primary">
              MOBILIZING FORCES
            </h2>
            <span className="text-on-surface-variant text-label-caps">
              {players.length} / {GAME_CONSTANTS.MAX_PLAYERS} PLAYERS
            </span>
          </div>
          <div className="w-full h-3 bg-surface-container-highest border border-outline-variant overflow-hidden">
            <div
              className="h-full bg-primary-container shadow-[0_0_10px_rgba(242,202,80,0.3)] transition-all duration-1000"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-on-surface-variant font-body-md italic text-center">
            {playersNeeded > 0
              ? `Awaiting ${playersNeeded} more agent${playersNeeded > 1 ? 's' : ''} to establish a quorum.`
              : 'Quorum established. Ready for deployment.'}
          </p>
        </section>

        <PlayerList
          roomId={room.id}
          players={players}
          hostId={room.hostId}
          currentUserId={user?.uid || null}
          isHost={isHost}
          onMenuOpen={setMenuOpenFor}
        />

        {menuOpenFor && openPlayer && (
          <PlayerMenu
            player={openPlayer}
            roomId={room.id}
            currentHostId={room.hostId}
            onClose={() => setMenuOpenFor(null)}
          />
        )}
      </div>

      {!gameStarted && (
        <footer className="fixed bottom-0 left-0 w-full p-margin-mobile bg-surface-container-high/95 backdrop-blur-md border-t border-outline-variant space-y-3 z-50">
          {isHost && (
            <StartGameButton
              roomId={room.id}
              playerCount={players.length}
              disabled={players.length < GAME_CONSTANTS.MIN_PLAYERS}
            />
          )}
          <ShareButton roomId={room.id} />
          <LeaveRoomButton roomId={room.id} />
        </footer>
      )}
    </div>
  )
}
