const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Database initialization
const { sequelize } = require('./config/database');

// Routes
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const transactionsRoutes = require('./routes/transactions');
const registrationsRoutes = require('./routes/registrations');
const paymentsRoutes = require('./routes/payments');
const prebendasRoutes = require('./routes/prebendas');
const pastorRegistrationsRoutes = require('./routes/pastorRegistrations');
const documentRangesRoutes = require('./routes/documentRanges');
const financialGoalsRoutes = require('./routes/financialGoals');

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/registrations', registrationsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/prebendas', prebendasRoutes);
app.use('/api/pastor-registrations', pastorRegistrationsRoutes);
app.use('/api/document-ranges', documentRangesRoutes);
app.use('/api/financial-goals', financialGoalsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'CEDADER API is running' });
});

// Initialize database and start server
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    await sequelize.sync({ force: false });
    console.log('Database synchronized.');
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
  }
}

startServer();

