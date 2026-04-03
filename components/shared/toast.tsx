'use client';

import { useToast } from '@/contexts/toast-context';
import type { Toast as ToastType } from '@/types';

const typeClasses: Record<ToastType['type'], string> = {
  error: 'bg-red-500',
  success: 'bg-green-500',
  info: 'bg-gray-700',
};

export function Toast() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`px-4 py-2 rounded-lg shadow-lg text-white animate-slide-in ${typeClasses[toast.type]}`}
          onClick={() => removeToast(toast.id)}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
