import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateRoomCode, isValidRoomCode, normalizeRoomCode, GAME_CONSTANTS } from '@/lib/utils';
import { RoomsServiceImpl, Room, Player } from '@/lib/rooms';

vi.mock('firebase/database', () => ({
  ref: vi.fn(() => ({})),
  set: vi.fn(),
  get: vi.fn(),
  onValue: vi.fn(),
  off: vi.fn(),
}));

describe('utils', () => {
  describe('generateRoomCode', () => {
    it('generates a 6-character code', () => {
      const code = generateRoomCode();
      expect(code).toHaveLength(6);
    });

    it('only uses valid characters', () => {
      const validChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      for (let i = 0; i < 100; i++) {
        const code = generateRoomCode();
        expect(code.split('').every(c => validChars.includes(c))).toBe(true);
      }
    });

    it('generates unique codes', () => {
      const codes = new Set<string>();
      for (let i = 0; i < 100; i++) {
        codes.add(generateRoomCode());
      }
      expect(codes.size).toBe(100);
    });
  });

  describe('isValidRoomCode', () => {
    it('returns true for valid codes', () => {
      expect(isValidRoomCode('ABCDEF')).toBe(true);
      expect(isValidRoomCode('xyz789')).toBe(true);
      expect(isValidRoomCode('RSTUVW')).toBe(true);
      expect(isValidRoomCode('234567')).toBe(true);
    });

    it('returns false for invalid length', () => {
      expect(isValidRoomCode('AB')).toBe(false);
      expect(isValidRoomCode('ABCDEFG')).toBe(false);
      expect(isValidRoomCode('')).toBe(false);
    });

    it('returns false for invalid characters', () => {
      expect(isValidRoomCode('ABCD10')).toBe(false);
      expect(isValidRoomCode('AB COI')).toBe(false);
      expect(isValidRoomCode('ABC-12')).toBe(false);
    });

    it('handles non-string input', () => {
      expect(isValidRoomCode(null as any)).toBe(false);
      expect(isValidRoomCode(undefined as any)).toBe(false);
      expect(isValidRoomCode(123 as any)).toBe(false);
    });
  });

  describe('normalizeRoomCode', () => {
    it('converts to uppercase', () => {
      expect(normalizeRoomCode('abc123')).toBe('ABC123');
    });

    it('trims whitespace', () => {
      expect(normalizeRoomCode('  ABC123  ')).toBe('ABC123');
    });
  });

  describe('GAME_CONSTANTS', () => {
    it('has correct min players', () => {
      expect(GAME_CONSTANTS.MIN_PLAYERS).toBe(5);
    });

    it('has correct max players', () => {
      expect(GAME_CONSTANTS.MAX_PLAYERS).toBe(10);
    });

    it('has correct hitler threshold', () => {
      expect(GAME_CONSTANTS.HITLER_SEES_FASCISTS_THRESHOLD).toBe(6);
    });
  });
});

describe('RoomsServiceImpl', () => {
  let service: RoomsServiceImpl;
  let mockDb: any;

  beforeEach(() => {
    mockDb = {};
    service = new RoomsServiceImpl(mockDb);
  });

  describe('createRoom', () => {
    it('creates a room with correct structure', async () => {
      const { ref, set } = await import('firebase/database');
      (ref as any).mockReturnValue({});
      (set as any).mockResolvedValue(undefined);

      const { roomId, playerId } = await service.createRoom({
        hostId: 'user-123',
        hostName: 'TestHost',
      });

      expect(roomId).toHaveLength(6);
      expect(playerId).toBe('user-123');
    });
  });
});
