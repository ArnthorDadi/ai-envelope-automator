import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  generateRoomCode,
  isValidRoomCode,
  normalizeRoomCode,
  GAME_CONSTANTS,
} from '@/lib/utils'
import {
  RoomsServiceImpl,
  Room,
  Player,
  JoinRoomError,
  getVisibleAllies,
} from '@/lib/rooms'

vi.mock('firebase/database', () => ({
  ref: vi.fn(() => ({})),
  set: vi.fn(),
  get: vi.fn(),
  update: vi.fn(),
  onValue: vi.fn(),
  off: vi.fn(),
}))

describe('utils', () => {
  describe('generateRoomCode', () => {
    it('generates a 6-character code', () => {
      const code = generateRoomCode()
      expect(code).toHaveLength(6)
    })

    it('only uses valid characters', () => {
      const validChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
      for (let i = 0; i < 100; i++) {
        const code = generateRoomCode()
        expect(code.split('').every((c) => validChars.includes(c))).toBe(true)
      }
    })

    it('generates unique codes', () => {
      const codes = new Set<string>()
      for (let i = 0; i < 100; i++) {
        codes.add(generateRoomCode())
      }
      expect(codes.size).toBe(100)
    })
  })

  describe('isValidRoomCode', () => {
    it('returns true for valid codes', () => {
      expect(isValidRoomCode('ABCDEF')).toBe(true)
      expect(isValidRoomCode('xyz789')).toBe(true)
      expect(isValidRoomCode('RSTUVW')).toBe(true)
      expect(isValidRoomCode('234567')).toBe(true)
    })

    it('returns false for invalid length', () => {
      expect(isValidRoomCode('AB')).toBe(false)
      expect(isValidRoomCode('ABCDEFG')).toBe(false)
      expect(isValidRoomCode('')).toBe(false)
    })

    it('returns false for invalid characters', () => {
      expect(isValidRoomCode('ABCD10')).toBe(false)
      expect(isValidRoomCode('AB COI')).toBe(false)
      expect(isValidRoomCode('ABC-12')).toBe(false)
    })

    it('handles non-string input', () => {
      expect(isValidRoomCode(null as any)).toBe(false)
      expect(isValidRoomCode(undefined as any)).toBe(false)
      expect(isValidRoomCode(123 as any)).toBe(false)
    })
  })

  describe('normalizeRoomCode', () => {
    it('converts to uppercase', () => {
      expect(normalizeRoomCode('abc123')).toBe('ABC123')
    })

    it('trims whitespace', () => {
      expect(normalizeRoomCode('  ABC123  ')).toBe('ABC123')
    })
  })

  describe('GAME_CONSTANTS', () => {
    it('has correct min players', () => {
      expect(GAME_CONSTANTS.MIN_PLAYERS).toBe(5)
    })

    it('has correct max players', () => {
      expect(GAME_CONSTANTS.MAX_PLAYERS).toBe(10)
    })

    it('has correct hitler threshold', () => {
      expect(GAME_CONSTANTS.HITLER_SEES_FASCISTS_THRESHOLD).toBe(6)
    })
  })
})

