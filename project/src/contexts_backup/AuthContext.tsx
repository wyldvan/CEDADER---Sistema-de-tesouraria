import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isAdmin: () => boolean;
  isDiretor: () => boolean;
  isUsuario: () => boolean;
  canEdit: () => boolean;
  canDelete: () => boolean;
  updateCredentials: (newUsername: string, newPassword: string) => boolean;
  createUser: (userData: Omit<User, 'id' | 'createdAt'>) => boolean;
  updateUser: (id: string, updates: Partial<User>) => boolean;
  deleteUser: (id: string) => boolean;
  getAllUsers: () => User[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const defaultAdmin: User = {
  id: 'admin-default',
  username: 'CEDADER',
  password: '123456789',
  role: 'admin',
  fullName: 'Administrador CEDADER',
  email: 'admin@cedader.com',
  createdAt: new Date().toISOString(),
  isActive: true
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([defaultAdmin]);

  useEffect(() => {
    const savedUser = localStorage.getItem('cedader_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    // Load all users
    const savedUsers = localStorage.getItem('cedader_users');
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    } else {
      // Initialize with default admin
      localStorage.setItem('cedader_users', JSON.stringify([defaultAdmin]));
    }
  }, []);

  const saveUsers = (newUsers: User[]) => {
    setUsers(newUsers);
    localStorage.setItem('cedader_users', JSON.stringify(newUsers));
  };

  const login = (username: string, password: string): boolean => {
    const foundUser = users.find(u => 
      u.username === username && 
      u.password === password && 
      u.isActive
    );
    
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('cedader_user', JSON.stringify(foundUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('cedader_user');
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

  const updateCredentials = (newUsername: string, newPassword: string): boolean => {
    if (!newUsername || !newPassword || !user) return false;
    
    const updatedUsers = users.map(u => 
      u.id === user.id 
        ? { ...u, username: newUsername, password: newPassword }
        : u
    );
    
    const updatedUser = { ...user, username: newUsername, password: newPassword };
    
    saveUsers(updatedUsers);
    setUser(updatedUser);
    localStorage.setItem('cedader_user', JSON.stringify(updatedUser));
    
    return true;
  };

  const createUser = (userData: Omit<User, 'id' | 'createdAt'>): boolean => {
    // Check if username already exists
    if (users.some(u => u.username === userData.username)) {
      return false;
    }

    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };

    const updatedUsers = [...users, newUser];
    saveUsers(updatedUsers);
    return true;
  };

  const updateUser = (id: string, updates: Partial<User>): boolean => {
    const updatedUsers = users.map(u => 
      u.id === id ? { ...u, ...updates } : u
    );
    
    saveUsers(updatedUsers);
    
    // Update current user if it's the same
    if (user && user.id === id) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('cedader_user', JSON.stringify(updatedUser));
    }
    
    return true;
  };

  const deleteUser = (id: string): boolean => {
    // Don't allow deleting the default admin
    if (id === 'admin-default') return false;
    
    const updatedUsers = users.filter(u => u.id !== id);
    saveUsers(updatedUsers);
    
    // Logout if current user is being deleted
    if (user && user.id === id) {
      logout();
    }
    
    return true;
  };

  const getAllUsers = (): User[] => {
    return users;
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
      getAllUsers
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