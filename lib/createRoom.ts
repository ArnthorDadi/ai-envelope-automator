import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { generateRoomCode } from './utils';

interface CreateRoomOptions {
  hostId: string;
  hostName: string;
}

interface CreateRoomResult {
  roomId: string;
  playerId: string;
}

export async function createRoom(options: CreateRoomOptions): Promise<CreateRoomResult> {
  const { hostId, hostName } = options;
  const roomId = generateRoomCode();

  const roomRef = doc(db, 'rooms', roomId);
  await setDoc(roomRef, {
    id: roomId,
    hostId,
    status: 'lobby',
    playerCount: 1,
    settings: { hitlerSeesFascists: true },
    createdAt: serverTimestamp(),
  });

  const playerRef = doc(db, 'rooms', roomId, 'players', hostId);
  await setDoc(playerRef, {
    id: hostId,
    name: hostName,
    role: null,
    joinedAt: serverTimestamp(),
  });

  return { roomId, playerId: hostId };
}
