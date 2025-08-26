const express = require('express');
const { Prebenda } = require('../models');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get all prebendas
router.get('/', authMiddleware, async (req, res) => {
  try {
    const prebendas = await Prebenda.findAll({
      order: [['createdAt', 'DESC']]
    });

    res.json(prebendas);
  } catch (error) {
    console.error('Get prebendas error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create prebenda
router.post('/', authMiddleware, async (req, res) => {
  try {
    const prebendaData = {
      ...req.body,
      id: Date.now().toString(),
      date: new Date().toISOString(),
      createdBy: req.user.username
    };

    const prebenda = await Prebenda.create(prebendaData);
    res.status(201).json(prebenda);
  } catch (error) {
    console.error('Create prebenda error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update prebenda
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const prebenda = await Prebenda.findByPk(id);
    if (!prebenda) {
      return res.status(404).json({ error: 'Prebenda not found' });
    }

    await prebenda.update(updates);
    res.json(prebenda);
  } catch (error) {
    console.error('Update prebenda error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete prebenda
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const prebenda = await Prebenda.findByPk(id);
    if (!prebenda) {
      return res.status(404).json({ error: 'Prebenda not found' });
    }

    await prebenda.destroy();
    res.json({ message: 'Prebenda deleted successfully' });
  } catch (error) {
    console.error('Delete prebenda error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

