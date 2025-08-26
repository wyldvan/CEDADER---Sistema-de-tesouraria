const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = await User.findOne({ 
      where: { 
        username: username,
        isActive: true 
      } 
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // For migration compatibility, check both hashed and plain passwords
    let isValidPassword = false;
    
    if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
      // Password is hashed
      isValidPassword = await bcrypt.compare(password, user.password);
    } else {
      // Password is plain text (for migration compatibility)
      isValidPassword = password === user.password;
      
      // Hash the password for future use
      if (isValidPassword) {
        const hashedPassword = await bcrypt.hash(password, 10);
        await user.update({ password: hashedPassword });
      }
    }

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        fullName: user.fullName,
        email: user.email,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user
router.get('/me', authMiddleware, async (req, res) => {
  try {
    res.json({
      id: req.user.id,
      username: req.user.username,
      role: req.user.role,
      fullName: req.user.fullName,
      email: req.user.email,
      isActive: req.user.isActive
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update credentials
router.put('/credentials', authMiddleware, async (req, res) => {
  try {
    const { newUsername, newPassword } = req.body;

    if (!newUsername || !newPassword) {
      return res.status(400).json({ error: 'New username and password are required' });
    }

    // Check if username is already taken by another user
    const existingUser = await User.findOne({
      where: { 
        username: newUsername,
        id: { [require('sequelize').Op.ne]: req.user.id }
      }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await req.user.update({
      username: newUsername,
      password: hashedPassword
    });

    res.json({ message: 'Credentials updated successfully' });
  } catch (error) {
    console.error('Update credentials error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

