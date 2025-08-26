import React, { useState, useMemo } from 'react';
import { useFinancialGoals } from '../hooks/useFinancialGoals';
import { useAuth } from '../contexts/AuthContext';
import { FinancialGoalsForm } from './FinancialGoalsForm';
import { FIELDS, MONTHS, FinancialGoal } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Target, TrendingUp, TrendingDown, Award, AlertTriangle, CheckCircle, Plus, Edit2, Trash2, BarChart3, PieChart, Calendar, Filter, X, Download, Printer } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { generateFinancialGoalsPDF } from '../utils/pdfGenerator';
import { formatCurrency } from '../utils/formatters';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export function FinancialGoalsDashboard() {
  const { goals, deleteGoal, getGoalsProgress, getGoalsSummary } = useFinancialGoals();
  const { isAdmin } = useAuth();

  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<FinancialGoal | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedField, setSelectedField] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Get available years from goals
  const availableYears = useMemo(() => {
    const years = [...new Set(goals.map(g => g.year))];
    return years.sort((a, b) => b - a);
  }, [goals]);

  // Get fields with goals for selected year
  const fieldsWithGoals = useMemo(() => {
    return [...new Set(goals.filter(g => g.year === selectedYear && g.isActive).map(g => g.field))];
  }, [goals, selectedYear]);

  const progress = getGoalsProgress(selectedYear);
  const summary = getGoalsSummary(selectedYear);

  // Filter progress by selected field
  const filteredProgress = useMemo(() => {
    return selectedField
      ? progress.filter(p => p.field === selectedField)
      : progress;
  }, [progress, selectedField]);

  // Chart data for monthly progress
  const monthlyChartData = {
    labels: MONTHS,
    datasets: [
      {
        label: 'Meta',
        data: MONTHS.map(month => {
          const monthProgress = filteredProgress.filter(p => p.month === month);
          return monthProgress.reduce((sum, p) => sum + p.goalAmount, 0);
        }),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
      },
      {
        label: 'Realizado',
        data: MONTHS.map(month => {
          const monthProgress = filteredProgress.filter(p => p.month === month);
          return monthProgress.reduce((sum, p) => sum + p.actualAmount, 0);
        }),
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 2,
      }
    ],
  };

  // Chart data for field performance
  const fieldChartData = {
    labels: fieldsWithGoals.slice(0, 10), // Top 10 fields
    datasets: [
      {
        label: 'Meta Anual',
        data: fieldsWithGoals.slice(0, 10).map(field => {
          const fieldProgress = progress.filter(p => p.field === field && p.month === 'Anual');
          return fieldProgress.reduce((sum, p) => sum + p.goalAmount, 0);
        }),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
      },
      {
        label: 'Realizado',
        data: fieldsWithGoals.slice(0, 10).map(field => {
          const fieldProgress = progress.filter(p => p.field === field && p.month === 'Anual');
          return fieldProgress.reduce((sum, p) => sum + p.actualAmount, 0);
        }),
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 2,
      }
    ],
  };

  // Status distribution chart
  const statusChartData = {
    labels: ['Superou Meta', 'No Caminho Certo', 'Abaixo da Meta'],
    datasets: [
      {
        data: [
          summary.achievedMonthly + summary.achievedAnnual,
          summary.onTrackMonthly + summary.onTrackAnnual,
          summary.belowMonthly + summary.belowAnnual
        ],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)',
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

  const handleEditGoal = (goal: FinancialGoal) => {
    setEditingGoal(goal);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingGoal(null);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'exceeded': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'on-track': return <TrendingUp className="w-4 h-4 text-yellow-600" />;
      case 'below': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'exceeded': return 'bg-green-100 text-green-800 border-green-200';
      case 'on-track': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'below': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const clearFilters = () => {
    setSelectedField('');
  };

  const activeFiltersCount = selectedField !== '' ? 1 : 0;

  const handleDownloadPDF = () => {
    const filterDescription = [];
    if (selectedField) filterDescription.push(selectedField);

    const title = `Relatório de Metas Financeiras ${selectedYear}${filterDescription.length > 0 ? ` - ${filterDescription.join(', ')}` : ''}`;
    generateFinancialGoalsPDF(filteredProgress, goals.filter(g => g.year === selectedYear), summary, title, selectedYear);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
            <Target className="w-8 h-8 text-blue-600" />
            <span>Metas Financeiras</span>
          </h2>
          <p className="text-blue-600 mt-1">
            Acompanhamento de metas para todos os 83 campos
            {selectedField && <span className="ml-2 text-sm">(Campo: {selectedField})</span>}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {availableYears.length > 0 ? (
              availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))
            ) : (
              <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
            )}
          </select>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${showFilters || activeFiltersCount > 0
              ? 'bg-blue-100 text-blue-700 border border-blue-300'
              : 'bg-gray-100 text-gray-700 border border-gray-300'
              }`}
          >
            <Filter className="w-4 h-4" />
            <span>Filtros</span>
            {activeFiltersCount > 0 && (
              <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {isAdmin() && (
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Meta</span>
            </button>
          )}

          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>PDF</span>
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-blue-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Filter className="w-5 h-5 text-blue-600" />
              <span>Filtros de Metas</span>
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
                Campo
              </label>
              <select
                value={selectedField}
                onChange={(e) => setSelectedField(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todos os Campos</option>
                {fieldsWithGoals.map((field) => (
                  <option key={field} value={field}>{field}</option>
                ))}
              </select>
            </div>
          </div>

          {activeFiltersCount > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <span className="font-medium">Filtros ativos:</span>
                {selectedField && <span className="ml-2 px-2 py-1 bg-blue-100 rounded text-xs">{selectedField}</span>}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Metas Ativas</p>
              <p className="text-2xl font-bold text-blue-600">{summary.totalGoals}</p>
              <p className="text-xs text-gray-500 mt-1">Campos com metas</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Metas Superadas</p>
              <p className="text-2xl font-bold text-green-600">
                {summary.achievedMonthly + summary.achievedAnnual}
              </p>
              <p className="text-xs text-gray-500 mt-1">Mensais + Anuais</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Award className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-yellow-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">No Caminho Certo</p>
              <p className="text-2xl font-bold text-yellow-600">
                {summary.onTrackMonthly + summary.onTrackAnnual}
              </p>
              <p className="text-xs text-gray-500 mt-1">80-99% da meta</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-red-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Abaixo da Meta</p>
              <p className="text-2xl font-bold text-red-600">
                {summary.belowMonthly + summary.belowAnnual}
              </p>
              <p className="text-xs text-gray-500 mt-1">Precisam atenção</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      {filteredProgress.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-blue-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <span>Progresso Mensal {selectedYear}</span>
            </h3>
            <div>
              <Bar data={monthlyChartData} options={chartOptions} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-blue-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <span>Top 10 Campos</span>
            </h3>
            <div>
              <Bar data={fieldChartData} options={chartOptions} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-blue-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <PieChart className="w-5 h-5 text-blue-600" />
              <span>Status das Metas</span>
            </h3>
            <div>
              <Pie data={statusChartData} />
            </div>
          </div>
        </div>
      )}

      {/* Progress Table */}
      {filteredProgress.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-blue-100">
          <div className="px-6 py-4 border-b border-blue-100">
            <h3 className="text-lg font-semibold text-gray-900">
              Progresso Detalhado {selectedYear}
              {selectedField && <span className="text-sm font-normal text-gray-600 ml-2">- {selectedField}</span>}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-blue-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                    Campo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                    Período
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                    Meta
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                    Realizado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                    Progresso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-blue-100">
                {filteredProgress.slice(0, 20).map((item, index) => (
                  <tr key={index} className="hover:bg-blue-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.field}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${item.month === 'Anual'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                        }`}>
                        {item.month}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      {formatCurrency(item.goalAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      {formatCurrency(item.actualAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${item.percentage >= 100 ? 'bg-green-500' :
                              item.percentage >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                            style={{ width: `${Math.min(item.percentage, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900 min-w-[50px]">
                          {formatCurrency(item.percentage)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`flex items-center space-x-2 px-2 py-1 rounded-full border ${getStatusColor(item.status)}`}>
                        {getStatusIcon(item.status)}
                        <span className="text-xs font-medium">
                          {item.status === 'exceeded' ? 'Superou' :
                            item.status === 'on-track' ? 'No Caminho' : 'Abaixo'}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Goals Management */}
      {isAdmin() && goals.filter(g => g.year === selectedYear).length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-blue-100">
          <div className="px-6 py-4 border-b border-blue-100">
            <h3 className="text-lg font-semibold text-gray-900">Gerenciar Metas {selectedYear}</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {goals.filter(g => g.year === selectedYear && g.isActive).map((goal) => (
                <div key={goal.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{goal.field}</h4>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditGoal(goal)}
                        className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteGoal(goal.id)}
                        className="p-1 text-red-600 hover:text-red-800 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Meta Anual: <span className="font-medium text-blue-600">{formatCurrency(goal.annualGoal)}</span>
                  </p>
                  <p className="text-xs text-gray-500">
                    {Object.keys(goal.monthlyGoals).length} meses configurados
                  </p>
                  {goal.description && (
                    <p className="text-xs text-gray-600 mt-2">{goal.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* No Data Message */}
      {goals.filter(g => g.year === selectedYear).length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-blue-100">
          <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma meta configurada para {selectedYear}</h3>
          <p className="text-gray-500 mb-4">
            Comece criando metas financeiras para os campos usando o botão "Nova Meta".
          </p>
          {isAdmin() && (
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Criar primeira meta
            </button>
          )}
        </div>
      )}

      {/* Form */}
      <FinancialGoalsForm
        isOpen={showForm}
        onClose={handleCloseForm}
        editGoal={editingGoal}
      />
    </div>
  );
}