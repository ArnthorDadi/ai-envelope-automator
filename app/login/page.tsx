'use client';

import { BackButton, LoginForm } from '@/components/login';

export default function LoginPage() {
  return (
    <main className="flex flex-col items-center justify-center flex-1 p-4">
      <BackButton />

      <h1 className="text-2xl font-bold mb-6">Enter your name</h1>

      <LoginForm />
    </main>
  );
}
