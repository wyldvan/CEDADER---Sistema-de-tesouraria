import { useState, useEffect } from 'react';
import { Prebenda } from '../types';
import { apiService } from '../services/api';

export function usePrebenda() {
  const [prebendas, setPrebendas] = useState<Prebenda[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadPrebendas();
  }, []);

  const loadPrebendas = async () => {
    try {
      setLoading(true);
      const data = await apiService.getPrebendas();
      setPrebendas(data);
    } catch (error) {
      console.error('Failed to load prebendas:', error);
    } finally {
      setLoading(false);
    }
  };

  const addPrebenda = async (prebenda: Omit<Prebenda, 'id' | 'date'>) => {
    try {
      const newPrebenda = await apiService.createPrebenda(prebenda);
      setPrebendas(prev => [newPrebenda, ...prev]);
    } catch (error) {
      console.error('Failed to add prebenda:', error);
      throw error;
    }
  };

  const updatePrebenda = async (id: string, updates: Partial<Prebenda>) => {
    try {
      const updatedPrebenda = await apiService.updatePrebenda(id, updates);
      setPrebendas(prev => prev.map(p => 
        p.id === id ? updatedPrebenda : p
      ));
    } catch (error) {
      console.error('Failed to update prebenda:', error);
      throw error;
    }
  };

  const deletePrebenda = async (id: string) => {
    try {
      await apiService.deletePrebenda(id);
      setPrebendas(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Failed to delete prebenda:', error);
      throw error;
    }
  };

  const getPrebendaBalance = () => {
    return prebendas.reduce((balance, prebenda) => {
      return prebenda.type === 'entry' 
        ? balance + Number(prebenda.amount)
        : balance - Number(prebenda.amount);
    }, 0);
  };

  const getTotalByType = (type: 'entry' | 'exit') => {
    return prebendas
      .filter(p => p.type === type)
      .reduce((total, p) => total + Number(p.amount), 0);
  };

  const getPrebendaByPastor = () => {
    const byPastor: Record<string, number> = {};
    prebendas.forEach(p => {
      byPastor[p.pastor] = (byPastor[p.pastor] || 0) + (p.type === 'entry' ? Number(p.amount) : -Number(p.amount));
    });
    return byPastor;
  };

  const getPrebendaByMonth = () => {
    const byMonth: Record<string, number> = {};
    prebendas.forEach(p => {
      byMonth[p.month] = (byMonth[p.month] || 0) + (p.type === 'entry' ? Number(p.amount) : -Number(p.amount));
    });
    return byMonth;
  };

  return {
    prebendas,
    loading,
    addPrebenda,
    updatePrebenda,
    deletePrebenda,
    getPrebendaBalance,
    getTotalByType,
    getPrebendaByPastor,
    getPrebendaByMonth,
    refresh: loadPrebendas
  };
}

