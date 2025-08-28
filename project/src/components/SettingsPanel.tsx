import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { DocumentRange, User } from '../types';
import { UserManagementForm } from './UserManagementForm';
import { DocumentRangeForm } from './DocumentRangeForm';
import { DocumentRangesList } from './DocumentRangesList';
import { Settings, Users, Shield, Key, FileText, Download, Upload, Database, AlertTriangle, User as UserIcon } from 'lucide-react';

export function SettingsPanel() {
  const { user, updateCredentials, getAllUsers, deleteUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'general' | 'users' | 'documents' | 'backup'>('general');
  const [showUserForm, setShowUserForm] = useState(false);
  const [showDocumentRangeForm, setShowDocumentRangeForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editingDocumentRange, setEditingDocumentRange] = useState<DocumentRange | null>(null);

  // Estado para usuários
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Credentials form
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [credentialsMessage, setCredentialsMessage] = useState('');

  // Carregar usuários quando o componente montar
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoadingUsers(true);
        const users = await getAllUsers();
        setAllUsers(users);
      } catch (error) {
        console.error('Erro ao carregar usuários:', error);
        setAllUsers([]);
      } finally {
        setLoadingUsers(false);
      }
    };

    loadUsers();
  }, [getAllUsers]);

  const handleUpdateCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setCredentialsMessage('');

    if (!newUsername || !newPassword) {
      setCredentialsMessage('Usuário e senha são obrigatórios');
      return;
    }

    if (newPassword !== confirmPassword) {
      setCredentialsMessage('As senhas não coincidem');
      return;
    }

    if (newPassword.length < 6) {
      setCredentialsMessage('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    try {
      const success = await updateCredentials(newUsername, newPassword);
      if (success) {
        setCredentialsMessage('Credenciais atualizadas com sucesso!');
        setNewUsername('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setCredentialsMessage('Erro ao atualizar credenciais');
      }
    } catch (error) {
      setCredentialsMessage('Erro ao atualizar credenciais');
    }
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setShowUserForm(true);
  };

  const handleAddDocumentRange = () => {
    setEditingDocumentRange(null);
    setShowDocumentRangeForm(true);
  };

  const handleEditDocumentRange = (range: DocumentRange) => {
    setEditingDocumentRange(range);
    setShowDocumentRangeForm(true);
  };

  const handleCloseUserForm = () => {
    setShowUserForm(false);
    setEditingUser(null);
    // Recarregar usuários após fechar o formulário
    loadUsers();
  };

  const handleCloseDocumentRangeForm = () => {
    setShowDocumentRangeForm(false);
    setEditingDocumentRange(null);
  };

  // Função para recarregar usuários
  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const users = await getAllUsers();
      setAllUsers(users);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      setAllUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleDeleteUser = async (userId: string, username: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o usuário "${username}"?`)) {
      try {
        await deleteUser(userId);
        // Recarregar a lista de usuários após exclusão
        await loadUsers();
      } catch (error) {
        console.error('Erro ao excluir usuário:', error);
        alert('Erro ao excluir usuário');
      }
    }
  };

  const exportData = () => {
    const data = {
      transactions: JSON.parse(localStorage.getItem('cedader_transactions') || '[]'),
      registrations: JSON.parse(localStorage.getItem('cedader_registrations') || '[]'),
      prebendas: JSON.parse(localStorage.getItem('cedader_prebendas') || '[]'),
      pastorRegistrations: JSON.parse(localStorage.getItem('cedader_pastor_registrations') || '[]'),
      users: JSON.parse(localStorage.getItem('cedader_users') || '[]'),
      documentRanges: JSON.parse(localStorage.getItem('cedader_document_ranges') || '[]'),
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cedader_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);

        if (window.confirm('Isso irá substituir todos os dados atuais. Tem certeza?')) {
          if (data.transactions) localStorage.setItem('cedader_transactions', JSON.stringify(data.transactions));
          if (data.registrations) localStorage.setItem('cedader_registrations', JSON.stringify(data.registrations));
          if (data.prebendas) localStorage.setItem('cedader_prebendas', JSON.stringify(data.prebendas));
          if (data.pastorRegistrations) localStorage.setItem('cedader_pastor_registrations', JSON.stringify(data.pastorRegistrations));
          if (data.users) localStorage.setItem('cedader_users', JSON.stringify(data.users));
          if (data.documentRanges) localStorage.setItem('cedader_document_ranges', JSON.stringify(data.documentRanges));

          alert('Dados importados com sucesso! A página será recarregada.');
          window.location.reload();
        }
      } catch (error) {
        alert('Erro ao importar dados. Verifique se o arquivo está correto.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
          <Settings className="w-7 h-7 text-gray-600" />
          <span>Configurações do Sistema</span>
        </h2>
        <p className="text-gray-600">Gerencie configurações, usuários e dados do sistema</p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('general')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${activeTab === 'general'
              ? 'text-gray-700 bg-gray-50 border-b-2 border-gray-500'
              : 'text-gray-600 hover:text-gray-700 hover:bg-gray-50'
              }`}
          >
            <Settings className="w-4 h-4" />
            <span>Geral</span>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${activeTab === 'users'
              ? 'text-blue-700 bg-blue-50 border-b-2 border-blue-500'
              : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
              }`}
          >
            <Users className="w-4 h-4" />
            <span>Usuários</span>
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              {allUsers.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${activeTab === 'documents'
              ? 'text-green-700 bg-green-50 border-b-2 border-green-500'
              : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
              }`}
          >
            <FileText className="w-4 h-4" />
            <span>Documentos</span>
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${activeTab === 'backup'
              ? 'text-purple-700 bg-purple-50 border-b-2 border-purple-500'
              : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
              }`}
          >
            <Database className="w-4 h-4" />
            <span>Backup</span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'general' && (
        <div className="space-y-6">
          {/* Update Credentials */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Key className="w-5 h-5 text-gray-600" />
              <span>Alterar Credenciais</span>
            </h3>

            <form onSubmit={handleUpdateCredentials} className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Novo Usuário
                </label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                  placeholder="Digite o novo usuário"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nova Senha
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                  placeholder="Digite a nova senha"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar Senha
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                  placeholder="Confirme a nova senha"
                />
              </div>

              {credentialsMessage && (
                <div className={`p-3 rounded-lg ${credentialsMessage.includes('sucesso')
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                  {credentialsMessage}
                </div>
              )}

              <button
                type="submit"
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Atualizar Credenciais
              </button>
            </form>
          </div>

          {/* System Info */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações do Sistema</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900">Usuário Atual</h4>
                <p className="text-gray-600">{user?.fullName || user?.username}</p>
                <p className="text-sm text-gray-500">
                  Tipo: {user?.role === 'admin' ? 'Administrador' : user?.role === 'usuario' ? 'Usuário' : user?.role === 'client' ? 'Cliente' : 'Diretor'}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900">Versão</h4>
                <p className="text-gray-600">CEDADER v1.0.0</p>
                <p className="text-sm text-gray-500">Convenção Estadual das Assembléia de Deus</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Add User Button */}
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Gerenciamento de Usuários</h3>
              <p className="text-gray-600">Crie e gerencie contas de usuário do sistema</p>
            </div>
            <button
              onClick={() => setShowUserForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Users className="w-4 h-4" />
              <span>Novo Usuário</span>
            </button>
          </div>

          {/* Users List */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuário
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nome Completo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loadingUsers ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                        Carregando usuários...
                      </td>
                    </tr>
                  ) : allUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                        Nenhum usuário encontrado
                      </td>
                    </tr>
                  ) : (
                    allUsers.map((user: User) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {user.username}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.fullName || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${user.role === 'admin'
                            ? 'bg-red-100 text-red-800'
                            : user.role === 'usuario'
                              ? 'bg-green-100 text-green-800'
                              : user.role === 'client'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                            {user.role === 'admin' ? (
                              <div className="flex items-center space-x-1">
                                <Shield className="w-3 h-3" />
                                <span>Admin</span>
                              </div>
                            ) : user.role === 'usuario' ? (
                              <div className="flex items-center space-x-1">
                                <UserIcon className="w-3 h-3" />
                                <span>Usuário</span>
                              </div>
                            ) : user.role === 'client' ? (
                              <div className="flex items-center space-x-1">
                                <UserIcon className="w-3 h-3" />
                                <span>Cliente</span>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-1">
                                <Users className="w-3 h-3" />
                                <span>Diretor</span>
                              </div>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${user.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                            }`}>
                            {user.isActive ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleEditUser(user)}
                              className="text-blue-600 hover:text-blue-900 transition-colors"
                            >
                              Editar
                            </button>
                            {user.id !== 'admin-default' && (
                              <button
                                onClick={() => handleDeleteUser(user.id, user.username)}
                                className="text-red-600 hover:text-red-900 transition-colors"
                              >
                                Excluir
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'documents' && (
        <DocumentRangesList
          onAddRange={handleAddDocumentRange}
          onEditRange={handleEditDocumentRange}
        />
      )}

      {activeTab === 'backup' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Database className="w-5 h-5 text-purple-600" />
              <span>Backup e Restauração</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Export */}
              <div className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2 flex items-center space-x-2">
                  <Download className="w-4 h-4 text-green-600" />
                  <span>Exportar Dados</span>
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  Baixe um backup completo de todos os dados do sistema.
                </p>
                <button
                  onClick={exportData}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Baixar Backup</span>
                </button>
              </div>

              {/* Import */}
              <div className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2 flex items-center space-x-2">
                  <Upload className="w-4 h-4 text-blue-600" />
                  <span>Importar Dados</span>
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  Restaure dados de um arquivo de backup anterior.
                </p>
                <label className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 cursor-pointer">
                  <Upload className="w-4 h-4" />
                  <span>Selecionar Arquivo</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={importData}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Warning */}
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800">Atenção</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    A importação de dados irá substituir completamente todos os dados atuais do sistema.
                    Certifique-se de fazer um backup antes de importar novos dados.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Forms */}
      <UserManagementForm
        isOpen={showUserForm}
        onClose={handleCloseUserForm}
        editUser={editingUser}
      />

      <DocumentRangeForm
        isOpen={showDocumentRangeForm}
        onClose={handleCloseDocumentRangeForm}
        editRange={editingDocumentRange}
      />
    </div>
  );
}