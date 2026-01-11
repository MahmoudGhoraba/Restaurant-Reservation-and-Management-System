import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('renders children and responds to click', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    expect(screen.getByText('Click me')).toBeInTheDocument();

    await user.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalled();
  });

  it('shows loading state', () => {
    render(<Button isLoading>Save</Button>);
    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
  });
});