describe('RoomsServiceImpl', () => {
  let service: RoomsServiceImpl
  let mockDb: any

  beforeEach(() => {
    mockDb = {}
    service = new RoomsServiceImpl(mockDb)
    vi.clearAllMocks()
  })

  describe('createRoom', () => {
    it('creates a room with correct structure', async () => {
      const { ref, set } = await import('firebase/database')
      ;(ref as any).mockReturnValue({})
      ;(set as any).mockResolvedValue(undefined)

      const { roomId, playerId } = await service.createRoom({
        hostId: 'user-123',
        hostName: 'TestHost',
      })

      expect(roomId).toHaveLength(6)
      expect(playerId).toBe('user-123')
    })
  })

  describe('joinRoom', () => {
    it('throws error for invalid room code', async () => {
      await expect(
        service.joinRoom('INVALID', {
          playerId: 'user-123',
          playerName: 'TestUser',
        })
      ).rejects.toThrow(JoinRoomError)
    })

    it('throws error for room not found', async () => {
      const { ref, get } = await import('firebase/database')
      ;(ref as any).mockReturnValue({})
      ;(get as any).mockResolvedValue({ val: () => null })

      await expect(
        service.joinRoom('ABCDEF', {
          playerId: 'user-123',
          playerName: 'TestUser',
        })
      ).rejects.toThrow(JoinRoomError)
    })

    it('throws error when game already started', async () => {
      const { ref, get } = await import('firebase/database')
      ;(ref as any).mockReturnValue({})
      ;(get as any).mockResolvedValue({ val: () => ({ status: 'started' }) })

      await expect(
        service.joinRoom('ABCDEF', {
          playerId: 'user-123',
          playerName: 'TestUser',
        })
      ).rejects.toThrow(JoinRoomError)
    })

    it('throws error when room is full', async () => {
      const { ref, get } = await import('firebase/database')
      ;(ref as any).mockReturnValue({})
      ;(get as any).mockResolvedValue({
        val: () => ({ status: 'lobby', playerCount: 10 }),
      })

      await expect(
        service.joinRoom('ABCDEF', {
          playerId: 'user-123',
          playerName: 'TestUser',
        })
      ).rejects.toThrow(JoinRoomError)
    })

    it('joins room successfully', async () => {
      const { ref, get, update } = await import('firebase/database')
      ;(ref as any).mockReturnValue({})
      ;(get as any).mockResolvedValue({
        val: () => ({ status: 'lobby', playerCount: 3 }),
      })
      ;(update as any).mockResolvedValue(undefined)

      const result = await service.joinRoom('abcdef', {
        playerId: 'user-123',
        playerName: 'TestUser',
      })

      expect(result.roomId).toBe('ABCDEF')
      expect(result.playerId).toBe('user-123')
    })

    it('increments player count on join', async () => {
      const { ref, get, update } = await import('firebase/database')
      ;(ref as any).mockReturnValue({})
      ;(get as any).mockResolvedValue({
        val: () => ({ status: 'lobby', playerCount: 3 }),
      })
      ;(update as any).mockResolvedValue(undefined)

      await service.joinRoom('ABCDEF', {
        playerId: 'user-123',
        playerName: 'TestUser',
      })

      expect(update).toHaveBeenCalled()
    })
  })

  describe('leaveRoom', () => {
    it('sets leftAt timestamp on player', async () => {
      const { ref, update } = await import('firebase/database')
      ;(ref as any).mockReturnValue({})
      ;(update as any).mockResolvedValue(undefined)

      await service.leaveRoom('ABCDEF', 'user-123')

      expect(update).toHaveBeenCalled()
      const updateCall = (update as any).mock.calls[0][1]
      expect(updateCall.leftAt).toBeDefined()
      expect(typeof updateCall.leftAt).toBe('number')
    })
  })

  describe('startGame', () => {
    it('throws error when room not found', async () => {
      const { ref, get } = await import('firebase/database')
      ;(ref as any).mockReturnValue({})
      ;(get as any).mockResolvedValue({ val: () => null })

      await expect(service.startGame('ABCDEF', 'user-123')).rejects.toThrow(
        'Room not found'
      )
    })

    it('throws error when caller is not host', async () => {
      const { ref, get } = await import('firebase/database')
      ;(ref as any).mockReturnValue({})
      ;(get as any).mockResolvedValue({
        val: () => ({
          hostId: 'other-user',
          status: 'lobby',
          playerCount: 5,
        }),
      })

      await expect(service.startGame('ABCDEF', 'user-123')).rejects.toThrow(
        'Only the host can start the game'
      )
    })

    it('throws error when game already started', async () => {
      const { ref, get } = await import('firebase/database')
      ;(ref as any).mockReturnValue({})
      ;(get as any).mockResolvedValue({
        val: () => ({
          hostId: 'user-123',
          status: 'started',
        }),
      })

      await expect(service.startGame('ABCDEF', 'user-123')).rejects.toThrow(
        'Game already started'
      )
    })

    it('throws error when not enough players', async () => {
      const { ref, get } = await import('firebase/database')
      ;(ref as any).mockReturnValue({})
      ;(get as any)
        .mockResolvedValueOnce({
          val: () => ({
            hostId: 'user-123',
            status: 'lobby',
          }),
        })
        .mockResolvedValueOnce({
          val: () => ({
            'user-123': { id: 'user-123', name: 'Host' },
          }),
        })

      await expect(service.startGame('ABCDEF', 'user-123')).rejects.toThrow(
        'Need at least 5 players to start'
      )
    })

    it('starts game successfully with 5 players', async () => {
      const { ref, get, update } = await import('firebase/database')
      ;(ref as any).mockReturnValue({})
      ;(get as any)
        .mockResolvedValueOnce({
          val: () => ({
            hostId: 'user-1',
            status: 'lobby',
          }),
        })
        .mockResolvedValueOnce({
          val: () => ({
            'user-1': { id: 'user-1', name: 'Player 1' },
            'user-2': { id: 'user-2', name: 'Player 2' },
            'user-3': { id: 'user-3', name: 'Player 3' },
            'user-4': { id: 'user-4', name: 'Player 4' },
            'user-5': { id: 'user-5', name: 'Player 5' },
          }),
        })
      ;(update as any).mockResolvedValue(undefined)

      await service.startGame('ABCDEF', 'user-1')

      expect(update).toHaveBeenCalled()
    })
  })

  describe('subscribeToRoom', () => {
    it('calls onValue with room data', async () => {
      const { ref, onValue } = await import('firebase/database')
      ;(ref as any).mockReturnValue({})
      ;(onValue as any).mockImplementation((ref: any, callback: any) => {
        callback({ val: () => ({ id: 'ABC123', status: 'lobby' }) })
        return vi.fn()
      })

      const callback = vi.fn()
      service.subscribeToRoom('ABC123', callback)

      expect(onValue).toHaveBeenCalled()
    })
  })

  describe('subscribeToPlayers', () => {
    it('calls onValue with players array', async () => {
      const { ref, onValue } = await import('firebase/database')
      ;(ref as any).mockReturnValue({})
      ;(onValue as any).mockImplementation((ref: any, callback: any) => {
        callback({
          val: () => ({
            'user-1': { id: 'user-1', name: 'Player 1' },
            'user-2': { id: 'user-2', name: 'Player 2' },
          }),
        })
        return vi.fn()
      })

      const callback = vi.fn()
      service.subscribeToPlayers('ABC123', callback)

      expect(onValue).toHaveBeenCalled()
    })

    it('returns empty array when no players', async () => {
      const { ref, onValue } = await import('firebase/database')
      ;(ref as any).mockReturnValue({})
      ;(onValue as any).mockImplementation((ref: any, callback: any) => {
        callback({ val: () => null })
        return vi.fn()
      })

      const callback = vi.fn()
      service.subscribeToPlayers('ABC123', callback)

      expect(callback).toHaveBeenCalledWith([])
    })
  })

  describe('getRoleDistribution', () => {
    it('distributes roles correctly for 5 players', () => {
      const distribution = (service as any).getRoleDistribution(5)
      expect(distribution.liberals).toBe(3)
      expect(distribution.fascists).toBe(2)
    })

    it('distributes roles correctly for 6 players', () => {
      const distribution = (service as any).getRoleDistribution(6)
      expect(distribution.liberals).toBe(4)
      expect(distribution.fascists).toBe(2)
    })

    it('distributes roles correctly for 7 players', () => {
      const distribution = (service as any).getRoleDistribution(7)
      expect(distribution.liberals).toBe(4)
      expect(distribution.fascists).toBe(3)
    })

    it('distributes roles correctly for 8 players', () => {
      const distribution = (service as any).getRoleDistribution(8)
      expect(distribution.liberals).toBe(5)
      expect(distribution.fascists).toBe(3)
    })

    it('distributes roles correctly for 9 players', () => {
      const distribution = (service as any).getRoleDistribution(9)
      expect(distribution.liberals).toBe(5)
      expect(distribution.fascists).toBe(4)
    })

    it('distributes roles correctly for 10 players', () => {
      const distribution = (service as any).getRoleDistribution(10)
      expect(distribution.liberals).toBe(6)
      expect(distribution.fascists).toBe(4)
    })
  })

  describe('fisherYatesShuffle', () => {
    it('returns array of same length', () => {
      const input = [1, 2, 3, 4, 5]
      const result = (service as any).fisherYatesShuffle(input)
      expect(result).toHaveLength(input.length)
    })

    it('returns array with same elements', () => {
      const input = [1, 2, 3, 4, 5]
      const result = (service as any).fisherYatesShuffle(input)
      expect(result.sort()).toEqual(input.sort())
    })

    it('does not mutate original array', () => {
      const input = [1, 2, 3, 4, 5]
      const original = [...input]
      ;(service as any).fisherYatesShuffle(input)
      expect(input).toEqual(original)
    })

    it('produces different results across multiple shuffles', () => {
      const input = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      const results = new Set<string>()
      for (let i = 0; i < 20; i++) {
        const shuffled = (service as any).fisherYatesShuffle([...input])
        results.add(shuffled.join(','))
      }
      expect(results.size).toBeGreaterThan(1)
    })
  })

  describe('role assignment verification', () => {
    const createPlayers = (count: number): Record<string, Player> => {
      const players: Record<string, Player> = {}
      for (let i = 0; i < count; i++) {
        players[`user-${i}`] = {
          id: `user-${i}`,
          name: `Player ${i}`,
          role: null,
          joinedAt: i * 1000,
          leftAt: null,
        }
      }
      return players
    }

    it('assigns exactly one Hitler for all player counts', async () => {
      const { ref, get, update } = await import('firebase/database')
      ;(ref as any).mockReturnValue({})
      ;(update as any).mockResolvedValue(undefined)

      for (let count = 5; count <= 10; count++) {
        ;(get as any)
          .mockResolvedValueOnce({
            val: () => ({ hostId: 'user-0', status: 'lobby' }),
          })
          .mockResolvedValueOnce({
            val: () => createPlayers(count),
          })

        await service.startGame('ABCDEF', 'user-0')

        const updateCall = (update as any).mock.calls.at(-1)
        const updates = updateCall[1] as Record<string, unknown>
        const assignedRoles = Object.values(updates).filter(
          (v: unknown) =>
            typeof v === 'string' &&
            ['liberal', 'fascist', 'hitler'].includes(v)
        )
        const hitlerCount = assignedRoles.filter((r) => r === 'hitler').length
        expect(hitlerCount).toBe(1)
      }
    })

    it('assigns correct total number of roles', async () => {
      const { ref, get, update } = await import('firebase/database')
      ;(ref as any).mockReturnValue({})
      ;(update as any).mockResolvedValue(undefined)

      for (let count = 5; count <= 10; count++) {
        ;(get as any)
          .mockResolvedValueOnce({
            val: () => ({ hostId: 'user-0', status: 'lobby' }),
          })
          .mockResolvedValueOnce({
            val: () => createPlayers(count),
          })

        await service.startGame('ABCDEF', 'user-0')

        const updateCall = (update as any).mock.calls.at(-1)
        const updates = updateCall[1] as Record<string, unknown>
        const assignedRoles = Object.values(updates).filter(
          (v: unknown) =>
            typeof v === 'string' &&
            ['liberal', 'fascist', 'hitler'].includes(v)
        )
        expect(assignedRoles.length).toBe(count)
      }
    })

    it('updates room status to started', async () => {
      const { ref, get, update } = await import('firebase/database')
      ;(ref as any).mockReturnValue({})
      ;(get as any)
        .mockResolvedValueOnce({
          val: () => ({ hostId: 'user-0', status: 'lobby' }),
        })
        .mockResolvedValueOnce({
          val: () => createPlayers(5),
        })
      ;(update as any).mockResolvedValue(undefined)

      await service.startGame('ABCDEF', 'user-0')

      const updateCall = (update as any).mock.calls.at(-1)
      const updates = updateCall[1]
      expect(updates.status).toBe('started')
    })

    it('assigns roles to correct player paths', async () => {
      const { ref, get, update } = await import('firebase/database')
      ;(ref as any).mockReturnValue({})
      ;(get as any)
        .mockResolvedValueOnce({
          val: () => ({ hostId: 'user-0', status: 'lobby' }),
        })
        .mockResolvedValueOnce({
          val: () => createPlayers(5),
        })
      ;(update as any).mockResolvedValue(undefined)

      await service.startGame('ABCDEF', 'user-0')

      const updateCall = (update as any).mock.calls.at(-1)
      const updates = updateCall[1]

      for (let i = 0; i < 5; i++) {
        expect(updates[`rooms/ABCDEF/players/user-${i}/role`]).toBeDefined()
        expect(['liberal', 'fascist', 'hitler']).toContain(
          updates[`rooms/ABCDEF/players/user-${i}/role`]
        )
      }
    })
  })

  describe('resetGame', () => {
    const createPlayers = (count: number): Record<string, Player> => {
      const players: Record<string, Player> = {}
      for (let i = 0; i < count; i++) {
        players[`user-${i}`] = {
          id: `user-${i}`,
          name: `Player ${i}`,
          role: i % 2 === 0 ? 'liberal' : 'fascist',
          joinedAt: i * 1000,
          leftAt: null,
        }
      }
      return players
    }

    it('throws error when room not found', async () => {
      const { ref, get } = await import('firebase/database')
      ;(ref as any).mockReturnValue({})
      ;(get as any).mockResolvedValue({ val: () => null })

      await expect(service.resetGame('ABCDEF', 'user-123')).rejects.toThrow(
        'Room not found'
      )
    })

    it('throws error when caller is not host', async () => {
      const { ref, get } = await import('firebase/database')
      ;(ref as any).mockReturnValue({})
      ;(get as any).mockResolvedValue({
        val: () => ({
          hostId: 'other-user',
          status: 'started',
          playerCount: 5,
        }),
      })

      await expect(service.resetGame('ABCDEF', 'user-123')).rejects.toThrow(
        'Only the host can reset the game'
      )
    })

    it('throws error when game not started', async () => {
      const { ref, get } = await import('firebase/database')
      ;(ref as any).mockReturnValue({})
      ;(get as any).mockResolvedValue({
        val: () => ({
          hostId: 'user-123',
          status: 'lobby',
        }),
      })

      await expect(service.resetGame('ABCDEF', 'user-123')).rejects.toThrow(
        'Game must be started before it can be reset'
      )
    })

    it('throws error when not enough players', async () => {
      const { ref, get } = await import('firebase/database')
      ;(ref as any).mockReturnValue({})
      ;(get as any)
        .mockResolvedValueOnce({
          val: () => ({
            hostId: 'user-123',
            status: 'started',
          }),
        })
        .mockResolvedValueOnce({
          val: () => ({
            'user-123': { id: 'user-123', name: 'Host', role: 'liberal', joinedAt: 1000, leftAt: null },
          }),
        })

      await expect(service.resetGame('ABCDEF', 'user-123')).rejects.toThrow(
        'Need at least 5 players to reset'
      )
    })

    it('resets game successfully with 5 players', async () => {
      const { ref, get, update } = await import('firebase/database')
      ;(ref as any).mockReturnValue({})
      ;(get as any)
        .mockResolvedValueOnce({
          val: () => ({
            hostId: 'user-1',
            status: 'started',
          }),
        })
        .mockResolvedValueOnce({
          val: () => createPlayers(5),
        })
      ;(update as any).mockResolvedValue(undefined)

      await service.resetGame('ABCDEF', 'user-1')

      expect(update).toHaveBeenCalled()
      const updateCall = (update as any).mock.calls.at(-1)
      const updates = updateCall[1] as Record<string, unknown>

      const assignedRoles = Object.values(updates).filter(
        (v: unknown) =>
          typeof v === 'string' &&
          ['liberal', 'fascist', 'hitler'].includes(v)
      )
      expect(assignedRoles.length).toBe(5)
    })

    it('assigns exactly one Hitler on reset', async () => {
      const { ref, get, update } = await import('firebase/database')
      ;(ref as any).mockReturnValue({})
      ;(update as any).mockResolvedValue(undefined)

      for (let count = 5; count <= 10; count++) {
        ;(get as any)
          .mockResolvedValueOnce({
            val: () => ({ hostId: 'user-0', status: 'started' }),
          })
          .mockResolvedValueOnce({
            val: () => createPlayers(count),
          })

        await service.resetGame('ABCDEF', 'user-0')

        const updateCall = (update as any).mock.calls.at(-1)
        const updates = updateCall[1] as Record<string, unknown>
        const assignedRoles = Object.values(updates).filter(
          (v: unknown) =>
            typeof v === 'string' &&
            ['liberal', 'fascist', 'hitler'].includes(v)
        )
        const hitlerCount = assignedRoles.filter((r) => r === 'hitler').length
        expect(hitlerCount).toBe(1)
      }
    })

    it('assigns correct total number of roles on reset', async () => {
      const { ref, get, update } = await import('firebase/database')
      ;(ref as any).mockReturnValue({})
      ;(update as any).mockResolvedValue(undefined)

      for (let count = 5; count <= 10; count++) {
        ;(get as any)
          .mockResolvedValueOnce({
            val: () => ({ hostId: 'user-0', status: 'started' }),
          })
          .mockResolvedValueOnce({
            val: () => createPlayers(count),
          })

        await service.resetGame('ABCDEF', 'user-0')

        const updateCall = (update as any).mock.calls.at(-1)
        const updates = updateCall[1] as Record<string, unknown>
        const assignedRoles = Object.values(updates).filter(
          (v: unknown) =>
            typeof v === 'string' &&
            ['liberal', 'fascist', 'hitler'].includes(v)
        )
        expect(assignedRoles.length).toBe(count)
      }
    })

    it('keeps room status as started (does not change)', async () => {
      const { ref, get, update } = await import('firebase/database')
      ;(ref as any).mockReturnValue({})
      ;(get as any)
        .mockResolvedValueOnce({
          val: () => ({ hostId: 'user-0', status: 'started' }),
        })
        .mockResolvedValueOnce({
          val: () => createPlayers(5),
        })
      ;(update as any).mockResolvedValue(undefined)

      await service.resetGame('ABCDEF', 'user-0')

      const updateCall = (update as any).mock.calls.at(-1)
      const updates = updateCall[1]
      expect(updates.status).toBeUndefined()
    })

    it('assigns roles to correct player paths', async () => {
      const { ref, get, update } = await import('firebase/database')
      ;(ref as any).mockReturnValue({})
      ;(get as any)
        .mockResolvedValueOnce({
          val: () => ({ hostId: 'user-0', status: 'started' }),
        })
        .mockResolvedValueOnce({
          val: () => createPlayers(5),
        })
      ;(update as any).mockResolvedValue(undefined)

      await service.resetGame('ABCDEF', 'user-0')

      const updateCall = (update as any).mock.calls.at(-1)
      const updates = updateCall[1]

      for (let i = 0; i < 5; i++) {
        const roleKey = Object.keys(updates).find(
          (k) => k.includes(`user-${i}`) && k.endsWith('role')
        )
        expect(roleKey).toBeDefined()
        expect(['liberal', 'fascist', 'hitler']).toContain(
          updates[roleKey!]
        )
      }
    })

    it('produces different role assignments across resets', async () => {
      const { ref, get, update } = await import('firebase/database')
      ;(ref as any).mockReturnValue({})
      ;(update as any).mockResolvedValue(undefined)

      const roleSets: string[] = []

      for (let attempt = 0; attempt < 10; attempt++) {
        ;(get as any)
          .mockResolvedValueOnce({
            val: () => ({ hostId: 'user-0', status: 'started' }),
          })
          .mockResolvedValueOnce({
            val: () => createPlayers(5),
          })

        await service.resetGame('ABCDEF', 'user-0')

        const updateCall = (update as any).mock.calls.at(-1)
        const updates = updateCall[1] as Record<string, unknown>
        const roles = Object.entries(updates)
          .filter(([k]) => k.endsWith('role'))
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([, v]) => v)
          .join(',')
        roleSets.push(roles)
      }

      const uniqueSets = new Set(roleSets)
      expect(uniqueSets.size).toBeGreaterThan(1)
    })
  })

  describe('transferHost', () => {
    it('returns null when room not found', async () => {
      const { ref, get } = await import('firebase/database')
      ;(ref as any).mockReturnValue({})
      ;(get as any).mockResolvedValue({ val: () => null })

      const result = await service.transferHost('ABCDEF', 'host-1')
      expect(result).toBeNull()
    })

    it('returns null when caller is not current host', async () => {
      const { ref, get } = await import('firebase/database')
      ;(ref as any).mockReturnValue({})
      ;(get as any).mockResolvedValue({
        val: () => ({ hostId: 'host-1', status: 'lobby' }),
      })

      const result = await service.transferHost('ABCDEF', 'other-user')
      expect(result).toBeNull()
    })

    it('transfers host to first active player', async () => {
      const { ref, get, update } = await import('firebase/database')
      ;(ref as any).mockReturnValue({})
      ;(get as any)
        .mockResolvedValueOnce({
          val: () => ({ hostId: 'host-1', status: 'lobby' }),
        })
        .mockResolvedValueOnce({
          val: () => ({
            'host-1': { id: 'host-1', name: 'Host', leftAt: Date.now() },
            'player-2': { id: 'player-2', name: 'Player 2', joinedAt: 1000 },
          }),
        })
      ;(update as any).mockResolvedValue(undefined)

      const result = await service.transferHost('ABCDEF', 'host-1')
      expect(result).toBe('player-2')
      expect(update).toHaveBeenCalledWith({}, { hostId: 'player-2' })
    })

    it('returns null when no active players', async () => {
      const { ref, get } = await import('firebase/database')
      ;(ref as any).mockReturnValue({})
      ;(get as any)
        .mockResolvedValueOnce({
          val: () => ({ hostId: 'host-1', status: 'lobby' }),
        })
        .mockResolvedValueOnce({
          val: () => ({
            'host-1': { id: 'host-1', name: 'Host', leftAt: Date.now() },
          }),
        })

      const result = await service.transferHost('ABCDEF', 'host-1')
      expect(result).toBeNull()
    })

    it('selects player with earliest joinedAt', async () => {
      const { ref, get, update } = await import('firebase/database')
      ;(ref as any).mockReturnValue({})
      ;(get as any)
        .mockResolvedValueOnce({
          val: () => ({ hostId: 'host-1', status: 'lobby' }),
        })
        .mockResolvedValueOnce({
          val: () => ({
            'host-1': { id: 'host-1', name: 'Host', leftAt: Date.now() },
            'player-2': { id: 'player-2', name: 'Player 2', joinedAt: 3000 },
            'player-3': { id: 'player-3', name: 'Player 3', joinedAt: 1000 },
          }),
        })
      ;(update as any).mockResolvedValue(undefined)

      const result = await service.transferHost('ABCDEF', 'host-1')
      expect(result).toBe('player-3')
    })
  })
})

