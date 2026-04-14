import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;  // 👈 Используйте React.ReactNode
}

const ProtectedRoute = ({ children }: ProtectedRouteProps): React.ReactElement => {
  const location = useLocation();
  const accessToken = localStorage.getItem('accessToken');
  
  if (!accessToken) {
    // Сохраняем путь, куда хотел попасть пользователь
    return <Navigate to="/login-page" state={{ from: location }} replace />;
  }
  
  return <>{children}</>;  // 👈 Оборачиваем children во фрагмент
};

export default ProtectedRoute;
