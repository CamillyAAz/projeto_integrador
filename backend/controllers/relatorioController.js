const { Emprestimo, Aluno, Material, Administrador } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

module.exports = {
  // RF-11: Relatório geral de empréstimos com filtros por período
  async relatorioGeral(req, res) {
    try {
      const { data_inicio, data_fim, status, bloco, periodo } = req.query;

      // Construir filtros dinâmicos
      const whereClause = {};

      // Filtro por período de data
      if (data_inicio && data_fim) {
        whereClause.data_retirada = {
          [Op.between]: [new Date(data_inicio), new Date(data_fim)]
        };
      } else if (data_inicio) {
        whereClause.data_retirada = {
          [Op.gte]: new Date(data_inicio)
        };
      } else if (data_fim) {
        whereClause.data_retirada = {
          [Op.lte]: new Date(data_fim)
        };
      }

      // Filtro por status
      if (status) {
        whereClause.status = status;
      }

      // Filtro por bloco (local)
      if (bloco) {
        whereClause.local_retirada = bloco;
      }

      // Filtro por período do dia
      if (periodo) {
        whereClause.periodo = periodo;
      }

      // Buscar empréstimos com joins
      const emprestimos = await Emprestimo.findAll({
        where: whereClause,
        include: [
          {
            model: Aluno,
            attributes: ['id_aluno', 'nome', 'ra', 'turma', 'bloco', 'email']
          },
          {
            model: Material,
            attributes: ['id_material', 'nome', 'codigo', 'tipo']
          },
          {
            model: Administrador,
            attributes: ['id_admin', 'nome', 'email']
          }
        ],
        order: [['data_retirada', 'DESC']]
      });

      // Calcular estatísticas
      const total = emprestimos.length;
      const ativos = emprestimos.filter(e => e.status === 'ativo').length;
      const devolvidos = emprestimos.filter(e => e.status === 'devolvido').length;
      const atrasados = emprestimos.filter(e => e.status === 'atrasado').length;
      const totalMultas = emprestimos.reduce((sum, e) => sum + parseFloat(e.valor_multa || 0), 0);

      res.json({
        filtros_aplicados: {
          data_inicio: data_inicio || 'Nenhum',
          data_fim: data_fim || 'Nenhum',
          status: status || 'Todos',
          bloco: bloco || 'Todos',
          periodo: periodo || 'Todos'
        },
        estatisticas: {
          total_emprestimos: total,
          emprestimos_ativos: ativos,
          emprestimos_devolvidos: devolvidos,
          emprestimos_atrasados: atrasados,
          total_multas: totalMultas.toFixed(2),
          taxa_devolucao: total > 0 ? ((devolvidos / total) * 100).toFixed(2) + '%' : '0%'
        },
        emprestimos
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // RF-11: Relatório de empréstimos por aluno
  async relatorioPorAluno(req, res) {
    try {
      const { id_aluno } = req.params;
      const { data_inicio, data_fim } = req.query;

      const whereClause = { id_aluno };

      // Filtro por período
      if (data_inicio && data_fim) {
        whereClause.data_retirada = {
          [Op.between]: [new Date(data_inicio), new Date(data_fim)]
        };
      }

      const emprestimos = await Emprestimo.findAll({
        where: whereClause,
        include: [
          {
            model: Material,
            attributes: ['id_material', 'nome', 'codigo', 'tipo']
          }
        ],
        order: [['data_retirada', 'DESC']]
      });

      const aluno = await Aluno.findByPk(id_aluno);

      if (!aluno) {
        return res.status(404).json({ error: 'Aluno não encontrado' });
      }

      // Estatísticas do aluno
      const total = emprestimos.length;
      const ativos = emprestimos.filter(e => e.status === 'ativo').length;
      const devolvidos = emprestimos.filter(e => e.status === 'devolvido').length;
      const atrasados = emprestimos.filter(e => e.status === 'atrasado').length;
      const multasPendentes = emprestimos.filter(e => parseFloat(e.valor_multa) > 0 && !e.multa_paga).length;
      const totalMultas = emprestimos.reduce((sum, e) => sum + parseFloat(e.valor_multa || 0), 0);
      const multasPagas = emprestimos.reduce((sum, e) => e.multa_paga ? sum + parseFloat(e.valor_multa || 0) : sum, 0);
      const multasNaoPagas = totalMultas - multasPagas;

      res.json({
        aluno: {
          id: aluno.id_aluno,
          nome: aluno.nome,
          ra: aluno.ra,
          turma: aluno.turma,
          bloco: aluno.bloco,
          email: aluno.email
        },
        periodo: {
          data_inicio: data_inicio || 'Início',
          data_fim: data_fim || 'Atual'
        },
        estatisticas: {
          total_emprestimos: total,
          emprestimos_ativos: ativos,
          emprestimos_devolvidos: devolvidos,
          emprestimos_atrasados: atrasados,
          multas_pendentes: multasPendentes,
          total_multas: totalMultas.toFixed(2),
          multas_pagas: multasPagas.toFixed(2),
          multas_nao_pagas: multasNaoPagas.toFixed(2)
        },
        historico: emprestimos
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // RF-11: Relatório de materiais mais emprestados
  async relatorioMateriaisMaisEmprestados(req, res) {
    try {
      const { data_inicio, data_fim, limite } = req.query;
      const limit = parseInt(limite) || 10;

      const whereClause = {};

      // Filtro por período
      if (data_inicio && data_fim) {
        whereClause.data_retirada = {
          [Op.between]: [new Date(data_inicio), new Date(data_fim)]
        };
      }

      // Agregar dados usando Sequelize
      const materiais = await Emprestimo.findAll({
        where: whereClause,
        attributes: [
          'id_material',
          [sequelize.fn('COUNT', sequelize.col('id_material')), 'total_emprestimos']
        ],
        include: [
          {
            model: Material,
            attributes: ['id_material', 'nome', 'codigo', 'tipo', 'disponivel']
          }
        ],
        group: ['id_material'],
        order: [[sequelize.fn('COUNT', sequelize.col('id_material')), 'DESC']],
        limit: limit,
        raw: false
      });

      res.json({
        periodo: {
          data_inicio: data_inicio || 'Início',
          data_fim: data_fim || 'Atual'
        },
        top_materiais: materiais.map(m => ({
          id_material: m.id_material,
          material: m.Material,
          total_emprestimos: m.dataValues.total_emprestimos
        }))
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // RF-11: Relatório de empréstimos por período (manhã, tarde, noite)
  async relatorioPorPeriodo(req, res) {
    try {
      const { data_inicio, data_fim } = req.query;

      const whereClause = {};

      // Filtro por data
      if (data_inicio && data_fim) {
        whereClause.data_retirada = {
          [Op.between]: [new Date(data_inicio), new Date(data_fim)]
        };
      }

      // Agregar por período
      const periodos = await Emprestimo.findAll({
        where: whereClause,
        attributes: [
          'periodo',
          [sequelize.fn('COUNT', sequelize.col('periodo')), 'total_emprestimos'],
          [sequelize.fn('SUM', sequelize.col('valor_multa')), 'total_multas']
        ],
        group: ['periodo'],
        order: [[sequelize.fn('COUNT', sequelize.col('periodo')), 'DESC']],
        raw: true
      });

      const total = periodos.reduce((sum, p) => sum + parseInt(p.total_emprestimos), 0);

      res.json({
        periodo_consulta: {
          data_inicio: data_inicio || 'Início',
          data_fim: data_fim || 'Atual'
        },
        estatisticas: {
          total_emprestimos: total,
          distribuicao: periodos.map(p => ({
            periodo: p.periodo,
            total_emprestimos: p.total_emprestimos,
            percentual: ((parseInt(p.total_emprestimos) / total) * 100).toFixed(2) + '%',
            total_multas: parseFloat(p.total_multas || 0).toFixed(2)
          }))
        }
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // RF-11: Relatório de empréstimos por local (bloco)
  async relatorioPorLocal(req, res) {
    try {
      const { data_inicio, data_fim } = req.query;

      const whereClause = {};

      // Filtro por data
      if (data_inicio && data_fim) {
        whereClause.data_retirada = {
          [Op.between]: [new Date(data_inicio), new Date(data_fim)]
        };
      }

      // Agregar por local
      const locais = await Emprestimo.findAll({
        where: whereClause,
        attributes: [
          'local_retirada',
          [sequelize.fn('COUNT', sequelize.col('local_retirada')), 'total_emprestimos'],
          [sequelize.fn('SUM', sequelize.col('valor_multa')), 'total_multas']
        ],
        group: ['local_retirada'],
        order: [[sequelize.fn('COUNT', sequelize.col('local_retirada')), 'DESC']],
        raw: true
      });

      const total = locais.reduce((sum, l) => sum + parseInt(l.total_emprestimos), 0);

      res.json({
        periodo_consulta: {
          data_inicio: data_inicio || 'Início',
          data_fim: data_fim || 'Atual'
        },
        estatisticas: {
          total_emprestimos: total,
          distribuicao_por_bloco: locais.map(l => ({
            bloco: l.local_retirada,
            total_emprestimos: l.total_emprestimos,
            percentual: ((parseInt(l.total_emprestimos) / total) * 100).toFixed(2) + '%',
            total_multas: parseFloat(l.total_multas || 0).toFixed(2)
          }))
        }
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // RF-11: Relatório financeiro (multas)
  async relatorioFinanceiro(req, res) {
    try {
      const { data_inicio, data_fim, status_pagamento } = req.query;

      const whereClause = {
        valor_multa: {
          [Op.gt]: 0
        }
      };

      // Filtro por data
      if (data_inicio && data_fim) {
        whereClause.data_retirada = {
          [Op.between]: [new Date(data_inicio), new Date(data_fim)]
        };
      }

      // Filtro por status de pagamento
      if (status_pagamento === 'pago') {
        whereClause.multa_paga = true;
      } else if (status_pagamento === 'pendente') {
        whereClause.multa_paga = false;
      }

      const emprestimosComMulta = await Emprestimo.findAll({
        where: whereClause,
        include: [
          {
            model: Aluno,
            attributes: ['id_aluno', 'nome', 'ra', 'turma']
          },
          {
            model: Material,
            attributes: ['id_material', 'nome', 'codigo']
          }
        ],
        order: [['valor_multa', 'DESC']]
      });

      // Calcular totais
      const totalMultas = emprestimosComMulta.reduce((sum, e) => sum + parseFloat(e.valor_multa), 0);
      const multasPagas = emprestimosComMulta
        .filter(e => e.multa_paga)
        .reduce((sum, e) => sum + parseFloat(e.valor_multa), 0);
      const multasPendentes = emprestimosComMulta
        .filter(e => !e.multa_paga)
        .reduce((sum, e) => sum + parseFloat(e.valor_multa), 0);

      res.json({
        periodo_consulta: {
          data_inicio: data_inicio || 'Início',
          data_fim: data_fim || 'Atual',
          filtro_pagamento: status_pagamento || 'Todos'
        },
        resumo_financeiro: {
          total_multas: totalMultas.toFixed(2),
          multas_pagas: multasPagas.toFixed(2),
          multas_pendentes: multasPendentes.toFixed(2),
          quantidade_total: emprestimosComMulta.length,
          quantidade_pagas: emprestimosComMulta.filter(e => e.multa_paga).length,
          quantidade_pendentes: emprestimosComMulta.filter(e => !e.multa_paga).length,
          taxa_recuperacao: totalMultas > 0 ? ((multasPagas / totalMultas) * 100).toFixed(2) + '%' : '0%'
        },
        detalhamento: emprestimosComMulta.map(e => ({
          id_emprestimo: e.id_emprestimo,
          aluno: e.Aluno,
          material: e.Material,
          data_retirada: e.data_retirada,
          data_devolucao_prevista: e.data_devolucao_prevista,
          data_devolucao_real: e.data_devolucao_real,
          valor_multa: parseFloat(e.valor_multa).toFixed(2),
          multa_paga: e.multa_paga,
          status: e.status
        }))
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // RF-11: Relatório consolidado (dashboard)
  async relatorioDashboard(req, res) {
    try {
      const { data_inicio, data_fim } = req.query;

      const whereClause = {};

      // Filtro por data
      if (data_inicio && data_fim) {
        whereClause.data_retirada = {
          [Op.between]: [new Date(data_inicio), new Date(data_fim)]
        };
      }

      // Buscar todos os empréstimos do período
      const emprestimos = await Emprestimo.findAll({
        where: whereClause
      });

      // Estatísticas gerais
      const total = emprestimos.length;
      const ativos = emprestimos.filter(e => e.status === 'ativo').length;
      const devolvidos = emprestimos.filter(e => e.status === 'devolvido').length;
      const atrasados = emprestimos.filter(e => e.status === 'atrasado').length;
      const totalMultas = emprestimos.reduce((sum, e) => sum + parseFloat(e.valor_multa || 0), 0);
      const multasPagas = emprestimos.filter(e => e.multa_paga).reduce((sum, e) => sum + parseFloat(e.valor_multa || 0), 0);
      const multasPendentes = totalMultas - multasPagas;

      // Contar alunos únicos
      const alunosUnicos = [...new Set(emprestimos.map(e => e.id_aluno))].length;

      // Contar materiais únicos
      const materiaisUnicos = [...new Set(emprestimos.map(e => e.id_material))].length;

      res.json({
        periodo: {
          data_inicio: data_inicio || 'Início',
          data_fim: data_fim || 'Atual'
        },
        resumo_geral: {
          total_emprestimos: total,
          alunos_atendidos: alunosUnicos,
          materiais_diferentes: materiaisUnicos,
          taxa_devolucao: total > 0 ? ((devolvidos / total) * 100).toFixed(2) + '%' : '0%'
        },
        status_emprestimos: {
          ativos,
          devolvidos,
          atrasados,
          percentual_ativos: total > 0 ? ((ativos / total) * 100).toFixed(2) + '%' : '0%',
          percentual_devolvidos: total > 0 ? ((devolvidos / total) * 100).toFixed(2) + '%' : '0%',
          percentual_atrasados: total > 0 ? ((atrasados / total) * 100).toFixed(2) + '%' : '0%'
        },
        financeiro: {
          total_multas: totalMultas.toFixed(2),
          multas_pagas: multasPagas.toFixed(2),
          multas_pendentes: multasPendentes.toFixed(2),
          taxa_recuperacao: totalMultas > 0 ? ((multasPagas / totalMultas) * 100).toFixed(2) + '%' : '0%'
        }
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // RF-11: Exportar relatório em formato CSV
  async exportarCSV(req, res) {
    try {
      const { tipo, data_inicio, data_fim } = req.query;

      if (!tipo) {
        return res.status(400).json({ error: 'Tipo de relatório não especificado' });
      }

      const whereClause = {};

      // Filtro por data
      if (data_inicio && data_fim) {
        whereClause.data_retirada = {
          [Op.between]: [new Date(data_inicio), new Date(data_fim)]
        };
      }

      const emprestimos = await Emprestimo.findAll({
        where: whereClause,
        include: [
          { model: Aluno, attributes: ['nome', 'ra', 'turma', 'bloco'] },
          { model: Material, attributes: ['nome', 'codigo', 'tipo'] },
          { model: Administrador, attributes: ['nome'] }
        ],
        order: [['data_retirada', 'DESC']]
      });

      // Gerar CSV
      let csv = 'ID,Aluno,RA,Turma,Material,Código,Tipo,Data Retirada,Data Devolução Prevista,Data Devolução Real,Período,Local,Status,Multa,Multa Paga,Administrador\n';

      emprestimos.forEach(e => {
        csv += `${e.id_emprestimo},`;
        csv += `"${e.Aluno?.nome || 'N/A'}",`;
        csv += `${e.Aluno?.ra || 'N/A'},`;
        csv += `"${e.Aluno?.turma || 'N/A'}",`;
        csv += `"${e.Material?.nome || 'N/A'}",`;
        csv += `${e.Material?.codigo || 'N/A'},`;
        csv += `"${e.Material?.tipo || 'N/A'}",`;
        csv += `${e.data_retirada ? new Date(e.data_retirada).toISOString().split('T')[0] : 'N/A'},`;
        csv += `${e.data_devolucao_prevista ? new Date(e.data_devolucao_prevista).toISOString().split('T')[0] : 'N/A'},`;
        csv += `${e.data_devolucao_real ? new Date(e.data_devolucao_real).toISOString().split('T')[0] : 'N/A'},`;
        csv += `${e.periodo},`;
        csv += `"${e.local_retirada}",`;
        csv += `${e.status},`;
        csv += `${parseFloat(e.valor_multa || 0).toFixed(2)},`;
        csv += `${e.multa_paga ? 'Sim' : 'Não'},`;
        csv += `"${e.Administrador?.nome || 'N/A'}"\n`;
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=relatorio_emprestimos_${Date.now()}.csv`);
      res.send(csv);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};
