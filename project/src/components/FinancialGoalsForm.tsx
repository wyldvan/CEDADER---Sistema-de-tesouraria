import React, { useState, useEffect } from 'react';
import { useFinancialGoals } from '../hooks/useFinancialGoals';
import { useAuth } from '../contexts/AuthContext';
import { FIELDS, MONTHS, FinancialGoal } from '../types';
import { Plus, X, Target, MapPin, Calendar, DollarSign, TrendingUp } from 'lucide-react';
import { formatCurrency } from '../utils/formatters'; // Certifique-se que este caminho está correto

// --- INÍCIO DAS FUNÇÕES AUXILIARES ---
// Colocamos estas funções aqui para que o componente possa usá-las.

/**
 * Formata o valor de um input em tempo real como moeda brasileira.
 * Ex: "12345" -> "R$ 123,45"
 */
const formatInputAsCurrency = (value: string): string => {
  if (!value) return '';
  // 1. Remove tudo que não for um dígito numérico
  const digitsOnly = value.replace(/\D/g, '');
  if (digitsOnly === '') return '';

  // 2. Converte a string de dígitos para um número (ex: "12345" -> 123.45)
  const numberValue = parseInt(digitsOnly, 10) / 100;

  // 3. Usa nossa função global para formatar no padrão BRL
  return formatCurrency(numberValue);
};

/**
 * Converte uma string de moeda formatada (ex: "R$ 1.234,56") de volta para um número puro (ex: 1234.56)
 * Essencial para fazer cálculos e salvar no banco de dados.
 */
const parseFormattedCurrency = (value: string): number => {
  if (!value) return 0;
  const digitsOnly = value.replace(/\D/g, '');
  if (digitsOnly === '') return 0;
  return parseFloat(digitsOnly) / 100;
};

// --- FIM DAS FUNÇÕES AUXILIARES ---


