import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { User, LoginCredentials, RegisterData } from '../types/auth';
import { loginApi, registerApi, getMeApi, logoutApi } from '../services/auth';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<User>;
  register: (data: RegisterData) => Promise<void>;
  updateUser: (user: User) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  
  
  const [token, setToken] = useState<string | null>(() => sessionStorage.getItem('secarena_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const currentUser = await getMeApi();
        setUser(currentUser);
      } catch (err) {
        console.error('Session restoration failed:', err);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  const login = async (credentials: LoginCredentials): Promise<User> => {
    const response = await loginApi(credentials);
    sessionStorage.setItem('secarena_token', response.access_token);
    setToken(response.access_token);
    setUser(response.user);
    return response.user;
  };

  const register = async (data: RegisterData) => {
    await registerApi(data);
  };

  const logout = async () => {
    try {
      if (token) {
        await logoutApi();
      }
    } catch (e) {
      console.error(e);
    } finally {
      sessionStorage.removeItem('secarena_token');
      setToken(null);
      setUser(null);
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        register,
        updateUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
