/**
 * joinRoom.ts
 * 
 * Allows a player to join an existing room.
 * Uses Firebase v9 modular SDK.
 */

import { doc, setDoc, getDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

interface JoinRoomOptions {
  roomId: string;
  playerId: string;
  playerName: string;
}

interface JoinRoomResult {
  success: boolean;
  error?: 'ROOM_NOT_FOUND' | 'ROOM_FULL' | 'GAME_STARTED';
}

/**
 * Adds a player to an existing room.
 * 
 * @param options - Join room options
 * @returns Promise with success status or error code
 * 
 * @throws Error if Firestore operation fails
 */
export async function joinRoom(options: JoinRoomOptions): Promise<JoinRoomResult> {
  const { roomId, playerId, playerName } = options;
  
  // Normalize room ID to uppercase
  const normalizedRoomId = roomId.toUpperCase().trim();
  
  // Check if room exists
  const roomRef = doc(db, 'rooms', normalizedRoomId);
  const roomSnapshot = await getDoc(roomRef);
  
  if (!roomSnapshot.exists()) {
    return { success: false, error: 'ROOM_NOT_FOUND' };
  }
  
  const roomData = roomSnapshot.data();
  
  // Check if game already started
  if (roomData.status !== 'lobby') {
    return { success: false, error: 'GAME_STARTED' };
  }
  
  // Check if room is full (max 10 players)
  if (roomData.playerCount >= 10) {
    return { success: false, error: 'ROOM_FULL' };
  }
  
  // Add player to room
  const playerRef = doc(db, 'rooms', normalizedRoomId, 'players', playerId);
  await setDoc(playerRef, {
    id: playerId,
    name: playerName,
    role: null,
    joinedAt: serverTimestamp(),
  }, { merge: true }); // Merge to handle reconnection
  
  // Increment player count atomically
  // Use increment() to avoid race conditions from read-modify-write
  await updateDoc(roomRef, {
    playerCount: increment(1),
  });
  
  return { success: true };
}

// Example usage:
// const result = await joinRoom({
//   roomId: 'ABC123',
//   playerId: auth.currentUser.uid,
//   playerName: 'Bob',
// });
// 
// if (!result.success) {
//   showError(result.error);
// }
