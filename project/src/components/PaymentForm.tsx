import React, { useState } from 'react';
import { usePayments } from '../hooks/usePayments';
import { useAuth } from '../contexts/AuthContext';
import { PAYMENT_CATEGORIES, SECTORS, MONTHS } from '../types';
import { Plus, X, CreditCard, MapPin } from 'lucide-react';

interface PaymentFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PaymentForm({ isOpen, onClose }: PaymentFormProps) {
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'cash' | 'transfer'>('pix');
  const [description, setDescription] = useState('');
  const [sector, setSector] = useState('');
  const [field, setField] = useState('');
  const [month, setMonth] = useState('');
  
  const { addPayment } = usePayments();
  const { user } = useAuth();

  const handleSectorChange = (selectedSector: string) => {
    setSector(selectedSector);
    setField(''); // Reset field when sector changes
  };

  const getFieldsForSector = (sectorName: string) => {
    return SECTORS[sectorName as keyof typeof SECTORS] || [];
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!category || !amount || !description) return;

    addPayment({
      category,
      amount: parseFloat(amount),
      paymentMethod,
      description,
      field: field || undefined,
      month: month || undefined,
      createdBy: user?.username || 'unknown'
    });

    // Reset form
    setCategory('');
    setAmount('');
    setPaymentMethod('pix');
    setDescription('');
    setSector('');
    setField('');
    setMonth('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
              <CreditCard className="w-6 h-6 text-orange-600" />
              <span>Novo Pagamento</span>
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoria *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                required
              >
                <option value="">Selecione uma categoria</option>
                {PAYMENT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valor *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="0,00"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Método de Pagamento *
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as 'pix' | 'cash' | 'transfer')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                required
              >
                <option value="pix">PIX</option>
                <option value="cash">Dinheiro</option>
                <option value="transfer">Transferência</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Setor
              </label>
              <select
                value={sector}
                onChange={(e) => handleSectorChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
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
                Mês
              </label>
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">Selecione um mês</option>
                {MONTHS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                rows={3}
                placeholder="Descreva o pagamento..."
                required
              />
            </div>

            {/* Sector Information Display */}
            {sector && (
              <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                <h4 className="text-sm font-medium text-orange-800 mb-2 flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>{sector}</span>
                </h4>
                <div className="text-xs text-orange-700">
                  <span className="font-medium">Campos disponíveis:</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {getFieldsForSector(sector).map((fieldName) => (
                      <span
                        key={fieldName}
                        className={`px-2 py-1 rounded text-xs ${
                          field === fieldName
                            ? 'bg-orange-200 text-orange-900 font-medium'
                            : 'bg-orange-100 text-orange-800'
                        }`}
                      >
                        {fieldName}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all flex items-center justify-center space-x-2"
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