import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Logo } from './logo';

describe('Logo', () => {
  it('renders "Secret Hitler" title', () => {
    render(<Logo />);
    expect(screen.getByText('Secret Hitler')).toBeInTheDocument();
  });
});
