'use client'

interface SpinnerProps {
  size?: 'sm' | 'md'
}

const sizeClasses = {
  sm: 'w-5 h-5 border-2',
  md: 'w-8 h-8 border-4',
}

export function Spinner({ size = 'sm' }: SpinnerProps) {
  return (
    <div
      className={`${sizeClasses[size]} border-gray-400 border-t-blue-500 rounded-full animate-spin`}
    />
  )
}
