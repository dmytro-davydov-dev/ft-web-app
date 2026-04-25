import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import AppShell from './AppShell';
import { useAuth } from '../context/AuthContext';

jest.mock('../context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

const mockedUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('AppShell', () => {
  test('renders nav and child outlet content', () => {
    mockedUseAuth.mockReturnValue({
      user: { displayName: 'Jane Doe', email: 'jane@flowterra.io' } as never,
      customerId: 'cust-1',
      loading: false,
      signIn: jest.fn(),
      signOut: jest.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/dashboard" element={<AppShell />}>
            <Route index element={<div>Nested dashboard page</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Flowterra')).toBeInTheDocument();
    expect(screen.getAllByText('Live')).toHaveLength(2);
    expect(screen.getByText('Assets')).toBeInTheDocument();
    expect(screen.getByText('Analyze')).toBeInTheDocument();
    expect(screen.getByText('Nested dashboard page')).toBeInTheDocument();
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  test('signs user out from sidebar action', async () => {
    const signOut = jest.fn().mockResolvedValue(undefined);

    mockedUseAuth.mockReturnValue({
      user: { displayName: 'Jane Doe', email: 'jane@flowterra.io' } as never,
      customerId: 'cust-1',
      loading: false,
      signIn: jest.fn(),
      signOut,
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/dashboard" element={<AppShell />}>
            <Route index element={<div>Nested dashboard page</div>} />
          </Route>
          <Route path="/login" element={<div>Login View</div>} />
        </Routes>
      </MemoryRouter>
    );

    await userEvent.click(screen.getByRole('button', { name: 'Sign out' }));

    expect(signOut).toHaveBeenCalledTimes(1);
    expect(await screen.findByText('Login View')).toBeInTheDocument();
  });
});