export function FinancialGoalsForm({ isOpen, onClose, editGoal }: FinancialGoalsFormProps) {
  const { addGoal, updateGoal } = useFinancialGoals();
  const { user } = useAuth();

  // --- ESTADOS DO COMPONENTE ---
  const [field, setField] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [description, setDescription] = useState('');

  // Os estados de valores agora guardam a STRING FORMATADA para a máscara funcionar
  const [annualGoal, setAnnualGoal] = useState('');
  const [monthlyGoals, setMonthlyGoals] = useState<{ [key: string]: string }>({});

  // --- EFEITO PARA INICIALIZAR/RESETAR O FORMULÁRIO ---
  useEffect(() => {
    if (isOpen) {
      if (editGoal) {
        // Se estiver editando, preenche o formulário com os dados existentes
        setField(editGoal.field);
        setYear(editGoal.year);
        setDescription(editGoal.description || '');
        setAnnualGoal(formatCurrency(editGoal.annualGoal)); // Formata o número para a string de exibição

        const formattedMonthly = Object.fromEntries(
          Object.entries(editGoal.monthlyGoals).map(([month, value]) => [month, formatCurrency(value)])
        );
        setMonthlyGoals(formattedMonthly);
      } else {
        // Se for um novo formulário, reseta todos os campos
        setField('');
        setYear(new Date().getFullYear());
        setDescription('');
        setAnnualGoal('');
        setMonthlyGoals({});
      }
    }
  }, [isOpen, editGoal]); // Roda sempre que o modal abrir ou o 'editGoal' mudar

  // --- HANDLERS (MANIPULADORES DE EVENTOS) ---

  // Handler genérico para os inputs de moeda
  const handleCurrencyInputChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatInputAsCurrency(e.target.value);
    setter(formattedValue);
  };

  // Handler específico para os inputs mensais
  const handleMonthlyGoalChange = (month: string, value: string) => {
    const formattedValue = formatInputAsCurrency(value);
    setMonthlyGoals(prev => ({
      ...prev,
      [month]: formattedValue,
    }));
  };

  const distributeAnnualGoal = () => {
    const annualAmount = parseFormattedCurrency(annualGoal);
    if (annualAmount <= 0) return;

    const monthlyAmount = annualAmount / 12;
    const distributed: { [key: string]: string } = {};

    MONTHS.forEach(month => {
      distributed[month] = formatCurrency(monthlyAmount); // Armazena a string formatada
    });

    setMonthlyGoals(distributed);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const annualAmountNumber = parseFormattedCurrency(annualGoal);
    if (!field || !year || annualAmountNumber <= 0) {
      alert("Por favor, preencha Campo, Ano e Meta Anual.");
      return;
    }

    // Converte os dados de volta para NÚMEROS antes de enviar
    const goalData = {
      field,
      year,
      annualGoal: annualAmountNumber,
      monthlyGoals: Object.fromEntries(
        Object.entries(monthlyGoals)
          .map(([month, value]) => [month, parseFormattedCurrency(value)])
          .filter(([_, numValue]) => numValue > 0)
      ),
      description: description.trim() || undefined,
      isActive: true,
      createdBy: user?.username || 'unknown',
    };

    if (editGoal) {
      updateGoal(editGoal.id, goalData);
    } else {
      addGoal(goalData);
    }
    onClose();
  };

  if (!isOpen) return null;

  // --- CÁLCULOS PARA EXIBIÇÃO ---
  const totalMonthlyGoals = Object.values(monthlyGoals)
    .reduce((sum, value) => sum + parseFormattedCurrency(value), 0);

  const annualAmountNumberForCalc = parseFormattedCurrency(annualGoal);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
              <Target className="w-6 h-6 text-blue-600" />
              <span>{editGoal ? 'Editar Meta' : 'Nova Meta Financeira'}</span>
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h4 className="text-lg font-medium text-blue-800 mb-4 flex items-center space-x-2">
                <Target className="w-5 h-5" />
                <span>Informações da Meta</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Campo *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <select value={field} onChange={(e) => setField(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required>
                      <option value="">Selecione um campo</option>
                      {FIELDS.map((f) => (<option key={f} value={f}>{f}</option>))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ano *</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <select value={year} onChange={(e) => setYear(parseInt(e.target.value))} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required>
                      {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i - 2).map(y => (<option key={y} value={y}>{y}</option>))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Meta Anual *</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    {/* --- INPUT CORRIGIDO --- */}
                    <input
                      type="text"
                      value={annualGoal}
                      onChange={handleCurrencyInputChange(setAnnualGoal)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0,00"
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" rows={2} placeholder="Descrição opcional da meta..." />
              </div>
            </div>

            {/* Monthly Goals */}
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-medium text-green-800 flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>Metas Mensais</span>
                </h4>
                <button type="button" onClick={distributeAnnualGoal} disabled={!annualGoal} className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm disabled:bg-gray-400">
                  Distribuir Igualmente
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {MONTHS.map((month) => (
                  <div key={month}>
                    <label className="block text-xs font-medium text-gray-600 mb-1">{month}</label>
                    {/* --- INPUTS MENSAIS CORRIGIDOS --- */}
                    <input
                      type="text"
                      value={monthlyGoals[month] || ''}
                      onChange={(e) => handleMonthlyGoalChange(month, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                      placeholder="0,00"
                    />
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="mt-4 p-3 bg-white rounded-lg border border-green-300">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Meta Anual:</span>
                    <span className="ml-2 font-bold text-blue-600">{formatCurrency(annualAmountNumberForCalc)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Mensal:</span>
                    <span className="ml-2 font-bold text-green-600">{formatCurrency(totalMonthlyGoals)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Diferença:</span>
                    {/* --- EXIBIÇÃO DA DIFERENÇA CORRIGIDA --- */}
                    <span className={`ml-2 font-bold ${annualAmountNumberForCalc > 0 && totalMonthlyGoals !== annualAmountNumberForCalc ? 'text-orange-600' : 'text-green-600'}`}>
                      {formatCurrency(annualAmountNumberForCalc - totalMonthlyGoals)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex space-x-3 pt-4 border-t border-gray-200">
              <button type="button" onClick={onClose} className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                Cancelar
              </button>
              <button type="submit" className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all flex items-center justify-center space-x-2 font-medium">
                <Plus className="w-5 h-5" />
                <span>{editGoal ? 'Atualizar Meta' : 'Criar Meta'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
