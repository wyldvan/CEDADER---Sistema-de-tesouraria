import { useState, useEffect } from 'react';
import { ObreiroRegistration } from '../types';

export function useObreiros() {
  const [obreiros, setObreiros] = useState<ObreiroRegistration[]>([]);
  
  useEffect(() => {
    const saved = localStorage.getItem('cedader_obreiros');
    if (saved) {
      setObreiros(JSON.parse(saved));
    }
  }, []);

  const saveObreiros = (newObreiros: ObreiroRegistration[]) => {
    setObreiros(newObreiros);
    localStorage.setItem('cedader_obreiros', JSON.stringify(newObreiros));
  };

  const addObreiro = (obreiro: Omit<ObreiroRegistration, 'id' | 'date'>) => {
    const newObreiro: ObreiroRegistration = {
      ...obreiro,
      id: Date.now().toString(),
      date: new Date().toISOString()
    };
    saveObreiros([...obreiros, newObreiro]);
  };

  const updateObreiro = (id: string, updates: Partial<ObreiroRegistration>) => {
    const updated = obreiros.map(o => 
      o.id === id ? { ...o, ...updates } : o
    );
    saveObreiros(updated);
  };

  const deleteObreiro = (id: string) => {
    const filtered = obreiros.filter(o => o.id !== id);
    saveObreiros(filtered);
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
    addObreiro,
    updateObreiro,
    deleteObreiro,
    getTotalObreiros,
    getObreirosByTipo,
    getObreirosBySetor,
    getObreirosByPagamento
  };
}