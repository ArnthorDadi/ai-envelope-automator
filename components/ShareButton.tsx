'use client';

import { useState } from 'react';
import { shareRoom } from '@/lib/shareRoom';
import { useToast } from '@/contexts/ToastContext';

interface ShareButtonProps {
  roomCode: string;
}

export function ShareButton({ roomCode }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const { addToast } = useToast();

  const handleShare = async () => {
    const result = await shareRoom({ roomCode });
    
    if (result.copied) {
      setCopied(true);
      addToast('Copied!');
      setTimeout(() => setCopied(false), 2000);
    } else if (!result.success) {
      addToast('Failed to share');
    }
  };

  return (
    <button
      onClick={handleShare}
      className="px-3 py-1.5 text-sm bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
    >
      {copied ? '✓ Copied' : 'Share'}
    </button>
  );
}
