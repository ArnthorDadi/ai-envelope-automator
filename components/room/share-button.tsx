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
      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
    >
      {sharing ? 'Sharing...' : 'Share'}
    </button>
  )
}
