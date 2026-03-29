import { describe, it, expect } from 'vitest';
import { generateRoomCode, isValidRoomCode, normalizeRoomCode, shuffle } from '@/lib/utils';

describe('utils', () => {
  describe('generateRoomCode', () => {
    it('should generate a 6-character room code', () => {
      const code = generateRoomCode();
      expect(code).toHaveLength(6);
    });

    it('should only contain valid characters', () => {
      const validChars = new Set('ABCDEFGHJKLMNPQRSTUVWXYZ23456789');
      for (let i = 0; i < 10; i++) {
        const code = generateRoomCode();
        expect([...code].every(char => validChars.has(char))).toBe(true);
      }
    });
  });

  describe('isValidRoomCode', () => {
    it('should return true for valid room codes', () => {
      expect(isValidRoomCode('ABC234')).toBe(true);
      expect(isValidRoomCode('XYZ789')).toBe(true);
      expect(isValidRoomCode('abc234')).toBe(true); // case insensitive
    });

    it('should return false for invalid room codes', () => {
      expect(isValidRoomCode('')).toBe(false);
      expect(isValidRoomCode('ABC12')).toBe(false); // too short
      expect(isValidRoomCode('ABC1234')).toBe(false); // too long
      expect(isValidRoomCode('ABC12O')).toBe(false); // contains O
      expect(isValidRoomCode('ABC12I')).toBe(false); // contains I
      expect(isValidRoomCode('ABCOI')).toBe(false); // contains O and I
      expect(isValidRoomCode('ABC1')).toBe(false); // contains 1
      expect(isValidRoomCode('ABC0')).toBe(false); // contains 0
    });
  });

  describe('normalizeRoomCode', () => {
    it('should uppercase and trim room codes', () => {
      expect(normalizeRoomCode('abc123')).toBe('ABC123');
      expect(normalizeRoomCode('  XYZ789  ')).toBe('XYZ789');
    });
  });

  describe('shuffle', () => {
    it('should return an array with the same elements', () => {
      const arr = [1, 2, 3, 4, 5];
      const shuffled = shuffle(arr);
      expect(shuffled.sort()).toEqual(arr);
    });

    it('should not modify the original array', () => {
      const arr = [1, 2, 3, 4, 5];
      const original = [...arr];
      shuffle(arr);
      expect(arr).toEqual(original);
    });
  });
});
