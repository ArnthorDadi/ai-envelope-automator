/**
 * subscribeToRoom.ts
 * 
 * Real-time subscription to room updates using Firestore onSnapshot.
 * Uses Firebase v9 modular SDK.
 */

import { 
  doc, 
  onSnapshot, 
  collection,
  query,
  where,
  Unsubscribe 
} from 'firebase/firestore';
import { db } from './firebase';

// Type definitions
interface Room {
  id: string;
  hostId: string;
  status: 'lobby' | 'started';
  playerCount: number;
  settings: {
    hitlerSeesFascists: boolean;
  };
  createdAt: unknown; // Firebase Timestamp
}

interface Player {
  id: string;
  name: string;
  role: 'liberal' | 'fascist' | 'hitler' | null;
  joinedAt: unknown; // Firebase Timestamp
}

/**
 * Subscribe to room document updates.
 * 
 * @param roomId - The room ID to subscribe to
 * @param callback - Called with room data on each update
 * @returns Unsubscribe function to stop listening
 */
export function subscribeToRoom(
  roomId: string,
  callback: (room: Room | null) => void
): Unsubscribe {
  const roomRef = doc(db, 'rooms', roomId);
  
  return onSnapshot(roomRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data() as Room);
    } else {
      callback(null); // Room was deleted
    }
  }, (error) => {
    console.error('Room subscription error:', error);
    callback(null);
  });
}

/**
 * Subscribe to players in a room.
 * 
 * @param roomId - The room ID
 * @param callback - Called with array of players on each update
 * @returns Unsubscribe function
 */
export function subscribeToPlayers(
  roomId: string,
  callback: (players: Player[]) => void
): Unsubscribe {
  const playersRef = collection(db, 'rooms', roomId, 'players');
  
  return onSnapshot(playersRef, (snapshot) => {
    const players = snapshot.docs.map((doc) => doc.data() as Player);
    callback(players);
  }, (error) => {
    console.error('Players subscription error:', error);
    callback([]);
  });
}

/**
 * Subscribe to a specific player's document.
 * Useful for watching your own role assignment.
 * 
 * @param roomId - The room ID
 * @param playerId - The player ID (Firebase UID)
 * @param callback - Called with player data on updates
 * @returns Unsubscribe function
 */
export function subscribeToPlayer(
  roomId: string,
  playerId: string,
  callback: (player: Player | null) => void
): Unsubscribe {
  const playerRef = doc(db, 'rooms', roomId, 'players', playerId);
  
  return onSnapshot(playerRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data() as Player);
    } else {
      callback(null); // Player was removed
    }
  }, (error) => {
    console.error('Player subscription error:', error);
    callback(null);
  });
}

/**
 * Combined subscription for room and players.
 * Provides a clean interface for the game component.
 * 
 * @param roomId - The room ID
 * @param playerId - Current player's ID
 * @param callbacks - Object with callback functions
 * @returns Object with unsubscribe functions
 */
export function subscribeToGame(
  roomId: string,
  playerId: string,
  callbacks: {
    onRoomUpdate?: (room: Room | null) => void;
    onPlayersUpdate?: (players: Player[]) => void;
    onPlayerUpdate?: (player: Player | null) => void;
  }
): { unsubscribe: () => void } {
  const unsubscribers: Unsubscribe[] = [];
  
  if (callbacks.onRoomUpdate) {
    unsubscribers.push(subscribeToRoom(roomId, callbacks.onRoomUpdate));
  }
  
  if (callbacks.onPlayersUpdate) {
    unsubscribers.push(subscribeToPlayers(roomId, callbacks.onPlayersUpdate));
  }
  
  if (callbacks.onPlayerUpdate) {
    unsubscribers.push(subscribeToPlayer(roomId, playerId, callbacks.onPlayerUpdate));
  }
  
  return {
    unsubscribe: () => {
      unsubscribers.forEach((unsub) => unsub());
    },
  };
}

// Example usage in React component:
// ------------------------------
// 
// 'use client';
// 
// import { useEffect, useState } from 'react';
// import { subscribeToGame } from './examples/subscribeToRoom';
// 
// export function GameRoom({ roomId, playerId }) {
//   const [room, setRoom] = useState<Room | null>(null);
//   const [players, setPlayers] = useState<Player[]>([]);
//   const [myPlayer, setMyPlayer] = useState<Player | null>(null);
// 
//   useEffect(() => {
//     const { unsubscribe } = subscribeToGame(roomId, playerId, {
//       onRoomUpdate: setRoom,
//       onPlayersUpdate: setPlayers,
//       onPlayerUpdate: setMyPlayer,
//     });
// 
//     return unsubscribe;
//   }, [roomId, playerId]);
// 
//   // Render UI...
// }
