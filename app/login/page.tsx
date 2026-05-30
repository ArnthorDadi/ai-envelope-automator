import { LoginForm } from '@/components/login'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ createRoom?: string; joinRoom?: string }>
}) {
  const params = await searchParams

  return (
    <main className="login-bg min-h-dvh flex flex-col items-center p-margin-mobile relative pt-16">
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-surface/80" />

      <div className="w-full max-w-container-max flex flex-col items-center relative z-10">
        <div className="mb-12 text-center">
          <h1 className="font-headline-xl text-headline-xl text-primary tracking-[0.3em] uppercase drop-shadow-lg">
            SECRET HITLER
          </h1>
          <p className="font-label-caps text-label-caps text-on-surface-variant tracking-widest mt-2">
            BERLIN • 1932 • OFFICIAL RECORDS
          </p>
        </div>

        <div
          className="login-card w-full rounded-lg shadow-2xl relative overflow-hidden flex flex-col items-center p-6 md:p-12"
          style={{
            border: '12px double #4d4635',
            outline: '4px solid #4d4635',
            outlineOffset: '4px',
          }}
        >
          <div className="text-center mb-10 w-full relative">
            <div className="absolute left-4 top-1/2 w-6 h-[1px] bg-outline-variant" />
            <div className="absolute right-4 top-1/2 w-6 h-[1px] bg-outline-variant" />
            <h2 className="font-headline-md text-headline-md uppercase">
              {params.joinRoom ? 'JOIN ROOM' : 'ENTER YOUR NAME'}
            </h2>
          </div>

          <div className="w-24 h-32 bg-surface-dim mb-8 relative border-4 border-outline-variant -rotate-1 shadow-md">
            <img
              alt="Identity Silhouette"
              src="/images/silhouettes/identity-silhouette-1.png"
              className="w-full h-full object-cover grayscale opacity-80"
            />
            <div className="absolute inset-0 border-[1px] border-white/10 pointer-events-none" />
          </div>

          <LoginForm
            createRoomOnLogin={params.createRoom === 'true'}
            joinRoomCode={params.joinRoom}
          />

          <div className="absolute top-4 right-4 opacity-10 pointer-events-none">
            <span className="material-symbols-outlined text-6xl text-surface-dim rotate-45">
              fingerprint
            </span>
          </div>
          <div className="absolute bottom-4 left-4 opacity-20 pointer-events-none">
            <p className="font-code-display text-[8px] text-surface-dim -rotate-90 origin-left">
              SEC-HIT-ID-9283-B
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-4">
          <p className="font-label-caps text-[10px] text-on-surface-variant tracking-[0.2em] opacity-40 uppercase text-on-surface">
            Established 1932 • Weimar Republic
          </p>
        </div>
      </div>
    </main>
  )
}
