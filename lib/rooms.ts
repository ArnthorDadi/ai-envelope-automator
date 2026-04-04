import {
  ref,
  set,
  get,
  update,
  onValue,
  off,
  Database,
} from 'firebase/database'
import { generateRoomCode, isValidRoomCode, GAME_CONSTANTS } from './utils'

export interface Room {
  id: string
  hostId: string
  status: 'lobby' | 'started'
  playerCount: number
  createdAt: number
}

export interface Player {
  id: string
  name: string
  role: 'liberal' | 'fascist' | 'hitler' | null
  joinedAt: number
  leftAt: number | null
}

export interface CreateRoomOptions {
  hostId: string
  hostName: string
}

export interface CreateRoomResult {
  roomId: string
  playerId: string
}

export interface JoinRoomOptions {
  playerId: string
  playerName: string
}

export interface JoinRoomResult {
  roomId: string
  playerId: string
}

export class JoinRoomError extends Error {
  constructor(
    message: string,
    public code:
      | 'ROOM_NOT_FOUND'
      | 'ROOM_FULL'
      | 'GAME_STARTED'
      | 'INVALID_CODE'
  ) {
    super(message)
    this.name = 'JoinRoomError'
  }
}

export interface RoomsService {
  createRoom(options: CreateRoomOptions): Promise<CreateRoomResult>
  getRoom(roomId: string): Promise<Room | null>
  getPlayers(roomId: string): Promise<Player[]>
  joinRoom(roomId: string, options: JoinRoomOptions): Promise<JoinRoomResult>
  leaveRoom(roomId: string, playerId: string): Promise<void>
  startGame(roomId: string, playerId: string): Promise<void>
  transferHost(roomId: string, leavingHostId: string): Promise<string | null>
  transferHostTo(
    roomId: string,
    currentHostId: string,
    targetPlayerId: string
  ): Promise<void>
  subscribeToRoom(
    roomId: string,
    callback: (room: Room | null) => void
  ): () => void
  subscribeToPlayers(
    roomId: string,
    callback: (players: Player[]) => void
  ): () => void
}

export class RoomsServiceImpl implements RoomsService {
  constructor(private db: Database) {}

  async createRoom(options: CreateRoomOptions): Promise<CreateRoomResult> {
    const { hostId, hostName } = options
    const roomId = generateRoomCode()
    const now = Date.now()

    const roomRef = ref(this.db, `rooms/${roomId}`)
    await set(roomRef, {
      id: roomId,
      hostId,
      status: 'lobby',
      playerCount: 1,
      createdAt: now,
    })

    const playerRef = ref(this.db, `rooms/${roomId}/players/${hostId}`)
    await set(playerRef, {
      id: hostId,
      name: hostName,
      role: null,
      joinedAt: now,
    })

    return { roomId, playerId: hostId }
  }

  async getRoom(roomId: string): Promise<Room | null> {
    const roomRef = ref(this.db, `rooms/${roomId}`)
    const snapshot = await get(roomRef)
    return snapshot.val()
  }

  async getPlayers(roomId: string): Promise<Player[]> {
    const playersRef = ref(this.db, `rooms/${roomId}/players`)
    const snapshot = await get(playersRef)
    const data = snapshot.val()
    if (!data) return []
    return Object.values(data) as Player[]
  }

  async joinRoom(
    roomId: string,
    options: JoinRoomOptions
  ): Promise<JoinRoomResult> {
    const normalizedCode = roomId.toUpperCase().trim()

    if (!isValidRoomCode(normalizedCode)) {
      throw new JoinRoomError('Invalid room code format', 'INVALID_CODE')
    }

    const roomRef = ref(this.db, `rooms/${normalizedCode}`)
    const snapshot = await get(roomRef)
    const room = snapshot.val()

    if (!room) {
      throw new JoinRoomError('Room not found', 'ROOM_NOT_FOUND')
    }

    if (room.status !== 'lobby') {
      throw new JoinRoomError('Game already started', 'GAME_STARTED')
    }

    if (room.playerCount >= GAME_CONSTANTS.MAX_PLAYERS) {
      throw new JoinRoomError('Room is full', 'ROOM_FULL')
    }

    const now = Date.now()
    const playerRef = ref(
      this.db,
      `rooms/${normalizedCode}/players/${options.playerId}`
    )
    await update(playerRef, {
      id: options.playerId,
      name: options.playerName,
      role: null,
      joinedAt: now,
    })

    await update(roomRef, {
      playerCount: (room.playerCount || 0) + 1,
    })

    return { roomId: normalizedCode, playerId: options.playerId }
  }

