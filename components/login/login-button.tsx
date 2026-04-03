'use client';

import { useRouter } from 'next/navigation';

export function LoginButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push('/login')}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    >
      Login
    </button>
  );
}
