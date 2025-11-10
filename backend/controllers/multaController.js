const { Emprestimo, Aluno, Material } = require('../models');
const Suspensao = require('../models/suspensao');
const { Op } = require('sequelize');
const WhatsAppNotificationService = require('../services/whatsappNotificationService');

const whatsappService = new WhatsAppNotificationService();

const VALOR_MULTA_POR_DIA = 10.0;
const LIMITE_MULTAS_SUSPENSAO = 50.0;

const calcularMultaPorAtraso = (dataPrevista, dataReal) => {
  const prevista = new Date(dataPrevista);
  const real = new Date(dataReal);
  
  if (real <= prevista) return 0;
  
  const diffTime = Math.abs(real - prevista);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays * VALOR_MULTA_POR_DIA;
};

const verificarESuspenderAluno = async (alunoId) => {
  const multasPendentes = await Emprestimo.sum('valor_multa', {
    where: {
      id_aluno: alunoId,
      multa_paga: false,
      valor_multa: { [Op.gt]: 0 }
    }
  });

  const totalMultas = parseFloat(multasPendentes || 0);

  if (totalMultas >= LIMITE_MULTAS_SUSPENSAO) {
    const suspensaoAtiva = await Suspensao.findOne({
      where: {
        id_aluno: alunoId,
        status: 'ativa',
        motivo: 'multas_pendentes'
      }
    });

    if (!suspensaoAtiva) {
      await Suspensao.create({
        id_aluno: alunoId,
        motivo: 'multas_pendentes',
        descricao: `Suspensão automática por acúmulo de multas. Total pendente: R$ ${totalMultas.toFixed(2)}`,
        valor_pendente: totalMultas,
        status: 'ativa'
      });

      const aluno = await Aluno.findByPk(alunoId);
      if (aluno) {
        await aluno.update({ ativo: false });
        
        try {
          await whatsappService.notifySuspension(aluno, totalMultas);
        } catch (error) {
          console.error('Erro ao notificar suspensão:', error.message);
        }
      }

      return true;
    }
  }

  return false;
};

