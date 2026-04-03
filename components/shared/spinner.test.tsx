import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Spinner } from '@/components/shared';

describe('Spinner', () => {
  it('renders with default sm size', () => {
    const { container } = render(<Spinner />);
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('renders with sm size', () => {
    const { container } = render(<Spinner size="sm" />);
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('renders with md size', () => {
    const { container } = render(<Spinner size="md" />);
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });
});
