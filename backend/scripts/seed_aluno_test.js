require('dotenv').config();
const bcrypt = require('bcrypt');
const sequelize = require('../config/database');
const { Administrador, Aluno } = require('../models');

(async () => {
  try {
    await sequelize.sync({ alter: true, force: false });

    // Criar usuário comum de teste com RA menor
    const alunoRa = '12345'; // RA menor para evitar erro de tamanho
    const alunoSenha = '87654321';
    const alunoHash = await bcrypt.hash(alunoSenha, 10);
    const [aluno] = await Aluno.findOrCreate({
      where: { ra: alunoRa },
      defaults: {
        ra: alunoRa,
        nome: 'Aluno Teste TDD',
        turma: 'A',
        bloco: 'Dev',
        email: 'aluno.tdd@example.com',
        telefone: '45999999999',
        senha: alunoHash,
        ativo: 1,
      },
    });

    console.log('✅ Aluno de teste criado com sucesso:');
    console.log('📱 RA:', aluno.ra);
    console.log('👤 Nome:', aluno.nome);
    console.log('🔑 Senha:', alunoSenha);
    console.log('');
    console.log('📝 Use estas credenciais para testes:');
    console.log('   Login: 12345');
    console.log('   Senha: 87654321');
    
    process.exit(0);
  } catch (e) {
    console.error('❌ Erro ao criar aluno de teste:', e.message);
    process.exit(1);
  }
})();