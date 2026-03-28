/**
 * getVisiblePlayers.ts
 * 
 * Determines which players a given player can see based on game rules.
 * Handles fascist visibility and Hitler visibility logic.
 * Uses Firebase v9 modular SDK.
 */

import { 
  doc, 
  getDoc,
  collection,
  getDocs 
} from 'firebase/firestore';
import { db } from './firebase';

// Type definitions
type Role = 'liberal' | 'fascist' | 'hitler';

interface Player {
  id: string;
  name: string;
  role: Role | null;
}

interface Room {
  id: string;
  status: 'lobby' | 'started';
  playerCount: number;
  settings: {
    hitlerSeesFascists: boolean;
  };
}

const HITLER_SEES_FASCISTS_THRESHOLD = 6;

/**
 * Fetches all players in a room and filters based on visibility rules.
 * 
 * This function should be called after the game has started
 * and the local player knows their own role.
 * 
 * @param roomId - The room ID
 * @param currentPlayerId - The current player's ID
 * @returns Promise with array of visible players (filtered)
 */
export async function getVisiblePlayers(
  roomId: string,
  currentPlayerId: string
): Promise<Player[]> {
  // Fetch current player's role
  const playerRef = doc(db, 'rooms', roomId, 'players', currentPlayerId);
  const playerSnapshot = await getDoc(playerRef);
  
  if (!playerSnapshot.exists()) {
    throw new Error('Player not found');
  }
  
  const currentPlayer = playerSnapshot.data() as Player;
  
  // Fetch room settings to determine Hitler visibility rule
  const roomRef = doc(db, 'rooms', roomId);
  const roomSnapshot = await getDoc(roomRef);
  
  if (!roomSnapshot.exists()) {
    throw new Error('Room not found');
  }
  
  const room = roomSnapshot.data() as Room;
  
  // Fetch all players
  const playersRef = collection(db, 'rooms', roomId, 'players');
  const playersSnapshot = await getDocs(playersRef);
  const allPlayers = playersSnapshot.docs.map((doc) => doc.data() as Player);
  
  // Apply visibility rules
  return filterVisiblePlayers(currentPlayer, allPlayers, room);
}

/**
 * Filters players based on visibility rules.
 * This is the pure logic function, usable without Firebase.
 * 
 * @param currentPlayer - The player viewing the data
 * @param allPlayers - All players in the room
 * @param room - Room data (for settings)
 * @returns Filtered array of visible players
 */
export function filterVisiblePlayers(
  currentPlayer: Player,
  allPlayers: Player[],
  room: Room
): Player[] {
  // If game hasn't started or no role assigned, see nothing
  if (room.status !== 'started' || !currentPlayer.role) {
    return [];
  }
  
  const myRole = currentPlayer.role;
  const totalPlayers = allPlayers.length;
  
  switch (myRole) {
    case 'liberal':
      // Liberals see nothing
      return [];
    
    case 'fascist':
      // Fascists see other fascists and Hitler
      return allPlayers.filter(
        (p) => p.role === 'fascist' || p.role === 'hitler'
      );
    
    case 'hitler':
      // Hitler sees fascists only in games with 5-6 players
      // This is controlled by room settings or player count
      const hitlerSeesFascists = room.settings?.hitlerSeesFascists 
        ?? (totalPlayers <= HITLER_SEES_FASCISTS_THRESHOLD);
      
      if (hitlerSeesFascists) {
        return allPlayers.filter((p) => p.role === 'fascist');
      }
      return [];
    
    default:
      return [];
  }
}

/**
 * Gets a summary of visible information for a player.
 * Useful for debugging or displaying "what you know".
 * 
 * @param currentPlayer - The player viewing the data
 * @param allPlayers - All players in the room
 * @param room - Room data
 * @returns Object with visible information summary
 */
export function getPlayerKnowledgeSummary(
  currentPlayer: Player,
  allPlayers: Player[],
  room: Room
): {
  role: Role | null;
  knowsCount: number;
  knowsPlayers: string[]; // Player names
  knowsHitler: boolean;
  knowsFascists: boolean;
} {
  const visiblePlayers = filterVisiblePlayers(currentPlayer, allPlayers, room);
  
  return {
    role: currentPlayer.role,
    knowsCount: visiblePlayers.length,
    knowsPlayers: visiblePlayers.map((p) => p.name),
    knowsHitler: visiblePlayers.some((p) => p.role === 'hitler'),
    knowsFascists: visiblePlayers.some((p) => p.role === 'fascist'),
  };
}

// Example usage:
// ------------------------------
// 
// // In a React component after game starts:
// const [visiblePlayers, setVisiblePlayers] = useState<Player[]>([]);
// 
// useEffect(() => {
//   async function loadVisiblePlayers() {
//     const visible = await getVisiblePlayers(roomId, currentUserId);
//     setVisiblePlayers(visible);
//   }
//   
//   loadVisiblePlayers();
// }, [roomId, currentUserId]);
// 
// // Display for fascist:
// // "You see: Bob (Fascist), Charlie (Hitler)"
// 
// ------------------------------
// 
// // Pure function usage (no Firebase):
// const summary = getPlayerKnowledgeSummary(
//   { id: '1', name: 'Alice', role: 'fascist' },
//   [
//     { id: '1', name: 'Alice', role: 'fascist' },
//     { id: '2', name: 'Bob', role: 'fascist' },
//     { id: '3', name: 'Charlie', role: 'hitler' },
//     { id: '4', name: 'Diana', role: 'liberal' },
//     { id: '5', name: 'Eve', role: 'liberal' },
//   ],
//   { id: 'ABC123', status: 'started', playerCount: 5, settings: {} }
// );
// 
// // summary = {
// //   role: 'fascist',
// //   knowsCount: 2,
// //   knowsPlayers: ['Bob', 'Charlie'],
// //   knowsHitler: true,
// //   knowsFascists: true,
// // }
