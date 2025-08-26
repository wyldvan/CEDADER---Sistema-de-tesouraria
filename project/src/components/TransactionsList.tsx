import { useState, useMemo } from 'react';
import { useTransactions } from '../hooks/useTransactions';
import { TransactionEditForm } from './TransactionEditForm';
import { useAuth } from '../contexts/AuthContext';
import { Transaction, CATEGORIES, SECTORS, MONTHS } from '../types';
import { format, getYear, getMonth, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Edit2, Trash2, ArrowUpCircle, ArrowDownCircle, Download, Search, Filter, X, Calendar, FileText } from 'lucide-react';
import { generateTransactionsPDF } from '../utils/pdfGenerator';
import { formatCurrency } from '../utils/formatters';

export function TransactionsList() {
  const { transactions, deleteTransaction } = useTransactions();
  const { isAdmin, canEdit, canDelete } = useAuth();

  // Edit transaction state
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);

  // Filter states
  const [typeFilter, setTypeFilter] = useState<'all' | 'entry' | 'exit'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<'all' | 'pix' | 'cash' | 'transfer'>('all');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sectorFilter, setSectorFilter] = useState('');
  const [fieldFilter, setFieldFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [periodFilter, setPeriodFilter] = useState<'all' | 'today' | 'week' | 'month' | 'quarter' | 'year'>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Generate year range from 2000 to 2030
  const availableYears = useMemo(() => {
    const years = [];
    for (let year = 2000; year <= 2030; year++) {
      years.push(year);
    }
    return years.reverse(); // Most recent first
  }, []);

  // Get unique fields from transactions
  const availableFields = useMemo(() => {
    const fields = transactions.map(t => t.field).filter(Boolean);
    return [...new Set(fields)].sort();
  }, [transactions]);

  // Get all categories based on current type filter
  const availableCategories = useMemo(() => {
    if (typeFilter === 'entry') return CATEGORIES.entry;
    if (typeFilter === 'exit') return CATEGORIES.exit;
    return [...CATEGORIES.entry, ...CATEGORIES.exit];
  }, [typeFilter]);

  // Get date range for period filter
  const getDateRangeForPeriod = (period: string) => {
    const now = new Date();
    switch (period) {
      case 'today':
        return { start: now, end: now };
      case 'week':
        return { start: startOfWeek(now), end: endOfWeek(now) };
      case 'month':
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case 'quarter':
        return { start: startOfQuarter(now), end: endOfQuarter(now) };
      case 'year':
        return { start: startOfYear(now), end: endOfYear(now) };
      default:
        return null;
    }
  };

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(t => {
        // Type filter
        if (typeFilter !== 'all' && t.type !== typeFilter) return false;

        // Search filter (description, category, field, document number)
        if (searchTerm) {
          const search = searchTerm.toLowerCase();
          const matchesDescription = t.description.toLowerCase().includes(search);
          const matchesCategory = t.category.toLowerCase().includes(search);
          const matchesField = t.field?.toLowerCase().includes(search);
          const matchesDocumentNumber = t.documentNumber?.toLowerCase().includes(search);
          if (!matchesDescription && !matchesCategory && !matchesField && !matchesDocumentNumber) return false;
        }

        // Payment method filter
        if (paymentMethodFilter !== 'all' && t.paymentMethod !== paymentMethodFilter) return false;

        // Category filter
        if (categoryFilter && t.category !== categoryFilter) return false;

        // Field filter
        if (fieldFilter && t.field !== fieldFilter) return false;

        // Sector filter
        if (sectorFilter) {
          const sectorFields = SECTORS[sectorFilter as keyof typeof SECTORS] || [];
          if (!t.field || !sectorFields.includes(t.field)) return false;
        }

        // Year filter
        if (yearFilter && getYear(new Date(t.date)).toString() !== yearFilter) return false;

        // Month filter
        if (monthFilter) {
          const monthIndex = MONTHS.indexOf(monthFilter);
          if (monthIndex !== -1 && getMonth(new Date(t.date)) !== monthIndex) return false;
        }

        // Period filter
        if (periodFilter !== 'all') {
          const dateRange = getDateRangeForPeriod(periodFilter);
          if (dateRange) {
            const transactionDate = new Date(t.date);
            if (!isWithinInterval(transactionDate, dateRange)) return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        // Always sort by date (newest first)
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
  }, [transactions, typeFilter, searchTerm, paymentMethodFilter, categoryFilter, fieldFilter, sectorFilter, yearFilter, monthFilter, periodFilter]);

  const handleDownloadPDF = () => {
    const filterDescription = [];
    if (typeFilter !== 'all') filterDescription.push(typeFilter === 'entry' ? 'Entradas' : 'Saídas');
    if (paymentMethodFilter !== 'all') filterDescription.push(paymentMethodFilter.toUpperCase());
    if (categoryFilter) filterDescription.push(categoryFilter);
    if (fieldFilter) filterDescription.push(fieldFilter);
    if (sectorFilter) filterDescription.push(sectorFilter);
    if (yearFilter) filterDescription.push(yearFilter);
    if (monthFilter) filterDescription.push(monthFilter);
    if (periodFilter !== 'all') {
      const periodLabels = {
        today: 'Hoje',
        week: 'Esta Semana',
        month: 'Este Mês',
        quarter: 'Este Trimestre',
        year: 'Este Ano'
      };
      filterDescription.push(periodLabels[periodFilter as keyof typeof periodLabels]);
    }
    if (searchTerm) filterDescription.push(`"${searchTerm}"`);

    const title = `Relatório de Transações${filterDescription.length > 0 ? ` - ${filterDescription.join(', ')}` : ''}`;
    generateTransactionsPDF(filteredTransactions, title);
  };

  const clearAllFilters = () => {
    setTypeFilter('all');
    setSearchTerm('');
    setPaymentMethodFilter('all');
    setCategoryFilter('');
    setFieldFilter('');
    setSectorFilter('');
    setYearFilter('');
    setMonthFilter('');
    setPeriodFilter('all');
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'pix': return 'PIX';
      case 'cash': return 'Dinheiro';
      case 'transfer': return 'Transferência';
      default: return method;
    }
  };

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case 'today': return 'Hoje';
      case 'week': return 'Esta Semana';
      case 'month': return 'Este Mês';
      case 'quarter': return 'Este Trimestre';
      case 'year': return 'Este Ano';
      default: return 'Todos';
    }
  };

  const activeFiltersCount = [
    typeFilter !== 'all',
    searchTerm !== '',
    paymentMethodFilter !== 'all',
    categoryFilter !== '',
    fieldFilter !== '',
    sectorFilter !== '',
    yearFilter !== '',
    monthFilter !== '',
    periodFilter !== 'all'
  ].filter(Boolean).length;

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowEditForm(true);
  };

  const handleCloseEditForm = () => {
    setShowEditForm(false);
    setEditingTransaction(null);
  };
  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Transações</h2>
            <p className="text-emerald-600">
              Histórico de entradas e saídas
              {filteredTransactions.length !== transactions.length && (
                <span className="ml-2 text-sm">
                  ({filteredTransactions.length} de {transactions.length} registros)
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${showFilters || activeFiltersCount > 0
                ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                : 'bg-gray-100 text-gray-700 border border-gray-300'
                }`}
            >
              <Filter className="w-4 h-4" />
              <span>Filtros</span>
              {activeFiltersCount > 0 && (
                <span className="bg-emerald-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            <button
              onClick={handleDownloadPDF}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>PDF</span>
            </button>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-emerald-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <Filter className="w-5 h-5 text-emerald-600" />
                <span>Filtros Avançados</span>
              </h3>
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-red-600 hover:text-red-800 transition-colors flex items-center space-x-1"
                >
                  <X className="w-4 h-4" />
                  <span>Limpar Filtros</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {/* Search */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pesquisar
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Descrição, categoria, campo, nº documento..."
                  />
                </div>
              </div>

              {/* Period Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Período
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <select
                    value={periodFilter}
                    onChange={(e) => setPeriodFilter(e.target.value as 'all' | 'today' | 'week' | 'month' | 'quarter' | 'year')}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="all">Todos os Períodos</option>
                    <option value="today">Hoje</option>
                    <option value="week">Esta Semana</option>
                    <option value="month">Este Mês</option>
                    <option value="quarter">Este Trimestre</option>
                    <option value="year">Este Ano</option>
                  </select>
                </div>
              </div>

              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo
                </label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as 'all' | 'entry' | 'exit')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="all">Todas</option>
                  <option value="entry">Entradas</option>
                  <option value="exit">Saídas</option>
                </select>
              </div>

              {/* Payment Method Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PIX
                </label>
                <select
                  value={paymentMethodFilter}
                  onChange={(e) => setPaymentMethodFilter(e.target.value as 'all' | 'pix' | 'cash' | 'transfer')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="all">Todos</option>
                  <option value="pix">PIX</option>
                  <option value="cash">Dinheiro</option>
                  <option value="transfer">Transferência</option>
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">Todas</option>
                  {availableCategories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Campo Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Campo
                </label>
                <select
                  value={fieldFilter}
                  onChange={(e) => setFieldFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">Todos</option>
                  {availableFields.map((field) => (
                    <option key={field} value={field}>{field}</option>
                  ))}
                </select>
              </div>

              {/* Sector Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Setor
                </label>
                <select
                  value={sectorFilter}
                  onChange={(e) => setSectorFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">Todos</option>
                  {Object.keys(SECTORS).map((sector) => (
                    <option key={sector} value={sector}>{sector}</option>
                  ))}
                </select>
              </div>

              {/* Year Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ano (2000-2030)
                </label>
                <select
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">Todos os Anos</option>
                  {availableYears.map((year) => (
                    <option key={year} value={year.toString()}>{year}</option>
                  ))}
                </select>
              </div>

              {/* Month Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mês
                </label>
                <select
                  value={monthFilter}
                  onChange={(e) => setMonthFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">Todos os Meses</option>
                  {MONTHS.map((month) => (
                    <option key={month} value={month}>{month}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active Filters Summary */}
            {activeFiltersCount > 0 && (
              <div className="mt-4 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <p className="text-sm text-emerald-800">
                  <span className="font-medium">Filtros ativos:</span>
                  {periodFilter !== 'all' && <span className="ml-2 px-2 py-1 bg-emerald-100 rounded text-xs">{getPeriodLabel(periodFilter)}</span>}
                  {typeFilter !== 'all' && <span className="ml-2 px-2 py-1 bg-emerald-100 rounded text-xs">{typeFilter === 'entry' ? 'Entradas' : 'Saídas'}</span>}
                  {paymentMethodFilter !== 'all' && <span className="ml-2 px-2 py-1 bg-emerald-100 rounded text-xs">{paymentMethodFilter.toUpperCase()}</span>}
                  {categoryFilter && <span className="ml-2 px-2 py-1 bg-emerald-100 rounded text-xs">{categoryFilter}</span>}
                  {fieldFilter && <span className="ml-2 px-2 py-1 bg-emerald-100 rounded text-xs">{fieldFilter}</span>}
                  {sectorFilter && <span className="ml-2 px-2 py-1 bg-emerald-100 rounded text-xs">{sectorFilter}</span>}
                  {yearFilter && <span className="ml-2 px-2 py-1 bg-emerald-100 rounded text-xs">{yearFilter}</span>}
                  {monthFilter && <span className="ml-2 px-2 py-1 bg-emerald-100 rounded text-xs">{monthFilter}</span>}
                  {searchTerm && <span className="ml-2 px-2 py-1 bg-emerald-100 rounded text-xs">"{searchTerm}"</span>}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-emerald-100">
          {filteredTransactions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {transactions.length === 0 ? (
                <p>Nenhuma transação encontrada.</p>
              ) : (
                <div>
                  <p className="mb-2">Nenhuma transação encontrada com os filtros aplicados.</p>
                  <button
                    onClick={clearAllFilters}
                    className="text-emerald-600 hover:text-emerald-800 transition-colors"
                  >
                    Limpar filtros
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-emerald-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-emerald-800 uppercase tracking-wider">
                      Nº Doc
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-emerald-800 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-emerald-800 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-emerald-800 uppercase tracking-wider">
                      Categoria
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-emerald-800 uppercase tracking-wider">
                      Valor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-emerald-800 uppercase tracking-wider">
                      Pagamento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-emerald-800 uppercase tracking-wider">
                      Campo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-emerald-800 uppercase tracking-wider">
                      Mês
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-emerald-800 uppercase tracking-wider">
                      Data Início
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-emerald-800 uppercase tracking-wider">
                      Descrição
                    </th>
                    {isAdmin() && (
                      <th className="px-6 py-3 text-right text-xs font-medium text-emerald-800 uppercase tracking-wider">
                        Ações
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-emerald-100">
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-emerald-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.documentNumber ? (
                          <div className="flex items-center space-x-1">
                            <FileText className="w-3 h-3 text-gray-400" />
                            <span className="font-mono text-xs">{transaction.documentNumber}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {transaction.type === 'entry' ? (
                            <ArrowUpCircle className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <ArrowDownCircle className="w-5 h-5 text-red-600" />
                          )}
                          <span className={`text-sm font-medium ${transaction.type === 'entry' ? 'text-emerald-600' : 'text-red-600'
                            }`}>
                            {transaction.type === 'entry' ? 'Entrada' : 'Saída'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {format(new Date(transaction.date), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${transaction.type === 'entry' ? 'text-emerald-600' : 'text-red-600'
                          }`}>
                          {formatCurrency(transaction.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${transaction.paymentMethod === 'pix' ? 'bg-blue-100 text-blue-800' :
                          transaction.paymentMethod === 'cash' ? 'bg-green-100 text-green-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                          {getPaymentMethodLabel(transaction.paymentMethod)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${transaction.field ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                          }`}>
                          {transaction.field || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${transaction.month ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                          }`}>
                          {transaction.month || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.startDate ? (
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3 text-gray-400" />
                            <span className="text-xs">{format(new Date(transaction.startDate), 'dd/MM/yyyy', { locale: ptBR })}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                        {transaction.description}
                      </td>
                      {canEdit() || canDelete() ? (
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            {canEdit() && (
                              <button
                                onClick={() => handleEditTransaction(transaction)}
                                className="text-emerald-600 hover:text-emerald-900 transition-colors"
                                title="Editar transação"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            )}
                            {canDelete() && (
                              <button
                                onClick={() => deleteTransaction(transaction.id)}
                                className="text-red-600 hover:text-red-900 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      ) : null}
                      {!canEdit() && !canDelete() && isAdmin() && (
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <span className="text-gray-400 text-xs">Sem ações</span>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Edit Transaction Form */}
      {editingTransaction && (
        <TransactionEditForm
          isOpen={showEditForm}
          onClose={handleCloseEditForm}
          transaction={editingTransaction}
        />
      )}
    </>
  );
}