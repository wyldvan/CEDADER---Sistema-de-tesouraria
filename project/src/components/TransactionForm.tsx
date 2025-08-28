// project/src/components/TransactionForm.tsx - VERSÃO CORRIGIDA E FINAL

import React, { useState, useEffect } from 'react'; // Adicionado useEffect
import { useTransactions } from '../hooks/useTransactions';
import { useDocumentRanges } from '../hooks/useDocumentRanges';
import { useAuth } from '../contexts/AuthContext';
import { CATEGORIES, SECTORS, MONTHS, Transaction } from '../types'; // Adicionado Transaction
import { Plus, X, MapPin, FileText, Calendar, AlertTriangle, CheckCircle, Info } from 'lucide-react';

// Importe as funções do nosso arquivo de utilitários central
import { formatCurrency, parseToNumber } from '../utils/formatters';

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'entry' | 'exit';
  editTransaction?: Transaction; // Adicionado para permitir edição
}

// Função auxiliar para a máscara de input
const formatInputAsCurrency = (value: string): string => {
  if (!value) return '';
  const digitsOnly = value.replace(/\D/g, '');
  if (digitsOnly === '') return '';
  const numberValue = parseInt(digitsOnly, 10) / 100;
  return formatCurrency(numberValue);
};

export function TransactionForm({ isOpen, onClose, type, editTransaction }: TransactionFormProps) {
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'cash' | 'transfer'>('pix');
  const [description, setDescription] = useState('');
  const [sector, setSector] = useState('');
  const [field, setField] = useState('');
  const [month, setMonth] = useState('');
  const [startDate, setStartDate] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [documentError, setDocumentError] = useState('');
  const [documentValidation, setDocumentValidation] = useState<{ isValid: boolean, message: string }>({ isValid: true, message: '' });

  const { addTransaction, updateTransaction, transactions } = useTransactions(); // Adicionado updateTransaction
  const { isDocumentNumberInRange } = useDocumentRanges();
  const { user } = useAuth();

  // Efeito para popular ou resetar o formulário
  useEffect(() => {
    if (isOpen) {
      if (editTransaction) {
        setCategory(editTransaction.category || '');
        setAmount(formatCurrency(editTransaction.amount));
        setPaymentMethod(editTransaction.paymentMethod || 'pix');
        setDescription(editTransaction.description || '');
        setSector(editTransaction.sector || '');
        setField(editTransaction.field || '');
        setMonth(editTransaction.month || '');
        setStartDate(editTransaction.startDate ? new Date(editTransaction.startDate).toISOString().split('T')[0] : '');
        setDocumentNumber(editTransaction.documentNumber || '');
      } else {
        // Reset para um novo formulário
        setCategory('');
        setAmount('');
        setPaymentMethod('pix');
        setDescription('');
        setSector('');
        setField('');
        setMonth('');
        setStartDate('');
        setDocumentNumber('');
        setDocumentError('');
        setDocumentValidation({ isValid: true, message: '' });
      }
    }
  }, [isOpen, editTransaction]);

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

  const checkDocumentNumber = (docNumber: string) => {
    if (!docNumber.trim()) {
      setDocumentError('');
      setDocumentValidation({ isValid: true, message: '' });
      return true;
    }
    const normalizedDocNumber = docNumber.trim().toLowerCase();
    const existingTransaction = transactions.find(t =>
      t.documentNumber && t.documentNumber.toLowerCase() === normalizedDocNumber && t.id !== editTransaction?.id
    );
    const prebendas = JSON.parse(localStorage.getItem('cedader_prebendas') || '[]');
    const existingPrebenda = prebendas.find((p: any) =>
      p.documentNumber && p.documentNumber.toLowerCase() === normalizedDocNumber
    );
    if (existingTransaction || existingPrebenda) {
      setDocumentError(`Documento "${docNumber}" já existe!`);
      setDocumentValidation({ isValid: false, message: '' });
      return false;
    }
    const rangeValidation = isDocumentNumberInRange(docNumber);
    setDocumentValidation(rangeValidation);
    if (!rangeValidation.isValid) {
      setDocumentError('');
      return false;
    }
    setDocumentError('');
    return true;
  };

  const handleDocumentNumberChange = (value: string) => {
    setDocumentNumber(value);
    checkDocumentNumber(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Converte a string formatada de volta para um NÚMERO
    const amountNumber = parseToNumber(amount);

    // 2. Validação
    if (!category || amountNumber <= 0 || !description) {
      alert("Por favor, preencha Categoria, Valor e Descrição. O valor deve ser maior que zero.");
      return;
    }
    if (documentNumber && !checkDocumentNumber(documentNumber)) {
      return;
    }

    // 3. Monta o objeto de dados com o NÚMERO, não a string
    const transactionData = {
      type,
      category,
      amount: amountNumber, // <<-- A CORREÇÃO CRUCIAL ESTÁ AQUI
      paymentMethod,
      description,
      field: field || undefined,
      month: month || undefined,
      startDate: startDate || undefined,
      documentNumber: documentNumber.trim() || undefined,
      createdBy: user?.username || 'unknown'
    };

    // 4. Envia os dados corretos para a API
    if (editTransaction) {
      updateTransaction(editTransaction.id, transactionData);
    } else {
      addTransaction(transactionData);
    }

    onClose();
  };

  if (!isOpen) return null;

  const isDocumentValid = !documentNumber || (!documentError && documentValidation.isValid && documentNumber.trim() !== '');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              {editTransaction ? 'Editar' : 'Nova'} {type === 'entry' ? 'Entrada' : 'Saída'}
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* O resto do seu JSX permanece o mesmo, pois a lógica de correção está no handleSubmit */}
            {/* ... cole o resto do seu formulário aqui, desde "Nº do Documento" até o final ... */}
            {/* Nº do Documento - COM VALIDAÇÃO COMPLETA */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nº do Documento
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={documentNumber}
                  onChange={(e) => handleDocumentNumberChange(e.target.value)}
                  className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 transition-colors ${documentError || !documentValidation.isValid
                    ? 'border-red-300 focus:border-red-500 bg-red-50'
                    : documentNumber && documentValidation.isValid && !documentError
                      ? 'border-green-300 focus:border-green-500 bg-green-50'
                      : 'border-gray-300 focus:border-emerald-500'
                    }`}
                  placeholder="Ex: 001, NF-123, REC-456..."
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {documentNumber && ((documentError || !documentValidation.isValid) ? (<AlertTriangle className="w-4 h-4 text-red-500" />) : (<CheckCircle className="w-4 h-4 text-green-500" />))}
                </div>
              </div>
              {documentError && (<div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg"><div className="flex items-center space-x-2"><AlertTriangle className="w-4 h-4 text-red-600" /><span className="text-sm text-red-700 font-medium">{documentError}</span></div></div>)}
              {!documentError && !documentValidation.isValid && documentNumber && (<div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg"><div className="flex items-center space-x-2"><AlertTriangle className="w-4 h-4 text-red-600" /><span className="text-sm text-red-700 font-medium">{documentValidation.message}</span></div></div>)}
              {documentNumber && !documentError && documentValidation.isValid && (<div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg"><div className="flex items-center space-x-2"><CheckCircle className="w-4 h-4 text-green-600" /><span className="text-sm text-green-700 font-medium">✓ {documentValidation.message || 'Número do documento válido'}</span></div></div>)}
              {!documentNumber && (<div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg"><div className="flex items-center space-x-2"><Info className="w-4 h-4 text-blue-600" /><span className="text-sm text-blue-700">Configure faixas de documentos em Configurações → Documentos</span></div></div>)}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoria *</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" required>
                <option value="">Selecione uma categoria</option>
                {CATEGORIES[type].map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor *</label>
              <input type="text" value={amount} onChange={handleAmountChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" placeholder="0,00" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Método de Pagamento *</label>
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as 'pix' | 'cash' | 'transfer')} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" required>
                <option value="pix">PIX</option>
                <option value="cash">Dinheiro</option>
                <option value="transfer">Transferência</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Setor</label>
              <select value={sector} onChange={(e) => handleSectorChange(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                <option value="">Selecione um setor</option>
                {Object.keys(SECTORS).map((sectorName) => (<option key={sectorName} value={sectorName}>{sectorName}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Campo</label>
              <select value={field} onChange={(e) => setField(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" disabled={!sector}>
                <option value="">{sector ? 'Selecione um campo' : 'Primeiro selecione um setor'}</option>
                {sector && getFieldsForSector(sector).map((fieldName) => (<option key={fieldName} value={fieldName}>{fieldName}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mês</label>
              <select value={month} onChange={(e) => setMonth(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                <option value="">Selecione um mês</option>
                {MONTHS.map((monthName) => (<option key={monthName} value={monthName}>{monthName}</option>))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Todos os meses de Janeiro a Dezembro são aceitos</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data de Início</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição *</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" rows={3} placeholder="Descreva a transação..." required />
            </div>
            {sector && (<div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200"><h4 className="text-sm font-medium text-emerald-800 mb-2 flex items-center space-x-1"><MapPin className="w-4 h-4" /><span>{sector}</span></h4><div className="text-xs text-emerald-700"><span className="font-medium">Campos disponíveis:</span><div className="mt-1 flex flex-wrap gap-1">{getFieldsForSector(sector).map((fieldName) => (<span key={fieldName} className={`px-2 py-1 rounded text-xs ${field === fieldName ? 'bg-emerald-200 text-emerald-900 font-medium' : 'bg-emerald-100 text-emerald-800'}`}>{fieldName}</span>))}</div></div></div>)}
            {month && (<div className="p-3 bg-blue-50 rounded-lg border border-blue-200"><h4 className="text-sm font-medium text-blue-800 mb-1 flex items-center space-x-1"><Calendar className="w-4 h-4" /><span>Mês Selecionado: {month}</span></h4><p className="text-xs text-blue-700">✅ Sistema aceita todos os meses de Janeiro a Dezembro</p></div>)}
            <div className="flex space-x-3 pt-4">
              <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">Cancelar</button>
              <button type="submit" disabled={!isDocumentValid} className={`flex-1 px-4 py-2 rounded-lg transition-all flex items-center justify-center space-x-2 font-medium ${isDocumentValid ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 hover:to-green-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}><Plus className="w-4 h-4" /><span>{editTransaction ? 'Atualizar' : 'Adicionar'}</span></button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
