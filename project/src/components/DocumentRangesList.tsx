import React, { useState } from 'react';
import { useDocumentRanges } from '../hooks/useDocumentRanges';
import { useAuth } from '../contexts/AuthContext';
import { DocumentRange } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FileText, Edit2, Trash2, Plus, ToggleLeft, ToggleRight, Hash, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface DocumentRangesListProps {
  onAddRange: () => void;
  onEditRange: (range: DocumentRange) => void;
}

export function DocumentRangesList({ onAddRange, onEditRange }: DocumentRangesListProps) {
  const { documentRanges, deleteDocumentRange, updateDocumentRange } = useDocumentRanges();
  const { isAdmin } = useAuth();
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null);

  const toggleRangeStatus = (range: DocumentRange) => {
    updateDocumentRange(range.id, { isActive: !range.isActive });
  };

  const handleDeleteClick = (range: DocumentRange) => {
    setDeleteConfirmation(range.id);
  };

  const confirmDelete = (range: DocumentRange) => {
    deleteDocumentRange(range.id);
    setDeleteConfirmation(null);
  };

  const cancelDelete = () => {
    setDeleteConfirmation(null);
  };

  const activeRanges = documentRanges.filter(r => r.isActive);
  const inactiveRanges = documentRanges.filter(r => !r.isActive);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <span>Faixas de Documentos</span>
          </h3>
          <p className="text-sm text-gray-600">
            Configure as faixas de números permitidos para documentos
          </p>
        </div>
        
        {isAdmin() && (
          <button
            onClick={onAddRange}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Faixa</span>
          </button>
        )}
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-blue-900">Total de Faixas</span>
          </div>
          <p className="text-2xl font-bold text-blue-600 mt-1">{documentRanges.length}</p>
        </div>

        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="font-medium text-green-900">Faixas Ativas</span>
          </div>
          <p className="text-2xl font-bold text-green-600 mt-1">{activeRanges.length}</p>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2">
            <XCircle className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-900">Faixas Inativas</span>
          </div>
          <p className="text-2xl font-bold text-gray-600 mt-1">{inactiveRanges.length}</p>
        </div>
      </div>

      {/* Validation Status */}
      <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
        <h4 className="font-medium text-yellow-800 mb-2">📋 Status da Validação:</h4>
        {activeRanges.length === 0 ? (
          <p className="text-sm text-yellow-700">
            ⚠️ <strong>Nenhuma faixa ativa:</strong> Todos os números de documento são aceitos
          </p>
        ) : (
          <div className="text-sm text-yellow-700">
            <p className="mb-2">✅ <strong>Validação ativa:</strong> Apenas números nas faixas abaixo são aceitos:</p>
            <ul className="list-disc list-inside space-y-1">
              {activeRanges.map(range => (
                <li key={range.id}>
                  <strong>{range.name}:</strong> {range.startNumber} até {range.endNumber}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Ranges List */}
      {documentRanges.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma faixa configurada</h3>
          <p className="text-gray-500 mb-4">
            Configure faixas de números para controlar quais documentos são aceitos no sistema.
          </p>
          {isAdmin() && (
            <button
              onClick={onAddRange}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Criar primeira faixa
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Active Ranges */}
          {activeRanges.length > 0 && (
            <div>
              <h4 className="text-md font-medium text-green-800 mb-3 flex items-center space-x-2">
                <CheckCircle className="w-4 h-4" />
                <span>Faixas Ativas ({activeRanges.length})</span>
              </h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {activeRanges.map((range) => (
                  <RangeCard
                    key={range.id}
                    range={range}
                    onEdit={onEditRange}
                    onDeleteClick={handleDeleteClick}
                    onToggleStatus={toggleRangeStatus}
                    isAdmin={isAdmin()}
                    deleteConfirmation={deleteConfirmation}
                    onConfirmDelete={confirmDelete}
                    onCancelDelete={cancelDelete}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Inactive Ranges */}
          {inactiveRanges.length > 0 && (
            <div>
              <h4 className="text-md font-medium text-gray-600 mb-3 flex items-center space-x-2">
                <XCircle className="w-4 h-4" />
                <span>Faixas Inativas ({inactiveRanges.length})</span>
              </h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {inactiveRanges.map((range) => (
                  <RangeCard
                    key={range.id}
                    range={range}
                    onEdit={onEditRange}
                    onDeleteClick={handleDeleteClick}
                    onToggleStatus={toggleRangeStatus}
                    isAdmin={isAdmin()}
                    deleteConfirmation={deleteConfirmation}
                    onConfirmDelete={confirmDelete}
                    onCancelDelete={cancelDelete}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface RangeCardProps {
  range: DocumentRange;
  onEdit: (range: DocumentRange) => void;
  onDeleteClick: (range: DocumentRange) => void;
  onToggleStatus: (range: DocumentRange) => void;
  isAdmin: boolean;
  deleteConfirmation: string | null;
  onConfirmDelete: (range: DocumentRange) => void;
  onCancelDelete: () => void;
}

function RangeCard({ 
  range, 
  onEdit, 
  onDeleteClick, 
  onToggleStatus, 
  isAdmin, 
  deleteConfirmation,
  onConfirmDelete,
  onCancelDelete
}: RangeCardProps) {
  const isConfirmingDelete = deleteConfirmation === range.id;

  return (
    <div className={`p-4 rounded-lg border-2 transition-all ${
      range.isActive 
        ? 'bg-green-50 border-green-200 shadow-sm' 
        : 'bg-gray-50 border-gray-200 opacity-75'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Hash className={`w-4 h-4 ${range.isActive ? 'text-green-600' : 'text-gray-500'}`} />
          <h5 className={`font-medium ${range.isActive ? 'text-green-900' : 'text-gray-700'}`}>
            {range.name}
          </h5>
        </div>
        
        {isAdmin && !isConfirmingDelete && (
          <div className="flex items-center space-x-1">
            <button
              onClick={() => onToggleStatus(range)}
              className={`p-1 rounded transition-colors ${
                range.isActive 
                  ? 'text-green-600 hover:text-green-800' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
              title={range.isActive ? 'Desativar faixa' : 'Ativar faixa'}
            >
              {range.isActive ? (
                <ToggleRight className="w-5 h-5" />
              ) : (
                <ToggleLeft className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={() => onEdit(range)}
              className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
              title="Editar faixa"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDeleteClick(range)}
              className="p-1 text-red-600 hover:text-red-800 transition-colors"
              title="Excluir faixa"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      {isConfirmingDelete && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="font-medium text-red-800">Confirmar Exclusão</span>
          </div>
          <p className="text-sm text-red-700 mb-3">
            Tem certeza que deseja excluir a faixa "<strong>{range.name}</strong>"?
            Esta ação não pode ser desfeita.
          </p>
          <div className="flex space-x-2">
            <button
              onClick={() => onConfirmDelete(range)}
              className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
            >
              Sim, Excluir
            </button>
            <button
              onClick={onCancelDelete}
              className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Range Info */}
      {!isConfirmingDelete && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Faixa:</span>
            <span className={`font-mono text-sm font-medium ${
              range.isActive ? 'text-green-800' : 'text-gray-600'
            }`}>
              {range.startNumber} - {range.endNumber}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Status:</span>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
              range.isActive 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-600'
            }`}>
              {range.isActive ? 'Ativa' : 'Inativa'}
            </span>
          </div>

          {range.description && (
            <div className="mt-2">
              <p className="text-xs text-gray-600">{range.description}</p>
            </div>
          )}

          <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
            Criado em {format(new Date(range.createdAt), 'dd/MM/yyyy', { locale: ptBR })} por {range.createdBy}
          </div>
        </div>
      )}
    </div>
  );
}