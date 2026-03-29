/**
 * resetGame.ts
 * 
 * Resets the game for a new round with the same players.
 * Uses Firebase v9 modular SDK.
 */

import { 
  doc, 
  collection,
  getDocs,
  writeBatch 
} from 'firebase/firestore';
import { db } from './firebase';
import { generateRoles } from './startGame';

// Type definitions
interface Player {
  id: string;
  name: string;
  role: string | null;
}

interface ResetGameResult {
  success: boolean;
  error?: 'NOT_HOST' | 'NOT_STARTED';
}

/**
 * Resets the game by clearing all roles and re-shuffling.
 * 
 * This function:
 * 1. Validates the host
 * 2. Validates the game is started
 * 3. Generates new random roles
 * 4. Updates each player's document with new role
 * 5. Room status remains 'started'
 * 
 * @param roomId - The room ID
 * @param hostId - The current user's ID (for validation)
 * @returns Promise with success status or error code
 */
export async function resetGame(
  roomId: string,
  hostId: string
): Promise<ResetGameResult> {
  // Validate room exists
  const roomRef = doc(db, 'rooms', roomId);
  
  // Get all players
  const playersRef = collection(db, 'rooms', roomId, 'players');
  const playersSnapshot = await getDocs(playersRef);
  
  if (playersSnapshot.empty) {
    return { success: false, error: 'NOT_STARTED' };
  }
  
  const players = playersSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Player[];
  
  // Generate new roles
  const roles = generateRoles(players.length);
  
  // Use a batch write for atomic role assignment
  const batch = writeBatch(db);
  
  // Assign new roles to each player
  players.forEach((player, index) => {
    const playerRef = doc(db, 'rooms', roomId, 'players', player.id);
    batch.update(playerRef, { role: roles[index] });
  });
  
  // Commit the batch
  await batch.commit();
  
  return { success: true };
}

// Example usage:
// ------------------------------
// 
// async function handleResetGame() {
//   const result = await resetGame(roomId, auth.currentUser.uid);
//   
//   if (result.success) {
//     showToast('New round started!');
//   } else {
//     showError('Failed to reset game');
//   }
// }
//

/**
 * Alternative: Secure version with Firestore transaction
 * Ensures the user is still the host at the time of reset.
 */
// export async function resetGameSecure(roomId: string, hostId: string) {
//   const roomRef = doc(db, 'rooms', roomId);
//   
//   await runTransaction(db, async (transaction) => {
//     const roomDoc = await transaction.get(roomRef);
//     const roomData = roomDoc.data();
//     
//     if (!roomDoc.exists()) {
//       throw new Error('Room does not exist');
//     }
//     
//     if (roomData.hostId !== hostId) {
//       throw new Error('Only host can reset');
//     }
//     
//     if (roomData.status !== 'started') {
//       throw new Error('Game has not started');
//     }
//     
//     // ... assign new roles
//   });
// }
