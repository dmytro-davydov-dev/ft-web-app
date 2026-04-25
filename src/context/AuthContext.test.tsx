import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from './AuthContext';
import { auth } from '../firebase/config';

const mockOnIdTokenChanged = jest.fn();
const mockSignInWithEmailAndPassword = jest.fn();
const mockFirebaseSignOut = jest.fn();

jest.mock('../firebase/config', () => ({
  auth: { mocked: true },
}));

jest.mock('firebase/auth', () => ({
  onIdTokenChanged: (...args: unknown[]) => mockOnIdTokenChanged(...args),
  signInWithEmailAndPassword: (...args: unknown[]) => mockSignInWithEmailAndPassword(...args),
  signOut: (...args: unknown[]) => mockFirebaseSignOut(...args),
}));

function AuthConsumer() {
  const { loading, user, customerId, signIn, signOut } = useAuth();

  return (
    <div>
      <p data-testid="loading">{String(loading)}</p>
      <p data-testid="email">{user?.email ?? 'none'}</p>
      <p data-testid="customer-id">{customerId ?? 'none'}</p>
      <button onClick={() => signIn('dev@flowterra.io', 'test-pass')}>call signIn</button>
      <button onClick={() => signOut()}>call signOut</button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('throws when useAuth is called outside provider', () => {
    expect(() => render(<AuthConsumer />)).toThrow('useAuth must be used inside <AuthProvider>');
  });

  test('hydrates user state from onAuthStateChanged callback', async () => {
    let listener: ((firebaseUser: any) => Promise<void> | void) | undefined;
    const unsubscribe = jest.fn();

    mockOnIdTokenChanged.mockImplementation((_auth: unknown, callback: typeof listener) => {
      listener = callback;
      return unsubscribe;
    });

    const firebaseUser = {
      email: 'dev@flowterra.io',
      getIdTokenResult: jest.fn().mockResolvedValue({ claims: { customerId: 'customer-42' } }),
    };

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId('loading')).toHaveTextContent('true');

    await act(async () => {
      await listener?.(firebaseUser);
    });

    expect(screen.getByTestId('loading')).toHaveTextContent('false');
    expect(screen.getByTestId('email')).toHaveTextContent('dev@flowterra.io');
    expect(screen.getByTestId('customer-id')).toHaveTextContent('customer-42');
  });

  test('exposes signIn and signOut wrappers', async () => {
    mockOnIdTokenChanged.mockImplementation((_auth: unknown, callback: (user: null) => void) => {
      callback(null);
      return jest.fn();
    });

    mockSignInWithEmailAndPassword.mockResolvedValue({ user: { uid: 'u1' } });
    mockFirebaseSignOut.mockResolvedValue(undefined);

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    await userEvent.click(screen.getByRole('button', { name: 'call signIn' }));
    await userEvent.click(screen.getByRole('button', { name: 'call signOut' }));

    expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(auth, 'dev@flowterra.io', 'test-pass');
    expect(mockFirebaseSignOut).toHaveBeenCalledWith(auth);
  });

  test('cleans up auth listener on unmount', () => {
    const unsubscribe = jest.fn();
    mockOnIdTokenChanged.mockImplementation(() => unsubscribe);

    const { unmount } = render(
      <AuthProvider>
        <div>auth ready</div>
      </AuthProvider>
    );

    unmount();

    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });
});
