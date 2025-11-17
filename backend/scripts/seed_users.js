require('dotenv').config();
const bcrypt = require('bcrypt');
const sequelize = require('../config/database');
const { Administrador, Aluno } = require('../models');

(async () => {
  try {
    await sequelize.sync({ alter: true, force: false });

    const adminLogin = 'admin';
    const adminSenha = 'adnim';
    const adminEmail = 'admin@example.com';
    const adminHash = await bcrypt.hash(adminSenha, 10);
    const [admin] = await Administrador.findOrCreate({
      where: { login: adminLogin },
      defaults: { nome: 'Administrador', login: adminLogin, senha: adminHash, email: adminEmail },
    });

    const alunoRa = '12345';
    const alunoSenha = '87654321';
    const alunoHash = await bcrypt.hash(alunoSenha, 10);
    const [aluno] = await Aluno.findOrCreate({
      where: { ra: alunoRa },
      defaults: {
        ra: alunoRa,
        nome: 'Aluno Teste',
        turma: 'A',
        bloco: 'Dev',
        email: 'aluno@example.com',
        telefone: '45999999999',
        senha: alunoHash,
        ativo: 1,
      },
    });

    console.log('Admin:', { id_admin: admin.id_admin, login: admin.login });
    console.log('Aluno:', { id_aluno: aluno.id_aluno, ra: aluno.ra });
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();