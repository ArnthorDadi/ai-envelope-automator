import { ref, set, Database } from 'firebase/database';
import { generateRoomCode } from './utils';

export interface Room {
  id: string;
  hostId: string;
  status: 'lobby' | 'started';
  playerCount: number;
  createdAt: number;
}

export interface Player {
  id: string;
  name: string;
  role: 'liberal' | 'fascist' | 'hitler' | null;
  joinedAt: number;
  leftAt: number | null;
}

export interface CreateRoomOptions {
  db: Database;
  hostId: string;
  hostName: string;
}

export interface CreateRoomResult {
  roomId: string;
  playerId: string;
}

export async function createRoom(options: CreateRoomOptions): Promise<CreateRoomResult> {
  const { db, hostId, hostName } = options;

  const roomId = generateRoomCode();
  const now = Date.now();

  const roomRef = ref(db, `rooms/${roomId}`);
  await set(roomRef, {
    id: roomId,
    hostId,
    status: 'lobby',
    playerCount: 1,
    createdAt: now,
  });

  const playerRef = ref(db, `rooms/${roomId}/players/${hostId}`);
  await set(playerRef, {
    id: hostId,
    name: hostName,
    role: null,
    joinedAt: now,
  });

  return { roomId, playerId: hostId };
}
