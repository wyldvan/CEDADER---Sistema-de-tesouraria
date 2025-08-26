const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PastorRegistration = sequelize.define('PastorRegistration', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false
  },
  pastorName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  spouseName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  currentField: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fieldPeriod: {
    type: DataTypes.STRING,
    allowNull: false
  },
  children: {
    type: DataTypes.TEXT, // JSON string
    allowNull: false,
    defaultValue: '[]'
  },
  birthDate: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  previousFields: {
    type: DataTypes.TEXT, // JSON string
    allowNull: false,
    defaultValue: '[]'
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
  tableName: 'pastor_registrations',
  timestamps: true
});

module.exports = PastorRegistration;

