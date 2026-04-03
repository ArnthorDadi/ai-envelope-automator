'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/components/shared';

export function LoginForm() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { signIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      await signIn(name.trim());
      router.push('/');
    } catch {
      // Error handled in context
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xs">
      <input
        ref={inputRef}
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value.slice(0, 20))}
        placeholder="Your name"
        maxLength={20}
        className="w-full p-3 border rounded-lg mb-4"
        disabled={loading}
      />

      <button
        type="submit"
        disabled={!name.trim() || loading}
        className="w-full p-3 bg-blue-500 text-white rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? <Spinner size="sm" /> : null}
        {loading ? 'SUBMITTING' : 'SUBMIT'}
      </button>
    </form>
  );
}
