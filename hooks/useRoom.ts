'use client';

import { useState, useEffect } from 'react';
import { doc, onSnapshot, collection, Unsubscribe } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Room, Player } from '@/lib/types';

export function useRoom(roomId: string) {
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomId) return;

    const roomRef = doc(db, 'rooms', roomId);
    const unsubscribe = onSnapshot(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        setRoom(snapshot.data() as Room);
      } else {
        setRoom(null);
        setError('Room not found');
      }
      setLoading(false);
    }, (err) => {
      console.error('Room subscription error:', err);
      setError(err.message);
      setLoading(false);
    });

    return unsubscribe;
  }, [roomId]);

  return { room, loading, error };
}

export function usePlayers(roomId: string) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roomId) return;

    const playersRef = collection(db, 'rooms', roomId, 'players');
    const unsubscribe = onSnapshot(playersRef, (snapshot) => {
      const playerList = snapshot.docs.map((doc) => doc.data() as Player);
      setPlayers(playerList);
      setLoading(false);
    }, (err) => {
      console.error('Players subscription error:', err);
      setLoading(false);
    });

    return unsubscribe;
  }, [roomId]);

  return { players, loading };
}

export function usePlayer(roomId: string, playerId: string) {
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roomId || !playerId) return;

    const playerRef = doc(db, 'rooms', roomId, 'players', playerId);
    const unsubscribe = onSnapshot(playerRef, (snapshot) => {
      if (snapshot.exists()) {
        setPlayer(snapshot.data() as Player);
      } else {
        setPlayer(null);
      }
      setLoading(false);
    }, (err) => {
      console.error('Player subscription error:', err);
      setLoading(false);
    });

    return unsubscribe;
  }, [roomId, playerId]);

  return { player, loading };
}
