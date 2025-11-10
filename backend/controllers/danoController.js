const Dano = require('../models/dano');
const { Emprestimo, Aluno, Material } = require('../models');
const Suspensao = require('../models/suspensao');
const { Op } = require('sequelize');
const WhatsAppNotificationService = require('../services/whatsappNotificationService');

const whatsappService = new WhatsAppNotificationService();

const LIMITE_DANOS_SUSPENSAO = 100.0;

const calcularValorReparo = (gravidade, valorOriginal = 0) => {
  const valores = {
    'leve': 50.0,
    'moderado': 150.0,
    'grave': 300.0,
    'perda_total': valorOriginal > 0 ? valorOriginal : 500.0
  };
  
  return valores[gravidade] || 0;
};

const verificarESuspenderPorDanos = async (alunoId) => {
  const danosPendentes = await Dano.sum('valor_reparo', {
    where: {
      id_aluno: alunoId,
      valor_pago: 0,
      valor_reparo: { [Op.gt]: 0 }
    }
  });

  const totalDanos = parseFloat(danosPendentes || 0);

  if (totalDanos >= LIMITE_DANOS_SUSPENSAO) {
    const suspensaoAtiva = await Suspensao.findOne({
      where: {
        id_aluno: alunoId,
        status: 'ativa',
        motivo: 'danos_nao_pagos'
      }
    });

    if (!suspensaoAtiva) {
      await Suspensao.create({
        id_aluno: alunoId,
        motivo: 'danos_nao_pagos',
        descricao: `Suspensão automática por acúmulo de danos não pagos. Total pendente: R$ ${totalDanos.toFixed(2)}`,
        valor_pendente: totalDanos,
        status: 'ativa'
      });

      const aluno = await Aluno.findByPk(alunoId);
      if (aluno) {
        await aluno.update({ ativo: false });
        
        try {
          await whatsappService.notifySuspension(aluno, totalDanos, 'danos_nao_pagos');
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
  async registrarDano(req, res) {
    try {
      const { id_emprestimo, descricao_dano, gravidade, valor_reparo, observacoes } = req.body;

      const emprestimo = await Emprestimo.findByPk(id_emprestimo, {
        include: [
          { model: Aluno },
          { model: Material }
        ]
      });

      if (!emprestimo) {
        return res.status(404).json({ error: 'Empréstimo não encontrado' });
      }

      const valorCalculado = valor_reparo || calcularValorReparo(gravidade);

      const dano = await Dano.create({
        id_emprestimo,
        id_material: emprestimo.id_material,
        id_aluno: emprestimo.id_aluno,
        descricao_dano,
        gravidade,
        valor_reparo: valorCalculado,
        observacoes
      });

      if (gravidade === 'perda_total' || gravidade === 'grave') {
        const material = await Material.findByPk(emprestimo.id_material);
        if (material) {
          await material.update({ disponivel: false });
        }
      }

      const aluno = emprestimo.Aluno;
      const material = emprestimo.Material;

      if (aluno && material) {
        try {
          await whatsappService.notifyDamage(aluno, material, dano);
        } catch (error) {
          console.error('Erro ao notificar dano:', error.message);
        }
      }

      const suspendido = await verificarESuspenderPorDanos(emprestimo.id_aluno);

      res.status(201).json({
        message: 'Dano registrado com sucesso',
        dano,
        valor_calculado: valorCalculado.toFixed(2),
        aluno_suspendido: suspendido
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async listarDanos(req, res) {
    try {
      const { status_reparo, gravidade, id_aluno, id_material } = req.query;

      const whereClause = {};

      if (status_reparo) {
        whereClause.status_reparo = status_reparo;
      }

      if (gravidade) {
        whereClause.gravidade = gravidade;
      }

      if (id_aluno) {
        whereClause.id_aluno = id_aluno;
      }

      if (id_material) {
        whereClause.id_material = id_material;
      }

      const danos = await Dano.findAll({
        where: whereClause,
        include: [
          {
            model: Aluno,
            attributes: ['id_aluno', 'nome', 'ra', 'email', 'telefone']
          },
          {
            model: Material,
            attributes: ['id_material', 'nome', 'codigo', 'tipo']
          },
          {
            model: Emprestimo,
            attributes: ['id_emprestimo', 'data_retirada', 'data_devolucao_real']
          }
        ],
        order: [['data_registro', 'DESC']]
      });

      const totalValor = danos.reduce((sum, d) => sum + parseFloat(d.valor_reparo), 0);
      const totalPago = danos.reduce((sum, d) => sum + parseFloat(d.valor_pago), 0);
      const totalPendente = totalValor - totalPago;

      res.json({
        total_registros: danos.length,
        resumo: {
          valor_total_reparos: totalValor.toFixed(2),
          valor_pago: totalPago.toFixed(2),
          valor_pendente: totalPendente.toFixed(2),
          por_gravidade: {
            leve: danos.filter(d => d.gravidade === 'leve').length,
            moderado: danos.filter(d => d.gravidade === 'moderado').length,
            grave: danos.filter(d => d.gravidade === 'grave').length,
            perda_total: danos.filter(d => d.gravidade === 'perda_total').length
          },
          por_status: {
            pendente: danos.filter(d => d.status_reparo === 'pendente').length,
            em_reparo: danos.filter(d => d.status_reparo === 'em_reparo').length,
            reparado: danos.filter(d => d.status_reparo === 'reparado').length,
            irreparavel: danos.filter(d => d.status_reparo === 'irreparavel').length
          }
        },
        danos
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async obterDano(req, res) {
    try {
      const { id_dano } = req.params;

      const dano = await Dano.findByPk(id_dano, {
        include: [
          {
            model: Aluno,
            attributes: ['id_aluno', 'nome', 'ra', 'email', 'telefone', 'turma']
          },
          {
            model: Material,
            attributes: ['id_material', 'nome', 'codigo', 'tipo', 'disponivel']
          },
          {
            model: Emprestimo,
            attributes: ['id_emprestimo', 'data_retirada', 'data_devolucao_real', 'local_retirada']
          }
        ]
      });

      if (!dano) {
        return res.status(404).json({ error: 'Dano não encontrado' });
      }

      res.json(dano);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async atualizarStatusReparo(req, res) {
    try {
      const { id_dano } = req.params;
      const { status_reparo, observacoes } = req.body;

      const dano = await Dano.findByPk(id_dano);
      if (!dano) {
        return res.status(404).json({ error: 'Dano não encontrado' });
      }

      await dano.update({
        status_reparo,
        observacoes: observacoes || dano.observacoes
      });

      if (status_reparo === 'reparado') {
        const material = await Material.findByPk(dano.id_material);
        if (material) {
          await material.update({ disponivel: true });
        }
      }

      res.json({
        message: 'Status de reparo atualizado com sucesso',
        dano
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async pagarDano(req, res) {
    try {
      const { id_dano } = req.params;
      const { valor_pago, forma_pagamento } = req.body;

      const dano = await Dano.findByPk(id_dano);
      if (!dano) {
        return res.status(404).json({ error: 'Dano não encontrado' });
      }

      const valorReparo = parseFloat(dano.valor_reparo);
      const valorJaPago = parseFloat(dano.valor_pago || 0);
      const valorRestante = valorReparo - valorJaPago;
      const valorPago = parseFloat(valor_pago);

      if (valorPago <= 0) {
        return res.status(400).json({ error: 'Valor de pagamento inválido' });
      }

      const novoValorPago = valorJaPago + valorPago;

      await dano.update({
        valor_pago: novoValorPago,
        data_pagamento: new Date()
      });

      const totalDanosPendentes = await Dano.sum('valor_reparo', {
        where: {
          id_aluno: dano.id_aluno,
          valor_pago: 0,
          valor_reparo: { [Op.gt]: 0 }
        }
      });

      const suspensao = await Suspensao.findOne({
        where: {
          id_aluno: dano.id_aluno,
          status: 'ativa',
          motivo: 'danos_nao_pagos'
        }
      });

      let suspensaoResolvida = false;
      if (suspensao && (!totalDanosPendentes || totalDanosPendentes < LIMITE_DANOS_SUSPENSAO)) {
        await suspensao.update({
          status: 'resolvida',
          data_resolucao: new Date(),
          observacoes: 'Suspensão resolvida após pagamento de danos'
        });

        const aluno = await Aluno.findByPk(dano.id_aluno);
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
        message: novoValorPago >= valorReparo ? 'Pagamento completo registrado' : 'Pagamento parcial registrado',
        dano,
        detalhes_pagamento: {
          valor_pago: valorPago.toFixed(2),
          valor_total_pago: novoValorPago.toFixed(2),
          valor_total_reparo: valorReparo.toFixed(2),
          valor_restante: Math.max(0, valorReparo - novoValorPago).toFixed(2),
          pagamento_completo: novoValorPago >= valorReparo,
          forma_pagamento: forma_pagamento || 'não informado'
        },
        suspensao_resolvida: suspensaoResolvida
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async relatorioDanos(req, res) {
    try {
      const { data_inicio, data_fim, gravidade } = req.query;

      const whereClause = {};

      if (data_inicio && data_fim) {
        whereClause.data_registro = {
          [Op.between]: [new Date(data_inicio), new Date(data_fim)]
        };
      }

      if (gravidade) {
        whereClause.gravidade = gravidade;
      }

      const danos = await Dano.findAll({
        where: whereClause,
        include: [
          {
            model: Aluno,
            attributes: ['id_aluno', 'nome', 'ra', 'turma']
          },
          {
            model: Material,
            attributes: ['id_material', 'nome', 'tipo']
          }
        ]
      });

      const totalValor = danos.reduce((sum, d) => sum + parseFloat(d.valor_reparo), 0);
      const totalPago = danos.reduce((sum, d) => sum + parseFloat(d.valor_pago), 0);
      const totalPendente = totalValor - totalPago;

      const materiaisMaisDanificados = danos.reduce((acc, d) => {
        const key = d.id_material;
        if (!acc[key]) {
          acc[key] = { material: d.Material, quantidade: 0, valor_total: 0 };
        }
        acc[key].quantidade += 1;
        acc[key].valor_total += parseFloat(d.valor_reparo);
        return acc;
      }, {});

      const rankingMateriais = Object.values(materiaisMaisDanificados)
        .sort((a, b) => b.quantidade - a.quantidade)
        .slice(0, 10);

      res.json({
        periodo: {
          data_inicio: data_inicio || 'Início',
          data_fim: data_fim || 'Atual'
        },
        resumo: {
          total_danos: danos.length,
          valor_total_reparos: totalValor.toFixed(2),
          valor_pago: totalPago.toFixed(2),
          valor_pendente: totalPendente.toFixed(2),
          taxa_recuperacao: totalValor > 0 ? ((totalPago / totalValor) * 100).toFixed(2) + '%' : '0%',
          distribuicao_gravidade: {
            leve: danos.filter(d => d.gravidade === 'leve').length,
            moderado: danos.filter(d => d.gravidade === 'moderado').length,
            grave: danos.filter(d => d.gravidade === 'grave').length,
            perda_total: danos.filter(d => d.gravidade === 'perda_total').length
          },
          distribuicao_status: {
            pendente: danos.filter(d => d.status_reparo === 'pendente').length,
            em_reparo: danos.filter(d => d.status_reparo === 'em_reparo').length,
            reparado: danos.filter(d => d.status_reparo === 'reparado').length,
            irreparavel: danos.filter(d => d.status_reparo === 'irreparavel').length
          }
        },
        ranking_materiais_danificados: rankingMateriais.map(m => ({
          material: m.material,
          quantidade_danos: m.quantidade,
          valor_total: m.valor_total.toFixed(2)
        }))
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};
