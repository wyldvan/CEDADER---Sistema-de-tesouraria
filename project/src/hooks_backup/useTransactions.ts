import { useState, useEffect } from 'react';
import { Transaction } from '../types';

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  useEffect(() => {
    const saved = localStorage.getItem('cedader_transactions');
    if (saved) {
      setTransactions(JSON.parse(saved));
    }
  }, []);

  const saveTransactions = (newTransactions: Transaction[]) => {
    setTransactions(newTransactions);
    localStorage.setItem('cedader_transactions', JSON.stringify(newTransactions));
  };

  const addTransaction = (transaction: Omit<Transaction, 'id' | 'date'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
      date: new Date().toISOString()
    };
    saveTransactions([...transactions, newTransaction]);
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    const updated = transactions.map(t => 
      t.id === id ? { ...t, ...updates } : t
    );
    saveTransactions(updated);
  };

  const deleteTransaction = (id: string) => {
    const filtered = transactions.filter(t => t.id !== id);
    saveTransactions(filtered);
  };

  const getBalance = () => {
    return transactions.reduce((balance, transaction) => {
      return transaction.type === 'entry' 
        ? balance + transaction.amount 
        : balance - transaction.amount;
    }, 0);
  };

  const getTotalByType = (type: 'entry' | 'exit') => {
    return transactions
      .filter(t => t.type === type)
      .reduce((total, t) => total + t.amount, 0);
  };

  const getTransactionsByPaymentMethod = () => {
    const methods = { pix: 0, cash: 0, transfer: 0 };
    transactions.forEach(t => {
      methods[t.paymentMethod] += t.amount;
    });
    return methods;
  };

  return {
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getBalance,
    getTotalByType,
    getTransactionsByPaymentMethod
  };
}