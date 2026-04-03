/**
 * utils.ts
 *
 * Utility functions for the Secret Hitler app.
 */

// Characters allowed in room codes (ambiguous characters removed)
const ROOM_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const ROOM_CODE_LENGTH = 6

/**
 * Generates a random room code.
 * Uses cryptographically secure random if available.
 */
export function generateRoomCode(): string {
  let code = ''

  for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
    const randomIndex = Math.floor(Math.random() * ROOM_CODE_CHARS.length)
    code += ROOM_CODE_CHARS[randomIndex]
  }

  return code
}

/**
 * Validates a room code format.
 */
export function isValidRoomCode(code: string): boolean {
  if (!code || typeof code !== 'string') {
    return false
  }

  const normalized = code.toUpperCase().trim()

  if (normalized.length !== ROOM_CODE_LENGTH) {
    return false
  }

  // Check all characters are valid
  return [...normalized].every((char) => ROOM_CODE_CHARS.includes(char))
}

/**
 * Normalizes a room code to uppercase.
 */
export function normalizeRoomCode(code: string): string {
  return code.toUpperCase().trim()
}

// Game constants
export const GAME_CONSTANTS = {
  MIN_PLAYERS: 5,
  MAX_PLAYERS: 10,
  HITLER_SEES_FASCISTS_THRESHOLD: 6,
} as const

// Role display names
export const ROLE_DISPLAY: Record<string, { name: string; emoji: string }> = {
  liberal: { name: 'Liberal', emoji: '💙' },
  fascist: { name: 'Fascist', emoji: '👤' },
  hitler: { name: 'Hitler', emoji: '🕵️' },
} as const
