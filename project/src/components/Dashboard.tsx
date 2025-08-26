import React, { useState, useMemo } from 'react';
import { useTransactions } from '../hooks/useTransactions';
import { useRegistrations } from '../hooks/useRegistrations';
import { usePayments } from '../hooks/usePayments';
import { usePrebenda } from '../hooks/usePrebenda';
import { MONTHS } from '../types';
import { getYear, getMonth, isWithinInterval, startOfYear, endOfYear, startOfMonth, endOfMonth } from 'date-fns';
import { TrendingUp, TrendingDown, DollarSign, Users, BarChart3, PieChart, ArrowUpCircle, ArrowDownCircle, Filter, X, Calendar } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { formatCurrency } from '../utils/formatters';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

interface DashboardProps {
  onViewChange?: (view: string) => void;
}

export function Dashboard({ onViewChange }: DashboardProps) {
  const { transactions, getBalance, getTotalByType, getTransactionsByPaymentMethod } = useTransactions();
  const { registrations } = useRegistrations();
  const { getTotalPayments } = usePayments();
  const { prebendas, getTotalByType: getPrebendaTotalByType } = usePrebenda();

  // Filter states
  const [yearFilter, setYearFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Generate year range from 2000 to 2030
  const availableYears = useMemo(() => {
    const years = [];
    for (let year = 2000; year <= 2030; year++) {
      years.push(year);
    }
    return years.reverse(); // Most recent first
  }, []);

  // Filter data based on selected year and month
  const filteredData = useMemo(() => {
    const filterByDate = (items: any[]) => {
      return items.filter(item => {
        const itemDate = new Date(item.date);

        // Year filter
        if (yearFilter && getYear(itemDate).toString() !== yearFilter) {
          return false;
        }

        // Month filter
        if (monthFilter) {
          const monthIndex = MONTHS.indexOf(monthFilter);
          if (monthIndex !== -1 && getMonth(itemDate) !== monthIndex) {
            return false;
          }
        }

        return true;
      });
    };

    return {
      transactions: filterByDate(transactions),
      registrations: filterByDate(registrations),
      prebendas: filterByDate(prebendas)
    };
  }, [transactions, registrations, prebendas, yearFilter, monthFilter]);

  // Calculate filtered totals
  const filteredTransactionBalance = filteredData.transactions.reduce((balance, transaction) => {
    return transaction.type === 'entry'
      ? balance + transaction.amount
      : balance - transaction.amount;
  }, 0);

  const filteredTransactionTotalEntry = filteredData.transactions
    .filter(t => t.type === 'entry')
    .reduce((total, t) => total + t.amount, 0);

  const filteredTransactionTotalExit = filteredData.transactions
    .filter(t => t.type === 'exit')
    .reduce((total, t) => total + t.amount, 0);

  const filteredPrebendaTotalEntry = filteredData.prebendas
    .filter(p => p.type === 'entry')
    .reduce((total, p) => total + p.amount, 0);

  const filteredPrebendaTotalExit = filteredData.prebendas
    .filter(p => p.type === 'exit')
    .reduce((total, p) => total + p.amount, 0);

  // Combined totals for dashboard display
  const totalEntry = filteredTransactionTotalEntry + filteredPrebendaTotalEntry;
  const totalExit = filteredTransactionTotalExit + filteredPrebendaTotalExit;
  const balance = filteredTransactionBalance + (filteredPrebendaTotalEntry - filteredPrebendaTotalExit);

  const totalRegistrations = filteredData.registrations.reduce((total, r) => total + r.amount, 0);

  // Combine payment methods from filtered transactions and prebenda entries
  const filteredEntryTransactions = filteredData.transactions.filter(t => t.type === 'entry');
  const filteredEntryPrebendas = filteredData.prebendas.filter(p => p.type === 'entry');

  const combinedEntryPaymentMethods = { pix: 0, cash: 0, transfer: 0 };

  // Add transaction entries
  filteredEntryTransactions.forEach(t => {
    combinedEntryPaymentMethods[t.paymentMethod] += t.amount;
  });

  // Add prebenda entries
  filteredEntryPrebendas.forEach(p => {
    combinedEntryPaymentMethods[p.paymentMethod] += p.amount;
  });

  const paymentMethodChartData = {
    labels: ['PIX', 'Dinheiro', 'Transferência'],
    datasets: [
      {
        label: 'Entradas por Método (Transações + Prebenda)',
        data: [combinedEntryPaymentMethods.pix, combinedEntryPaymentMethods.cash, combinedEntryPaymentMethods.transfer],
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
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const clearAllFilters = () => {
    setYearFilter('');
    setMonthFilter('');
  };

  const activeFiltersCount = [
    yearFilter !== '',
    monthFilter !== ''
  ].filter(Boolean).length;

  const hasEntryData = filteredEntryTransactions.length > 0 || filteredEntryPrebendas.length > 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Painel de Controle</h2>
          <p className="text-emerald-600 mt-1">
            Visão geral das finanças (incluindo Prebenda)
            {(filteredData.transactions.length !== transactions.length ||
              filteredData.registrations.length !== registrations.length ||
              filteredData.prebendas.length !== prebendas.length) && (
                <span className="ml-2 text-sm">
                  (dados filtrados)
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
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-emerald-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Filter className="w-5 h-5 text-emerald-600" />
              <span>Filtros do Painel</span>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Year Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ano (2000-2030)
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">Todos os Anos</option>
                  {availableYears.map((year) => (
                    <option key={year} value={year.toString()}>{year}</option>
                  ))}
                </select>
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
          </div>

          {/* Active Filters Summary */}
          {activeFiltersCount > 0 && (
            <div className="mt-4 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
              <p className="text-sm text-emerald-800">
                <span className="font-medium">Filtros ativos:</span>
                {yearFilter && <span className="ml-2 px-2 py-1 bg-emerald-100 rounded text-xs">{yearFilter}</span>}
                {monthFilter && <span className="ml-2 px-2 py-1 bg-emerald-100 rounded text-xs">{monthFilter}</span>}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-emerald-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Saldo Total</p>
              <p className={`text-2xl font-bold ${balance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {formatCurrency(balance)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {activeFiltersCount > 0 ? 'Filtrado' : 'Transações + Prebenda'}
              </p>
            </div>
            <div className={`p-3 rounded-full ${balance >= 0 ? 'bg-emerald-100' : 'bg-red-100'}`}>
              <DollarSign className={`w-6 h-6 ${balance >= 0 ? 'text-emerald-600' : 'text-red-600'}`} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-emerald-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Entradas</p>
              <p className="text-2xl font-bold text-emerald-600">{formatCurrency(totalEntry)}</p>
              <p className="text-xs text-gray-500 mt-1">
                {activeFiltersCount > 0 ? 'Filtrado' :
                  `Transações: ${formatCurrency(filteredTransactionTotalEntry)} | Prebenda: ${formatCurrency(filteredPrebendaTotalEntry)}`
                }
              </p>
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
              <p className="text-2xl font-bold text-red-600">{formatCurrency(totalExit)}</p>
              <p className="text-xs text-gray-500 mt-1">
                {activeFiltersCount > 0 ? 'Filtrado' :
                  `Transações: ${formatCurrency(filteredTransactionTotalExit)} | Prebenda: ${formatCurrency(filteredPrebendaTotalExit)}`
                }
              </p>
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
              <p className="text-2xl font-bold text-gray-900">
                {filteredData.transactions.length + filteredData.prebendas.length + filteredData.registrations.length}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {activeFiltersCount > 0 ? 'Filtrado' :
                  `Trans: ${filteredData.transactions.length} | Preb: ${filteredData.prebendas.length} | Reg: ${filteredData.registrations.length}`
                }
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Payment Method Chart */}
      {hasEntryData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-emerald-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <PieChart className="w-5 h-5 text-emerald-600" />
              <span>Entradas por Método de Pagamento</span>
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Inclui Transações + Prebenda
              {activeFiltersCount > 0 && <span className=" font-medium"> (filtrado)</span>}
            </p>
            <div id="payment-methods-chart">
              <Pie data={paymentMethodChartData} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-emerald-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo por Método (Entradas)</h3>
            <p className="text-sm text-gray-600 mb-4">
              Valores combinados de Transações + Prebenda
              {activeFiltersCount > 0 && <span className=" font-medium"> (filtrado)</span>}
            </p>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-emerald-500 rounded-full"></div>
                  <span className="font-medium text-gray-900">PIX</span>
                </div>
                <span className="text-xl font-bold text-emerald-600">
                  {formatCurrency(combinedEntryPaymentMethods.pix)}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span className="font-medium text-gray-900">Dinheiro</span>
                </div>
                <span className="text-xl font-bold text-green-600">
                  {formatCurrency(combinedEntryPaymentMethods.cash)}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                  <span className="font-medium text-gray-900">Transferência</span>
                </div>
                <span className="text-xl font-bold text-blue-600">
                  {formatCurrency(combinedEntryPaymentMethods.transfer)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* System Overview */}
      <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-emerald-100">
        <div className="max-w-2xl mx-auto">
          <DollarSign className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Sistema de Tesouraria CEDADER</h3>
          <p className="text-gray-600 leading-relaxed">
            Gerencie suas finanças de forma eficiente. O painel agora integra automaticamente os dados de
            Prebenda com as transações gerais para uma visão completa dos registros de recebimento.
            {activeFiltersCount > 0 && (
              <span className="block mt-2 text-emerald-600 font-medium">
                Dados filtrados por {yearFilter && `ano ${yearFilter}`}{yearFilter && monthFilter && ' e '}{monthFilter && `mês ${monthFilter}`}.
              </span>
            )}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="p-4 bg-emerald-50 rounded-lg">
              <BarChart3 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <h4 className="font-medium text-emerald-900">Transações</h4>
              <p className="text-sm text-emerald-700">
                {activeFiltersCount > 0 ? `${filteredData.transactions.length} registros` : 'Entradas e saídas gerais'}
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <DollarSign className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <h4 className="font-medium text-purple-900">Auxílio e Prebenda</h4>
              <p className="text-sm text-purple-700">
                {activeFiltersCount > 0 ? `${filteredData.prebendas.length} registros` : 'Integrado ao painel'}
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h4 className="font-medium text-blue-900">Agenda completa</h4>
              <p className="text-sm text-blue-700">
                {activeFiltersCount > 0 ? `${filteredData.registrations.length} registros` : 'Campos e categorias'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}