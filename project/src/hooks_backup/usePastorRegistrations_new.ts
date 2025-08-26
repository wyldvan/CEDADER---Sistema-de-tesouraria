import { useState, useEffect } from 'react';
import { PastorRegistration } from '../types';
import { apiService } from '../services/api';

export function usePastorRegistrations() {
  const [pastorRegistrations, setPastorRegistrations] = useState<PastorRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadPastorRegistrations();
  }, []);

  const loadPastorRegistrations = async () => {
    try {
      setLoading(true);
      const data = await apiService.getPastorRegistrations();
      setPastorRegistrations(data);
    } catch (error) {
      console.error('Failed to load pastor registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const addPastorRegistration = async (registration: Omit<PastorRegistration, 'id' | 'date'>) => {
    try {
      const newRegistration = await apiService.createPastorRegistration(registration);
      setPastorRegistrations(prev => [newRegistration, ...prev]);
    } catch (error) {
      console.error('Failed to add pastor registration:', error);
      throw error;
    }
  };

  const updatePastorRegistration = async (id: string, updates: Partial<PastorRegistration>) => {
    try {
      const updatedRegistration = await apiService.updatePastorRegistration(id, updates);
      setPastorRegistrations(prev => prev.map(r => 
        r.id === id ? updatedRegistration : r
      ));
    } catch (error) {
      console.error('Failed to update pastor registration:', error);
      throw error;
    }
  };

  const deletePastorRegistration = async (id: string) => {
    try {
      await apiService.deletePastorRegistration(id);
      setPastorRegistrations(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      console.error('Failed to delete pastor registration:', error);
      throw error;
    }
  };

  const getPastorsByField = () => {
    const byField: Record<string, number> = {};
    pastorRegistrations.forEach(r => {
      byField[r.currentField] = (byField[r.currentField] || 0) + 1;
    });
    return byField;
  };

  const getTotalPastors = () => {
    return pastorRegistrations.length;
  };

  const getTotalChildren = () => {
    return pastorRegistrations.reduce((total, pastor) => total + pastor.children.length, 0);
  };

  return {
    pastorRegistrations,
    loading,
    addPastorRegistration,
    updatePastorRegistration,
    deletePastorRegistration,
    getPastorsByField,
    getTotalPastors,
    getTotalChildren,
    refresh: loadPastorRegistrations
  };
}

