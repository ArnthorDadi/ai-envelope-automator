import { doc, setDoc, getDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { normalizeRoomCode } from './utils';

interface JoinRoomOptions {
  roomId: string;
  playerId: string;
  playerName: string;
}

interface JoinRoomResult {
  success: boolean;
  error?: 'ROOM_NOT_FOUND' | 'ROOM_FULL' | 'GAME_STARTED';
}

export async function joinRoom(options: JoinRoomOptions): Promise<JoinRoomResult> {
  const { roomId, playerId, playerName } = options;
  const normalizedRoomId = normalizeRoomCode(roomId);

  const roomRef = doc(db, 'rooms', normalizedRoomId);
  const roomSnapshot = await getDoc(roomRef);

  if (!roomSnapshot.exists()) {
    return { success: false, error: 'ROOM_NOT_FOUND' };
  }

  const roomData = roomSnapshot.data();

  if (roomData.status !== 'lobby') {
    return { success: false, error: 'GAME_STARTED' };
  }

  if (roomData.playerCount >= 10) {
    return { success: false, error: 'ROOM_FULL' };
  }

  const playerRef = doc(db, 'rooms', normalizedRoomId, 'players', playerId);
  await setDoc(playerRef, {
    id: playerId,
    name: playerName,
    role: null,
    joinedAt: serverTimestamp(),
  }, { merge: true });

  await updateDoc(roomRef, {
    playerCount: increment(1),
  });

  return { success: true };
}
