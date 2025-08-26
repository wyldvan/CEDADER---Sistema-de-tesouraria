import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User } from '../types';
import { Plus, X, User as UserIcon, Mail, Shield, Eye, EyeOff, AlertTriangle, CheckCircle } from 'lucide-react';

interface UserManagementFormProps {
  isOpen: boolean;
  onClose: () => void;
  editUser?: User | null;
}

export function UserManagementForm({ isOpen, onClose, editUser }: UserManagementFormProps) {
  const { createUser, updateUser } = useAuth();
  
  const [formData, setFormData] = useState({
    username: editUser?.username || '',
    password: editUser ? '' : '',
    confirmPassword: '',
    fullName: editUser?.fullName || '',
    email: editUser?.email || '',
    role: editUser?.role || 'client' as 'admin' | 'client',
    isActive: editUser?.isActive ?? true
  });
  
  const [showPasswords, setShowPasswords] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // Validation
    if (!formData.username.trim() || !formData.fullName.trim()) {
      setMessage({ type: 'error', text: 'Usuário e nome completo são obrigatórios' });
      return;
    }

    if (!editUser && !formData.password.trim()) {
      setMessage({ type: 'error', text: 'Senha é obrigatória para novos usuários' });
      return;
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'As senhas não coincidem' });
      return;
    }

    if (formData.password && formData.password.length < 6) {
      setMessage({ type: 'error', text: 'A senha deve ter pelo menos 6 caracteres' });
      return;
    }

    if (formData.email && !isValidEmail(formData.email)) {
      setMessage({ type: 'error', text: 'Email inválido' });
      return;
    }

    const userData = {
      username: formData.username.trim(),
      fullName: formData.fullName.trim(),
      email: formData.email.trim() || undefined,
      role: formData.role,
      isActive: formData.isActive,
      createdBy: 'admin'
    };

    let success = false;

    if (editUser) {
      // Update existing user
      const updates: any = { ...userData };
      if (formData.password) {
        updates.password = formData.password;
      }
      success = updateUser(editUser.id, updates);
    } else {
      // Create new user
      success = createUser({
        ...userData,
        password: formData.password
      });
    }

    if (success) {
      setMessage({ 
        type: 'success', 
        text: editUser ? 'Usuário atualizado com sucesso!' : 'Usuário criado com sucesso!' 
      });
      
      // Reset form after success
      setTimeout(() => {
        setFormData({
          username: '',
          password: '',
          confirmPassword: '',
          fullName: '',
          email: '',
          role: 'client',
          isActive: true
        });
        setMessage(null);
        onClose();
      }, 1500);
    } else {
      setMessage({ 
        type: 'error', 
        text: editUser ? 'Erro ao atualizar usuário' : 'Usuário já existe ou erro ao criar' 
      });
    }
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
              <UserIcon className="w-6 h-6 text-blue-600" />
              <span>{editUser ? 'Editar Usuário' : 'Criar Novo Usuário'}</span>
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome de Usuário *
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Digite o nome de usuário"
                  required
                />
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome Completo *
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nome completo do usuário"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="email@exemplo.com"
                />
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Acesso *
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'client' | 'usuario' })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="client">Diretoria (Apenas Visualização)</option>
                  <option value="usuario">Usuário (Visualizar + Criar)</option>
                  <option value="admin">Administrador (Acesso Completo)</option>
                </select>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {editUser ? 'Nova Senha (deixe em branco para manter)' : 'Senha *'}
              </label>
              <div className="relative">
                <input
                  type={showPasswords ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={editUser ? "Nova senha (opcional)" : "Digite a senha"}
                  required={!editUser}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(!showPasswords)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            {formData.password && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar Senha *
                </label>
                <input
                  type={showPasswords ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Confirme a senha"
                  required
                />
              </div>
            )}

            {/* Active Status */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                Usuário ativo
              </label>
            </div>

            {/* Role Description */}
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="text-sm font-medium text-blue-800 mb-2">
                {formData.role === 'client' ? 'Acesso Diretor:' : 
                 formData.role === 'usuario' ? 'Acesso Usuário:' : 'Acesso Administrador:'}
              </h4>
              <ul className="text-xs text-blue-700 space-y-1">
                {formData.role === 'client' ? (
                  <>
                    <li>• Visualizar painel de controle</li>
                    <li>• Consultar transações e relatórios</li>
                    <li>• Visualizar agenda e prebenda</li>
                    <li>• Gerar relatórios em PDF</li>
                    <li>• Sem permissão para criar/editar/excluir</li>
                  </>
                ) : formData.role === 'usuario' ? (
                  <>
                    <li>• Acesso completo para visualização</li>
                    <li>• Criar novas transações e registros</li>
                    <li>• Gerar relatórios em PDF</li>
                    <li>• Cadastrar pastores e obreiros</li>
                    <li>• SEM permissão para editar ou excluir</li>
                  </>
                ) : (
                  <>
                    <li>• Acesso completo ao sistema</li>
                    <li>• Criar, editar e excluir registros</li>
                    <li>• Gerenciar usuários</li>
                    <li>• Configurações do sistema</li>
                    <li>• Backup e restauração</li>
                  </>
                )}
              </ul>
            </div>

            {/* Message */}
            {message && (
              <div className={`p-3 rounded-lg border ${
                message.type === 'success' 
                  ? 'bg-green-50 border-green-200 text-green-800' 
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                <div className="flex items-center space-x-2">
                  {message.type === 'success' ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                  )}
                  <span className="text-sm font-medium">{message.text}</span>
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all flex items-center justify-center space-x-2 font-medium"
              >
                <Plus className="w-5 h-5" />
                <span>{editUser ? 'Atualizar' : 'Criar Usuário'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}