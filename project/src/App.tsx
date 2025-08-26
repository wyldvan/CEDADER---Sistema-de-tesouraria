import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { LoginForm } from './components/LoginForm';
import { Dashboard } from './components/Dashboard';
import { TransactionsList } from './components/TransactionsList';
import { TransactionForm } from './components/TransactionForm';
import { RegistrationForm } from './components/RegistrationForm';
import { PastorRegistrationForm } from './components/PastorRegistrationForm';
import { PastorRegistrationsList } from './components/PastorRegistrationsList';
import { PrebendaDashboard } from './components/PrebendaDashboard';
import { PrebendaForm } from './components/PrebendaForm';
import { Reports } from './components/Reports';
import { SettingsPanel } from './components/SettingsPanel';
import { Navigation } from './components/Navigation';
import { ObreiroRegistrationForm } from './components/ObreiroRegistrationForm';
import { ReceiptsPanel } from './components/ReceiptsPanel';
import { FinancialGoalsDashboard } from './components/FinancialGoalsDashboard';
import { Plus, ArrowUpCircle, ArrowDownCircle, Users, DollarSign, FileText, Settings, Eye, Receipt } from 'lucide-react';

function AppContent() {
  const { user, isDiretor } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [transactionType, setTransactionType] = useState<'entry' | 'exit'>('entry');
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [showPastorRegistrationForm, setShowPastorRegistrationForm] = useState(false);
  const [showPrebendaForm, setShowPrebendaForm] = useState(false);
  const [prebendaType, setPrebendaType] = useState<'entry' | 'exit'>('entry');
  const [showObreiroForm, setShowObreiroForm] = useState(false);

  if (!user) {
    return <LoginForm />;
  }

  const handleNewTransaction = (type: 'entry' | 'exit') => {
    if (isDiretor()) return; // Diretors can't create transactions
    setTransactionType(type);
    setShowTransactionForm(true);
  };

  const handleNewPrebenda = (type: 'entry' | 'exit') => {
    if (isDiretor()) return; // Diretors can't create prebenda
    setPrebendaType(type);
    setShowPrebendaForm(true);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onViewChange={setCurrentView} />;
      case 'transactions':
        return <TransactionsList />;
      case 'prebenda':
        return <PrebendaDashboard />;
      case 'registrations':
        return <PastorRegistrationsList />;
      case 'reports':
        return <Reports />;
      case 'goals':
        return <FinancialGoalsDashboard />;
      case 'receipts':
        return <ReceiptsPanel />;
      case 'settings':
        return <SettingsPanel />;
      default:
        return <Dashboard onViewChange={setCurrentView} />;
    }
  };

  return (
    <Layout>
      <Navigation currentView={currentView} onViewChange={setCurrentView} />
      
      {/* Quick Actions - Only show for non-clients or show view-only versions */}
      {currentView === 'dashboard' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {!isDiretor() ? (
            <>
              <button
                onClick={() => handleNewTransaction('entry')}
                className="p-6 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all flex items-center space-x-4 group"
              >
                <ArrowUpCircle className="w-8 h-8 group-hover:scale-110 transition-transform" />
                <div className="text-left">
                  <h3 className="font-semibold text-lg">Nova Entrada</h3>
                  <p className="text-emerald-100">Registrar recebimento</p>
                </div>
              </button>

              <button
                onClick={() => handleNewTransaction('exit')}
                className="p-6 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all flex items-center space-x-4 group"
              >
                <ArrowDownCircle className="w-8 h-8 group-hover:scale-110 transition-transform" />
                <div className="text-left">
                  <h3 className="font-semibold text-lg">Nova Saída</h3>
                  <p className="text-red-100">Registrar pagamento</p>
                </div>
              </button>

              <button
                onClick={() => handleNewPrebenda('entry')}
                className="p-6 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all flex items-center space-x-4 group"
              >
                <DollarSign className="w-8 h-8 group-hover:scale-110 transition-transform" />
                <div className="text-left">
                  <h3 className="font-semibold text-lg">Prebenda</h3>
                  <p className="text-purple-100">Auxílio pastoral</p>
                </div>
              </button>

              <button
                onClick={() => setCurrentView('receipts')}
                className="p-6 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl hover:from-indigo-600 hover:to-indigo-700 transition-all flex items-center space-x-4 group"
              >
                <Receipt className="w-8 h-8 group-hover:scale-110 transition-transform" />
                <div className="text-left">
                  <h3 className="font-semibold text-lg">Recibos</h3>
                  <p className="text-indigo-100">Visualize e gere recibos das entradas</p>
                </div>
              </button>

            </>
          ) : (
            <>
              <div className="p-6 bg-gradient-to-r from-emerald-400 to-green-500 text-white rounded-xl flex items-center space-x-4 opacity-75">
                <Eye className="w-8 h-8" />
                <div className="text-left">
                  <h3 className="font-semibold text-lg">Visualizar Entradas</h3>
                  <p className="text-emerald-100">Consultar recebimentos</p>
                </div>
              </div>

              <div className="p-6 bg-gradient-to-r from-red-400 to-red-500 text-white rounded-xl flex items-center space-x-4 opacity-75">
                <Eye className="w-8 h-8" />
                <div className="text-left">
                  <h3 className="font-semibold text-lg">Visualizar Saídas</h3>
                  <p className="text-red-100">Consultar pagamentos</p>
                </div>
              </div>

              <div className="p-6 bg-gradient-to-r from-purple-400 to-purple-500 text-white rounded-xl flex items-center space-x-4 opacity-75">
                <Eye className="w-8 h-8" />
                <div className="text-left">
                  <h3 className="font-semibold text-lg">Visualizar Prebenda</h3>
                  <p className="text-purple-100">Consultar auxílio pastoral</p>
                </div>
              </div>

              <div className="p-6 bg-gradient-to-r from-indigo-400 to-indigo-500 text-white rounded-xl flex items-center space-x-4 opacity-75">
                <Eye className="w-8 h-8" />
                <div className="text-left">
                  <h3 className="font-semibold text-lg">Visualizar Recibos</h3>
                  <p className="text-indigo-100">Consultar recibos das entradas</p>
                </div>
              </div>

            </>
          )}
        </div>
      )}

      {/* Prebenda Quick Actions */}
      {currentView === 'prebenda' && !isDiretor() && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => handleNewPrebenda('entry')}
            className="p-6 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all flex items-center space-x-4 group"
          >
            <ArrowUpCircle className="w-8 h-8 group-hover:scale-110 transition-transform" />
            <div className="text-left">
              <h3 className="font-semibold text-lg">Entrada Auxílio</h3>
              <p className="text-emerald-100">Registrar recebimento</p>
            </div>
          </button>

          <button
            onClick={() => handleNewPrebenda('exit')}
            className="p-6 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all flex items-center space-x-4 group"
          >
            <ArrowDownCircle className="w-8 h-8 group-hover:scale-110 transition-transform" />
            <div className="text-left">
              <h3 className="font-semibold text-lg">Saída Prebenda</h3>
              <p className="text-red-100">Registrar pagamento</p>
            </div>
          </button>
        </div>
      )}

      {/* Registration Quick Actions - Only for admins */}
      {currentView === 'registrations' && !isDiretor() && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => setShowPastorRegistrationForm(true)}
            className="p-6 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all flex items-center space-x-4 group"
          >
            <Users className="w-8 h-8 group-hover:scale-110 transition-transform" />
            <div className="text-left">
              <h3 className="font-semibold text-lg">Cadastrar Pastor</h3>
              <p className="text-emerald-100">Registro completo do pastor e família</p>
            </div>
          </button>

          <button
            onClick={() => setShowRegistrationForm(true)}
            className="p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all flex items-center space-x-4 group"
          >
            <FileText className="w-8 h-8 group-hover:scale-110 transition-transform" />
            <div className="text-left">
              <h3 className="font-semibold text-lg">Agenda Financeira</h3>
              <p className="text-blue-100">Registrar valores por campo e categoria</p>
            </div>
          </button>
        </div>
      )}

      {/* Settings Quick Actions - Only for admins */}
      {currentView === 'settings' && !isDiretor() && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="p-6 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl flex items-center space-x-4">
            <Settings className="w-8 h-8" />
            <div className="text-left">
              <h3 className="font-semibold text-lg">Configurações</h3>
              <p className="text-gray-100">Gerenciamento administrativo</p>
            </div>
          </div>
        </div>
      )}

      {renderContent()}

      {/* Forms - Only show for admins */}
      {!isDiretor() && (
        <>
          <TransactionForm
            isOpen={showTransactionForm}
            onClose={() => setShowTransactionForm(false)}
            type={transactionType}
          />

          <PrebendaForm
            isOpen={showPrebendaForm}
            onClose={() => setShowPrebendaForm(false)}
            type={prebendaType}
          />

          <PastorRegistrationForm
            isOpen={showPastorRegistrationForm}
            onClose={() => setShowPastorRegistrationForm(false)}
          />

          <RegistrationForm
            isOpen={showRegistrationForm}
            onClose={() => setShowRegistrationForm(false)}
          />

          <ObreiroRegistrationForm
            isOpen={showObreiroForm}
            onClose={() => setShowObreiroForm(false)}
          />

        </>
      )}
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}