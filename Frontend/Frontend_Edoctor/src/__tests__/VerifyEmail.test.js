import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import VerifyEmail from '../components/VerifyEmail'; // Adjust the path according to your project structure
import { BrowserRouter as Router, MemoryRouter } from 'react-router-dom';
import axios from '../services/api';

// Mock axios POST request
jest.mock('../services/api', () => ({
  post: jest.fn(),
}));

describe('VerifyEmail Component', () => {
  test('should render the verify email form correctly', () => {
    render(
      <MemoryRouter initialEntries={['/verify-email']}>
        <VerifyEmail />
      </MemoryRouter>
    );

    expect(screen.getByText('Verify Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Verification Code')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Verify/i })).toBeInTheDocument();
  });

  test('should show alert when verification code is successfully submitted', async () => {
    axios.post.mockResolvedValueOnce({ data: { message: 'Success' } });

    render(
      <MemoryRouter initialEntries={['/verify-email']}>
        <VerifyEmail />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Verification Code'), {
      target: { value: '12345' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Verify/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/auth/verify-email?code=12345&username=');
      expect(screen.getByText('Email verified successfully! Redirecting to Login...')).toBeInTheDocument();
    });
  });

  test('should show an error message when verification fails', async () => {
    axios.post.mockRejectedValueOnce({
      response: { status: 400, data: 'Invalid verification code.' },
    });

    render(
      <MemoryRouter initialEntries={['/verify-email']}>
        <VerifyEmail />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Verification Code'), {
      target: { value: 'wrongcode' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Verify/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid verification code.')).toBeInTheDocument();
    });
  });

  test('should show a generic error message when an unexpected error occurs', async () => {
    axios.post.mockRejectedValueOnce({
      response: { status: 500, data: 'Internal server error.' },
    });

    render(
      <MemoryRouter initialEntries={['/verify-email']}>
        <VerifyEmail />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Verification Code'), {
      target: { value: '12345' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Verify/i }));

    await waitFor(() => {
      expect(screen.getByText('An unexpected error occurred during verification.')).toBeInTheDocument();
    });
  });

  test('should handle empty verification code input', async () => {
    render(
      <MemoryRouter initialEntries={['/verify-email']}>
        <VerifyEmail />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /Verify/i }));

    // Check that the verification code field is still required (no actual request will be sent)
    expect(screen.getByPlaceholderText('Verification Code')).toBeInTheDocument();
  });
});
