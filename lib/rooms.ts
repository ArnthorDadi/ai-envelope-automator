import { ref, set, get, onValue, off, Database } from 'firebase/database';
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
  hostId: string;
  hostName: string;
}

export interface CreateRoomResult {
  roomId: string;
  playerId: string;
}

export interface RoomsService {
  createRoom(options: CreateRoomOptions): Promise<CreateRoomResult>;
  getRoom(roomId: string): Promise<Room | null>;
  getPlayers(roomId: string): Promise<Player[]>;
  subscribeToRoom(roomId: string, callback: (room: Room | null) => void): () => void;
  subscribeToPlayers(roomId: string, callback: (players: Player[]) => void): () => void;
}

export class RoomsServiceImpl implements RoomsService {
  constructor(private db: Database) {}

  async createRoom(options: CreateRoomOptions): Promise<CreateRoomResult> {
    const { hostId, hostName } = options;
    const roomId = generateRoomCode();
    const now = Date.now();

    const roomRef = ref(this.db, `rooms/${roomId}`);
    await set(roomRef, {
      id: roomId,
      hostId,
      status: 'lobby',
      playerCount: 1,
      createdAt: now,
    });

    const playerRef = ref(this.db, `rooms/${roomId}/players/${hostId}`);
    await set(playerRef, {
      id: hostId,
      name: hostName,
      role: null,
      joinedAt: now,
    });

    return { roomId, playerId: hostId };
  }

  async getRoom(roomId: string): Promise<Room | null> {
    const roomRef = ref(this.db, `rooms/${roomId}`);
    const snapshot = await get(roomRef);
    return snapshot.val();
  }

  async getPlayers(roomId: string): Promise<Player[]> {
    const playersRef = ref(this.db, `rooms/${roomId}/players`);
    const snapshot = await get(playersRef);
    const data = snapshot.val();
    if (!data) return [];
    return Object.values(data) as Player[];
  }

  subscribeToRoom(roomId: string, callback: (room: Room | null) => void): () => void {
    const roomRef = ref(this.db, `rooms/${roomId}`);

    const unsubscribe = onValue(roomRef, (snapshot) => {
      callback(snapshot.val());
    });

    return () => off(roomRef);
  }

  subscribeToPlayers(roomId: string, callback: (players: Player[]) => void): () => void {
    const playersRef = ref(this.db, `rooms/${roomId}/players`);

    const unsubscribe = onValue(playersRef, (snapshot) => {
      const data = snapshot.val();
      callback(data ? Object.values(data) : []);
    });

    return () => off(playersRef);
  }
}
