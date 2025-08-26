import { useState, useEffect } from 'react';
import { Payment } from '../types';

export function usePayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  
  useEffect(() => {
    const saved = localStorage.getItem('cedader_payments');
    if (saved) {
      setPayments(JSON.parse(saved));
    }
  }, []);

  const savePayments = (newPayments: Payment[]) => {
    setPayments(newPayments);
    localStorage.setItem('cedader_payments', JSON.stringify(newPayments));
  };

  const addPayment = (payment: Omit<Payment, 'id' | 'date'>) => {
    const newPayment: Payment = {
      ...payment,
      id: Date.now().toString(),
      date: new Date().toISOString()
    };
    savePayments([...payments, newPayment]);
  };

  const updatePayment = (id: string, updates: Partial<Payment>) => {
    const updated = payments.map(p => 
      p.id === id ? { ...p, ...updates } : p
    );
    savePayments(updated);
  };

  const deletePayment = (id: string) => {
    const filtered = payments.filter(p => p.id !== id);
    savePayments(filtered);
  };

  const getTotalPayments = () => {
    return payments.reduce((total, payment) => total + payment.amount, 0);
  };

  const getPaymentsByCategory = () => {
    const byCategory: Record<string, number> = {};
    payments.forEach(p => {
      byCategory[p.category] = (byCategory[p.category] || 0) + p.amount;
    });
    return byCategory;
  };

  const getPaymentsByMonth = () => {
    const byMonth: Record<string, number> = {};
    payments.forEach(p => {
      if (p.month) {
        byMonth[p.month] = (byMonth[p.month] || 0) + p.amount;
      }
    });
    return byMonth;
  };

  const getPaymentsByPaymentMethod = () => {
    const methods = { pix: 0, cash: 0, transfer: 0 };
    payments.forEach(p => {
      methods[p.paymentMethod] += p.amount;
    });
    return methods;
  };

  return {
    payments,
    addPayment,
    updatePayment,
    deletePayment,
    getTotalPayments,
    getPaymentsByCategory,
    getPaymentsByMonth,
    getPaymentsByPaymentMethod
  };
}