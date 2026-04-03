'use client'

import { useAuth } from '@/contexts/auth-context'
import { CreateRoomButton, HeroSection, JoinRoomForm } from '@/components/home'
import { AuthPrompt } from '@/components/auth'
import { Spinner } from '@/components/shared'

function HomeContent() {
  const { user } = useAuth()

  if (!user) {
    return <AuthPrompt />
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-xs">
      <CreateRoomButton />
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-background px-4 text-muted-foreground">
          Or join a room
        </span>
      </div>
      <JoinRoomForm />
    </div>
  )
}

export default function Home() {
  const { loading } = useAuth()

  if (loading) {
    return (
      <main className="flex items-center justify-center flex-1">
        <Spinner size="md" />
      </main>
    )
  }

  return (
    <main className="flex flex-col items-center justify-center flex-1 p-4">
      <HeroSection />
      <HomeContent />
    </main>
  )
}
