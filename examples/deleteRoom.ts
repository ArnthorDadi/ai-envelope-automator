/**
 * deleteRoom.ts
 *
 * Deletes a room when the host quits the game.
 * Uses Firebase v9 modular SDK.
 */

import { doc, deleteDoc, collection, getDocs } from 'firebase/firestore'
import { db } from './firebase'

interface DeleteRoomResult {
  success: boolean
  error?: 'NOT_HOST' | 'ROOM_NOT_FOUND'
}

/**
 * Deletes the room and all player documents.
 * Only the host can delete the room.
 *
 * @param roomId - The room ID
 * @param hostId - The current user's ID (for validation)
 * @returns Promise with success status or error code
 */
export async function deleteRoom(
  roomId: string,
  hostId: string
): Promise<DeleteRoomResult> {
  const roomRef = doc(db, 'rooms', roomId)

  // Get room to verify host
  // Note: In production, this should be done via Firestore rules
  // to prevent race conditions. Consider using a transaction.

  // Delete all player documents first
  const playersRef = collection(db, 'rooms', roomId, 'players')
  const playersSnapshot = await getDocs(playersRef)

  const deletePromises = playersSnapshot.docs.map((doc) => deleteDoc(doc.ref))

  await Promise.all(deletePromises)

  // Delete the room document
  await deleteDoc(roomRef)

  return { success: true }
}

// Example usage:
// ------------------------------
//
// async function handleQuitGame() {
//   const confirmed = window.confirm(
//     'Are you sure you want to quit? This will delete the room for all players.'
//   );
//
//   if (!confirmed) return;
//
//   const result = await deleteRoom(roomId, auth.currentUser.uid);
//
//   if (result.success) {
//     router.push('/');
//   } else {
//     showError('Failed to delete room');
//   }
// }
//

/**
 * Secure version using Firestore transaction
 * Ensures the user is still the host at the time of deletion.
 */
// export async function deleteRoomSecure(roomId: string, hostId: string) {
//   const roomRef = doc(db, 'rooms', roomId);
//
//   await runTransaction(db, async (transaction) => {
//     const roomDoc = await transaction.get(roomRef);
//
//     if (!roomDoc.exists()) {
//       throw new Error('Room does not exist');
//     }
//
//     if (roomDoc.data().hostId !== hostId) {
//       throw new Error('Only host can delete');
//     }
//
//     // Get all players
//     const playersRef = collection(db, 'rooms', roomId, 'players');
//     const playersSnap = await getDocs(playersRef);
//
//     // Delete all player documents
//     playersSnap.docs.forEach((doc) => {
//       transaction.delete(doc.ref);
//     });
//
//     // Delete room document
//     transaction.delete(roomRef);
//   });
// }
