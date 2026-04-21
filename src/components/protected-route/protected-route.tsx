import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { ReactNode } from 'react';
import type { RootState } from '../../services/store';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const { isLoggedIn, isAuthChecked } = useSelector((state: RootState) => state.auth);

  if (!isAuthChecked) {
    return null;
  }

  if (!isLoggedIn) {
    // Сохраняем путь, куда хотел попасть пользователь
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
