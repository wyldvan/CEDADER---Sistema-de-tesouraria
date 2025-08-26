const express = require('express');
const { Registration } = require('../models');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get all registrations
router.get('/', authMiddleware, async (req, res) => {
  try {
    const registrations = await Registration.findAll({
      order: [['createdAt', 'DESC']]
    });

    res.json(registrations);
  } catch (error) {
    console.error('Get registrations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create registration
router.post('/', authMiddleware, async (req, res) => {
  try {
    const registrationData = {
      ...req.body,
      id: Date.now().toString(),
      date: new Date().toISOString(),
      createdBy: req.user.username
    };

    const registration = await Registration.create(registrationData);
    res.status(201).json(registration);
  } catch (error) {
    console.error('Create registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update registration
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const registration = await Registration.findByPk(id);
    if (!registration) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    await registration.update(updates);
    res.json(registration);
  } catch (error) {
    console.error('Update registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete registration
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const registration = await Registration.findByPk(id);
    if (!registration) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    await registration.destroy();
    res.json({ message: 'Registration deleted successfully' });
  } catch (error) {
    console.error('Delete registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

