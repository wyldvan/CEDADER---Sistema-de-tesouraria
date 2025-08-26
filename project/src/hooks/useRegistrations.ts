import { useState, useEffect } from 'react';
import { Registration } from '../types';
import { apiService } from '../services/api';

export function useRegistrations() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadRegistrations();
  }, []);

  const loadRegistrations = async () => {
    try {
      setLoading(true);
      const data = await apiService.getRegistrations();
      setRegistrations(data);
    } catch (error) {
      console.error('Failed to load registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const addRegistration = async (registration: Omit<Registration, 'id' | 'date'>) => {
    try {
      const newRegistration = await apiService.createRegistration(registration);
      setRegistrations(prev => [newRegistration, ...prev]);
    } catch (error) {
      console.error('Failed to add registration:', error);
      throw error;
    }
  };

  const updateRegistration = async (id: string, updates: Partial<Registration>) => {
    try {
      const updatedRegistration = await apiService.updateRegistration(id, updates);
      setRegistrations(prev => prev.map(r => 
        r.id === id ? updatedRegistration : r
      ));
    } catch (error) {
      console.error('Failed to update registration:', error);
      throw error;
    }
  };

  const deleteRegistration = async (id: string) => {
    try {
      await apiService.deleteRegistration(id);
      setRegistrations(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      console.error('Failed to delete registration:', error);
      throw error;
    }
  };

  const getRegistrationsByField = () => {
    const byField: Record<string, number> = {};
    registrations.forEach(r => {
      byField[r.field] = (byField[r.field] || 0) + Number(r.amount);
    });
    return byField;
  };

  const getRegistrationsByMonth = () => {
    const byMonth: Record<string, number> = {};
    registrations.forEach(r => {
      byMonth[r.month] = (byMonth[r.month] || 0) + Number(r.amount);
    });
    return byMonth;
  };

  const getTotalRegistrations = () => {
    return registrations.reduce((total, registration) => total + Number(registration.amount), 0);
  };

  return {
    registrations,
    loading,
    addRegistration,
    updateRegistration,
    deleteRegistration,
    getRegistrationsByField,
    getRegistrationsByMonth,
    getTotalRegistrations,
    refresh: loadRegistrations
  };
}

