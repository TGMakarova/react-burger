import { Navigate, useLocation } from 'react-router-dom';

import { useSelector } from '../../hooks/customHooks';

import type { ReactNode } from 'react';

type ProtectedRouteProps = {
  children: ReactNode;
};

export default function ProtectedRoute({
  children,
}: ProtectedRouteProps): React.JSX.Element | null {
  const location = useLocation();
  const { isLoggedIn, isAuthChecked } = useSelector((state) => state.auth);

  if (!isAuthChecked) {
    return null;
  }

  if (!isLoggedIn) {
    localStorage.setItem('returnTo', location.pathname);
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
