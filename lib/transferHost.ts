'use client';

import { db } from './firebase';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  writeBatch, 
  doc, 
  getDocs 
} from 'firebase/firestore';

export async function transferHost(roomId: string): Promise<{ success: boolean; newHostId?: string; newHostName?: string; error?: string }> {
  try {
    const playersRef = collection(db, 'rooms', roomId, 'players');
    const q = query(
      playersRef,
      where('leftAt', '==', null),
      orderBy('joinedAt', 'asc'),
      limit(1)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return { success: false, error: 'No players available to transfer host' };
    }

    const newHostDoc = snapshot.docs[0];
    const newHostId = newHostDoc.id;
    const newHostName = newHostDoc.data().name;

    const roomRef = doc(db, 'rooms', roomId);
    const batch = writeBatch(db);
    
    batch.update(roomRef, { hostId: newHostId });
    
    await batch.commit();

    return { success: true, newHostId, newHostName };
  } catch (err) {
    console.error('Failed to transfer host:', err);
    return { success: false, error: 'Failed to transfer host' };
  }
}
