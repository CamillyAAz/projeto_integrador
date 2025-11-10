const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Suspensao = sequelize.define('Suspensao', {
  id_suspensao: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  id_aluno: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'aluno',
      key: 'id_aluno'
    }
  },
  motivo: {
    type: DataTypes.ENUM('multas_pendentes', 'danos_nao_pagos', 'atraso_recorrente', 'outros'),
    allowNull: false,
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  data_inicio: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  data_fim: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  valor_pendente: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
  },
  status: {
    type: DataTypes.ENUM('ativa', 'resolvida', 'cancelada'),
    allowNull: false,
    defaultValue: 'ativa',
  },
  resolvido_por: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'administrador',
      key: 'id_admin'
    }
  },
  data_resolucao: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  observacoes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'suspensao',
  timestamps: false,
});

module.exports = Suspensao;
