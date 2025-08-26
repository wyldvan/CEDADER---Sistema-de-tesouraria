const express = require('express');
const { FinancialGoal } = require('../models');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get all financial goals
router.get('/', authMiddleware, async (req, res) => {
  try {
    const goals = await FinancialGoal.findAll({
      order: [['createdAt', 'DESC']]
    });

    // Parse JSON fields
    const parsedGoals = goals.map(goal => ({
      ...goal.toJSON(),
      monthlyGoals: JSON.parse(goal.monthlyGoals)
    }));

    res.json(parsedGoals);
  } catch (error) {
    console.error('Get financial goals error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create financial goal
router.post('/', authMiddleware, async (req, res) => {
  try {
    const goalData = {
      ...req.body,
      id: Date.now().toString(),
      createdBy: req.user.username,
      monthlyGoals: JSON.stringify(req.body.monthlyGoals || {})
    };

    const goal = await FinancialGoal.create(goalData);
    
    const parsedGoal = {
      ...goal.toJSON(),
      monthlyGoals: JSON.parse(goal.monthlyGoals)
    };

    res.status(201).json(parsedGoal);
  } catch (error) {
    console.error('Create financial goal error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update financial goal
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    // Stringify JSON field if it exists
    if (updates.monthlyGoals) {
      updates.monthlyGoals = JSON.stringify(updates.monthlyGoals);
    }

    const goal = await FinancialGoal.findByPk(id);
    if (!goal) {
      return res.status(404).json({ error: 'Financial goal not found' });
    }

    await goal.update(updates);
    
    const parsedGoal = {
      ...goal.toJSON(),
      monthlyGoals: JSON.parse(goal.monthlyGoals)
    };

    res.json(parsedGoal);
  } catch (error) {
    console.error('Update financial goal error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete financial goal
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const goal = await FinancialGoal.findByPk(id);
    if (!goal) {
      return res.status(404).json({ error: 'Financial goal not found' });
    }

    await goal.destroy();
    res.json({ message: 'Financial goal deleted successfully' });
  } catch (error) {
    console.error('Delete financial goal error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

