const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const DocumentRange = sequelize.define('DocumentRange', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  startNumber: {
    type: DataTypes.STRING,
    allowNull: false
  },
  endNumber: {
    type: DataTypes.STRING,
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
  tableName: 'document_ranges',
  timestamps: true
});

module.exports = DocumentRange;

