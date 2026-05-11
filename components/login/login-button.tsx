'use client'

import { useRouter } from 'next/navigation'

export function LoginButton() {
  const router = useRouter()

  return (
    <button
      onClick={() => router.push('/login')}
      className="px-5 py-2 font-stamp-text text-stamp-text text-primary border border-primary hover:bg-primary-container/10 active:scale-95 transition-all rounded"
    >
      SIGN IN
    </button>
  )
}
