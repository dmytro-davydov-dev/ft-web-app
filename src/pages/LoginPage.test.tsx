import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from './LoginPage';
import { useAuth } from '../context/AuthContext';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

jest.mock('../context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

const mockedUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('LoginPage', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
  });

  test('renders login form fields', () => {
    mockedUseAuth.mockReturnValue({
      user: null,
      customerId: null,
      loading: false,
      signIn: jest.fn(),
      signOut: jest.fn(),
    });

    render(<LoginPage />);

    expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
  });

  test('submits credentials and navigates on success', async () => {
    const signIn = jest.fn().mockResolvedValue({});
    mockedUseAuth.mockReturnValue({
      user: null,
      customerId: null,
      loading: false,
      signIn,
      signOut: jest.fn(),
    });

    render(<LoginPage />);

    await userEvent.type(screen.getByPlaceholderText('you@example.com'), 'dev@flowterra.io');
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'secret-pass');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(signIn).toHaveBeenCalledWith('dev@flowterra.io', 'secret-pass');
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  test('shows friendly error on auth failure', async () => {
    const signIn = jest.fn().mockRejectedValue({ code: 'auth/wrong-password' });
    mockedUseAuth.mockReturnValue({
      user: null,
      customerId: null,
      loading: false,
      signIn,
      signOut: jest.fn(),
    });

    render(<LoginPage />);

    await userEvent.type(screen.getByPlaceholderText('you@example.com'), 'dev@flowterra.io');
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'bad-pass');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByText('Invalid email or password.')).toBeInTheDocument();
  });
});
