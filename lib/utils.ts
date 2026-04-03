const ROOM_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const ROOM_CODE_LENGTH = 6

export function generateRoomCode(): string {
  let code = ''

  for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
    const randomIndex = Math.floor(Math.random() * ROOM_CODE_CHARS.length)
    code += ROOM_CODE_CHARS[randomIndex]
  }

  return code
}

export function isValidRoomCode(code: string): boolean {
  if (!code || typeof code !== 'string') {
    return false
  }

  const normalized = code.toUpperCase().trim()

  if (normalized.length !== ROOM_CODE_LENGTH) {
    return false
  }

  return [...normalized].every((char) => ROOM_CODE_CHARS.includes(char))
}

export function normalizeRoomCode(code: string): string {
  return code.toUpperCase().trim()
}

export const GAME_CONSTANTS = {
  MIN_PLAYERS: 5,
  MAX_PLAYERS: 10,
  HITLER_SEES_FASCISTS_THRESHOLD: 6,
} as const
