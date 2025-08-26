const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
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
  paymentMethod: {
    type: DataTypes.ENUM('pix', 'cash', 'transfer'),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  field: {
    type: DataTypes.STRING,
    allowNull: true
  },
  month: {
    type: DataTypes.STRING,
    allowNull: true
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
  tableName: 'payments',
  timestamps: true
});

module.exports = Payment;

