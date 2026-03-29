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
