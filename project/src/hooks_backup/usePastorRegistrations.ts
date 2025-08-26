import { useState, useEffect } from 'react';
import { PastorRegistration } from '../types';

export function usePastorRegistrations() {
  const [pastorRegistrations, setPastorRegistrations] = useState<PastorRegistration[]>([]);
  
  useEffect(() => {
    const saved = localStorage.getItem('cedader_pastor_registrations');
    if (saved) {
      setPastorRegistrations(JSON.parse(saved));
    }
  }, []);

  const savePastorRegistrations = (newRegistrations: PastorRegistration[]) => {
    setPastorRegistrations(newRegistrations);
    localStorage.setItem('cedader_pastor_registrations', JSON.stringify(newRegistrations));
  };

  const addPastorRegistration = (registration: Omit<PastorRegistration, 'id' | 'date'>) => {
    const newRegistration: PastorRegistration = {
      ...registration,
      id: Date.now().toString(),
      date: new Date().toISOString()
    };
    savePastorRegistrations([...pastorRegistrations, newRegistration]);
  };

  const updatePastorRegistration = (id: string, updates: Partial<PastorRegistration>) => {
    const updated = pastorRegistrations.map(r => 
      r.id === id ? { ...r, ...updates } : r
    );
    savePastorRegistrations(updated);
  };

  const deletePastorRegistration = (id: string) => {
    const filtered = pastorRegistrations.filter(r => r.id !== id);
    savePastorRegistrations(filtered);
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
    addPastorRegistration,
    updatePastorRegistration,
    deletePastorRegistration,
    getPastorsByField,
    getTotalPastors,
    getTotalChildren
  };
}