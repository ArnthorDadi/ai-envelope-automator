import { doc, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from './firebase';
import { Role, ROLE_DISTRIBUTION, MIN_PLAYERS, MAX_PLAYERS } from './types';
import { shuffle } from './utils';

function generateRoles(playerCount: number): Role[] {
  const distribution = ROLE_DISTRIBUTION[playerCount];
  const roles: Role[] = [
    ...Array(distribution.liberals).fill('liberal'),
    ...Array(distribution.fascists - 1).fill('fascist'),
    'hitler',
  ];
  return shuffle(roles);
}

interface StartGameResult {
  success: boolean;
  error?: 'NOT_ENOUGH_PLAYERS';
}

export async function startGame(
  roomId: string,
  players: { id: string }[]
): Promise<StartGameResult> {
  if (players.length < MIN_PLAYERS) {
    return { success: false, error: 'NOT_ENOUGH_PLAYERS' };
  }

  const roles = generateRoles(players.length);
  const batch = writeBatch(db);

  players.forEach((player, index) => {
    const playerRef = doc(db, 'rooms', roomId, 'players', player.id);
    batch.update(playerRef, { role: roles[index] });
  });

  const roomRef = doc(db, 'rooms', roomId);
  batch.update(roomRef, { status: 'started' });

  await batch.commit();
  return { success: true };
}
