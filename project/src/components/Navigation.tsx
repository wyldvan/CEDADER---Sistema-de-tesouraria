import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, ArrowUpCircle, ArrowDownCircle, FileText, Users, DollarSign, Settings, Eye, User, Receipt } from 'lucide-react';

interface NavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export function Navigation({ currentView, onViewChange }: NavigationProps) {
  const { user, isDiretor, isUsuario } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Painel', icon: LayoutDashboard, clientAccess: true },
    { id: 'transactions', label: 'Transações', icon: FileText, clientAccess: true },
    { id: 'prebenda', label: 'Auxílio e Prebenda', icon: DollarSign, clientAccess: true },
    { id: 'registrations', label: 'Agenda completa', icon: Users, clientAccess: true },
    { id: 'reports', label: 'Relatórios', icon: null, clientAccess: true },
    { id: 'receipts', label: 'Recibos', icon: Receipt, clientAccess: true },
    { id: 'goals', label: 'Metas Financeiras', icon: null, clientAccess: true },
    { id: 'settings', label: 'Configurações', icon: Settings, clientAccess: false, adminOnly: true },
  ];

  // Filter navigation items based on user role
  const filteredNavItems = navItems.filter(item => 
    (!isDiretor() || item.clientAccess) && (!item.adminOnly || user?.role === 'admin')
  );

  return (
    <nav className="bg-white shadow-sm rounded-xl border border-emerald-100 mb-8">
      <div className="px-6 py-4">
        <div className="flex space-x-8 overflow-x-auto">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                  currentView === item.id
                    ? item.id === 'settings'
                      ? 'bg-gray-100 text-gray-700 font-medium'
                      : 'bg-emerald-100 text-emerald-700 font-medium'
                    : item.id === 'settings'
                      ? 'text-gray-600 hover:text-gray-700 hover:bg-gray-50'
                      : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'
                }`}
              >
                {Icon && <Icon className="w-5 h-5" />}
                <span>{item.label}</span>
                {isDiretor() && item.clientAccess && (
                  <Eye className="w-3 h-3 text-gray-400" />
                )}
                {isUsuario() && item.clientAccess && (
                  <User className="w-3 h-3 text-gray-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}