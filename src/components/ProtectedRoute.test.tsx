import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { useAuth } from '../context/AuthContext';

jest.mock('../context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

const mockedUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('ProtectedRoute', () => {
  test('renders nothing while auth is loading', () => {
    mockedUseAuth.mockReturnValue({
      user: null,
      customerId: null,
      loading: true,
      signIn: jest.fn(),
      signOut: jest.fn(),
    });

    const { container } = render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <ProtectedRoute>
          <div>Secret</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(container.firstChild).toBeNull();
  });

  test('redirects unauthenticated users to /login', () => {
    mockedUseAuth.mockReturnValue({
      user: null,
      customerId: null,
      loading: false,
      signIn: jest.fn(),
      signOut: jest.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div>Secret</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login View</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Login View')).toBeInTheDocument();
  });

  test('renders children for authenticated users', () => {
    mockedUseAuth.mockReturnValue({
      user: { uid: 'user-1' } as never,
      customerId: 'cust-1',
      loading: false,
      signIn: jest.fn(),
      signOut: jest.fn(),
    });

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Secret</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('Secret')).toBeInTheDocument();
  });
});
