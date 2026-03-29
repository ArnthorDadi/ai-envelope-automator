import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export async function leaveRoom(roomId: string, playerId: string): Promise<void> {
  const playerRef = doc(db, 'rooms', roomId, 'players', playerId);
  await updateDoc(playerRef, {
    leftAt: serverTimestamp(),
  });
}
