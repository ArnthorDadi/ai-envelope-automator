import { deleteDoc, doc } from 'firebase/firestore';
import { db } from './firebase';

export async function deleteRoom(roomId: string): Promise<void> {
  const roomRef = doc(db, 'rooms', roomId);
  await deleteDoc(roomRef);
}
