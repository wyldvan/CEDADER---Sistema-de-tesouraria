import { useState, useEffect } from 'react';
import { DocumentRange } from '../types';

export function useDocumentRanges() {
  const [documentRanges, setDocumentRanges] = useState<DocumentRange[]>([]);
  
  useEffect(() => {
    const saved = localStorage.getItem('cedader_document_ranges');
    if (saved) {
      setDocumentRanges(JSON.parse(saved));
    }
  }, []);

  const saveDocumentRanges = (newRanges: DocumentRange[]) => {
    setDocumentRanges(newRanges);
    localStorage.setItem('cedader_document_ranges', JSON.stringify(newRanges));
  };

  const addDocumentRange = (range: Omit<DocumentRange, 'id' | 'createdAt'>) => {
    const newRange: DocumentRange = {
      ...range,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    saveDocumentRanges([...documentRanges, newRange]);
  };

  const updateDocumentRange = (id: string, updates: Partial<DocumentRange>) => {
    const updated = documentRanges.map(r => 
      r.id === id ? { ...r, ...updates } : r
    );
    saveDocumentRanges(updated);
  };

  const deleteDocumentRange = (id: string) => {
    const filtered = documentRanges.filter(r => r.id !== id);
    saveDocumentRanges(filtered);
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
    addDocumentRange,
    updateDocumentRange,
    deleteDocumentRange,
    getActiveRanges,
    isDocumentNumberInRange
  };
}