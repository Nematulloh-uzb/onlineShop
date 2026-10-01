import { fireEvent, render, screen } from '@testing-library/react';
import PasswordInput from './PasswordInput.jsx';

describe('PasswordInput', () => {
  it('shows the password when requested and hides it again', () => {
    render(<PasswordInput aria-label="Parol" value="secret123" readOnly />);
    const input = screen.getByLabelText('Parol');

    expect(input).toHaveAttribute('type', 'password');

    fireEvent.click(screen.getByRole('button', { name: 'Parolni ko‘rsatish' }));
    expect(input).toHaveAttribute('type', 'text');
    expect(screen.getByRole('button', { name: 'Parolni yashirish' })).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(screen.getByRole('button', { name: 'Parolni yashirish' }));
    expect(input).toHaveAttribute('type', 'password');
  });
});
