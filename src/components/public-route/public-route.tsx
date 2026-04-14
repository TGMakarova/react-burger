import { Navigate } from 'react-router-dom';

interface PublicRouteProps {
  children: React.ReactNode;  // 👈 Используйте React.ReactNode вместо JSX.Element
}

const PublicRoute = ({ children }: PublicRouteProps): React.ReactElement => {
  const accessToken = localStorage.getItem('accessToken');
  
  // Если пользователь авторизован и пытается зайти на страницу логина/регистрации
  // перенаправляем его на профиль
  if (accessToken) {
    return <Navigate to="/profile" replace />;
  }
  
  return <>{children}</>;  // 👈 Оборачиваем children во фрагмент
};

export default PublicRoute;