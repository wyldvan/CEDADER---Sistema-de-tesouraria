// project/src/components/RegistrationForm.tsx - VERSÃO CORRIGIDA E FINAL

import React, { useState, useEffect } from 'react'; // Adicionado useEffect
import { useRegistrations } from '../hooks/useRegistrations';
import { useAuth } from '../contexts/AuthContext';
import { SECTORS, MONTHS, CATEGORIES, Registration } from '../types'; // Adicionado Registration
import { Plus, X, MapPin } from 'lucide-react';

// Importe as funções do nosso arquivo de utilitários central
import { formatCurrency, parseToNumber } from '../utils/formatters';

interface RegistrationFormProps {
  isOpen: boolean;
  onClose: () => void;
  editRegistration?: Registration; // Adicionado para permitir edição
}

// Função auxiliar para a máscara de input
const formatInputAsCurrency = (value: string): string => {
  if (!value) return '';
  const digitsOnly = value.replace(/\D/g, '');
  if (digitsOnly === '') return '';
  const numberValue = parseInt(digitsOnly, 10) / 100;
  return formatCurrency(numberValue);
};

export function RegistrationForm({ isOpen, onClose, editRegistration }: RegistrationFormProps) {
  const [sector, setSector] = useState('');
  const [field, setField] = useState('');
  const [month, setMonth] = useState('');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState(''); // Armazena a string formatada

  const { addRegistration, updateRegistration } = useRegistrations(); // Supondo que exista updateRegistration
  const { user } = useAuth();

  // Efeito para popular ou resetar o formulário
  useEffect(() => {
    if (isOpen) {
      if (editRegistration) {
        setSector(editRegistration.sector || '');
        setField(editRegistration.field || '');
        setMonth(editRegistration.month || '');
        setCategory(editRegistration.category || '');
        setAmount(formatCurrency(editRegistration.amount)); // Formata para exibição
      } else {
        // Reset para um novo formulário
        setSector('');
        setField('');
        setMonth('');
        setCategory('');
        setAmount('');
      }
    }
  }, [isOpen, editRegistration]);

  const handleSectorChange = (selectedSector: string) => {
    setSector(selectedSector);
    setField('');
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatInputAsCurrency(e.target.value);
    setAmount(formattedValue);
  };

  const getFieldsForSector = (sectorName: string) => {
    return SECTORS[sectorName as keyof typeof SECTORS] || [];
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Converte a string formatada de volta para um NÚMERO
    const amountNumber = parseToNumber(amount);

    // 2. Validação
    if (!sector || !field || !month || !category || amountNumber <= 0) {
      alert("Por favor, preencha todos os campos obrigatórios (*). O valor deve ser maior que zero.");
      return;
    }

    // 3. Monta o objeto de dados com o NÚMERO, não a string
    const registrationData = {
      sector,
      field,
      month,
      category,
      amount: amountNumber, // <<-- A CORREÇÃO CRUCIAL ESTÁ AQUI
      createdBy: user?.username || 'unknown'
    };

    // 4. Envia os dados corretos para a API
    if (editRegistration) {
      updateRegistration(editRegistration.id, registrationData);
    } else {
      addRegistration(registrationData);
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              {editRegistration ? 'Editar' : 'Nova'} Agenda Financeira
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Setor *</label>
              <select value={sector} onChange={(e) => handleSectorChange(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required>
                <option value="">Selecione um setor</option>
                {Object.keys(SECTORS).map((sectorName) => (<option key={sectorName} value={sectorName}>{sectorName}</option>))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Campo *</label>
              <select value={field} onChange={(e) => setField(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required disabled={!sector}>
                <option value="">{sector ? 'Selecione um campo' : 'Primeiro selecione um setor'}</option>
                {sector && getFieldsForSector(sector).map((fieldName) => (<option key={fieldName} value={fieldName}>{fieldName}</option>))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mês *</label>
              <select value={month} onChange={(e) => setMonth(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required>
                <option value="">Selecione um mês</option>
                {MONTHS.map((m) => (<option key={m} value={m}>{m}</option>))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoria *</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required>
                <option value="">Selecione uma categoria</option>
                {CATEGORIES.entry.map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
              </select>
            </div>

            {/* CAMPO DE VALOR CORRIGIDO */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor *</label>
              <input
                type="text" // Mude para "text" para a máscara funcionar
                value={amount}
                onChange={handleAmountChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="R$ 0,00"
                required
              />
            </div>

            {sector && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center space-x-1"><MapPin className="w-4 h-4" /><span>{sector}</span></h4>
                <div className="text-xs text-blue-700">
                  <span className="font-medium">Campos disponíveis:</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {getFieldsForSector(sector).map((fieldName) => (<span key={fieldName} className={`px-2 py-1 rounded text-xs ${field === fieldName ? 'bg-blue-200 text-blue-900 font-medium' : 'bg-blue-100 text-blue-800'}`}>{fieldName}</span>))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">Cancelar</button>
              <button type="submit" className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all flex items-center justify-center space-x-2"><Plus className="w-4 h-4" /><span>{editRegistration ? 'Atualizar' : 'Adicionar'}</span></button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
