'use client';

import { useRouter } from 'next/navigation';

export function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push('/')}
      className="absolute top-16 left-4 text-blue-500 hover:underline"
    >
      ← Back
    </button>
  );
}
