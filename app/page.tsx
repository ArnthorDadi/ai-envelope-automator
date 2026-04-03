'use client';

import { useAuth } from '@/contexts/auth-context';
import { HeroSection, CreateRoomButton } from '@/components/home';
import { AuthPrompt } from '@/components/auth';
import { Spinner } from '@/components/shared';

function HomeContent() {
  const { user } = useAuth();

  return user ? <CreateRoomButton /> : <AuthPrompt />;
}

export default function Home() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <main className="flex items-center justify-center flex-1">
        <Spinner size="md" />
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center justify-center flex-1 p-4">
      <HeroSection />
      <div className="flex flex-col gap-4 w-full max-w-xs">
        <HomeContent />
      </div>
    </main>
  );
}
