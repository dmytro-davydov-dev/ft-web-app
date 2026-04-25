import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('./context/AuthContext', () => ({
  AuthProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

jest.mock('./components/ProtectedRoute', () => ({
  __esModule: true,
  default: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

jest.mock('./components/AppShell', () => {
  const { Outlet } = jest.requireActual('react-router-dom');
  return {
    __esModule: true,
    default: () => (
      <div>
        <span>App Shell</span>
        <Outlet />
      </div>
    ),
  };
});

jest.mock('./pages/LoginPage', () => ({
  __esModule: true,
  default: () => <div>Login Page</div>,
}));

jest.mock('./pages/DashboardPage', () => ({
  __esModule: true,
  default: () => <div>Dashboard Page</div>,
}));

jest.mock('./pages/SitePage', () => ({
  __esModule: true,
  default: () => <div>Site Page</div>,
}));

describe('App router', () => {
  test('renders the login route', () => {
    window.history.pushState({}, '', '/login');

    render(<App />);

    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  test('redirects unknown routes to /login', () => {
    window.history.pushState({}, '', '/unknown-route');

    render(<App />);

    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });
});
