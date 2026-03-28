/**
 * startGame.ts
 * 
 * Handles game initialization and role assignment.
 * Uses Firebase v9 modular SDK.
 */

import { 
  doc, 
  updateDoc, 
  writeBatch,
  arrayUnion 
} from 'firebase/firestore';
import { db } from './firebase';

// Type definitions
type Role = 'liberal' | 'fascist' | 'hitler';

interface Player {
  id: string;
  name: string;
  role: Role | null;
}

interface RoleDistribution {
  liberals: number;
  fascists: number;
}

// Role distribution based on player count (5-10 players)
const ROLE_DISTRIBUTION: Record<number, RoleDistribution> = {
  5:  { liberals: 3, fascists: 2 },
  6:  { liberals: 4, fascists: 2 },
  7:  { liberals: 4, fascists: 3 },
  8:  { liberals: 5, fascists: 3 },
  9:  { liberals: 5, fascists: 4 },
  10: { liberals: 6, fascists: 4 },
};

const MIN_PLAYERS = 5;
const MAX_PLAYERS = 10;

/**
 * Shuffles an array using Fisher-Yates algorithm.
 */
function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Generates roles based on player count.
 */
function generateRoles(playerCount: number): Role[] {
  if (playerCount < MIN_PLAYERS || playerCount > MAX_PLAYERS) {
    throw new Error(`Invalid player count: ${playerCount}`);
  }
  
  const distribution = ROLE_DISTRIBUTION[playerCount];
  
  // Create role array: liberals, fascists-1 (one fascist is Hitler), hitler
  const roles: Role[] = [
    ...Array(distribution.liberals).fill('liberal'),
    ...Array(distribution.fascists - 1).fill('fascist'),
    'hitler',
  ];
  
  return shuffle(roles);
}

interface StartGameResult {
  success: boolean;
  error?: 'NOT_HOST' | 'NOT_ENOUGH_PLAYERS' | 'ALREADY_STARTED';
}

/**
 * Starts the game by assigning roles to all players.
 * 
 * This function:
 * 1. Validates the host and player count
 * 2. Generates shuffled roles
 * 3. Updates each player's document with their role
 * 4. Updates room status to 'started'
 * 
 * @param roomId - The room ID
 * @param hostId - The current user's ID (for validation)
 * @param players - Array of players in the room
 * @returns Promise with success status or error code
 */
export async function startGame(
  roomId: string,
  hostId: string,
  players: Player[]
): Promise<StartGameResult> {
  // Validate player count
  if (players.length < MIN_PLAYERS) {
    return { 
      success: false, 
      error: 'NOT_ENOUGH_PLAYERS' 
    };
  }
  
  if (players.length > MAX_PLAYERS) {
    throw new Error('Room has too many players');
  }
  
  // Generate roles
  const roles = generateRoles(players.length);
  
  // Use a batch write for atomic role assignment
  const batch = writeBatch(db);
  
  // Assign roles to each player
  players.forEach((player, index) => {
    const playerRef = doc(db, 'rooms', roomId, 'players', player.id);
    batch.update(playerRef, { role: roles[index] });
  });
  
  // Update room status
  const roomRef = doc(db, 'rooms', roomId);
  batch.update(roomRef, { status: 'started' });
  
  // Commit the batch
  await batch.commit();
  
  return { success: true };
}

// Example usage:
// ------------------------------
// 
// async function handleStartGame() {
//   const players = await getPlayersInRoom(roomId);
//   
//   const result = await startGame(
//     roomId,
//     auth.currentUser.uid,
//     players
//   );
//   
//   if (!result.success) {
//     switch (result.error) {
//       case 'NOT_HOST':
//         showError('Only the host can start the game');
//         break;
//       case 'NOT_ENOUGH_PLAYERS':
//         showError('Need at least 5 players to start');
//         break;
//       case 'ALREADY_STARTED':
//         showError('Game has already started');
//         break;
//     }
//   }
// }
//

/**
 * Alternative: Server-side role assignment validation.
 * 
 * For extra security, you could use Firebase Functions to:
 * 1. Validate the request is from the host
 * 2. Verify player count
 * 3. Generate and assign roles
 * 
 * This prevents any client-side manipulation of role assignment.
 */
// export async function startGameSecure(roomId: string): Promise<StartGameResult> {
//   const response = await fetch(`/api/games/${roomId}/start`, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ roomId }),
//   });
//   
//   return response.json();
// }
