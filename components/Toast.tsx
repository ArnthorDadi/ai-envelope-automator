'use client';

import { useToast } from '@/contexts/ToastContext';

export function Toast() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`px-4 py-2 rounded-lg shadow-lg text-white animate-slide-in ${
            toast.type === 'error' ? 'bg-red-500' :
            toast.type === 'success' ? 'bg-green-500' :
            'bg-gray-700'
          }`}
          onClick={() => removeToast(toast.id)}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
