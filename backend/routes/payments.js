const express = require('express');
const { Payment } = require('../models');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get all payments
router.get('/', authMiddleware, async (req, res) => {
  try {
    const payments = await Payment.findAll({
      order: [['createdAt', 'DESC']]
    });

    res.json(payments);
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create payment
router.post('/', authMiddleware, async (req, res) => {
  try {
    const paymentData = {
      ...req.body,
      id: Date.now().toString(),
      date: new Date().toISOString(),
      createdBy: req.user.username
    };

    const payment = await Payment.create(paymentData);
    res.status(201).json(payment);
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update payment
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const payment = await Payment.findByPk(id);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    await payment.update(updates);
    res.json(payment);
  } catch (error) {
    console.error('Update payment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete payment
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await Payment.findByPk(id);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    await payment.destroy();
    res.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    console.error('Delete payment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

