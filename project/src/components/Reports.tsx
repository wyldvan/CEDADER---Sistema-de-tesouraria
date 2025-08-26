import React, { useState, useMemo } from 'react';
import { useTransactions } from '../hooks/useTransactions';
import { useRegistrations } from '../hooks/useRegistrations';
import { usePayments } from '../hooks/usePayments';
import { usePrebenda } from '../hooks/usePrebenda';
import { Transaction, Registration, FIELDS, SECTORS, CATEGORIES } from '../types';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear, isWithinInterval, getMonth, getQuarter, getYear, parseISO, isAfter, isBefore } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, LineElement, PointElement } from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Calendar, Download, Printer, FileText, MapPin, BarChart3, PieChart, TrendingUp, Filter, X } from 'lucide-react';
import { generateTransactionsPDF, generateRegistrationsPDF, generatePrebendaPDF, generateFieldReportPDF, generateChartPDF } from '../utils/pdfGenerator';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, ArcElement);

export function Reports() {
  const { transactions } = useTransactions();
  const { registrations } = useRegistrations();
  const { payments } = usePayments();
  const { prebendas } = usePrebenda();

  // Filter states
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual'>('monthly');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportType, setReportType] = useState<'transactions' | 'registrations' | 'prebenda' | 'field' | 'charts'>('charts');
  const [selectedField, setSelectedField] = useState<string>('');
  const [selectedSector, setSelectedSector] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  // Chart type selection
  const [chartType, setChartType] = useState<'revenue-distribution' | 'period-comparison' | 'sector-analysis' | 'field-performance'>('revenue-distribution');

  const getDateRange = (date: Date, period: string) => {
    switch (period) {
      case 'daily':
        return { start: date, end: date };
      case 'weekly':
        return { start: startOfWeek(date), end: endOfWeek(date) };
      case 'monthly':
        return { start: startOfMonth(date), end: endOfMonth(date) };
      case 'quarterly':
        return { start: startOfQuarter(date), end: endOfQuarter(date) };
      case 'annual':
        return { start: startOfYear(date), end: endOfYear(date) };
      default:
        return { start: date, end: date };
    }
  };

  const getCustomDateRange = () => {
    const start = parseISO(startDate);
    const end = parseISO(endDate);

    // Ensure start date is not after end date
    if (isAfter(start, end)) {
      return {
        start: end,
        end: start
      };
    }

    return {
      start,
      end
    };
  };

  const filteredData = useMemo(() => {
    const dateRange = period === 'custom' ? getCustomDateRange() : getDateRange(new Date(startDate), period);

    // Validate date range before filtering
    if (!dateRange.start || !dateRange.end || isAfter(dateRange.start, dateRange.end)) {
      return [];
    }

    if (reportType === 'transactions') {
      return transactions.filter(t => {
        try {
          return isWithinInterval(new Date(t.date), dateRange);
        } catch (error) {
          console.warn('Invalid date in transaction:', t.date);
          return false;
        }
      });
    } else if (reportType === 'registrations') {
      return registrations.filter(r => {
        try {
          return isWithinInterval(new Date(r.date), dateRange);
        } catch (error) {
          console.warn('Invalid date in registration:', r.date);
          return false;
        }
      });
    } else if (reportType === 'prebenda') {
      return prebendas.filter(p => {
        try {
          return isWithinInterval(new Date(p.date), dateRange);
        } catch (error) {
          console.warn('Invalid date in prebenda:', p.date);
          return false;
        }
      });
    } else if (reportType === 'field' && selectedField) {
      const fieldTransactions = transactions.filter(t => {
        try {
          return t.field === selectedField && isWithinInterval(new Date(t.date), dateRange);
        } catch (error) {
          console.warn('Invalid date in transaction:', t.date);
          return false;
        }
      });
      const fieldRegistrations = registrations.filter(r => {
        try {
          return r.field === selectedField && isWithinInterval(new Date(r.date), dateRange);
        } catch (error) {
          console.warn('Invalid date in registration:', r.date);
          return false;
        }
      });
      const fieldPrebendas = prebendas.filter(p => {
        try {
          return p.field === selectedField && isWithinInterval(new Date(p.date), dateRange);
        } catch (error) {
          console.warn('Invalid date in prebenda:', p.date);
          return false;
        }
      });
      return { transactions: fieldTransactions, registrations: fieldRegistrations, prebendas: fieldPrebendas };
    }
    return [];
  }, [transactions, registrations, prebendas, startDate, endDate, period, reportType, selectedField]);

  // Revenue Distribution Chart Data
  const revenueDistributionData = useMemo(() => {
    const dateRange = period === 'custom' ? getCustomDateRange() : getDateRange(new Date(startDate), period);

    // Validate date range
    if (!dateRange.start || !dateRange.end || isAfter(dateRange.start, dateRange.end)) {
      return { labels: [], datasets: [{ data: [], backgroundColor: [], borderColor: [], borderWidth: 2 }] };
    }

    // Get all entry transactions and prebendas within date range
    const entryTransactions = transactions.filter(t => {
      try {
        return t.type === 'entry' && isWithinInterval(new Date(t.date), dateRange);
      } catch (error) {
        return false;
      }
    });

    const entryPrebendas = prebendas.filter(p => {
      try {
        return p.type === 'entry' && isWithinInterval(new Date(p.date), dateRange);
      } catch (error) {
        return false;
      }
    });

    const filteredRegistrations = registrations.filter(r => {
      try {
        return isWithinInterval(new Date(r.date), dateRange);
      } catch (error) {
        return false;
      }
    });

    // Calculate revenue by category
    const revenueByCategory: Record<string, number> = {};

    // Add transaction entries
    entryTransactions.forEach(t => {
      revenueByCategory[t.category] = (revenueByCategory[t.category] || 0) + t.amount;
    });

    // Add registration entries
    filteredRegistrations.forEach(r => {
      revenueByCategory[r.category] = (revenueByCategory[r.category] || 0) + r.amount;
    });

    // Add prebenda entries as "Prebenda"
    const prebendaTotal = entryPrebendas.reduce((sum, p) => sum + p.amount, 0);
    if (prebendaTotal > 0) {
      revenueByCategory['Prebenda'] = prebendaTotal;
    }

    return {
      labels: Object.keys(revenueByCategory),
      datasets: [{
        data: Object.values(revenueByCategory),
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(156, 163, 175, 0.8)',
          'rgba(251, 146, 60, 0.8)',
          'rgba(14, 165, 233, 0.8)',
          'rgba(139, 92, 246, 0.8)',
        ],
        borderColor: [
          'rgba(16, 185, 129, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(168, 85, 247, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(156, 163, 175, 1)',
          'rgba(251, 146, 60, 1)',
          'rgba(14, 165, 233, 1)',
          'rgba(139, 92, 246, 1)',
        ],
        borderWidth: 2,
      }],
    };
  }, [transactions, registrations, prebendas, startDate, endDate, period]);

  // Period Comparison Chart Data
  const periodComparisonData = useMemo(() => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const currentYear = getYear(new Date());

    const monthlyData = months.map((month, index) => {
      const monthTransactions = transactions.filter(t => {
        try {
          return getMonth(new Date(t.date)) === index && getYear(new Date(t.date)) === currentYear;
        } catch (error) {
          return false;
        }
      });

      const monthRegistrations = registrations.filter(r => {
        try {
          return getMonth(new Date(r.date)) === index && getYear(new Date(r.date)) === currentYear;
        } catch (error) {
          return false;
        }
      });

      const monthPrebendas = prebendas.filter(p => {
        try {
          return getMonth(new Date(p.date)) === index && getYear(new Date(p.date)) === currentYear;
        } catch (error) {
          return false;
        }
      });

      const entries = monthTransactions.filter(t => t.type === 'entry').reduce((sum, t) => sum + t.amount, 0);
      const exits = monthTransactions.filter(t => t.type === 'exit').reduce((sum, t) => sum + t.amount, 0);
      const registrationsTotal = monthRegistrations.reduce((sum, r) => sum + r.amount, 0);
      const prebendasEntries = monthPrebendas.filter(p => p.type === 'entry').reduce((sum, p) => sum + p.amount, 0);
      const prebendasExits = monthPrebendas.filter(p => p.type === 'exit').reduce((sum, p) => sum + p.amount, 0);

      return {
        month,
        totalEntries: entries + prebendasEntries + registrationsTotal,
        totalExits: exits + prebendasExits,
        balance: (entries + prebendasEntries + registrationsTotal) - (exits + prebendasExits)
      };
    });

    return {
      labels: months,
      datasets: [
        {
          label: 'Receitas Totais',
          data: monthlyData.map(d => d.totalEntries),
          backgroundColor: 'rgba(16, 185, 129, 0.8)',
          borderColor: 'rgba(16, 185, 129, 1)',
          borderWidth: 2,
        },
        {
          label: 'Saídas Totais',
          data: monthlyData.map(d => d.totalExits),
          backgroundColor: 'rgba(239, 68, 68, 0.8)',
          borderColor: 'rgba(239, 68, 68, 1)',
          borderWidth: 2,
        },
        {
          label: 'Saldo',
          type: 'line' as const,
          data: monthlyData.map(d => d.balance),
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 3,
          fill: false,
        }
      ],
    };
  }, [transactions, registrations, prebendas]);

  // Sector Analysis Chart Data
  const sectorAnalysisData = useMemo(() => {
    const dateRange = period === 'custom' ? getCustomDateRange() : getDateRange(new Date(startDate), period);

    // Validate date range
    if (!dateRange.start || !dateRange.end || isAfter(dateRange.start, dateRange.end)) {
      return { labels: [], datasets: [{ label: 'Valor Total por Setor', data: [], backgroundColor: [], borderColor: [], borderWidth: 2 }] };
    }

    const sectorData: Record<string, number> = {};

    // Initialize sectors
    Object.keys(SECTORS).forEach(sector => {
      sectorData[sector] = 0;
    });

    // Add transaction data
    transactions.forEach(t => {
      try {
        if (isWithinInterval(new Date(t.date), dateRange) && t.field) {
          const sector = Object.keys(SECTORS).find(s =>
            SECTORS[s as keyof typeof SECTORS].includes(t.field!)
          );
          if (sector) {
            sectorData[sector] += t.amount;
          }
        }
      } catch (error) {
        // Skip invalid dates
      }
    });

    // Add registration data
    registrations.forEach(r => {
      try {
        if (isWithinInterval(new Date(r.date), dateRange)) {
          const sector = Object.keys(SECTORS).find(s =>
            SECTORS[s as keyof typeof SECTORS].includes(r.field)
          );
          if (sector) {
            sectorData[sector] += r.amount;
          }
        }
      } catch (error) {
        // Skip invalid dates
      }
    });

    // Add prebenda data
    prebendas.forEach(p => {
      try {
        if (isWithinInterval(new Date(p.date), dateRange) && p.field) {
          const sector = Object.keys(SECTORS).find(s =>
            SECTORS[s as keyof typeof SECTORS].includes(p.field!)
          );
          if (sector) {
            sectorData[sector] += p.amount;
          }
        }
      } catch (error) {
        // Skip invalid dates
      }
    });

    return {
      labels: Object.keys(sectorData),
      datasets: [{
        label: 'Valor Total por Setor',
        data: Object.values(sectorData),
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(156, 163, 175, 0.8)',
          'rgba(251, 146, 60, 0.8)',
          'rgba(14, 165, 233, 0.8)',
          'rgba(139, 92, 246, 0.8)',
        ],
        borderColor: [
          'rgba(16, 185, 129, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(168, 85, 247, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(156, 163, 175, 1)',
          'rgba(251, 146, 60, 1)',
          'rgba(14, 165, 233, 1)',
          'rgba(139, 92, 246, 1)',
        ],
        borderWidth: 2,
      }],
    };
  }, [transactions, registrations, prebendas, startDate, endDate, period]);

  // Field Performance Chart Data
  const fieldPerformanceData = useMemo(() => {
    const dateRange = period === 'custom' ? getCustomDateRange() : getDateRange(new Date(startDate), period);

    // Validate date range
    if (!dateRange.start || !dateRange.end || isAfter(dateRange.start, dateRange.end)) {
      return { labels: [], datasets: [{ label: 'Receitas', data: [], backgroundColor: 'rgba(16, 185, 129, 0.8)', borderColor: 'rgba(16, 185, 129, 1)', borderWidth: 2 }, { label: 'Saídas', data: [], backgroundColor: 'rgba(239, 68, 68, 0.8)', borderColor: 'rgba(239, 68, 68, 1)', borderWidth: 2 }] };
    }

    const fieldData: Record<string, { entries: number, exits: number }> = {};

    // Initialize fields
    FIELDS.forEach(field => {
      fieldData[field] = { entries: 0, exits: 0 };
    });

    // Add transaction data
    transactions.forEach(t => {
      try {
        if (isWithinInterval(new Date(t.date), dateRange) && t.field) {
          if (t.type === 'entry') {
            fieldData[t.field].entries += t.amount;
          } else {
            fieldData[t.field].exits += t.amount;
          }
        }
      } catch (error) {
        // Skip invalid dates
      }
    });

    // Add registration data (all as entries)
    registrations.forEach(r => {
      try {
        if (isWithinInterval(new Date(r.date), dateRange)) {
          fieldData[r.field].entries += r.amount;
        }
      } catch (error) {
        // Skip invalid dates
      }
    });

    // Add prebenda data
    prebendas.forEach(p => {
      try {
        if (isWithinInterval(new Date(p.date), dateRange) && p.field) {
          if (p.type === 'entry') {
            fieldData[p.field].entries += p.amount;
          } else {
            fieldData[p.field].exits += p.amount;
          }
        }
      } catch (error) {
        // Skip invalid dates
      }
    });

    // Filter fields with data
    const fieldsWithData = Object.entries(fieldData)
      .filter(([_, data]) => data.entries > 0 || data.exits > 0)
      .slice(0, 10); // Show top 10 fields

    return {
      labels: fieldsWithData.map(([field]) => field),
      datasets: [
        {
          label: 'Receitas',
          data: fieldsWithData.map(([_, data]) => data.entries),
          backgroundColor: 'rgba(16, 185, 129, 0.8)',
          borderColor: 'rgba(16, 185, 129, 1)',
          borderWidth: 2,
        },
        {
          label: 'Saídas',
          data: fieldsWithData.map(([_, data]) => data.exits),
          backgroundColor: 'rgba(239, 68, 68, 0.8)',
          borderColor: 'rgba(239, 68, 68, 1)',
          borderWidth: 2,
        }
      ],
    };
  }, [transactions, registrations, prebendas, startDate, endDate, period]);

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

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
      },
    },
  };

  const handleDownloadPDF = () => {
    const periodLabel = {
      daily: 'Diário',
      weekly: 'Semanal',
      monthly: 'Mensal',
      quarterly: 'Trimestral',
      annual: 'Anual'
    }[period];

    const title = `Relatório ${periodLabel} - ${format(new Date(startDate), 'dd/MM/yyyy', { locale: ptBR })}`;

    if (reportType === 'transactions') {
      generateTransactionsPDF(filteredData as Transaction[], title);
    } else if (reportType === 'registrations') {
      generateRegistrationsPDF(filteredData as Registration[], title);
    } else if (reportType === 'prebenda') {
      generatePrebendaPDF(filteredData as any[], title);
    } else if (reportType === 'field' && selectedField) {
      const fieldData = filteredData as { transactions: Transaction[], registrations: Registration[], prebendas: any[] };
      const fieldTitle = `Relatório ${periodLabel} - Campo ${selectedField} - ${format(new Date(startDate), 'dd/MM/yyyy', { locale: ptBR })}`;
      generateFieldReportPDF(fieldData, fieldTitle, selectedField);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const clearFilters = () => {
    setSelectedField('');
    setSelectedSector('');
  };

  const activeFiltersCount = [
    selectedField !== '',
    selectedSector !== ''
  ].filter(Boolean).length;

  const total = reportType === 'field'
    ? (filteredData && typeof filteredData === 'object' && 'transactions' in filteredData
      ? (filteredData as { transactions: Transaction[], registrations: Registration[], prebendas: any[] }).transactions.reduce((sum, t) => sum + t.amount, 0) +
      (filteredData as { transactions: Transaction[], registrations: Registration[], prebendas: any[] }).registrations.reduce((sum, r) => sum + r.amount, 0) +
      (filteredData as { transactions: Transaction[], registrations: Registration[], prebendas: any[] }).prebendas.reduce((sum, p) => sum + p.amount, 0)
      : 0)
    : (filteredData && Array.isArray(filteredData) ? filteredData.reduce((sum: number, item: any) => sum + item.amount, 0) : 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Relatórios e Gráficos</h2>
          <p className="text-emerald-600">Análise visual e relatórios detalhados</p>
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

      {/* Main Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-emerald-100">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Relatório
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="charts">Gráficos</option>
              <option value="transactions">Transações</option>
              <option value="registrations">Agenda completa</option>
              <option value="prebenda">Prebenda</option>
              <option value="field">Por Campo</option>
            </select>
          </div>

          {reportType === 'field' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Campo
              </label>
              <select
                value={selectedField}
                onChange={(e) => setSelectedField(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              >
                <option value="">Selecione um campo</option>
                {FIELDS.map((field) => (
                  <option key={field} value={field}>{field}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Período
            </label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="daily">Diário</option>
              <option value="weekly">Semanal</option>
              <option value="monthly">Mensal</option>
              <option value="quarterly">Trimestral</option>
              <option value="annual">Anual</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data de Início
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data de Fim
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div className="flex items-end">
            {reportType !== 'charts' ? (
              <button
                onClick={handleDownloadPDF}
                disabled={(reportType === 'field' && !selectedField)}
                className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center space-x-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                <span>PDF</span>
              </button>
            ) : (
              <button
                onClick={handlePrint}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-emerald-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Filter className="w-5 h-5 text-emerald-600" />
              <span>Filtros Avançados</span>
            </h3>
            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-sm text-red-600 hover:text-red-800 transition-colors flex items-center space-x-1"
              >
                <X className="w-4 h-4" />
                <span>Limpar Filtros</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Setor
              </label>
              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">Todos os Setores</option>
                {Object.keys(SECTORS).map((sector) => (
                  <option key={sector} value={sector}>{sector}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Campo
              </label>
              <select
                value={selectedField}
                onChange={(e) => setSelectedField(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                disabled={!selectedSector}
              >
                <option value="">
                  {selectedSector ? 'Selecione um campo' : 'Primeiro selecione um setor'}
                </option>
                {selectedSector && SECTORS[selectedSector as keyof typeof SECTORS].map((field) => (
                  <option key={field} value={field}>{field}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filters Summary */}
          {activeFiltersCount > 0 && (
            <div className="mt-4 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
              <p className="text-sm text-emerald-800">
                <span className="font-medium">Filtros ativos:</span>
                {selectedSector && <span className="ml-2 px-2 py-1 bg-emerald-100 rounded text-xs">{selectedSector}</span>}
                {selectedField && <span className="ml-2 px-2 py-1 bg-emerald-100 rounded text-xs">{selectedField}</span>}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Charts Section */}
      {reportType === 'charts' && (
        <div className="space-y-8">
          {/* Chart Type Selection */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-emerald-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tipo de Gráfico</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={() => setChartType('revenue-distribution')}
                className={`p-4 rounded-lg border-2 transition-all ${chartType === 'revenue-distribution'
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : 'border-gray-200 hover:border-emerald-300'
                  }`}
              >
                <PieChart className="w-8 h-8 mx-auto mb-2" />
                <p className="font-medium">Distribuição por Categoria</p>
                <p className="text-sm text-gray-600">Receitas principais</p>
              </button>

              <button
                onClick={() => setChartType('period-comparison')}
                className={`p-4 rounded-lg border-2 transition-all ${chartType === 'period-comparison'
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : 'border-gray-200 hover:border-emerald-300'
                  }`}
              >
                <BarChart3 className="w-8 h-8 mx-auto mb-2" />
                <p className="font-medium">Comparação Mensal</p>
                <p className="text-sm text-gray-600">Receitas vs Saídas</p>
              </button>

              <button
                onClick={() => setChartType('sector-analysis')}
                className={`p-4 rounded-lg border-2 transition-all ${chartType === 'sector-analysis'
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : 'border-gray-200 hover:border-emerald-300'
                  }`}
              >
                <MapPin className="w-8 h-8 mx-auto mb-2" />
                <p className="font-medium">Análise por Setor</p>
                <p className="text-sm text-gray-600">Performance setorial</p>
              </button>

              <button
                onClick={() => setChartType('field-performance')}
                className={`p-4 rounded-lg border-2 transition-all ${chartType === 'field-performance'
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : 'border-gray-200 hover:border-emerald-300'
                  }`}
              >
                <TrendingUp className="w-8 h-8 mx-auto mb-2" />
                <p className="font-medium">Performance por Campo</p>
                <p className="text-sm text-gray-600">Top 10 campos</p>
              </button>
            </div>
          </div>

          {/* Chart Display */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-emerald-100">
            {chartType === 'revenue-distribution' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                    <PieChart className="w-5 h-5 text-emerald-600" />
                    <span>Distribuição de Receitas por Categoria</span>
                  </h3>
                  <button
                    onClick={() => generateChartPDF('revenue-distribution-chart', 'Distribuição de Receitas por Categoria')}
                    className="px-3 py-1 text-sm bg-emerald-100 text-emerald-700 rounded hover:bg-emerald-200 transition-colors"
                  >
                    Baixar Gráfico
                  </button>
                </div>
                <div id="revenue-distribution-chart" className="h-96">
                  <Pie data={revenueDistributionData} options={pieChartOptions} />
                </div>
              </div>
            )}

            {chartType === 'period-comparison' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5 text-emerald-600" />
                    <span>Comparação Mensal - {getYear(new Date())}</span>
                  </h3>
                  <button
                    onClick={() => generateChartPDF('period-comparison-chart', 'Comparação Mensal')}
                    className="px-3 py-1 text-sm bg-emerald-100 text-emerald-700 rounded hover:bg-emerald-200 transition-colors"
                  >
                    Baixar Gráfico
                  </button>
                </div>
                <div id="period-comparison-chart" className="h-96">
                  <Bar data={periodComparisonData} options={chartOptions} />
                </div>
              </div>
            )}

            {chartType === 'sector-analysis' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                    <MapPin className="w-5 h-5 text-emerald-600" />
                    <span>Análise por Setor</span>
                  </h3>
                  <button
                    onClick={() => generateChartPDF('sector-analysis-chart', 'Análise por Setor')}
                    className="px-3 py-1 text-sm bg-emerald-100 text-emerald-700 rounded hover:bg-emerald-200 transition-colors"
                  >
                    Baixar Gráfico
                  </button>
                </div>
                <div id="sector-analysis-chart" className="h-96">
                  <Bar data={sectorAnalysisData} options={chartOptions} />
                </div>
              </div>
            )}

            {chartType === 'field-performance' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                    <span>Performance por Campo (Top 10)</span>
                  </h3>
                  <button
                    onClick={() => generateChartPDF('field-performance-chart', 'Performance por Campo')}
                    className="px-3 py-1 text-sm bg-emerald-100 text-emerald-700 rounded hover:bg-emerald-200 transition-colors"
                  >
                    Baixar Gráfico
                  </button>
                </div>
                <div id="field-performance-chart" className="h-96">
                  <Bar data={fieldPerformanceData} options={chartOptions} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Field Report Summary */}
      {reportType === 'field' && selectedField && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-emerald-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-emerald-600" />
            <span>Relatório do Campo: {selectedField}</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="p-4 bg-emerald-50 rounded-lg">
              <p className="text-sm text-emerald-700 font-medium">Transações</p>
              <p className="text-2xl font-bold text-emerald-900">
                {(filteredData as { transactions: Transaction[], registrations: Registration[], prebendas: any[] }).transactions.length}
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700 font-medium">Agenda</p>
              <p className="text-2xl font-bold text-blue-900">
                {(filteredData as { transactions: Transaction[], registrations: Registration[], prebendas: any[] }).registrations.length}
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-700 font-medium">Prebendas</p>
              <p className="text-2xl font-bold text-purple-900">
                {(filteredData as { transactions: Transaction[], registrations: Registration[], prebendas: any[] }).prebendas.length}
              </p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <p className="text-sm text-orange-700 font-medium">Total Geral</p>
              <p className="text-2xl font-bold text-orange-900">R$ {total.toFixed(2)}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700 font-medium">Período</p>
              <p className="text-lg font-bold text-gray-900">
                {format(new Date(startDate), 'MMM yyyy', { locale: ptBR })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Prebenda Report Summary */}
      {reportType === 'prebenda' && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-emerald-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            <span>Resumo de Prebenda</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-emerald-50 rounded-lg">
              <p className="text-sm text-emerald-700 font-medium">Total Entradas</p>
              <p className="text-2xl font-bold text-emerald-900">
                R$ {(filteredData as any[]).filter(p => p.type === 'entry').reduce((sum, p) => sum + p.amount, 0).toFixed(2)}
              </p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-red-700 font-medium">Total Saídas</p>
              <p className="text-2xl font-bold text-red-900">
                R$ {(filteredData as any[]).filter(p => p.type === 'exit').reduce((sum, p) => sum + p.amount, 0).toFixed(2)}
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700 font-medium">Total Registros</p>
              <p className="text-2xl font-bold text-blue-900">
                {Array.isArray(filteredData) ? filteredData.length : 0}
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-700 font-medium">Período</p>
              <p className="text-lg font-bold text-purple-900">
                {format(new Date(startDate), 'MMM yyyy', { locale: ptBR })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Summary for other report types */}
      {!['field', 'prebenda', 'charts'].includes(reportType) && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-emerald-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            <span>Resumo do Período</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-emerald-50 rounded-lg">
              <p className="text-sm text-emerald-700 font-medium">Total de Registros</p>
              <p className="text-2xl font-bold text-emerald-900">
                {Array.isArray(filteredData) ? filteredData.length : 0}
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700 font-medium">Valor Total</p>
              <p className="text-2xl font-bold text-blue-900">R$ {total.toFixed(2)}</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-700 font-medium">Período</p>
              <p className="text-lg font-bold text-purple-900">
                {format(new Date(startDate), 'MMM yyyy', { locale: ptBR })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* No Data Message */}
      {reportType !== 'charts' && ((Array.isArray(filteredData) && filteredData.length === 0) ||
        (reportType === 'field' && (!selectedField ||
          ((filteredData as { transactions: Transaction[], registrations: Registration[], prebendas: any[] }).transactions.length === 0 &&
            (filteredData as { transactions: Transaction[], registrations: Registration[], prebendas: any[] }).registrations.length === 0 &&
            (filteredData as { transactions: Transaction[], registrations: Registration[], prebendas: any[] }).prebendas.length === 0)))) && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-emerald-100">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {reportType === 'field' && !selectedField
                ? 'Selecione um campo para visualizar o relatório'
                : 'Nenhum dado encontrado'
              }
            </h3>
            <p className="text-gray-500">
              {reportType === 'field' && !selectedField
                ? 'Escolha um campo na lista acima para gerar o relatório específico.'
                : `Não há ${reportType === 'transactions' ? 'transações' : reportType === 'registrations' ? 'agenda' : reportType === 'prebenda' ? 'prebendas' : 'dados'} para o período selecionado.`
              }
            </p>
          </div>
        )}
    </div>
  );
}