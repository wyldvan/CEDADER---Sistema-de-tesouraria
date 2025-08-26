const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const FinancialGoal = sequelize.define('FinancialGoal', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false
  },
  field: {
    type: DataTypes.STRING,
    allowNull: false
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  monthlyGoals: {
    type: DataTypes.TEXT, // JSON string
    allowNull: false,
    defaultValue: '{}'
  },
  annualGoal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  createdBy: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'financial_goals',
  timestamps: true
});

module.exports = FinancialGoal;

