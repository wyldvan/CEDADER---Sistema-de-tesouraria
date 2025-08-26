const express = require('express');
const bcrypt = require('bcryptjs');
const { User } = require('../models');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get all users (admin only)
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });

    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create user (admin only)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { username, password, role, fullName, email, isActive = true } = req.body;

    if (!username || !password || !role) {
      return res.status(400).json({ error: 'Username, password, and role are required' });
    }

    // Check if username already exists
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      id: Date.now().toString(),
      username,
      password: hashedPassword,
      role,
      fullName,
      email,
      isActive,
      createdBy: req.user.username
    });

    const { password: _, ...userWithoutPassword } = user.toJSON();
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user (admin only)
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Don't allow updating the default admin
    if (id === 'admin-default' && updates.isActive === false) {
      return res.status(400).json({ error: 'Cannot deactivate default admin' });
    }

    // If password is being updated, hash it
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    // Check if username is being changed and if it's already taken
    if (updates.username && updates.username !== user.username) {
      const existingUser = await User.findOne({ 
        where: { 
          username: updates.username,
          id: { [require('sequelize').Op.ne]: id }
        }
      });
      if (existingUser) {
        return res.status(400).json({ error: 'Username already exists' });
      }
    }

    await user.update(updates);

    const { password: _, ...userWithoutPassword } = user.toJSON();
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete user (admin only)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Don't allow deleting the default admin
    if (id === 'admin-default') {
      return res.status(400).json({ error: 'Cannot delete default admin' });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await user.destroy();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

