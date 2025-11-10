const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Dano = sequelize.define('Dano', {
  id_dano: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  id_emprestimo: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'emprestimo',
      key: 'id_emprestimo'
    }
  },
  id_material: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'material',
      key: 'id_material'
    }
  },
  id_aluno: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'aluno',
      key: 'id_aluno'
    }
  },
  descricao_dano: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  gravidade: {
    type: DataTypes.ENUM('leve', 'moderado', 'grave', 'perda_total'),
    allowNull: false,
  },
  valor_reparo: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
  },
  data_registro: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  status_reparo: {
    type: DataTypes.ENUM('pendente', 'em_reparo', 'reparado', 'irreparavel'),
    allowNull: false,
    defaultValue: 'pendente',
  },
  valor_pago: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
  },
  data_pagamento: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  observacoes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'dano',
  timestamps: false,
});

module.exports = Dano;
