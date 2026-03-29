'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { Button } from '@/components/Button';
import { Navbar } from '@/components/Navbar';

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, updateName } = useAuth();
  const { addToast } = useToast();
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await updateName(name.trim());
      addToast('Welcome!');
      router.push('/');
    } catch (error) {
      addToast('Login failed, please try again');
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-md mx-auto px-6 py-6 flex items-center justify-center">
          <p>Loading...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-md mx-auto px-6 py-6 pb-[max(env(safe-area-inset-bottom),1.5rem)]">
        <button
          onClick={handleBack}
          className="mb-6 text-gray-600 hover:text-gray-800"
        >
          ← Back
        </button>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Enter your name</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 20))}
              placeholder="Your name"
              className="w-full px-4 py-3 border rounded-lg text-lg"
              maxLength={20}
              disabled={isSubmitting}
              autoFocus
            />
            <p className="text-sm text-gray-500 mt-1 text-right">
              {name.length}/20
            </p>
          </div>

          <Button
            type="submit"
            loading={isSubmitting}
            disabled={!name.trim()}
          >
            Submit
          </Button>
        </form>
      </main>
    </div>
  );
}
