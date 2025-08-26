import { useState, useEffect } from 'react';
import { DocumentRange } from '../types';
import { apiService } from '../services/api';

export function useDocumentRanges() {
  const [documentRanges, setDocumentRanges] = useState<DocumentRange[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadDocumentRanges();
  }, []);

  const loadDocumentRanges = async () => {
    try {
      setLoading(true);
      const data = await apiService.getDocumentRanges();
      setDocumentRanges(data);
    } catch (error) {
      console.error('Failed to load document ranges:', error);
    } finally {
      setLoading(false);
    }
  };

  const addDocumentRange = async (range: Omit<DocumentRange, 'id' | 'createdAt'>) => {
    try {
      const newRange = await apiService.createDocumentRange(range);
      setDocumentRanges(prev => [newRange, ...prev]);
    } catch (error) {
      console.error('Failed to add document range:', error);
      throw error;
    }
  };

  const updateDocumentRange = async (id: string, updates: Partial<DocumentRange>) => {
    try {
      const updatedRange = await apiService.updateDocumentRange(id, updates);
      setDocumentRanges(prev => prev.map(r => 
        r.id === id ? updatedRange : r
      ));
    } catch (error) {
      console.error('Failed to update document range:', error);
      throw error;
    }
  };

  const deleteDocumentRange = async (id: string) => {
    try {
      await apiService.deleteDocumentRange(id);
      setDocumentRanges(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      console.error('Failed to delete document range:', error);
      throw error;
    }
  };

  const getActiveRanges = () => {
    return documentRanges.filter(r => r.isActive);
  };

  // Função para verificar se um número está dentro das faixas permitidas
  const isDocumentNumberInRange = (documentNumber: string): { isValid: boolean, message: string } => {
    if (!documentNumber.trim()) {
      return { isValid: true, message: '' }; // Documento vazio é permitido
    }

    const activeRanges = getActiveRanges();
    
    if (activeRanges.length === 0) {
      return { isValid: true, message: 'Nenhuma faixa configurada - todos os números são aceitos' };
    }

    const docNum = documentNumber.trim();
    
    for (const range of activeRanges) {
      if (isNumberInRange(docNum, range.startNumber, range.endNumber)) {
        return { isValid: true, message: `Número válido na faixa: ${range.name}` };
      }
    }

    const rangesList = activeRanges.map(r => `${r.name} (${r.startNumber} - ${r.endNumber})`).join(', ');
    return { 
      isValid: false, 
      message: `Número fora das faixas permitidas. Faixas ativas: ${rangesList}` 
    };
  };

  // Função auxiliar para verificar se um número está dentro de uma faixa
  const isNumberInRange = (number: string, start: string, end: string): boolean => {
    // Tenta comparar como números primeiro
    const numValue = parseInt(number);
    const startValue = parseInt(start);
    const endValue = parseInt(end);

    if (!isNaN(numValue) && !isNaN(startValue) && !isNaN(endValue)) {
      return numValue >= startValue && numValue <= endValue;
    }

    // Se não for número puro, compara como string (ordem lexicográfica)
    return number >= start && number <= end;
  };

  return {
    documentRanges,
    loading,
    addDocumentRange,
    updateDocumentRange,
    deleteDocumentRange,
    getActiveRanges,
    isDocumentNumberInRange,
    refresh: loadDocumentRanges
  };
}

