import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Lock, LogIn, AlertTriangle } from 'lucide-react';

export function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      if (login(username, password)) {
        setUsername('');
        setPassword('');
      } else {
        setError('Usuário ou senha incorretos');
      }
    } catch (err) {
      setError('Erro ao fazer login. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">C</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">CEDADER</h1>
          <p className="text-emerald-600">Sistema de Tesouraria</p>
          <p className="text-sm text-gray-500 mt-2">Faça login para acessar o sistema</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Usuário
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                placeholder="Digite seu usuário"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                placeholder="Digite sua senha"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-700 font-medium">{error}</span>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 font-medium ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700'
            } text-white`}
          >
            <LogIn className="w-5 h-5" />
            <span>{isLoading ? 'Entrando...' : 'Entrar'}</span>
          </button>
        </form>

        <div className="mt-8 p-4 bg-emerald-50 rounded-lg text-sm text-emerald-800">
          <p className="font-medium mb-1">Credenciais do Administrador:</p>
          <p>Usuário: <span className="font-mono">CEDADER</span></p>
          <p>Senha: <span className="font-mono">123456789</span></p>
          <p className="text-xs text-emerald-600 mt-2">
            O administrador pode criar usuários e gerenciar permissões
          </p>
        </div>
      </div>
    </div>
  );
}