module.exports = {
  async aplicarMulta(req, res) {
    try {
      const { id_emprestimo } = req.params;
      const { data_devolucao_real } = req.body;

      const emprestimo = await Emprestimo.findByPk(id_emprestimo);
      if (!emprestimo) {
        return res.status(404).json({ error: 'Empréstimo não encontrado' });
      }

      if (emprestimo.valor_multa > 0) {
        return res.status(400).json({ 
          error: 'Multa já aplicada',
          valor_atual: parseFloat(emprestimo.valor_multa).toFixed(2)
        });
      }

      const dataReal = data_devolucao_real ? new Date(data_devolucao_real) : new Date();
      const valorMulta = calcularMultaPorAtraso(emprestimo.data_devolucao_prevista, dataReal);

      if (valorMulta === 0) {
        return res.status(400).json({ 
          error: 'Não há multa a ser aplicada',
          message: 'Material devolvido dentro do prazo'
        });
      }

      await emprestimo.update({
        valor_multa: valorMulta,
        multa_paga: false,
        status: 'devolvido'
      });

      const aluno = await Aluno.findByPk(emprestimo.id_aluno);
      const material = await Material.findByPk(emprestimo.id_material);

      if (aluno && material) {
        try {
          await whatsappService.notifyFine(aluno, material, valorMulta, emprestimo);
        } catch (error) {
          console.error('Erro ao notificar multa:', error.message);
        }
      }

      const suspendido = await verificarESuspenderAluno(emprestimo.id_aluno);

      res.json({
        message: 'Multa aplicada com sucesso',
        emprestimo,
        valor_multa: valorMulta.toFixed(2),
        dias_atraso: Math.ceil((dataReal - new Date(emprestimo.data_devolucao_prevista)) / (1000 * 60 * 60 * 24)),
        aluno_suspendido: suspendido
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async listarMultas(req, res) {
    try {
      const { status, id_aluno } = req.query;
      
      const whereClause = {
        valor_multa: { [Op.gt]: 0 }
      };

      if (status === 'pago') {
        whereClause.multa_paga = true;
      } else if (status === 'pendente') {
        whereClause.multa_paga = false;
      }

      if (id_aluno) {
        whereClause.id_aluno = id_aluno;
      }

      const emprestimos = await Emprestimo.findAll({
        where: whereClause,
        include: [
          {
            model: Aluno,
            attributes: ['id_aluno', 'nome', 'ra', 'email', 'telefone']
          },
          {
            model: Material,
            attributes: ['id_material', 'nome', 'codigo']
          }
        ],
        order: [['data_devolucao_prevista', 'DESC']]
      });

      const totalMultas = emprestimos.reduce((sum, e) => sum + parseFloat(e.valor_multa), 0);
      const multasPagas = emprestimos.filter(e => e.multa_paga).reduce((sum, e) => sum + parseFloat(e.valor_multa), 0);
      const multasPendentes = totalMultas - multasPagas;

      res.json({
        total_registros: emprestimos.length,
        resumo: {
          total_multas: totalMultas.toFixed(2),
          multas_pagas: multasPagas.toFixed(2),
          multas_pendentes: multasPendentes.toFixed(2),
          quantidade_pagas: emprestimos.filter(e => e.multa_paga).length,
          quantidade_pendentes: emprestimos.filter(e => !e.multa_paga).length
        },
        multas: emprestimos
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async pagarMulta(req, res) {
    try {
      const { id_emprestimo } = req.params;
      const { valor_pago, forma_pagamento } = req.body;

      const emprestimo = await Emprestimo.findByPk(id_emprestimo);
      if (!emprestimo) {
        return res.status(404).json({ error: 'Empréstimo não encontrado' });
      }

      if (emprestimo.valor_multa === 0) {
        return res.status(400).json({ error: 'Este empréstimo não possui multa' });
      }

      if (emprestimo.multa_paga) {
        return res.status(400).json({ error: 'Multa já foi paga anteriormente' });
      }

      const valorMulta = parseFloat(emprestimo.valor_multa);
      const valorPago = parseFloat(valor_pago || valorMulta);

      if (valorPago < valorMulta) {
        return res.status(400).json({ 
          error: 'Valor insuficiente',
          valor_devido: valorMulta.toFixed(2),
          valor_recebido: valorPago.toFixed(2)
        });
      }

      await emprestimo.update({
        multa_paga: true,
        data_pagamento_multa: new Date()
      });

      const totalMultasPendentes = await Emprestimo.sum('valor_multa', {
        where: {
          id_aluno: emprestimo.id_aluno,
          multa_paga: false,
          valor_multa: { [Op.gt]: 0 }
        }
      });

      const suspensao = await Suspensao.findOne({
        where: {
          id_aluno: emprestimo.id_aluno,
          status: 'ativa',
          motivo: 'multas_pendentes'
        }
      });

      let suspensaoResolvida = false;
      if (suspensao && (!totalMultasPendentes || totalMultasPendentes < LIMITE_MULTAS_SUSPENSAO)) {
        await suspensao.update({
          status: 'resolvida',
          data_resolucao: new Date(),
          observacoes: 'Suspensão resolvida após pagamento de multas'
        });

        const aluno = await Aluno.findByPk(emprestimo.id_aluno);
        if (aluno) {
          await aluno.update({ ativo: true });
          
          try {
            await whatsappService.notifySuspensionLifted(aluno);
          } catch (error) {
            console.error('Erro ao notificar liberação:', error.message);
          }
        }
        
        suspensaoResolvida = true;
      }

      res.json({
        message: 'Pagamento registrado com sucesso',
        emprestimo,
        valor_pago: valorPago.toFixed(2),
        troco: valorPago > valorMulta ? (valorPago - valorMulta).toFixed(2) : '0.00',
        forma_pagamento: forma_pagamento || 'não informado',
        suspensao_resolvida: suspensaoResolvida
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async calcularMulta(req, res) {
    try {
      const { data_prevista, data_real } = req.query;

      if (!data_prevista) {
        return res.status(400).json({ error: 'Data prevista é obrigatória' });
      }

      const dataReal = data_real ? new Date(data_real) : new Date();
      const dataPrevista = new Date(data_prevista);

      if (dataReal <= dataPrevista) {
        return res.json({
          dias_atraso: 0,
          valor_multa: '0.00',
          message: 'Sem atraso'
        });
      }

      const diffTime = Math.abs(dataReal - dataPrevista);
      const diasAtraso = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const valorMulta = diasAtraso * VALOR_MULTA_POR_DIA;

      res.json({
        data_prevista: dataPrevista.toISOString().split('T')[0],
        data_real: dataReal.toISOString().split('T')[0],
        dias_atraso: diasAtraso,
        valor_por_dia: VALOR_MULTA_POR_DIA.toFixed(2),
        valor_multa: valorMulta.toFixed(2)
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async relatorioMultas(req, res) {
    try {
      const { data_inicio, data_fim } = req.query;

      const whereClause = {
        valor_multa: { [Op.gt]: 0 }
      };

      if (data_inicio && data_fim) {
        whereClause.data_devolucao_prevista = {
          [Op.between]: [new Date(data_inicio), new Date(data_fim)]
        };
      }

      const emprestimos = await Emprestimo.findAll({
        where: whereClause,
        include: [
          {
            model: Aluno,
            attributes: ['id_aluno', 'nome', 'ra', 'turma']
          }
        ]
      });

      const totalMultas = emprestimos.reduce((sum, e) => sum + parseFloat(e.valor_multa), 0);
      const multasPagas = emprestimos.filter(e => e.multa_paga).reduce((sum, e) => sum + parseFloat(e.valor_multa), 0);
      const multasPendentes = totalMultas - multasPagas;

      const alunosComMulta = [...new Set(emprestimos.map(e => e.id_aluno))];
      const alunosMultasAltas = emprestimos
        .reduce((acc, e) => {
          if (!acc[e.id_aluno]) {
            acc[e.id_aluno] = { aluno: e.Aluno, total: 0, quantidade: 0 };
          }
          if (!e.multa_paga) {
            acc[e.id_aluno].total += parseFloat(e.valor_multa);
            acc[e.id_aluno].quantidade += 1;
          }
          return acc;
        }, {});

      const ranking = Object.values(alunosMultasAltas)
        .filter(a => a.total > 0)
        .sort((a, b) => b.total - a.total)
        .slice(0, 10);

      res.json({
        periodo: {
          data_inicio: data_inicio || 'Início',
          data_fim: data_fim || 'Atual'
        },
        resumo: {
          total_multas_geradas: totalMultas.toFixed(2),
          total_multas_pagas: multasPagas.toFixed(2),
          total_multas_pendentes: multasPendentes.toFixed(2),
          quantidade_total: emprestimos.length,
          quantidade_pagas: emprestimos.filter(e => e.multa_paga).length,
          quantidade_pendentes: emprestimos.filter(e => !e.multa_paga).length,
          taxa_recuperacao: totalMultas > 0 ? ((multasPagas / totalMultas) * 100).toFixed(2) + '%' : '0%',
          alunos_com_multa: alunosComMulta.length
        },
        ranking_devedores: ranking.map(r => ({
          aluno: r.aluno,
          total_pendente: r.total.toFixed(2),
          quantidade_multas: r.quantidade
        }))
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};
