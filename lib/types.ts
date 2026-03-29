export type Role = 'liberal' | 'fascist' | 'hitler';

export interface Room {
  id: string;
  hostId: string;
  status: 'lobby' | 'started';
  playerCount: number;
  settings: {
    hitlerSeesFascists: boolean;
  };
  createdAt: unknown;
}

export interface Player {
  id: string;
  name: string;
  role: Role | null;
  joinedAt: unknown;
  leftAt?: unknown;
}

export interface User {
  uid: string;
  name: string;
}

export const ROOM_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const ROOM_CODE_LENGTH = 6;
export const MIN_PLAYERS = 5;
export const MAX_PLAYERS = 10;

export const ROLE_DISTRIBUTION: Record<number, { liberals: number; fascists: number }> = {
  5:  { liberals: 3, fascists: 2 },
  6:  { liberals: 4, fascists: 2 },
  7:  { liberals: 4, fascists: 3 },
  8:  { liberals: 5, fascists: 3 },
  9:  { liberals: 5, fascists: 4 },
  10: { liberals: 6, fascists: 4 },
};

export type RoomErrorType = 
  | 'ROOM_NOT_FOUND' 
  | 'ROOM_FULL' 
  | 'GAME_STARTED' 
  | 'ROOM_DELETED' 
  | 'NETWORK_ERROR'
  | 'AUTH_ERROR';

export interface RoomError {
  type: RoomErrorType;
  message: string;
  roomCode?: string;
}

export function getErrorMessage(type: RoomErrorType): string {
  switch (type) {
    case 'ROOM_NOT_FOUND':
      return 'This room does not exist.';
    case 'ROOM_FULL':
      return 'This room is full (10 players).';
    case 'GAME_STARTED':
      return 'This game has already started.';
    case 'ROOM_DELETED':
      return 'This room no longer exists. The host may have quit.';
    case 'NETWORK_ERROR':
      return 'Network error. Please check your connection.';
    case 'AUTH_ERROR':
      return 'Authentication error. Please log in again.';
    default:
      return 'An error occurred.';
  }
}
