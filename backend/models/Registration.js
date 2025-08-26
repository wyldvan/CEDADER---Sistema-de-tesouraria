const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Registration = sequelize.define('Registration', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false
  },
  field: {
    type: DataTypes.STRING,
    allowNull: false
  },
  month: {
    type: DataTypes.STRING,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  date: {
    type: DataTypes.STRING,
    allowNull: false
  },
  createdBy: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'registrations',
  timestamps: true
});

module.exports = Registration;

