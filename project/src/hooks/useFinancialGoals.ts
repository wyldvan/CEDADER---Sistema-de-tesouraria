import { useState, useEffect } from 'react';
import { FinancialGoal, GoalProgress, MONTHS } from '../types';
import { apiService } from '../services/api';
import { useTransactions } from './useTransactions';
import { useRegistrations } from './useRegistrations';
import { usePrebenda } from './usePrebenda';
import { getYear, getMonth } from 'date-fns';

export function useFinancialGoals() {
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const { transactions } = useTransactions();
  const { registrations } = useRegistrations();
  const { prebendas } = usePrebenda();
  
  useEffect(() => {
    loadFinancialGoals();
  }, []);

  const loadFinancialGoals = async () => {
    try {
      setLoading(true);
      const data = await apiService.getFinancialGoals();
      setGoals(data);
    } catch (error) {
      console.error('Failed to load financial goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const addGoal = async (goal: Omit<FinancialGoal, 'id' | 'createdAt'>) => {
    try {
      const newGoal = await apiService.createFinancialGoal(goal);
      setGoals(prev => [newGoal, ...prev]);
    } catch (error) {
      console.error('Failed to add financial goal:', error);
      throw error;
    }
  };

  const updateGoal = async (id: string, updates: Partial<FinancialGoal>) => {
    try {
      const updatedGoal = await apiService.updateFinancialGoal(id, updates);
      setGoals(prev => prev.map(g => 
        g.id === id ? updatedGoal : g
      ));
    } catch (error) {
      console.error('Failed to update financial goal:', error);
      throw error;
    }
  };

  const deleteGoal = async (id: string) => {
    try {
      await apiService.deleteFinancialGoal(id);
      setGoals(prev => prev.filter(g => g.id !== id));
    } catch (error) {
      console.error('Failed to delete financial goal:', error);
      throw error;
    }
  };

  // Calculate actual amounts for a field in a specific year/month
  const getActualAmount = (field: string, year: number, month?: string) => {
    let total = 0;

    // Filter by year and optionally by month
    const yearTransactions = transactions.filter(t => {
      const tDate = new Date(t.date);
      const tYear = getYear(tDate);
      const tMonth = MONTHS[getMonth(tDate)];
      
      return t.field === field && 
             t.type === 'entry' && 
             tYear === year && 
             (!month || tMonth === month);
    });

    const yearRegistrations = registrations.filter(r => {
      const rDate = new Date(r.date);
      const rYear = getYear(rDate);
      const rMonth = MONTHS[getMonth(rDate)];
      
      return r.field === field && 
             rYear === year && 
             (!month || rMonth === month);
    });

    const yearPrebendas = prebendas.filter(p => {
      const pDate = new Date(p.date);
      const pYear = getYear(pDate);
      const pMonth = MONTHS[getMonth(pDate)];
      
      return p.field === field && 
             p.type === 'entry' && 
             pYear === year && 
             (!month || pMonth === month);
    });

    total += yearTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
    total += yearRegistrations.reduce((sum, r) => sum + Number(r.amount), 0);
    total += yearPrebendas.reduce((sum, p) => sum + Number(p.amount), 0);

    return total;
  };

  // Get progress for all goals
  const getGoalsProgress = (year: number): GoalProgress[] => {
    const progress: GoalProgress[] = [];

    goals.filter(g => g.year === year && g.isActive).forEach(goal => {
      // Monthly progress
      MONTHS.forEach(month => {
        const monthlyGoal = goal.monthlyGoals[month] || 0;
        if (monthlyGoal > 0) {
          const actualAmount = getActualAmount(goal.field, year, month);
          const percentage = (actualAmount / monthlyGoal) * 100;
          
          let status: 'below' | 'on-track' | 'exceeded' = 'below';
          if (percentage >= 100) status = 'exceeded';
          else if (percentage >= 80) status = 'on-track';

          progress.push({
            field: goal.field,
            year,
            month,
            goalAmount: monthlyGoal,
            actualAmount,
            percentage,
            status
          });
        }
      });

      // Annual progress
      const annualActual = getActualAmount(goal.field, year);
      const annualPercentage = (annualActual / Number(goal.annualGoal)) * 100;
      
      let annualStatus: 'below' | 'on-track' | 'exceeded' = 'below';
      if (annualPercentage >= 100) annualStatus = 'exceeded';
      else if (annualPercentage >= 80) annualStatus = 'on-track';

      progress.push({
        field: goal.field,
        year,
        month: 'Anual',
        goalAmount: Number(goal.annualGoal),
        actualAmount: annualActual,
        percentage: annualPercentage,
        status: annualStatus
      });
    });

    return progress;
  };

  // Get summary statistics
  const getGoalsSummary = (year: number) => {
    const progress = getGoalsProgress(year);
    const monthlyProgress = progress.filter(p => p.month !== 'Anual');
    const annualProgress = progress.filter(p => p.month === 'Anual');

    return {
      totalGoals: goals.filter(g => g.year === year && g.isActive).length,
      totalMonthlyGoals: monthlyProgress.length,
      achievedMonthly: monthlyProgress.filter(p => p.status === 'exceeded').length,
      onTrackMonthly: monthlyProgress.filter(p => p.status === 'on-track').length,
      belowMonthly: monthlyProgress.filter(p => p.status === 'below').length,
      achievedAnnual: annualProgress.filter(p => p.status === 'exceeded').length,
      onTrackAnnual: annualProgress.filter(p => p.status === 'on-track').length,
      belowAnnual: annualProgress.filter(p => p.status === 'below').length,
      totalGoalAmount: goals.filter(g => g.year === year && g.isActive)
        .reduce((sum, g) => sum + Number(g.annualGoal), 0),
      totalActualAmount: annualProgress.reduce((sum, p) => sum + p.actualAmount, 0)
    };
  };

  // Get fields with goals for a specific year
  const getFieldsWithGoals = (year: number) => {
    return goals.filter(g => g.year === year && g.isActive).map(g => g.field);
  };

  // Get goal for specific field and year
  const getGoalForField = (field: string, year: number) => {
    return goals.find(g => g.field === field && g.year === year && g.isActive);
  };

  return {
    goals,
    loading,
    addGoal,
    updateGoal,
    deleteGoal,
    getActualAmount,
    getGoalsProgress,
    getGoalsSummary,
    getFieldsWithGoals,
    getGoalForField,
    refresh: loadFinancialGoals
  };
}

