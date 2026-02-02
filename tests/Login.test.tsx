import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from '../pages/Login';

// Mock the auth service
vi.mock('../services/auth', () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
    isAuthenticated: vi.fn(() => false),
    getUser: vi.fn(() => null)
  }
}));

describe('Login Component', () => {
  const mockOnLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form by default', () => {
    render(<Login onLogin={mockOnLogin} />);

    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });

  it('switches to register form when clicking create account link', () => {
    render(<Login onLogin={mockOnLogin} />);

    fireEvent.click(screen.getByText("Don't have an account? Create one"));

    expect(screen.getByText('Create Account')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('John Doe')).toBeInTheDocument();
  });

  it('shows error message on failed login', async () => {
    const { authService } = await import('../services/auth');
    vi.mocked(authService.login).mockRejectedValue(new Error('Invalid credentials'));

    render(<Login onLogin={mockOnLogin} />);

    fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
      target: { value: 'test@test.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'wrongpass' }
    });
    fireEvent.click(screen.getByText('Sign In'));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it('displays author credit', () => {
    render(<Login onLogin={mockOnLogin} />);
    expect(screen.getByText('Designed by AlxanderArt')).toBeInTheDocument();
  });
});
