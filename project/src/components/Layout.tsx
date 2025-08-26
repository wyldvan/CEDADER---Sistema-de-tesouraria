import React, { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, Eye, Shield } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, logout, isDiretor, isUsuario } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100">
      <header className="bg-white shadow-sm border-b border-emerald-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">CEDADER</h1>
                <p className="text-sm text-emerald-600">Sistema de Tesouraria</p>
              </div>
            </div>
            
            {user && (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-gray-700">
                  <User className="w-4 h-4" />
                  <span>{user.fullName || user.username}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${
                    user.role === 'admin' 
                      ? 'bg-red-100 text-red-800' 
                      : user.role === 'usuario'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                  }`}>
                    {user.role === 'admin' ? (
                      <>
                        <Shield className="w-3 h-3" />
                        <span>Administrador</span>
                      </>
                    ) : user.role === 'usuario' ? (
                      <>
                        <User className="w-3 h-3" />
                        <span>Usuário</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3 h-3" />
                        <span>Diretor</span>
                      </>
                    )}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-700 hover:bg-emerald-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sair</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}