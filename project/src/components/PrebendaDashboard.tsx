import React, { useState, useMemo } from 'react';
import { usePrebenda } from '../hooks/usePrebenda';
import { PrebendaEditForm } from './PrebendaEditForm';
import { useAuth } from '../contexts/AuthContext';
import { FIELDS, MONTHS } from '../types';
import { format, getYear, getMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DollarSign, TrendingUp, TrendingDown, Users, BarChart3, ArrowUpCircle, ArrowDownCircle, PieChart, Search, Filter, X, Calendar, Download, Printer, Receipt, Edit2, Trash2 } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { generatePrebendaPDF } from '../utils/pdfGenerator';
import { formatCurrency } from '../utils/formatters';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export function PrebendaDashboard() {
  const { prebendas, deletePrebenda, getPrebendaBalance, getTotalByType, getPrebendaByPastor, getPrebendaByMonth } = usePrebenda();
  const { canEdit, canDelete } = useAuth();

  // Edit prebenda state
  const [editingPrebenda, setEditingPrebenda] = useState<any | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [fieldFilter, setFieldFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Generate year range from 2000 to 2030
  const availableYears = useMemo(() => {
    const years = [];
    for (let year = 2000; year <= 2030; year++) {
      years.push(year);
    }
    return years.reverse(); // Most recent first
  }, []);

  // Get unique fields from prebendas
  const availableFields = useMemo(() => {
    const fields = prebendas.map(p => p.field).filter(Boolean);
    return [...new Set(fields)].sort();
  }, [prebendas]);

  // Filter prebendas based on search and filters
  const filteredPrebendas = useMemo(() => {
    return prebendas.filter(p => {
      // Search filter (description, pastor, field)
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const matchesDescription = p.description.toLowerCase().includes(search);
        const matchesPastor = p.pastor.toLowerCase().includes(search);
        const matchesField = p.field?.toLowerCase().includes(search);
        if (!matchesDescription && !matchesPastor && !matchesField) return false;
      }

      // Month filter
      if (monthFilter && p.month !== monthFilter) return false;

      // Field filter
      if (fieldFilter && p.field !== fieldFilter) return false;

      // Year filter
      if (yearFilter && getYear(new Date(p.date)).toString() !== yearFilter) return false;

      return true;
    }).sort((a, b) => {
      // Sort by date (newest first)
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [prebendas, searchTerm, monthFilter, fieldFilter, yearFilter]);

  // Recalculate values based on filtered data
  const filteredBalance = filteredPrebendas.reduce((balance, prebenda) => {
    return prebenda.type === 'entry'
      ? balance + prebenda.amount
      : balance - prebenda.amount;
  }, 0);

  const filteredTotalEntry = filteredPrebendas
    .filter(p => p.type === 'entry')
    .reduce((total, p) => total + p.amount, 0);

  const filteredTotalExit = filteredPrebendas
    .filter(p => p.type === 'exit')
    .reduce((total, p) => total + p.amount, 0);

  // Calculate payment methods for filtered entries only
  const filteredEntryPrebendas = filteredPrebendas.filter(p => p.type === 'entry');
  const filteredEntryPaymentMethods = { pix: 0, cash: 0, transfer: 0 };

  filteredEntryPrebendas.forEach(p => {
    filteredEntryPaymentMethods[p.paymentMethod] += p.amount;
  });

  // Calculate filtered data for charts
  const filteredPrebendaByPastor = () => {
    const byPastor: Record<string, number> = {};
    filteredPrebendas.forEach(p => {
      byPastor[p.pastor] = (byPastor[p.pastor] || 0) + (p.type === 'entry' ? p.amount : -p.amount);
    });
    return byPastor;
  };

  const filteredPrebendaByMonth = () => {
    const byMonth: Record<string, number> = {};
    filteredPrebendas.forEach(p => {
      byMonth[p.month] = (byMonth[p.month] || 0) + (p.type === 'entry' ? p.amount : -p.amount);
    });
    return byMonth;
  };

  const pastorChartData = {
    labels: Object.keys(filteredPrebendaByPastor()),
    datasets: [
      {
        label: 'Saldo por Pastor',
        data: Object.values(filteredPrebendaByPastor()),
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 2,
      },
    ],
  };

  const monthChartData = {
    labels: Object.keys(filteredPrebendaByMonth()),
    datasets: [
      {
        label: 'Prebenda por Mês',
        data: Object.values(filteredPrebendaByMonth()),
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const typeChartData = {
    labels: ['Entradas', 'Saídas'],
    datasets: [
      {
        data: [filteredTotalEntry, filteredTotalExit],
        backgroundColor: ['rgba(16, 185, 129, 0.8)', 'rgba(239, 68, 68, 0.8)'],
        borderColor: ['rgba(16, 185, 129, 1)', 'rgba(239, 68, 68, 1)'],
        borderWidth: 2,
      },
    ],
  };

  // Payment method chart for filtered entries
  const paymentMethodChartData = {
    labels: ['PIX', 'Dinheiro', 'Transferência'],
    datasets: [
      {
        label: 'Entradas por Método',
        data: [filteredEntryPaymentMethods.pix, filteredEntryPaymentMethods.cash, filteredEntryPaymentMethods.transfer],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
        ],
        borderColor: [
          'rgba(16, 185, 129, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(59, 130, 246, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setMonthFilter('');
    setFieldFilter('');
    setYearFilter('');
  };

  const activeFiltersCount = [
    searchTerm !== '',
    monthFilter !== '',
    fieldFilter !== '',
    yearFilter !== ''
  ].filter(Boolean).length;

  const hasEntryData = filteredEntryPrebendas.length > 0;

  const handleEditPrebenda = (prebenda: any) => {
    setEditingPrebenda(prebenda);
    setShowEditForm(true);
  };

  const handleCloseEditForm = () => {
    setShowEditForm(false);
    setEditingPrebenda(null);
  };

  const handleDownloadPDF = () => {
    const filterDescription = [];
    if (searchTerm) filterDescription.push(`"${searchTerm}"`);
    if (monthFilter) filterDescription.push(monthFilter);
    if (fieldFilter) filterDescription.push(fieldFilter);
    if (yearFilter) filterDescription.push(yearFilter);

    const title = `Relatório de Prebenda${filterDescription.length > 0 ? ` - ${filterDescription.join(', ')}` : ''}`;
    generatePrebendaPDF(filteredPrebendas, title);
  };

  return (
    <>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
              <DollarSign className="w-8 h-8 text-emerald-600" />
              <span>Painel Auxílio e Prebenda</span>
            </h2>
            <p className="text-emerald-600 mt-1">
              Controle de auxílio pastoral
              {filteredPrebendas.length !== prebendas.length && (
                <span className="ml-2 text-sm">
                  ({filteredPrebendas.length} de {prebendas.length} registros)
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

            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir</span>
            </button>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-emerald-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <Filter className="w-5 h-5 text-emerald-600" />
                <span>Filtros de Auxílio e Prebenda</span>
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div>
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
                    placeholder="Pastor, descrição, campo..."
                  />
                </div>
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

              {/* Field Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Campo
                </label>
                <select
                  value={fieldFilter}
                  onChange={(e) => setFieldFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">Todos os Campos</option>
                  {availableFields.map((field) => (
                    <option key={field} value={field}>{field}</option>
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
            </div>

            {/* Active Filters Summary */}
            {activeFiltersCount > 0 && (
              <div className="mt-4 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <p className="text-sm text-emerald-800">
                  <span className="font-medium">Filtros ativos:</span>
                  {searchTerm && <span className="ml-2 px-2 py-1 bg-emerald-100 rounded text-xs">"{searchTerm}"</span>}
                  {monthFilter && <span className="ml-2 px-2 py-1 bg-emerald-100 rounded text-xs">{monthFilter}</span>}
                  {fieldFilter && <span className="ml-2 px-2 py-1 bg-emerald-100 rounded text-xs">{fieldFilter}</span>}
                  {yearFilter && <span className="ml-2 px-2 py-1 bg-emerald-100 rounded text-xs">{yearFilter}</span>}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Summary Cards - Updated with filtered data */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-emerald-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Saldo Auxílio e Prebenda</p>
                <p className={`text-2xl font-bold ${filteredBalance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {formatCurrency(filteredBalance)}
                </p>
                {filteredPrebendas.length !== prebendas.length && (
                  <p className="text-xs text-gray-500 mt-1">Filtrado</p>
                )}
              </div>
              <div className={`p-3 rounded-full ${filteredBalance >= 0 ? 'bg-emerald-100' : 'bg-red-100'}`}>
                <DollarSign className={`w-6 h-6 ${filteredBalance >= 0 ? 'text-emerald-600' : 'text-red-600'}`} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-emerald-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Entradas</p>
                <p className="text-2xl font-bold text-emerald-600">{formatCurrency(filteredTotalEntry)}</p>
                {filteredPrebendas.length !== prebendas.length && (
                  <p className="text-xs text-gray-500 mt-1">Filtrado</p>
                )}
              </div>
              <div className="p-3 bg-emerald-100 rounded-full">
                <ArrowUpCircle className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-emerald-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Saídas</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(filteredTotalExit)}</p>
                {filteredPrebendas.length !== prebendas.length && (
                  <p className="text-xs text-gray-500 mt-1">Filtrado</p>
                )}
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <ArrowDownCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-emerald-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Registros</p>
                <p className="text-2xl font-bold text-gray-900">{filteredPrebendas.length}</p>
                {filteredPrebendas.length !== prebendas.length && (
                  <p className="text-xs text-gray-500 mt-1">de {prebendas.length}</p>
                )}
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Payment Method Summary for Entries */}
        {hasEntryData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-emerald-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <PieChart className="w-5 h-5 text-emerald-600" />
                <span>Entradas por Método de Pagamento</span>
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Distribuição dos métodos de pagamento nas entradas
                {filteredPrebendas.length !== prebendas.length && <span className=" font-medium"> (filtrado)</span>}
              </p>
              <div id="prebenda-payment-methods-chart">
                <Pie data={paymentMethodChartData} />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-emerald-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo por Método (Entradas)</h3>
              <p className="text-sm text-gray-600 mb-4">
                Valores recebidos por método de pagamento
                {filteredPrebendas.length !== prebendas.length && <span className=" font-medium"> (filtrado)</span>}
              </p>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-emerald-500 rounded-full"></div>
                    <span className="font-medium text-gray-900">PIX</span>
                  </div>
                  <span className="text-xl font-bold text-emerald-600">
                    {formatCurrency(filteredEntryPaymentMethods.pix)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                    <span className="font-medium text-gray-900">Dinheiro</span>
                  </div>
                  <span className="text-xl font-bold text-green-600">
                    {formatCurrency(filteredEntryPaymentMethods.cash)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                    <span className="font-medium text-gray-900">Transferência</span>
                  </div>
                  <span className="text-xl font-bold text-blue-600">
                    {formatCurrency(filteredEntryPaymentMethods.transfer)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Charts - Updated with filtered data */}
        {filteredPrebendas.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-emerald-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Users className="w-5 h-5 text-emerald-600" />
                <span>Saldo por Pastor</span>
              </h3>
              {filteredPrebendas.length !== prebendas.length && (
                <p className="text-sm text-gray-600 mb-4">Dados filtrados</p>
              )}
              <div>
                <Bar data={pastorChartData} options={chartOptions} />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-emerald-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-emerald-600" />
                <span>Prebenda por Mês</span>
              </h3>
              {filteredPrebendas.length !== prebendas.length && (
                <p className="text-sm text-gray-600 mb-4">Dados filtrados</p>
              )}
              <div>
                <Bar data={monthChartData} options={chartOptions} />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-emerald-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                <span>Entradas vs Saídas</span>
              </h3>
              {filteredPrebendas.length !== prebendas.length && (
                <p className="text-sm text-gray-600 mb-4">Dados filtrados</p>
              )}
              <div>
                <Pie data={typeChartData} />
              </div>
            </div>
          </div>
        )}

        {/* Recent Transactions - Updated with filtered data */}
        {filteredPrebendas.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-emerald-100">
            <div className="px-6 py-4 border-b border-emerald-100">
              <h3 className="text-lg font-semibold text-gray-900">
                Últimas Movimentações
                {filteredPrebendas.length !== prebendas.length && (
                  <span className="text-sm font-normal text-gray-600 ml-2">(filtrado)</span>
                )}
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-emerald-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-emerald-800 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-emerald-800 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-emerald-800 uppercase tracking-wider">
                      Pastor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-emerald-800 uppercase tracking-wider">
                      Valor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-emerald-800 uppercase tracking-wider">
                      Método
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-emerald-800 uppercase tracking-wider">
                      Mês
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-emerald-800 uppercase tracking-wider">
                      Campo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-emerald-800 uppercase tracking-wider">
                      Descrição
                    </th>
                    {(canEdit() || canDelete()) && (
                      <th className="px-6 py-3 text-right text-xs font-medium text-emerald-800 uppercase tracking-wider">
                        Ações
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-emerald-100">
                  {filteredPrebendas.slice(0, 10).map((prebenda) => (
                    <tr key={prebenda.id} className="hover:bg-emerald-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {format(new Date(prebenda.date), 'dd/MM/yyyy', { locale: ptBR })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {prebenda.type === 'entry' ? (
                            <ArrowUpCircle className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <ArrowDownCircle className="w-4 h-4 text-red-600" />
                          )}
                          <span className={`text-sm font-medium ${prebenda.type === 'entry' ? 'text-emerald-600' : 'text-red-600'
                            }`}>
                            {prebenda.type === 'entry' ? 'Entrada' :
                              prebenda.type === 'exit' && (prebenda.isAuxilio || prebenda.isPrebenda) ?
                                `Saída: ${[prebenda.isAuxilio && 'Auxílio', prebenda.isPrebenda && 'Prebenda'].filter(Boolean).join(' + ')}` :
                                'Saída Auxílio'
                            }
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {prebenda.pastor}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${prebenda.type === 'entry' ? 'text-emerald-600' : 'text-red-600'
                          }`}>
                          {formatCurrency(prebenda.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${prebenda.paymentMethod === 'pix' ? 'bg-blue-100 text-blue-800' :
                          prebenda.paymentMethod === 'cash' ? 'bg-green-100 text-green-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                          {prebenda.paymentMethod === 'pix' ? 'PIX' :
                            prebenda.paymentMethod === 'cash' ? 'Dinheiro' :
                              'Transferência'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {prebenda.month}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${prebenda.field ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                          }`}>
                          {prebenda.field || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                        {prebenda.description}
                      </td>
                      {(canEdit() || canDelete()) && (
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            {canEdit() && (
                              <button
                                onClick={() => handleEditPrebenda(prebenda)}
                                className="text-blue-600 hover:text-blue-900 transition-colors"
                                title="Editar prebenda"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            )}
                            {canDelete() && (
                              <button
                                onClick={() => {
                                  if (window.confirm(`Tem certeza que deseja excluir esta prebenda de ${prebenda.pastor}?`)) {
                                    deletePrebenda(prebenda.id);
                                  }
                                }}
                                className="text-red-600 hover:text-red-900 transition-colors"
                                title="Excluir prebenda"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* No Data Message */}
        {filteredPrebendas.length === 0 && prebendas.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-emerald-100">
            <Filter className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum resultado encontrado</h3>
            <p className="text-gray-500 mb-4">
              Não há prebendas que correspondam aos filtros aplicados.
            </p>
            <button
              onClick={clearAllFilters}
              className="text-emerald-600 hover:text-emerald-800 transition-colors"
            >
              Limpar filtros
            </button>
          </div>
        )}

        {prebendas.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-emerald-100">
            <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum auxílio e prebenda registrado</h3>
            <p className="text-gray-500">
              Comece registrando entradas e saídas de auxílio e prebenda usando os botões de ação rápida.
            </p>
          </div>
        )}
      </div>

      {/* Edit Prebenda Form */}
      {editingPrebenda && (
        <PrebendaEditForm
          isOpen={showEditForm}
          onClose={handleCloseEditForm}
          prebenda={editingPrebenda}
        />
      )}
    </>
  );
}