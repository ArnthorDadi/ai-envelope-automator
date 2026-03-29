/**
 * createRoom.ts
 * 
 * Creates a new game room and adds the creator as host.
 * Uses Firebase v9 modular SDK.
 */

import { doc, setDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { generateRoomCode } from './utils';

interface CreateRoomOptions {
  hostId: string;
  hostName: string;
  settings?: {
    hitlerSeesFascists: boolean;
  };
}

interface CreateRoomResult {
  roomId: string;
  playerId: string;
}

/**
 * Creates a new room and adds the host as the first player.
 * 
 * @param options - Room creation options
 * @returns Promise with roomId and playerId
 */
export async function createRoom(options: CreateRoomOptions): Promise<CreateRoomResult> {
  const { hostId, hostName, settings = { hitlerSeesFascists: true } } = options;
  
  // Generate unique room code
  // In production, verify uniqueness by checking Firestore
  const roomId = generateRoomCode();
  
  // Create room document
  const roomRef = doc(db, 'rooms', roomId);
  await setDoc(roomRef, {
    id: roomId,
    hostId,
    status: 'lobby',
    playerCount: 1,
    settings,
    createdAt: serverTimestamp(),
  });
  
  // Add host as first player
  const playerRef = doc(db, 'rooms', roomId, 'players', hostId);
  await setDoc(playerRef, {
    id: hostId,
    name: hostName,
    role: null, // Role assigned when game starts
    joinedAt: serverTimestamp(),
  });
  
  return { roomId, playerId: hostId };
}

// Example usage:
// const { roomId, playerId } = await createRoom({
//   hostId: auth.currentUser.uid,
//   hostName: 'Alice',
// });
