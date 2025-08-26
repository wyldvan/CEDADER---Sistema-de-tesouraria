import React from 'react';
import { usePayments } from '../hooks/usePayments';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CreditCard, TrendingDown, BarChart3, PieChart, ArrowDownCircle } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export function PaymentDashboard() {
  const { payments, getTotalPayments, getPaymentsByCategory, getPaymentsByMonth, getPaymentsByPaymentMethod } = usePayments();

  const totalPayments = getTotalPayments();
  const paymentsByCategory = getPaymentsByCategory();
  const paymentsByMonth = getPaymentsByMonth();
  const paymentsByMethod = getPaymentsByPaymentMethod();

  const categoryChartData = {
    labels: Object.keys(paymentsByCategory),
    datasets: [
      {
        label: 'Valor por Categoria',
        data: Object.values(paymentsByCategory),
        backgroundColor: 'rgba(249, 115, 22, 0.8)',
        borderColor: 'rgba(249, 115, 22, 1)',
        borderWidth: 2,
      },
    ],
  };

  const monthChartData = {
    labels: Object.keys(paymentsByMonth),
    datasets: [
      {
        label: 'Pagamentos por Mês',
        data: Object.values(paymentsByMonth),
        backgroundColor: [
          'rgba(249, 115, 22, 0.8)',
          'rgba(251, 146, 60, 0.8)',
          'rgba(253, 186, 116, 0.8)',
          'rgba(254, 215, 170, 0.8)',
          'rgba(255, 237, 213, 0.8)',
          'rgba(234, 88, 12, 0.8)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const methodChartData = {
    labels: ['PIX', 'Dinheiro', 'Transferência'],
    datasets: [
      {
        data: [paymentsByMethod.pix, paymentsByMethod.cash, paymentsByMethod.transfer],
        backgroundColor: [
          'rgba(249, 115, 22, 0.8)',
          'rgba(251, 146, 60, 0.8)',
          'rgba(253, 186, 116, 0.8)',
        ],
        borderColor: [
          'rgba(249, 115, 22, 1)',
          'rgba(251, 146, 60, 1)',
          'rgba(253, 186, 116, 1)',
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

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
            <CreditCard className="w-8 h-8 text-orange-600" />
            <span>Painel de Pagamentos</span>
          </h2>
          <p className="text-orange-600 mt-1">Controle de pagamentos especiais</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-orange-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Pagamentos</p>
              <p className="text-2xl font-bold text-orange-600">R$ {totalPayments.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <CreditCard className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-orange-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Registros</p>
              <p className="text-2xl font-bold text-gray-900">{payments.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-orange-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Categorias</p>
              <p className="text-2xl font-bold text-purple-600">{Object.keys(paymentsByCategory).length}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <PieChart className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-orange-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Média Mensal</p>
              <p className="text-2xl font-bold text-green-600">
                R$ {Object.keys(paymentsByMonth).length > 0 ? (totalPayments / Object.keys(paymentsByMonth).length).toFixed(2) : '0.00'}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <TrendingDown className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      {payments.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-orange-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-orange-600" />
              <span>Pagamentos por Categoria</span>
            </h3>
            <div>
              <Bar data={categoryChartData} options={chartOptions} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-orange-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-orange-600" />
              <span>Pagamentos por Mês</span>
            </h3>
            <div>
              <Bar data={monthChartData} options={chartOptions} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-orange-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <PieChart className="w-5 h-5 text-orange-600" />
              <span>Métodos de Pagamento</span>
            </h3>
            <div>
              <Pie data={methodChartData} />
            </div>
          </div>
        </div>
      )}

      {/* Payment Methods Summary */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-orange-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo por Método de Pagamento</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-orange-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="font-medium text-gray-900">PIX</span>
            </div>
            <p className="text-2xl font-bold text-orange-600 mt-2">R$ {paymentsByMethod.pix.toFixed(2)}</p>
          </div>
          <div className="p-4 bg-orange-100 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
              <span className="font-medium text-gray-900">Dinheiro</span>
            </div>
            <p className="text-2xl font-bold text-orange-500 mt-2">R$ {paymentsByMethod.cash.toFixed(2)}</p>
          </div>
          <div className="p-4 bg-orange-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-orange-300 rounded-full"></div>
              <span className="font-medium text-gray-900">Transferência</span>
            </div>
            <p className="text-2xl font-bold text-orange-400 mt-2">R$ {paymentsByMethod.transfer.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Recent Payments */}
      {payments.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-orange-100">
          <div className="px-6 py-4 border-b border-orange-100">
            <h3 className="text-lg font-semibold text-gray-900">Últimos Pagamentos</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-orange-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-orange-800 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-orange-800 uppercase tracking-wider">
                    Categoria
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-orange-800 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-orange-800 uppercase tracking-wider">
                    Método
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-orange-800 uppercase tracking-wider">
                    Descrição
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-orange-100">
                {payments.slice(0, 10).map((payment) => (
                  <tr key={payment.id} className="hover:bg-orange-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {format(new Date(payment.date), 'dd/MM/yyyy', { locale: ptBR })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-orange-600">
                        R$ {payment.amount.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                        {payment.paymentMethod.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {payment.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {payments.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-orange-100">
          <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum pagamento registrado</h3>
          <p className="text-gray-500">
            Comece registrando pagamentos usando o botão de ação rápida.
          </p>
        </div>
      )}
    </div>
  );
}