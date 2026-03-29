import { ROOM_CODE_CHARS, ROOM_CODE_LENGTH } from './types';

export function generateRoomCode(): string {
  let code = '';
  for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
    const randomIndex = Math.floor(Math.random() * ROOM_CODE_CHARS.length);
    code += ROOM_CODE_CHARS[randomIndex];
  }
  return code;
}

export function isValidRoomCode(code: string): boolean {
  if (!code || typeof code !== 'string') {
    return false;
  }
  const normalized = code.toUpperCase().trim();
  if (normalized.length !== ROOM_CODE_LENGTH) {
    return false;
  }
  return [...normalized].every((char) => ROOM_CODE_CHARS.includes(char));
}

export function normalizeRoomCode(code: string): string {
  return code.toUpperCase().trim();
}

export function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
