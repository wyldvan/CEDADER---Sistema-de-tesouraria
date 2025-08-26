import { useState, useEffect } from 'react';
import { Registration } from '../types';

export function useRegistrations() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  
  useEffect(() => {
    const saved = localStorage.getItem('cedader_registrations');
    if (saved) {
      setRegistrations(JSON.parse(saved));
    }
  }, []);

  const saveRegistrations = (newRegistrations: Registration[]) => {
    setRegistrations(newRegistrations);
    localStorage.setItem('cedader_registrations', JSON.stringify(newRegistrations));
  };

  const addRegistration = (registration: Omit<Registration, 'id' | 'date'>) => {
    const newRegistration: Registration = {
      ...registration,
      id: Date.now().toString(),
      date: new Date().toISOString()
    };
    saveRegistrations([...registrations, newRegistration]);
  };

  const updateRegistration = (id: string, updates: Partial<Registration>) => {
    const updated = registrations.map(r => 
      r.id === id ? { ...r, ...updates } : r
    );
    saveRegistrations(updated);
  };

  const deleteRegistration = (id: string) => {
    const filtered = registrations.filter(r => r.id !== id);
    saveRegistrations(filtered);
  };

  const getRegistrationsByField = () => {
    const byField: Record<string, number> = {};
    registrations.forEach(r => {
      byField[r.field] = (byField[r.field] || 0) + r.amount;
    });
    return byField;
  };

  const getRegistrationsByMonth = () => {
    const byMonth: Record<string, number> = {};
    registrations.forEach(r => {
      byMonth[r.month] = (byMonth[r.month] || 0) + r.amount;
    });
    return byMonth;
  };

  const getTotalRegistrations = () => {
    return registrations.reduce((total, registration) => total + registration.amount, 0);
  };

  return {
    registrations,
    addRegistration,
    updateRegistration,
    deleteRegistration,
    getRegistrationsByField,
    getRegistrationsByMonth,
    getTotalRegistrations
  };
}