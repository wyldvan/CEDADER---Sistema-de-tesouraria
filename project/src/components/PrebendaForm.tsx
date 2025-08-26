import React, { useState } from 'react';
import { usePrebenda } from '../hooks/usePrebenda';
import { useDocumentRanges } from '../hooks/useDocumentRanges';
import { useAuth } from '../contexts/AuthContext';
import { PASTORS, MONTHS, SECTORS } from '../types';
import { Plus, X, DollarSign, FileText, AlertTriangle, CheckCircle, Info, Heart, HandHeart } from 'lucide-react';
import { formatInputAsCurrency } from '../utils/formatters';

interface PrebendaFormProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'entry' | 'exit';
}

export function PrebendaForm({ isOpen, onClose, type }: PrebendaFormProps) {
  const [documentNumber, setDocumentNumber] = useState('');
  const [isAuxilio, setIsAuxilio] = useState(false);
  const [isPrebenda, setIsPrebenda] = useState(false);
  const [pastor, setPastor] = useState('');
  const [amount, setAmount] = useState('');
  const [month, setMonth] = useState('');
  const [sector, setSector] = useState('');
  const [field, setField] = useState('');
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'cash' | 'transfer'>('pix');
  const [documentError, setDocumentError] = useState('');
  const [documentValidation, setDocumentValidation] = useState<{ isValid: boolean, message: string }>({ isValid: true, message: '' });

  const { addPrebenda, prebendas } = usePrebenda();
  const { isDocumentNumberInRange } = useDocumentRanges();
  const { user } = useAuth();

  const handleSectorChange = (selectedSector: string) => {
    setSector(selectedSector);
    setField(''); // Reset field when sector changes
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatInputAsCurrency(e.target.value);
    setAmount(formattedValue);
  };

  const getFieldsForSector = (sectorName: string) => {
    return SECTORS[sectorName as keyof typeof SECTORS] || [];
  };

  // Verificar se o número do documento já existe E se está na faixa permitida
  const checkDocumentNumber = (docNumber: string) => {
    if (!docNumber.trim()) {
      setDocumentError('');
      setDocumentValidation({ isValid: true, message: '' });
      return true;
    }

    const normalizedDocNumber = docNumber.trim().toLowerCase();

    // 1. Verificar duplicatas em prebendas
    const existingPrebenda = prebendas.find(p =>
      p.documentNumber && p.documentNumber.toLowerCase() === normalizedDocNumber
    );

    // Verificar em transações também
    const transactions = JSON.parse(localStorage.getItem('cedader_transactions') || '[]');
    const existingTransaction = transactions.find((t: any) =>
      t.documentNumber && t.documentNumber.toLowerCase() === normalizedDocNumber
    );

    if (existingPrebenda || existingTransaction) {
      setDocumentError(`Número do documento "${docNumber}" já existe! Use um número diferente.`);
      setDocumentValidation({ isValid: false, message: '' });
      return false;
    }

    // 2. Verificar se está na faixa permitida
    const rangeValidation = isDocumentNumberInRange(docNumber);
    setDocumentValidation(rangeValidation);

    if (!rangeValidation.isValid) {
      setDocumentError('');
      return false;
    }

    // Tudo OK
    setDocumentError('');
    return true;
  };

  const handleDocumentNumberChange = (value: string) => {
    setDocumentNumber(value);
    checkDocumentNumber(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!pastor || !amount || !month || !description) return;

    // Verificação final do número do documento
    if (documentNumber && !checkDocumentNumber(documentNumber)) {
      return; // Não submete se houver documento duplicado ou fora da faixa
    }

    addPrebenda({
      type,
      pastor,
      amount: parseFloat(amount),
      month,
      field: field || undefined,
      description,
      paymentMethod,
      documentNumber: documentNumber.trim() || undefined,
      isAuxilio: type === 'exit' ? isAuxilio : undefined,
      isPrebenda: type === 'exit' ? isPrebenda : undefined,
      createdBy: user?.username || 'unknown'
    });

    // Reset form
    setDocumentNumber('');
    setIsAuxilio(false);
    setIsPrebenda(false);
    setPastor('');
    setAmount('');
    setMonth('');
    setSector('');
    setField('');
    setDescription('');
    setPaymentMethod('pix');
    setDocumentError('');
    setDocumentValidation({ isValid: true, message: '' });
    setIsAuxilio(false);
    setIsPrebenda(false);
    onClose();
  };

  if (!isOpen) return null;

  const isDocumentValid = !documentNumber || (!documentError && documentValidation.isValid && documentNumber.trim() !== '');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
              <DollarSign className="w-6 h-6 text-emerald-600" />
              <span>
                {type === 'entry' ? 'Nova Entrada' : 'Nova Saída'} - Auxílio
              </span>
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Tipo de Saída - Apenas para saídas */}
          {type === 'exit' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Saída *
              </label>
              <div className="space-y-2">
                <label className="flex items-center space-x-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={isAuxilio}
                    onChange={(e) => setIsAuxilio(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                  />
                  <Heart className="w-4 h-4 text-pink-500" />
                  <span className="font-medium text-gray-900">Auxílio</span>
                </label>

                <label className="flex items-center space-x-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={isPrebenda}
                    onChange={(e) => setIsPrebenda(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                  />
                  <HandHeart className="w-4 h-4 text-emerald-500" />
                  <span className="font-medium text-gray-900">Prebenda</span>
                </label>
              </div>

              {/* Informação sobre seleção */}
              {(isAuxilio || isPrebenda) && (
                <div className="mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm text-emerald-700 font-medium">
                      Selecionado: {[isAuxilio && 'Auxílio', isPrebenda && 'Prebenda'].filter(Boolean).join(' + ')}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
                {/* Ícone de Status */}
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {documentNumber && (
                    (documentError || !documentValidation.isValid) ? (
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )
                  )}
                </div>
              </div>

              {/* Mensagem de Erro - Duplicata */}
              {documentError && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span className="text-sm text-red-700 font-medium">{documentError}</span>
                  </div>
                </div>
              )}

              {/* Mensagem de Erro - Faixa */}
              {!documentError && !documentValidation.isValid && documentNumber && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span className="text-sm text-red-700 font-medium">{documentValidation.message}</span>
                  </div>
                </div>
              )}

              {/* Mensagem de Sucesso */}
              {documentNumber && !documentError && documentValidation.isValid && (
                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-700 font-medium">
                      ✓ {documentValidation.message || 'Número do documento válido'}
                    </span>
                  </div>
                </div>
              )}

              {/* Mensagem Informativa */}
              {!documentNumber && (
                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Info className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-blue-700">
                      Configure faixas de documentos em Configurações → Documentos
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Pastor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pastor *
              </label>
              <select
                value={pastor}
                onChange={(e) => setPastor(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              >
                <option value="">Selecione um pastor</option>
                {PASTORS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valor *
              </label>
              <input
                type="text"
                value={amount}
                onChange={handleAmountChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="0,00"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mês *
              </label>
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              >
                <option value="">Selecione um mês</option>
                {MONTHS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Setor
              </label>
              <select
                value={sector}
                onChange={(e) => handleSectorChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">Selecione um setor</option>
                {Object.keys(SECTORS).map((sectorName) => (
                  <option key={sectorName} value={sectorName}>{sectorName}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Campo
              </label>
              <select
                value={field}
                onChange={(e) => setField(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                disabled={!sector}
              >
                <option value="">
                  {sector ? 'Selecione um campo' : 'Primeiro selecione um setor'}
                </option>
                {sector && getFieldsForSector(sector).map((fieldName) => (
                  <option key={fieldName} value={fieldName}>{fieldName}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Método de Pagamento *
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as 'pix' | 'cash' | 'transfer')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              >
                <option value="pix">PIX</option>
                <option value="cash">Dinheiro</option>
                <option value="transfer">Transferência</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                rows={3}
                placeholder="Descreva a prebenda..."
                required
              />
            </div>

            {/* Sector Information Display */}
            {sector && (
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <h4 className="text-sm font-medium text-emerald-800 mb-2 flex items-center space-x-1">
                  <DollarSign className="w-4 h-4" />
                  <span>{sector}</span>
                </h4>
                <div className="text-xs text-emerald-700">
                  <span className="font-medium">Campos disponíveis:</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {getFieldsForSector(sector).map((fieldName) => (
                      <span
                        key={fieldName}
                        className={`px-2 py-1 rounded text-xs ${field === fieldName
                          ? 'bg-emerald-200 text-emerald-900 font-medium'
                          : 'bg-emerald-100 text-emerald-800'
                          }`}
                      >
                        {fieldName}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!isDocumentValid}
                className={`flex-1 px-4 py-2 rounded-lg transition-all flex items-center justify-center space-x-2 font-medium ${isDocumentValid
                  ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 hover:to-green-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar</span>
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>
  );
}