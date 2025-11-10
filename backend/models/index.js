const sequelize = require('../config/database');

const Aluno = require('./aluno');
const Material = require('./material');
const Administrador = require('./administrador');
const Emprestimo = require('./emprestimo');
const Dano = require('./dano');
const Suspensao = require('./suspensao');

Emprestimo.belongsTo(Aluno, { foreignKey: 'id_aluno' });
Emprestimo.belongsTo(Material, { foreignKey: 'id_material' });
Emprestimo.belongsTo(Administrador, { foreignKey: 'id_admin' });

Aluno.hasMany(Emprestimo, { foreignKey: 'id_aluno' });
Material.hasMany(Emprestimo, { foreignKey: 'id_material' });
Administrador.hasMany(Emprestimo, { foreignKey: 'id_admin' });

Dano.belongsTo(Emprestimo, { foreignKey: 'id_emprestimo' });
Dano.belongsTo(Aluno, { foreignKey: 'id_aluno' });
Dano.belongsTo(Material, { foreignKey: 'id_material' });

Emprestimo.hasMany(Dano, { foreignKey: 'id_emprestimo' });
Aluno.hasMany(Dano, { foreignKey: 'id_aluno' });
Material.hasMany(Dano, { foreignKey: 'id_material' });

Suspensao.belongsTo(Aluno, { foreignKey: 'id_aluno' });
Suspensao.belongsTo(Administrador, { foreignKey: 'resolvido_por' });

Aluno.hasMany(Suspensao, { foreignKey: 'id_aluno' });
Administrador.hasMany(Suspensao, { foreignKey: 'resolvido_por' });

module.exports = {
  sequelize,
  Aluno,
  Material,
  Administrador,
  Emprestimo,
  Dano,
  Suspensao,
};