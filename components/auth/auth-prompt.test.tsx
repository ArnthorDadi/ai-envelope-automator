import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AuthPrompt } from './auth-prompt';

describe('AuthPrompt', () => {
  it('renders "Please login to play" message', () => {
    render(<AuthPrompt />);
    expect(screen.getByText('Please login to play')).toBeInTheDocument();
  });
});
