import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { ToastProvider, useToast } from '@/contexts/ToastContext';
import { useState } from 'react';

function TestComponent() {
  const { addToast, toasts } = useToast();
  const [lastToast, setLastToast] = useState('');

  return (
    <div>
      <button onClick={() => addToast('Test message')}>Add Toast</button>
      <button onClick={() => setLastToast(toasts[0]?.message || '')}>Get Last</button>
      <p data-testid="toast-count">{toasts.length}</p>
      <p data-testid="last-toast">{lastToast}</p>
    </div>
  );
}

describe('ToastContext', () => {
  it('adds a toast', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    const button = screen.getByText('Add Toast');
    await act(async () => {
      button.click();
    });

    expect(screen.getByTestId('toast-count').textContent).toBe('1');
  });

  it('auto-removes toast after 3 seconds', async () => {
    vi.useFakeTimers();
    
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    const button = screen.getByText('Add Toast');
    await act(async () => {
      button.click();
    });

    expect(screen.getByTestId('toast-count').textContent).toBe('1');

    await act(async () => {
      vi.advanceTimersByTime(3000);
    });

    expect(screen.getByTestId('toast-count').textContent).toBe('0');
    
    vi.useRealTimers();
  });
});
