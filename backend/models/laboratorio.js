const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Laboratorio = sequelize.define('Laboratorio', {
  id_laboratorio: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nome: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  codigo: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
  },
  bloco: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  andar: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  capacidade: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  tipo: {
    type: DataTypes.ENUM('informatica', 'quimica', 'fisica', 'biologia', 'multiplo', 'outro'),
    allowNull: false,
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  responsavel: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  telefone: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  disponivel: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  horario_funcionamento: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  equipamentos: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  observacoes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'laboratorio',
  timestamps: true,
});

module.exports = Laboratorio;
