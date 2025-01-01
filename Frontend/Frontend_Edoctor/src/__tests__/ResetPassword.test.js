import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ResetPassword from '../components/ResetPassword'; // Adjust the path according to your project structure
import { MemoryRouter } from 'react-router-dom';
import axios from '../services/api';

// Mock axios POST request
jest.mock('../services/api', () => ({
  post: jest.fn(),
}));

describe('ResetPassword Component', () => {
  test('should render the reset password form correctly', () => {
    render(
      <MemoryRouter initialEntries={['/reset-password']}>
        <ResetPassword />
      </MemoryRouter>
    );

    expect(screen.getByText('Reset Password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter OTP')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter new password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Confirm new password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reset Password/i })).toBeInTheDocument();
  });

  test('should show error message for empty OTP or password fields', async () => {
    render(
      <MemoryRouter initialEntries={['/reset-password']}>
        <ResetPassword />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /Reset Password/i }));

    await waitFor(() => {
      expect(screen.getByText('OTP is required.')).toBeInTheDocument();
      expect(screen.getByText('Password is required.')).toBeInTheDocument();
      expect(screen.getByText('Passwords do not match.')).toBeInTheDocument();
    });
  });

  test('should show error message for mismatched passwords', async () => {
    render(
      <MemoryRouter initialEntries={['/reset-password']}>
        <ResetPassword />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Enter OTP'), {
      target: { value: '12345' },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter new password'), {
      target: { value: 'NewPassword@123' },
    });
    fireEvent.change(screen.getByPlaceholderText('Confirm new password'), {
      target: { value: 'NewPassword@124' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Reset Password/i }));

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match.')).toBeInTheDocument();
    });
  });

  test('should show success message and redirect on successful password reset', async () => {
    axios.post.mockResolvedValueOnce({ data: { message: 'Success' } });

    render(
      <MemoryRouter initialEntries={['/reset-password']}>
        <ResetPassword />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Enter OTP'), {
      target: { value: '12345' },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter new password'), {
      target: { value: 'NewPassword@123' },
    });
    fireEvent.change(screen.getByPlaceholderText('Confirm new password'), {
      target: { value: 'NewPassword@123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Reset Password/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        '/auth/reset-password/confirm',
        null,
        { params: { email: '', token: '12345', newPassword: 'NewPassword@123' } }
      );
      expect(screen.getByText('Password reset successfully! Redirecting to login...')).toBeInTheDocument();
    });
  });

  test('should show error message on password reset failure', async () => {
    axios.post.mockRejectedValueOnce({
      response: { data: { error: 'Reset password failed' } },
    });

    render(
      <MemoryRouter initialEntries={['/reset-password']}>
        <ResetPassword />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Enter OTP'), {
      target: { value: '12345' },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter new password'), {
      target: { value: 'NewPassword@123' },
    });
    fireEvent.change(screen.getByPlaceholderText('Confirm new password'), {
      target: { value: 'NewPassword@123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Reset Password/i }));

    await waitFor(() => {
      expect(screen.getByText('Reset password failed')).toBeInTheDocument();
    });
  });

  test('should show a message when form is invalid', async () => {
    render(
      <MemoryRouter initialEntries={['/reset-password']}>
        <ResetPassword />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Enter OTP'), {
      target: { value: '12345' },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter new password'), {
      target: { value: 'NewPassword@123' },
    });
    fireEvent.change(screen.getByPlaceholderText('Confirm new password'), {
      target: { value: 'NewPassword@124' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Reset Password/i }));

    await waitFor(() => {
      expect(screen.getByText('Please fix the errors above.')).toBeInTheDocument();
    });
  });
});
