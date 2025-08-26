import { useState, useEffect } from 'react';
import { ObreiroRegistration } from '../types';

export function useObreiros() {
  const [obreiros, setObreiros] = useState<ObreiroRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadObreiros();
  }, []);

  const loadObreiros = async () => {
    try {
      setLoading(true);
      // Para compatibilidade, ainda usa localStorage por enquanto
      // Pode ser migrado para API posteriormente se necessário
      const saved = localStorage.getItem('cedader_obreiros');
      if (saved) {
        setObreiros(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load obreiros:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveObreiros = (newObreiros: ObreiroRegistration[]) => {
    setObreiros(newObreiros);
    localStorage.setItem('cedader_obreiros', JSON.stringify(newObreiros));
  };

  const addObreiro = async (obreiro: Omit<ObreiroRegistration, 'id' | 'date'>) => {
    try {
      const newObreiro: ObreiroRegistration = {
        ...obreiro,
        id: Date.now().toString(),
        date: new Date().toISOString()
      };
      saveObreiros([...obreiros, newObreiro]);
    } catch (error) {
      console.error('Failed to add obreiro:', error);
      throw error;
    }
  };

  const updateObreiro = async (id: string, updates: Partial<ObreiroRegistration>) => {
    try {
      const updated = obreiros.map(o => 
        o.id === id ? { ...o, ...updates } : o
      );
      saveObreiros(updated);
    } catch (error) {
      console.error('Failed to update obreiro:', error);
      throw error;
    }
  };

  const deleteObreiro = async (id: string) => {
    try {
      const filtered = obreiros.filter(o => o.id !== id);
      saveObreiros(filtered);
    } catch (error) {
      console.error('Failed to delete obreiro:', error);
      throw error;
    }
  };

  const getTotalObreiros = () => {
    return obreiros.length;
  };

  const getObreirosByTipo = () => {
    const byTipo: Record<string, number> = {};
    obreiros.forEach(o => {
      byTipo[o.tipo] = (byTipo[o.tipo] || 0) + 1;
    });
    return byTipo;
  };

  const getObreirosBySetor = () => {
    const bySetor: Record<string, number> = {};
    obreiros.forEach(o => {
      bySetor[o.setor] = (bySetor[o.setor] || 0) + 1;
    });
    return bySetor;
  };

  const getObreirosByPagamento = () => {
    const byPagamento = { dinheiro: 0, banco: 0 };
    obreiros.forEach(o => {
      byPagamento[o.pagamento.tipo]++;
    });
    return byPagamento;
  };

  return {
    obreiros,
    loading,
    addObreiro,
    updateObreiro,
    deleteObreiro,
    getTotalObreiros,
    getObreirosByTipo,
    getObreirosBySetor,
    getObreirosByPagamento,
    refresh: loadObreiros
  };
}

