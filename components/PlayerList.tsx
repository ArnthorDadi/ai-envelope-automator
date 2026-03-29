'use client';

import React from 'react';
import { Player } from '@/lib/types';

interface PlayerListProps {
  players: Player[];
  hostId: string;
  currentUserId?: string;
  joiningPlayerIds: Set<string>;
  leavingPlayerIds: Set<string>;
}

export const PlayerList = React.memo(function PlayerList({
  players,
  hostId,
  currentUserId,
  joiningPlayerIds,
  leavingPlayerIds,
}: PlayerListProps) {
  return (
    <div className="space-y-2">
      {players.map((player) => {
        const isJoining = joiningPlayerIds.has(player.id);
        const isLeaving = leavingPlayerIds.has(player.id);
        
        let animationClass = '';
        if (isJoining) animationClass = 'animate-player-join';
        else if (isLeaving) animationClass = 'animate-player-leave';
        
        return (
          <div
            key={player.id}
            className={`flex items-center gap-2 p-3 bg-white rounded-lg border ${animationClass}`}
          >
            <span>{player.id === hostId ? '⭐' : '👤'}</span>
            <span className="font-medium">
              {player.name}
              {player.id === hostId && ' (Host)'}
              {player.id === currentUserId && ' (You)'}
            </span>
          </div>
        );
      })}
    </div>
  );
});
