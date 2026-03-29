import { doc, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from './firebase';
import { Role, ROLE_DISTRIBUTION } from './types';
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

export async function resetGame(roomId: string, players: { id: string }[]): Promise<void> {
  const roles = generateRoles(players.length);
  const batch = writeBatch(db);

  players.forEach((player, index) => {
    const playerRef = doc(db, 'rooms', roomId, 'players', player.id);
    batch.update(playerRef, { role: roles[index] });
  });

  await batch.commit();
}
