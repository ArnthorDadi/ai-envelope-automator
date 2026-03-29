interface ShareOptions {
  roomCode: string;
}

interface ShareResult {
  success: boolean;
  copied?: boolean;
}

export async function shareRoom(options: ShareOptions): Promise<ShareResult> {
  const { roomCode } = options;
  const url = `${window.location.origin}/room/${roomCode}`;

  if (navigator.share && navigator.canShare?.({ url })) {
    try {
      await navigator.share({
        title: 'Join My Secret Hitler Room',
        url,
      });
      return { success: true };
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        return { success: false };
      }
    }
  }

  if (navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(url);
      return { success: true, copied: true };
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  }

  const textArea = document.createElement('textarea');
  textArea.value = url;
  textArea.style.position = 'fixed';
  textArea.style.left = '-9999px';
  document.body.appendChild(textArea);
  textArea.select();
  try {
    document.execCommand('copy');
    document.body.removeChild(textArea);
    return { success: true, copied: true };
  } catch (err) {
    document.body.removeChild(textArea);
    console.error('Fallback copy failed:', err);
    return { success: false };
  }
}
