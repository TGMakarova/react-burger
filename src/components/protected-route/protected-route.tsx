import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

import type { RootState } from '../../services/store';
import type { ReactNode } from 'react';

type ProtectedRouteProps = {
  children: ReactNode;
};

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const { isLoggedIn, isAuthChecked } = useSelector((state: RootState) => state.auth);

  if (!isAuthChecked) {
    return null;
  }

  if (!isLoggedIn) {
    localStorage.setItem('returnTo', location.pathname);
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
