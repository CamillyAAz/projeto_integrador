const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Aluno = sequelize.define('Aluno', {
  id_aluno: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  ra: {
    type: DataTypes.STRING(7),
    allowNull: false,
    unique: true,
  },
  nome: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  turma: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  bloco: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  ativo: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 1,
  },
}, {
  tableName: 'aluno',
  timestamps: false,
});

module.exports = Aluno;
