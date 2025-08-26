const express = require('express');
const { Transaction } = require('../models');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get all transactions
router.get('/', authMiddleware, async (req, res) => {
  try {
    const transactions = await Transaction.findAll({
      order: [['createdAt', 'DESC']]
    });

    res.json(transactions);
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create transaction
router.post('/', authMiddleware, async (req, res) => {
  try {
    const transactionData = {
      ...req.body,
      id: Date.now().toString(),
      date: new Date().toISOString(),
      createdBy: req.user.username
    };

    const transaction = await Transaction.create(transactionData);
    res.status(201).json(transaction);
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update transaction
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const transaction = await Transaction.findByPk(id);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    await transaction.update(updates);
    res.json(transaction);
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete transaction
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findByPk(id);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    await transaction.destroy();
    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

