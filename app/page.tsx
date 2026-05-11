import {
  CreateRoomButton,
  HeroSection,
  JoinRoomForm,
  FactionPreviewCards,
} from '@/components/home'

export default function Home() {
  return (
    <main className="flex flex-col items-center px-margin-mobile w-full max-w-container-max mx-auto gap-12 py-12">
      <HeroSection />
      <CreateRoomButton />
      <JoinRoomForm />
      <FactionPreviewCards />
      <footer className="text-center pb-8 opacity-40">
        <p className="font-label-caps text-label-caps italic max-w-xs mx-auto">
          &ldquo;In a world of secrets, trust is the only currency worth
          trading.&rdquo;
        </p>
        <div className="mt-4 flex justify-center gap-4">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <div className="w-2 h-2 rounded-full bg-hitler-accent" />
          <div className="w-2 h-2 rounded-full bg-primary" />
        </div>
      </footer>
    </main>
  )
}
