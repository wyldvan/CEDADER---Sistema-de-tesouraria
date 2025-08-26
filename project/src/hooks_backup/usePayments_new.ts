import { useState, useEffect } from 'react';
import { Payment } from '../types';
import { apiService } from '../services/api';

export function usePayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const data = await apiService.getPayments();
      setPayments(data);
    } catch (error) {
      console.error('Failed to load payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const addPayment = async (payment: Omit<Payment, 'id' | 'date'>) => {
    try {
      const newPayment = await apiService.createPayment(payment);
      setPayments(prev => [newPayment, ...prev]);
    } catch (error) {
      console.error('Failed to add payment:', error);
      throw error;
    }
  };

  const updatePayment = async (id: string, updates: Partial<Payment>) => {
    try {
      const updatedPayment = await apiService.updatePayment(id, updates);
      setPayments(prev => prev.map(p => 
        p.id === id ? updatedPayment : p
      ));
    } catch (error) {
      console.error('Failed to update payment:', error);
      throw error;
    }
  };

  const deletePayment = async (id: string) => {
    try {
      await apiService.deletePayment(id);
      setPayments(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Failed to delete payment:', error);
      throw error;
    }
  };

  const getTotalPayments = () => {
    return payments.reduce((total, payment) => total + Number(payment.amount), 0);
  };

  const getPaymentsByCategory = () => {
    const byCategory: Record<string, number> = {};
    payments.forEach(p => {
      byCategory[p.category] = (byCategory[p.category] || 0) + Number(p.amount);
    });
    return byCategory;
  };

  const getPaymentsByMonth = () => {
    const byMonth: Record<string, number> = {};
    payments.forEach(p => {
      if (p.month) {
        byMonth[p.month] = (byMonth[p.month] || 0) + Number(p.amount);
      }
    });
    return byMonth;
  };

  const getPaymentsByPaymentMethod = () => {
    const methods = { pix: 0, cash: 0, transfer: 0 };
    payments.forEach(p => {
      methods[p.paymentMethod] += Number(p.amount);
    });
    return methods;
  };

  return {
    payments,
    loading,
    addPayment,
    updatePayment,
    deletePayment,
    getTotalPayments,
    getPaymentsByCategory,
    getPaymentsByMonth,
    getPaymentsByPaymentMethod,
    refresh: loadPayments
  };
}

