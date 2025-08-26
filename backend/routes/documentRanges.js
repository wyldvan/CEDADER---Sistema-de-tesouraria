const express = require('express');
const { DocumentRange } = require('../models');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get all document ranges
router.get('/', authMiddleware, async (req, res) => {
  try {
    const documentRanges = await DocumentRange.findAll({
      order: [['createdAt', 'DESC']]
    });

    res.json(documentRanges);
  } catch (error) {
    console.error('Get document ranges error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create document range
router.post('/', authMiddleware, async (req, res) => {
  try {
    const rangeData = {
      ...req.body,
      id: Date.now().toString(),
      createdBy: req.user.username
    };

    const range = await DocumentRange.create(rangeData);
    res.status(201).json(range);
  } catch (error) {
    console.error('Create document range error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update document range
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const range = await DocumentRange.findByPk(id);
    if (!range) {
      return res.status(404).json({ error: 'Document range not found' });
    }

    await range.update(updates);
    res.json(range);
  } catch (error) {
    console.error('Update document range error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete document range
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const range = await DocumentRange.findByPk(id);
    if (!range) {
      return res.status(404).json({ error: 'Document range not found' });
    }

    await range.destroy();
    res.json({ message: 'Document range deleted successfully' });
  } catch (error) {
    console.error('Delete document range error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

