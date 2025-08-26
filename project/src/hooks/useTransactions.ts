import { useState, useEffect } from 'react';
import { Transaction } from '../types';
import { apiService } from '../services/api';

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const data = await apiService.getTransactions();
      setTransactions(data);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'date'>) => {
    try {
      const newTransaction = await apiService.createTransaction(transaction);
      setTransactions(prev => [newTransaction, ...prev]);
    } catch (error) {
      console.error('Failed to add transaction:', error);
      throw error;
    }
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    try {
      const updatedTransaction = await apiService.updateTransaction(id, updates);
      setTransactions(prev => prev.map(t => 
        t.id === id ? updatedTransaction : t
      ));
    } catch (error) {
      console.error('Failed to update transaction:', error);
      throw error;
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      await apiService.deleteTransaction(id);
      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      console.error('Failed to delete transaction:', error);
      throw error;
    }
  };

  const getBalance = () => {
    return transactions.reduce((balance, transaction) => {
      return transaction.type === 'entry' 
        ? balance + Number(transaction.amount)
        : balance - Number(transaction.amount);
    }, 0);
  };

  const getTotalByType = (type: 'entry' | 'exit') => {
    return transactions
      .filter(t => t.type === type)
      .reduce((total, t) => total + Number(t.amount), 0);
  };

  const getTransactionsByPaymentMethod = () => {
    const methods = { pix: 0, cash: 0, transfer: 0 };
    transactions.forEach(t => {
      methods[t.paymentMethod] += Number(t.amount);
    });
    return methods;
  };

  return {
    transactions,
    loading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getBalance,
    getTotalByType,
    getTransactionsByPaymentMethod,
    refresh: loadTransactions
  };
}

