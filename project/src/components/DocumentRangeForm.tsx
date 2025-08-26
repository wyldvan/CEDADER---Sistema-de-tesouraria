import React, { useState } from 'react';
import { useDocumentRanges } from '../hooks/useDocumentRanges';
import { useAuth } from '../contexts/AuthContext';
import { DocumentRange } from '../types';
import { Plus, X, FileText, AlertTriangle, CheckCircle, Hash } from 'lucide-react';

interface DocumentRangeFormProps {
  isOpen: boolean;
  onClose: () => void;
  editRange?: DocumentRange | null;
}

export function DocumentRangeForm({ isOpen, onClose, editRange }: DocumentRangeFormProps) {
  const { addDocumentRange, updateDocumentRange } = useDocumentRanges();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    name: editRange?.name || '',
    startNumber: editRange?.startNumber || '',
    endNumber: editRange?.endNumber || '',
    description: editRange?.description || '',
    isActive: editRange?.isActive ?? true
  });
  
  const [error, setError] = useState('');

  const validateRange = () => {
    if (!formData.name.trim()) {
      setError('Nome da faixa é obrigatório');
      return false;
    }

    if (!formData.startNumber.trim() || !formData.endNumber.trim()) {
      setError('Número inicial e final são obrigatórios');
      return false;
    }

    // Validação numérica se ambos forem números
    const startNum = parseInt(formData.startNumber);
    const endNum = parseInt(formData.endNumber);

    if (!isNaN(startNum) && !isNaN(endNum)) {
      if (startNum >= endNum) {
        setError('Número inicial deve ser menor que o número final');
        return false;
      }
    } else {
      // Validação lexicográfica para strings
      if (formData.startNumber >= formData.endNumber) {
        setError('Número inicial deve ser menor que o número final (ordem alfabética)');
        return false;
      }
    }

    setError('');
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateRange()) return;

    const rangeData = {
      ...formData,
      name: formData.name.trim(),
      startNumber: formData.startNumber.trim(),
      endNumber: formData.endNumber.trim(),
      description: formData.description.trim(),
      createdBy: user?.username || 'unknown'
    };

    if (editRange) {
      updateDocumentRange(editRange.id, rangeData);
    } else {
      addDocumentRange(rangeData);
    }

    // Reset form
    setFormData({
      name: '',
      startNumber: '',
      endNumber: '',
      description: '',
      isActive: true
    });
    setError('');
    onClose();
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData({ ...formData, [field]: value });
    if (error) setError(''); // Clear error when user starts typing
  };

  if (!isOpen) return null;

  const isFormValid = formData.name.trim() && formData.startNumber.trim() && formData.endNumber.trim() && !error;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
              <FileText className="w-6 h-6 text-blue-600" />
              <span>{editRange ? 'Editar Faixa' : 'Nova Faixa de Documentos'}</span>
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nome da Faixa */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome da Faixa *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: Notas Fiscais, Recibos, Vouchers..."
                required
              />
            </div>

            {/* Número Inicial */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número Inicial *
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={formData.startNumber}
                  onChange={(e) => handleInputChange('startNumber', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: 001, NF-001, A001..."
                  required
                />
              </div>
            </div>

            {/* Número Final */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número Final *
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={formData.endNumber}
                  onChange={(e) => handleInputChange('endNumber', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: 999, NF-999, A999..."
                  required
                />
              </div>
            </div>

            {/* Descrição */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Descrição opcional da faixa de documentos..."
              />
            </div>

            {/* Status Ativo */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => handleInputChange('isActive', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                Faixa ativa (será usada na validação)
              </label>
            </div>

            {/* Preview da Faixa */}
            {formData.startNumber && formData.endNumber && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center space-x-1">
                  <FileText className="w-4 h-4" />
                  <span>Preview da Faixa</span>
                </h4>
                <div className="text-sm text-blue-700">
                  <p><span className="font-medium">Nome:</span> {formData.name || 'Sem nome'}</p>
                  <p><span className="font-medium">Faixa:</span> {formData.startNumber} até {formData.endNumber}</p>
                  <p><span className="font-medium">Status:</span> {formData.isActive ? 'Ativa' : 'Inativa'}</p>
                  {formData.description && (
                    <p><span className="font-medium">Descrição:</span> {formData.description}</p>
                  )}
                </div>
              </div>
            )}

            {/* Mensagem de Erro */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span className="text-sm text-red-700 font-medium">{error}</span>
                </div>
              </div>
            )}

            {/* Informações sobre Validação */}
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="text-sm font-medium text-gray-800 mb-2">ℹ️ Como funciona a validação:</h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Números puros (001-999): validação numérica</li>
                <li>• Strings (NF-001 a NF-999): validação alfabética</li>
                <li>• Apenas faixas ativas são usadas na validação</li>
                <li>• Se nenhuma faixa estiver ativa, todos os números são aceitos</li>
                <li>• Documentos em branco sempre são permitidos</li>
              </ul>
            </div>

            {/* Form Actions */}
            <div className="flex space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!isFormValid}
                className={`flex-1 px-4 py-3 rounded-lg transition-all flex items-center justify-center space-x-2 font-medium ${
                  isFormValid
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Plus className="w-5 h-5" />
                <span>{editRange ? 'Atualizar' : 'Criar Faixa'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}