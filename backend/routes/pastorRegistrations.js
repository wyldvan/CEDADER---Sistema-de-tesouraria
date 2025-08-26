const express = require('express');
const { PastorRegistration } = require('../models');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get all pastor registrations
router.get('/', authMiddleware, async (req, res) => {
  try {
    const pastorRegistrations = await PastorRegistration.findAll({
      order: [['createdAt', 'DESC']]
    });

    // Parse JSON fields
    const parsedRegistrations = pastorRegistrations.map(reg => ({
      ...reg.toJSON(),
      children: JSON.parse(reg.children),
      previousFields: JSON.parse(reg.previousFields)
    }));

    res.json(parsedRegistrations);
  } catch (error) {
    console.error('Get pastor registrations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create pastor registration
router.post('/', authMiddleware, async (req, res) => {
  try {
    const registrationData = {
      ...req.body,
      id: Date.now().toString(),
      date: new Date().toISOString(),
      createdBy: req.user.username,
      children: JSON.stringify(req.body.children || []),
      previousFields: JSON.stringify(req.body.previousFields || [])
    };

    const registration = await PastorRegistration.create(registrationData);
    
    const parsedRegistration = {
      ...registration.toJSON(),
      children: JSON.parse(registration.children),
      previousFields: JSON.parse(registration.previousFields)
    };

    res.status(201).json(parsedRegistration);
  } catch (error) {
    console.error('Create pastor registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update pastor registration
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    // Stringify JSON fields if they exist
    if (updates.children) {
      updates.children = JSON.stringify(updates.children);
    }
    if (updates.previousFields) {
      updates.previousFields = JSON.stringify(updates.previousFields);
    }

    const registration = await PastorRegistration.findByPk(id);
    if (!registration) {
      return res.status(404).json({ error: 'Pastor registration not found' });
    }

    await registration.update(updates);
    
    const parsedRegistration = {
      ...registration.toJSON(),
      children: JSON.parse(registration.children),
      previousFields: JSON.parse(registration.previousFields)
    };

    res.json(parsedRegistration);
  } catch (error) {
    console.error('Update pastor registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete pastor registration
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const registration = await PastorRegistration.findByPk(id);
    if (!registration) {
      return res.status(404).json({ error: 'Pastor registration not found' });
    }

    await registration.destroy();
    res.json({ message: 'Pastor registration deleted successfully' });
  } catch (error) {
    console.error('Delete pastor registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

