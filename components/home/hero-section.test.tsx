import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HeroSection } from './hero-section';

describe('HeroSection', () => {
  it('renders Digital Roles text', () => {
    render(<HeroSection />);
    expect(screen.getByText('Digital Roles')).toBeInTheDocument();
  });
});
