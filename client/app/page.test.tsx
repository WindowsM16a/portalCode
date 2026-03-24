import { render, screen } from '@testing-library/react';
import Page from './page';
import { describe, it, expect } from 'vitest';

describe('Home Page', () => {
  it('renders a heading', () => {
    render(<Page />);
    const heading = screen.getByRole('heading');
    expect(heading).toBeInTheDocument();
  });
});