  async leaveRoom(roomId: string, playerId: string): Promise<void> {
    const roomRef = ref(this.db, `rooms/${roomId}`)
    const playerRef = ref(this.db, `rooms/${roomId}/players/${playerId}`)

    const roomSnapshot = await get(roomRef)
    const room = roomSnapshot.val()
    const isHost = room?.hostId === playerId

    await update(playerRef, {
      leftAt: Date.now(),
    })

    if (isHost) {
      await this.transferHost(roomId, playerId)
    }
  }

  async transferHost(
    roomId: string,
    leavingHostId: string
  ): Promise<string | null> {
    const roomRef = ref(this.db, `rooms/${roomId}`)
    const playersRef = ref(this.db, `rooms/${roomId}/players`)

    const roomSnapshot = await get(roomRef)
    const room = roomSnapshot.val()

    if (!room || room.hostId !== leavingHostId) {
      return null
    }

    const playersSnapshot = await get(playersRef)
    const playersData = playersSnapshot.val()
    if (!playersData) return null

    const allPlayers = Object.values(playersData) as Player[]
    const players = allPlayers
      .filter((p) => !p.leftAt)
      .sort((a, b) => a.joinedAt - b.joinedAt)

    if (players.length === 0) return null

    const newHost = players[0]
    await update(roomRef, { hostId: newHost.id })

    return newHost.id
  }

  async transferHostTo(
    roomId: string,
    currentHostId: string,
    targetPlayerId: string
  ): Promise<void> {
    const roomRef = ref(this.db, `rooms/${roomId}`)

    const roomSnapshot = await get(roomRef)
    const room = roomSnapshot.val()

    if (!room) {
      throw new Error('Room not found')
    }

    if (room.hostId !== currentHostId) {
      throw new Error('Only the host can transfer host')
    }

    if (currentHostId === targetPlayerId) {
      throw new Error('Cannot transfer host to yourself')
    }

    await update(roomRef, { hostId: targetPlayerId })
  }

  async startGame(roomId: string, playerId: string): Promise<void> {
    const roomRef = ref(this.db, `rooms/${roomId}`)
    const playersRef = ref(this.db, `rooms/${roomId}/players`)

    const roomSnapshot = await get(roomRef)
    const room = roomSnapshot.val()

    if (!room) {
      throw new Error('Room not found')
    }

    if (room.hostId !== playerId) {
      throw new Error('Only the host can start the game')
    }

    if (room.status !== 'lobby') {
      throw new Error('Game already started')
    }

    const playersSnapshot = await get(playersRef)
    const playersData = playersSnapshot.val()
    const players: Player[] = playersData ? Object.values(playersData) : []

    if (players.length < GAME_CONSTANTS.MIN_PLAYERS) {
      throw new Error(
        `Need at least ${GAME_CONSTANTS.MIN_PLAYERS} players to start`
      )
    }

    const roleDistribution = this.getRoleDistribution(players.length)
    const shuffledPlayers = this.fisherYatesShuffle([...players])
    const roles: Array<'liberal' | 'fascist' | 'hitler'> = [
      ...Array(roleDistribution.liberals).fill('liberal'),
      ...Array(roleDistribution.fascists - 1).fill('fascist'),
      'hitler',
    ]
    const shuffledRoles = this.fisherYatesShuffle(roles)

    const updates: Record<string, unknown> = {
      status: 'started',
    }

    shuffledPlayers.forEach((player, index) => {
      updates[`rooms/${roomId}/players/${player.id}/role`] =
        shuffledRoles[index]
    })

    await update(roomRef, updates)
  }

  private getRoleDistribution(playerCount: number): {
    liberals: number
    fascists: number
  } {
    switch (playerCount) {
      case 5:
        return { liberals: 3, fascists: 2 }
      case 6:
        return { liberals: 4, fascists: 2 }
      case 7:
        return { liberals: 4, fascists: 3 }
      case 8:
        return { liberals: 5, fascists: 3 }
      case 9:
        return { liberals: 5, fascists: 4 }
      case 10:
        return { liberals: 6, fascists: 4 }
      default:
        return { liberals: playerCount - 2, fascists: 2 }
    }
  }

  private fisherYatesShuffle<T>(array: T[]): T[] {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  subscribeToRoom(
    roomId: string,
    callback: (room: Room | null) => void
  ): () => void {
    const roomRef = ref(this.db, `rooms/${roomId}`)

    const unsubscribe = onValue(roomRef, (snapshot) => {
      callback(snapshot.val())
    })

    return () => off(roomRef)
  }

  subscribeToPlayers(
    roomId: string,
    callback: (players: Player[]) => void
  ): () => void {
    const playersRef = ref(this.db, `rooms/${roomId}/players`)

    const unsubscribe = onValue(playersRef, (snapshot) => {
      const data = snapshot.val()
      callback(data ? Object.values(data) : [])
    })

    return () => off(playersRef)
  }
}
