const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ObreiroRegistration = sequelize.define('ObreiroRegistration', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false
  },
  nomeCompleto: {
    type: DataTypes.STRING,
    allowNull: false
  },
  setor: {
    type: DataTypes.STRING,
    allowNull: false
  },
  campo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  campoMissionario: {
    type: DataTypes.STRING,
    allowNull: true
  },
  tipo: {
    type: DataTypes.ENUM('pastor', 'missionaria', 'evangelista', 'jubilado'),
    allowNull: false
  },
  pagamento: {
    type: DataTypes.TEXT, // JSON string
    allowNull: false
  },
  observacoes: {
    type: DataTypes.TEXT,
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
  tableName: 'obreiro_registrations',
  timestamps: true
});

module.exports = ObreiroRegistration;

