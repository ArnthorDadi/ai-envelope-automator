'use client'

import { useState } from 'react'
import { useToast } from '@/contexts/toast-context'

interface CopyCodeButtonProps {
  roomCode: string
}

export function CopyCodeButton({ roomCode }: CopyCodeButtonProps) {
  const { addToast } = useToast()
  const [copying, setCopying] = useState(false)

  const handleCopy = async () => {
    setCopying(true)
    try {
      await navigator.clipboard.writeText(roomCode)
      addToast('Room code copied!', 'success')
    } catch (error) {
      addToast('Failed to copy room code', 'error')
    } finally {
      setCopying(false)
    }
  }

  return (
    <button
      onClick={handleCopy}
      disabled={copying}
      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
    >
      {copying ? 'Copying...' : 'Copy Code'}
    </button>
  )
}
