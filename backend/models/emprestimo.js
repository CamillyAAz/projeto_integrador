const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Emprestimo = sequelize.define('Emprestimo', {
  id_emprestimo: {
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
  id_material: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'material',
      key: 'id_material'
    }
  },
  id_admin: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'administrador',
      key: 'id_admin'
    }
  },
  data_retirada: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  data_devolucao_prevista: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  data_devolucao_real: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  periodo: {
    type: DataTypes.ENUM('manhã', 'tarde', 'noite'),
    allowNull: false,
  },
  valor_multa: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0.00,
  },
  multa_paga: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  local_retirada: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  local_devolucao: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('ativo', 'devolvido', 'atrasado'),
    allowNull: false,
    defaultValue: 'ativo',
  },
  aprovado_admin: {
    type: DataTypes.TINYINT(1),
    allowNull: false,
    defaultValue: 0,
  },
}, {
  tableName: 'emprestimo',
  timestamps: false,
});

module.exports = Emprestimo;