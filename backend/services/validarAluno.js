const Aluno = require('../models/aluno');
const Emprestimo = require('../models/emprestimo');

async function alunoEstaApto(id_aluno, limiteEmprestimos = 3) {
//Verifica se está cadastrado
  const aluno = await Aluno.findByPk(id_aluno);
  if (!aluno) return { apto: false, motivo: 'Aluno não cadastrado.' };

//Verifica se está ativo
  if (!aluno.ativo) return { apto: false, motivo: 'Aluno inativo.' };

//Verifica se tem pendências (empréstimos em atraso)
  const emprestimosAtrasados = await Emprestimo.findAll({
    where: { id_aluno, status: 'atrasado' }
  });
  if (emprestimosAtrasados.length > 0) {
    return { apto: false, motivo: 'Aluno possui débitos/pedências.' };
  }

//Limite empréstimos ativos
  const emprestimosAtivos = await Emprestimo.findAll({
    where: { id_aluno, status: 'ativo' }
  });
  if (emprestimosAtivos.length >= limiteEmprestimos) {
    return { apto: false, motivo: 'Aluno atingiu o limite de empréstimos.' };
  }

  return { apto: true, motivo: 'Aluno apto para empréstimo.' };
}

module.exports = alunoEstaApto;