describe('getVisibleAllies', () => {
  const otherPlayers: Player[] = [
    {
      id: 'player-2',
      name: 'Bob',
      role: 'liberal',
      joinedAt: Date.now(),
      leftAt: null,
    },
    {
      id: 'player-3',
      name: 'Charlie',
      role: 'fascist',
      joinedAt: Date.now(),
      leftAt: null,
    },
    {
      id: 'player-4',
      name: 'Diana',
      role: 'hitler',
      joinedAt: Date.now(),
      leftAt: null,
    },
  ]

  it('returns empty array for liberal', () => {
    const result = getVisibleAllies('liberal', otherPlayers, 5)
    expect(result).toHaveLength(0)
  })

  it('returns empty array for null role', () => {
    const result = getVisibleAllies(null, otherPlayers, 5)
    expect(result).toHaveLength(0)
  })

  it('returns fascists and hitler for fascist', () => {
    const result = getVisibleAllies('fascist', otherPlayers, 5)
    expect(result).toHaveLength(2)
    expect(result.map((a) => a.name)).toContain('Charlie')
    expect(result.map((a) => a.name)).toContain('Diana')
  })

  it('returns fascists only for hitler (5-6 players)', () => {
    const result = getVisibleAllies('hitler', otherPlayers, 5)
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Charlie')
  })

  it('returns empty array for hitler (7+ players)', () => {
    const result = getVisibleAllies('hitler', otherPlayers, 7)
    expect(result).toHaveLength(0)
  })
})
