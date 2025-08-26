import { useState, useEffect } from 'react';
import { Prebenda } from '../types';

export function usePrebenda() {
  const [prebendas, setPrebendas] = useState<Prebenda[]>([]);
  
  useEffect(() => {
    const saved = localStorage.getItem('cedader_prebendas');
    if (saved) {
      setPrebendas(JSON.parse(saved));
    }
  }, []);

  const savePrebendas = (newPrebendas: Prebenda[]) => {
    setPrebendas(newPrebendas);
    localStorage.setItem('cedader_prebendas', JSON.stringify(newPrebendas));
  };

  const addPrebenda = (prebenda: Omit<Prebenda, 'id' | 'date'>) => {
    const newPrebenda: Prebenda = {
      ...prebenda,
      id: Date.now().toString(),
      date: new Date().toISOString()
    };
    savePrebendas([...prebendas, newPrebenda]);
  };

  const updatePrebenda = (id: string, updates: Partial<Prebenda>) => {
    const updated = prebendas.map(p => 
      p.id === id ? { ...p, ...updates } : p
    );
    savePrebendas(updated);
  };

  const deletePrebenda = (id: string) => {
    const filtered = prebendas.filter(p => p.id !== id);
    savePrebendas(filtered);
  };

  const getPrebendaBalance = () => {
    return prebendas.reduce((balance, prebenda) => {
      return prebenda.type === 'entry' 
        ? balance + prebenda.amount 
        : balance - prebenda.amount;
    }, 0);
  };

  const getTotalByType = (type: 'entry' | 'exit') => {
    return prebendas
      .filter(p => p.type === type)
      .reduce((total, p) => total + p.amount, 0);
  };

  const getPrebendaByPastor = () => {
    const byPastor: Record<string, number> = {};
    prebendas.forEach(p => {
      byPastor[p.pastor] = (byPastor[p.pastor] || 0) + (p.type === 'entry' ? p.amount : -p.amount);
    });
    return byPastor;
  };

  const getPrebendaByMonth = () => {
    const byMonth: Record<string, number> = {};
    prebendas.forEach(p => {
      byMonth[p.month] = (byMonth[p.month] || 0) + (p.type === 'entry' ? p.amount : -p.amount);
    });
    return byMonth;
  };

  return {
    prebendas,
    addPrebenda,
    updatePrebenda,
    deletePrebenda,
    getPrebendaBalance,
    getTotalByType,
    getPrebendaByPastor,
    getPrebendaByMonth
  };
}