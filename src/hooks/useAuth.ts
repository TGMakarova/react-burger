import { useState, useEffect } from 'react';

type UseAuthReturn = {
  isAuthenticated: boolean;
};

export const useAuth = (): UseAuthReturn => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  return { isAuthenticated };
};
