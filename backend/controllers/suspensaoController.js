const Suspensao = require('../models/suspensao');
const { Aluno, Emprestimo } = require('../models');
const Dano = require('../models/dano');
const { Op } = require('sequelize');
const WhatsAppNotificationService = require('../services/whatsappNotificationService');

const whatsappService = new WhatsAppNotificationService();

module.exports = {
  async criarSuspensao(req, res) {
    try {
      const { id_aluno, motivo, descricao, valor_pendente, data_fim } = req.body;

      const aluno = await Aluno.findByPk(id_aluno);
      if (!aluno) {
        return res.status(404).json({ error: 'Aluno não encontrado' });
      }

      const suspensaoAtiva = await Suspensao.findOne({
        where: {
          id_aluno,
          status: 'ativa'
        }
      });

      if (suspensaoAtiva) {
        return res.status(400).json({ 
          error: 'Aluno já possui suspensão ativa',
          suspensao: suspensaoAtiva
        });
      }

      const suspensao = await Suspensao.create({
        id_aluno,
        motivo,
        descricao,
        valor_pendente: valor_pendente || 0,
        data_fim,
        status: 'ativa'
      });

      await aluno.update({ ativo: false });

      try {
        await whatsappService.notifySuspension(aluno, valor_pendente || 0, motivo, descricao);
      } catch (error) {
        console.error('Erro ao notificar suspensão:', error.message);
      }

      res.status(201).json({
        message: 'Suspensão criada com sucesso',
        suspensao
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async listarSuspensoes(req, res) {
    try {
      const { status, id_aluno } = req.query;

      const whereClause = {};

      if (status) {
        whereClause.status = status;
      }

      if (id_aluno) {
        whereClause.id_aluno = id_aluno;
      }

      const suspensoes = await Suspensao.findAll({
        where: whereClause,
        include: [
          {
            model: Aluno,
            attributes: ['id_aluno', 'nome', 'ra', 'email', 'telefone', 'turma']
          }
        ],
        order: [['data_inicio', 'DESC']]
      });

      const ativas = suspensoes.filter(s => s.status === 'ativa').length;
      const resolvidas = suspensoes.filter(s => s.status === 'resolvida').length;
      const canceladas = suspensoes.filter(s => s.status === 'cancelada').length;
      const valorTotal = suspensoes.reduce((sum, s) => sum + parseFloat(s.valor_pendente || 0), 0);

      res.json({
        total: suspensoes.length,
        resumo: {
          ativas,
          resolvidas,
          canceladas,
          valor_total_pendente: valorTotal.toFixed(2)
        },
        suspensoes
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async verificarSuspensao(req, res) {
    try {
      const { id_aluno } = req.params;

      const aluno = await Aluno.findByPk(id_aluno);
      if (!aluno) {
        return res.status(404).json({ error: 'Aluno não encontrado' });
      }

      const suspensao = await Suspensao.findOne({
        where: {
          id_aluno,
          status: 'ativa'
        }
      });

      if (!suspensao) {
        return res.json({
          suspenso: false,
          message: 'Aluno não possui suspensão ativa',
          ativo: aluno.ativo
        });
      }

      const multasPendentes = await Emprestimo.sum('valor_multa', {
        where: {
          id_aluno,
          multa_paga: false,
          valor_multa: { [Op.gt]: 0 }
        }
      });

      const danosPendentes = await Dano.sum('valor_reparo', {
        where: {
          id_aluno,
          valor_pago: 0,
          valor_reparo: { [Op.gt]: 0 }
        }
      });

      res.json({
        suspenso: true,
        suspensao,
        detalhes: {
          multas_pendentes: parseFloat(multasPendentes || 0).toFixed(2),
          danos_pendentes: parseFloat(danosPendentes || 0).toFixed(2),
          total_pendente: (parseFloat(multasPendentes || 0) + parseFloat(danosPendentes || 0)).toFixed(2)
        },
        aluno: {
          id: aluno.id_aluno,
          nome: aluno.nome,
          ra: aluno.ra,
          ativo: aluno.ativo
        }
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async resolverSuspensao(req, res) {
    try {
      const { id_suspensao } = req.params;
      const { resolvido_por, observacoes } = req.body;

      const suspensao = await Suspensao.findByPk(id_suspensao);
      if (!suspensao) {
        return res.status(404).json({ error: 'Suspensão não encontrada' });
      }

      if (suspensao.status !== 'ativa') {
        return res.status(400).json({ 
          error: 'Suspensão não está ativa',
          status_atual: suspensao.status
        });
      }

      await suspensao.update({
        status: 'resolvida',
        resolvido_por,
        data_resolucao: new Date(),
        observacoes
      });

      const aluno = await Aluno.findByPk(suspensao.id_aluno);
      if (aluno) {
        await aluno.update({ ativo: true });

        try {
          await whatsappService.notifySuspensionLifted(aluno);
        } catch (error) {
          console.error('Erro ao notificar liberação:', error.message);
        }
      }

      res.json({
        message: 'Suspensão resolvida com sucesso',
        suspensao
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async cancelarSuspensao(req, res) {
    try {
      const { id_suspensao } = req.params;
      const { motivo_cancelamento } = req.body;

      const suspensao = await Suspensao.findByPk(id_suspensao);
      if (!suspensao) {
        return res.status(404).json({ error: 'Suspensão não encontrada' });
      }

      if (suspensao.status !== 'ativa') {
        return res.status(400).json({ 
          error: 'Suspensão não está ativa',
          status_atual: suspensao.status
        });
      }

      await suspensao.update({
        status: 'cancelada',
        data_resolucao: new Date(),
        observacoes: motivo_cancelamento
      });

      const aluno = await Aluno.findByPk(suspensao.id_aluno);
      if (aluno) {
        await aluno.update({ ativo: true });
      }

      res.json({
        message: 'Suspensão cancelada com sucesso',
        suspensao
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async processarSuspensoesAutomaticas(req, res) {
    try {
      const LIMITE_MULTAS = 50.0;
      const LIMITE_DANOS = 100.0;

      const alunosComMultasAltas = await Emprestimo.findAll({
        attributes: [
          'id_aluno',
          [Emprestimo.sequelize.fn('SUM', Emprestimo.sequelize.col('valor_multa')), 'total_multas']
        ],
        where: {
          multa_paga: false,
          valor_multa: { [Op.gt]: 0 }
        },
        group: ['id_aluno'],
        having: Emprestimo.sequelize.literal(`SUM(valor_multa) >= ${LIMITE_MULTAS}`),
        raw: true
      });

      const suspensoesMultas = [];
      for (const registro of alunosComMultasAltas) {
        const suspensaoExiste = await Suspensao.findOne({
          where: {
            id_aluno: registro.id_aluno,
            status: 'ativa',
            motivo: 'multas_pendentes'
          }
        });

        if (!suspensaoExiste) {
          const suspensao = await Suspensao.create({
            id_aluno: registro.id_aluno,
            motivo: 'multas_pendentes',
            descricao: `Suspensão automática por acúmulo de multas pendentes`,
            valor_pendente: registro.total_multas,
            status: 'ativa'
          });

          const aluno = await Aluno.findByPk(registro.id_aluno);
          if (aluno) {
            await aluno.update({ ativo: false });
          }

          suspensoesMultas.push(suspensao);
        }
      }

      const alunosComDanosAltos = await Dano.findAll({
        attributes: [
          'id_aluno',
          [Dano.sequelize.fn('SUM', Dano.sequelize.col('valor_reparo')), 'total_danos']
        ],
        where: {
          valor_pago: 0,
          valor_reparo: { [Op.gt]: 0 }
        },
        group: ['id_aluno'],
        having: Dano.sequelize.literal(`SUM(valor_reparo) >= ${LIMITE_DANOS}`),
        raw: true
      });

      const suspensoesDanos = [];
      for (const registro of alunosComDanosAltos) {
        const suspensaoExiste = await Suspensao.findOne({
          where: {
            id_aluno: registro.id_aluno,
            status: 'ativa',
            motivo: 'danos_nao_pagos'
          }
        });

        if (!suspensaoExiste) {
          const suspensao = await Suspensao.create({
            id_aluno: registro.id_aluno,
            motivo: 'danos_nao_pagos',
            descricao: `Suspensão automática por acúmulo de danos não pagos`,
            valor_pendente: registro.total_danos,
            status: 'ativa'
          });

          const aluno = await Aluno.findByPk(registro.id_aluno);
          if (aluno) {
            await aluno.update({ ativo: false });
          }

          suspensoesDanos.push(suspensao);
        }
      }

      res.json({
        message: 'Processamento de suspensões automáticas concluído',
        suspensoes_criadas: {
          por_multas: suspensoesMultas.length,
          por_danos: suspensoesDanos.length,
          total: suspensoesMultas.length + suspensoesDanos.length
        },
        limites: {
          multas: LIMITE_MULTAS,
          danos: LIMITE_DANOS
        }
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async relatorioSuspensoes(req, res) {
    try {
      const { data_inicio, data_fim } = req.query;

      const whereClause = {};

      if (data_inicio && data_fim) {
        whereClause.data_inicio = {
          [Op.between]: [new Date(data_inicio), new Date(data_fim)]
        };
      }

      const suspensoes = await Suspensao.findAll({
        where: whereClause,
        include: [
          {
            model: Aluno,
            attributes: ['id_aluno', 'nome', 'ra', 'turma']
          }
        ]
      });

      const porMotivo = suspensoes.reduce((acc, s) => {
        acc[s.motivo] = (acc[s.motivo] || 0) + 1;
        return acc;
      }, {});

      const tempoMedio = suspensoes
        .filter(s => s.data_resolucao)
        .reduce((acc, s) => {
          const dias = Math.ceil((new Date(s.data_resolucao) - new Date(s.data_inicio)) / (1000 * 60 * 60 * 24));
          return acc + dias;
        }, 0) / suspensoes.filter(s => s.data_resolucao).length || 0;

      res.json({
        periodo: {
          data_inicio: data_inicio || 'Início',
          data_fim: data_fim || 'Atual'
        },
        resumo: {
          total_suspensoes: suspensoes.length,
          ativas: suspensoes.filter(s => s.status === 'ativa').length,
          resolvidas: suspensoes.filter(s => s.status === 'resolvida').length,
          canceladas: suspensoes.filter(s => s.status === 'cancelada').length,
          valor_total_pendente: suspensoes.reduce((sum, s) => sum + parseFloat(s.valor_pendente || 0), 0).toFixed(2),
          tempo_medio_resolucao_dias: Math.round(tempoMedio)
        },
        distribuicao_por_motivo: porMotivo,
        suspensoes
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};
