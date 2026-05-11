'use client'

import { useState } from 'react'
import { useToast } from '@/contexts/toast-context'

interface ShareButtonProps {
  roomId: string
}

export function ShareButton({ roomId }: ShareButtonProps) {
  const { addToast } = useToast()
  const [sharing, setSharing] = useState(false)

  const handleShare = async () => {
    const url = `${window.location.origin}/room/${roomId}`

    setSharing(true)
    try {
      if (navigator.share && navigator.canShare) {
        const shareData = { title: 'Secret Hitler', url }
        if (navigator.canShare(shareData)) {
          await navigator.share(shareData)
          return
        }
      }

      await navigator.clipboard.writeText(url)
      addToast('Room link copied!', 'success')
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        addToast('Failed to share room', 'error')
      }
    } finally {
      setSharing(false)
    }
  }

  return (
    <button
      onClick={handleShare}
      disabled={sharing}
      className="w-full h-touch-target bg-surface-container border border-outline-variant font-stamp-text text-stamp-text active:scale-95 transition-transform flex items-center justify-center gap-2 hover:bg-surface-container-high disabled:opacity-50"
    >
      {sharing ? (
        'SHARING...'
      ) : (
        <>
          INVITE PLAYERS
          <span className="material-symbols-outlined text-[20px]">send</span>
        </>
      )}
    </button>
  )
}
