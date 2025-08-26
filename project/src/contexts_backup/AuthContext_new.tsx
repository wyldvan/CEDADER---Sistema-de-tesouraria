import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { apiService } from '../services/api';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: () => boolean;
  isDiretor: () => boolean;
  isUsuario: () => boolean;
  canEdit: () => boolean;
  canDelete: () => boolean;
  updateCredentials: (newUsername: string, newPassword: string) => Promise<boolean>;
  createUser: (userData: Omit<User, 'id' | 'createdAt'>) => Promise<boolean>;
  updateUser: (id: string, updates: Partial<User>) => Promise<boolean>;
  deleteUser: (id: string) => Promise<boolean>;
  getAllUsers: () => Promise<User[]>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('cedader_token');
      if (token) {
        try {
          const userData = await apiService.getCurrentUser();
          setUser(userData);
        } catch (error) {
          console.error('Failed to get current user:', error);
          apiService.removeToken();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await apiService.login(username, password);
      setUser(response.user);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    apiService.removeToken();
  };

  const isAdmin = (): boolean => {
    return user?.role === 'admin';
  };

  const isDiretor = (): boolean => {
    return user?.role === 'client';
  };

  const isUsuario = (): boolean => {
    return user?.role === 'usuario';
  };

  const canEdit = (): boolean => {
    return user?.role === 'admin';
  };

  const canDelete = (): boolean => {
    return user?.role === 'admin';
  };

  const updateCredentials = async (newUsername: string, newPassword: string): Promise<boolean> => {
    try {
      await apiService.updateCredentials(newUsername, newPassword);
      
      // Update local user data
      if (user) {
        setUser({ ...user, username: newUsername });
      }
      
      return true;
    } catch (error) {
      console.error('Failed to update credentials:', error);
      return false;
    }
  };

  const createUser = async (userData: Omit<User, 'id' | 'createdAt'>): Promise<boolean> => {
    try {
      await apiService.createUser(userData);
      return true;
    } catch (error) {
      console.error('Failed to create user:', error);
      return false;
    }
  };

  const updateUser = async (id: string, updates: Partial<User>): Promise<boolean> => {
    try {
      const updatedUser = await apiService.updateUser(id, updates);
      
      // Update current user if it's the same
      if (user && user.id === id) {
        setUser(updatedUser);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to update user:', error);
      return false;
    }
  };

  const deleteUser = async (id: string): Promise<boolean> => {
    try {
      await apiService.deleteUser(id);
      
      // Logout if current user is being deleted
      if (user && user.id === id) {
        logout();
      }
      
      return true;
    } catch (error) {
      console.error('Failed to delete user:', error);
      return false;
    }
  };

  const getAllUsers = async (): Promise<User[]> => {
    try {
      return await apiService.getUsers();
    } catch (error) {
      console.error('Failed to get users:', error);
      return [];
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isAdmin, 
      isDiretor,
      isUsuario,
      canEdit,
      canDelete,
      updateCredentials,
      createUser,
      updateUser,
      deleteUser,
      getAllUsers,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

