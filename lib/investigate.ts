import { get, ref, Database } from 'firebase/database'
import { Role } from './rooms'

export type InvestigationResult = 'fascist' | 'liberal'

export class InvestigateError extends Error {
  constructor(
    message: string,
    public code:
      | 'GAME_NOT_STARTED'
      | 'CANNOT_INVESTIGATE_SELF'
      | 'PLAYER_NOT_FOUND'
  ) {
    super(message)
    this.name = 'InvestigateError'
  }
}

export class InvestigationServiceImpl {
  constructor(private db: Database) {}

  async investigate(
    roomId: string,
    investigatorId: string,
    targetId: string
  ): Promise<InvestigationResult> {
    const roomRef = ref(this.db, `rooms/${roomId}`)
    const roomSnapshot = await get(roomRef)
    const room = roomSnapshot.val()

    if (!room || room.status !== 'started') {
      throw new InvestigateError('Game has not started yet', 'GAME_NOT_STARTED')
    }

    if (investigatorId === targetId) {
      throw new InvestigateError(
        'You cannot investigate yourself',
        'CANNOT_INVESTIGATE_SELF'
      )
    }

    const playersRef = ref(this.db, `rooms/${roomId}/players`)
    const playersSnapshot = await get(playersRef)
    const playersData = playersSnapshot.val()

    if (!playersData) {
      throw new InvestigateError('Player not found', 'PLAYER_NOT_FOUND')
    }

    const players = Object.values(playersData) as Array<{
      id: string
      role: Role
      name: string
    }>

    const target = players.find((p) => p.id === targetId)

    if (!target) {
      throw new InvestigateError('Player not found', 'PLAYER_NOT_FOUND')
    }

    if (target.role === 'hitler') {
      return 'fascist'
    }

    if (target.role === 'fascist') {
      return 'fascist'
    }

    return 'liberal'
  }
}
