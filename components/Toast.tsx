'use client';

import { useToast } from '@/contexts/ToastContext';

export function Toast() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          onClick={() => removeToast(toast.id)}
          className="bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg cursor-pointer animate-slide-in hover:bg-gray-700 transition-colors"
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
