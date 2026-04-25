/**
 * ProtectedRoute — redirects to /login if not authenticated.
 * Shows nothing while auth state is still loading.
 */
import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) return null; // splash / spinner can go here later

  return user ? <>{children}</> : <Navigate to="/login" replace />;
}
