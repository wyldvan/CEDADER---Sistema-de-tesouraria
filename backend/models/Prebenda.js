const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Prebenda = sequelize.define('Prebenda', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('entry', 'exit'),
    allowNull: false
  },
  pastor: {
    type: DataTypes.STRING,
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  month: {
    type: DataTypes.STRING,
    allowNull: false
  },
  field: {
    type: DataTypes.STRING,
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  paymentMethod: {
    type: DataTypes.ENUM('pix', 'cash', 'transfer'),
    allowNull: false
  },
  documentNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isAuxilio: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false
  },
  isPrebenda: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false
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
  tableName: 'prebendas',
  timestamps: true
});

module.exports = Prebenda;

