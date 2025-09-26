const sequelize = require('../config/database');

const Aluno = require('./aluno');
const Material = require('./material');
const Administrador = require('./administrador');
const Emprestimo = require('./emprestimo');

Emprestimo.belongsTo(Aluno, { foreignKey: 'id_aluno', as: 'aluno' });
Emprestimo.belongsTo(Material, { foreignKey: 'id_material', as: 'material' });
Emprestimo.belongsTo(Administrador, { foreignKey: 'id_admin', as: 'administrador' });

Aluno.hasMany(Emprestimo, { foreignKey: 'id_aluno', as: 'emprestimos' });
Material.hasMany(Emprestimo, { foreignKey: 'id_material', as: 'emprestimos' });
Administrador.hasMany(Emprestimo, { foreignKey: 'id_admin', as: 'emprestimos' });

module.exports = {
  sequelize,
  Aluno,
  Material,
  Administrador,
  Emprestimo,
};