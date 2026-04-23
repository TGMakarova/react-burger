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

  console.log('🛡️ [ProtectedRoute]', {
    isAuthChecked,
    isLoggedIn,
    pathname: location.pathname,
    returnTo: localStorage.getItem('returnTo')
  });

  if (!isAuthChecked) {
    console.log('🛡️ [ProtectedRoute] Ожидание проверки...');
    return null;
  }

  if (!isLoggedIn) {
    console.log('🛡️ [ProtectedRoute] Сохраняем returnTo:', location.pathname);
    localStorage.setItem('returnTo', location.pathname);
    console.log('🛡️ [ProtectedRoute] Редирект на /login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.log('🛡️ [ProtectedRoute] Показываем страницу');
  return <>{children}</>;
}