const Emprestimo = require('../models/emprestimo');
const { Aluno, Material } = require('../models');
const WhatsAppNotificationService = require('../services/whatsappNotificationService');
const { Op } = require('sequelize');

const whatsappService = new WhatsAppNotificationService();

const calcularMulta = (dataPrevista, dataReal) => {
  const prevista = new Date(dataPrevista);
  const real = new Date(dataReal);
  
  if (real <= prevista) return 0;
  
  const diffTime = Math.abs(real - prevista);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays * 10.0;
};

const verificarMultasPendentes = async (alunoId) => {
  const multasPendentes = await Emprestimo.findOne({
    where: {
      id_aluno: alunoId,
      valor_multa: {
        [Op.gt]: 0
      },
      multa_paga: false
    }
  });
  
  return !!multasPendentes;
};

module.exports = {
  async consultarMultasPendentes(req, res) {
    try {
      const { alunoId } = req.params;
      
      const multasPendentes = await Emprestimo.findAll({
        where: {
          id_aluno: alunoId,
          valor_multa: {
            [Op.gt]: 0
          },
          multa_paga: false
        }
      });
      
      const totalMultas = multasPendentes.reduce((total, emp) => total + parseFloat(emp.valor_multa), 0);
      
      res.json({
        multas: multasPendentes,
        total: totalMultas,
        quantidade: multasPendentes.length
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  
  async create(req, res) {
    try {
      const possuiMultasPendentes = await verificarMultasPendentes(req.body.id_aluno);
      
      if (possuiMultasPendentes) {
        return res.status(403).json({ 
          error: 'Não é possível realizar empréstimos para alunos com multas pendentes',
          message: 'Por favor, regularize suas multas pendentes antes de solicitar um novo empréstimo'
        });
      }
      
      const emprestimo = await Emprestimo.create(req.body);
      
      const aluno = await Aluno.findByPk(emprestimo.id_aluno);
      const material = await Material.findByPk(emprestimo.id_material);
      
      if (aluno && material) {
        try {
          await whatsappService.notifyNewLoan(aluno, material, emprestimo);
        } catch (notifyError) {
          console.error('Erro ao enviar notificação:', notifyError.message);
        }
      }
      
      res.status(201).json(emprestimo);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async findAll(req, res) {
    try {
      const emprestimos = await Emprestimo.findAll();
      res.json(emprestimos);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async findOne(req, res) {
    try {
      const emprestimo = await Emprestimo.findByPk(req.params.id);
      if (!emprestimo) return res.status(404).json({ error: 'Empréstimo não encontrado' });
      res.json(emprestimo);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async update(req, res) {
    try {
      const emprestimo = await Emprestimo.findByPk(req.params.id);
      
      if (req.body.data_devolucao_real && !emprestimo.data_devolucao_real) {
        const valorMulta = calcularMulta(emprestimo.data_devolucao_prevista, req.body.data_devolucao_real);
        req.body.valor_multa = valorMulta;
      }
      if (!emprestimo) return res.status(404).json({ error: 'Empréstimo não encontrado' });
      await emprestimo.update(req.body);
      res.json(emprestimo);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async delete(req, res) {
    try {
      const emprestimo = await Emprestimo.findByPk(req.params.id);
      if (!emprestimo) return res.status(404).json({ error: 'Empréstimo não encontrado' });
      await emprestimo.destroy();
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async findByAluno(req, res) {
    try {
      const emprestimos = await Emprestimo.findAll({ 
        where: { id_aluno: req.params.alunoId } 
      });
      res.json(emprestimos);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async findByStatus(req, res) {
    try {
      const emprestimos = await Emprestimo.findAll({ 
        where: { status: req.params.status } 
      });
      res.json(emprestimos);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async findMine(req, res) {
    try {
      if (!req.user || req.user.role !== 'aluno') {
        return res.status(403).json({ error: 'Acesso negado' });
      }
      const emprestimos = await Emprestimo.findAll({ 
        where: { id_aluno: req.user.id_aluno } 
      });
      res.json(emprestimos);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async aprovar(req, res) {
    try {
      const emprestimo = await Emprestimo.findByPk(req.params.id);
      if (!emprestimo) return res.status(404).json({ error: 'Empréstimo não encontrado' });
      
      await emprestimo.update({ aprovado_admin: 1 });
      
      const aluno = await Aluno.findByPk(emprestimo.id_aluno);
      const material = await Material.findByPk(emprestimo.id_material);
      
      if (aluno && material) {
        try {
          await whatsappService.notifyLoanApproval(aluno, material, emprestimo);
        } catch (notifyError) {
          console.error('Erro ao enviar notificação:', notifyError.message);
        }
      }
      
      res.json(emprestimo);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async devolver(req, res) {
    try {
      const emprestimo = await Emprestimo.findByPk(req.params.id);
      if (!emprestimo) return res.status(404).json({ error: 'Empréstimo não encontrado' });
      
      const { local_devolucao } = req.body;
      
      if (local_devolucao && local_devolucao !== emprestimo.local_retirada) {
        return res.status(400).json({ 
          error: 'Local de devolução inválido',
          message: `O material deve ser devolvido no mesmo local onde foi retirado: ${emprestimo.local_retirada}`,
          local_esperado: emprestimo.local_retirada,
          local_informado: local_devolucao
        });
      }
      
      const dataAtual = new Date();
      const valorMulta = calcularMulta(emprestimo.data_devolucao_prevista, dataAtual);
      
      await emprestimo.update({ 
        status: 'devolvido',
        data_devolucao_real: dataAtual,
        local_devolucao: emprestimo.local_retirada,
        valor_multa: valorMulta
      });
      
      const aluno = await Aluno.findByPk(emprestimo.id_aluno);
      const material = await Material.findByPk(emprestimo.id_material);
      
      if (aluno && material) {
        try {
          await whatsappService.notifyReturn(aluno, material, emprestimo);
        } catch (notifyError) {
          console.error('Erro ao enviar notificação:', notifyError.message);
        }
      }
      
      res.json(emprestimo);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async aprovarViaQr(req, res) {
    try {
      const {
        ra_aluno,
        cod_material,
        bloco,
        descricao,
        data_retirada,
        data_devolucao_prevista,
        periodo
      } = req.body;

      const aluno = await Aluno.findOne({ where: { ra: ra_aluno } });
      if (!aluno) return res.status(404).json({ error: 'Aluno não encontrado' });

      const material = await Material.findOne({ where: { codigo: cod_material } });
      if (!material) return res.status(404).json({ error: 'Material não encontrado' });
      if (!material.disponivel) return res.status(400).json({ error: 'Material indisponível' });

      const emprestimo = await Emprestimo.create({
        id_aluno: aluno.id_aluno,
        id_material: material.id_material,
        data_retirada,
        data_devolucao_prevista,
        periodo,
        local_retirada: bloco,
        local_devolucao: bloco,
        status: 'ativo',
        aprovado_admin: 1
      });

      await material.update({ disponivel: 0 });

      res.status(201).json({ message: 'Empréstimo aprovado via QR Code', emprestimo });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async devolverViaQr(req, res) {
    try {
      const { id_emprestimo, bloco } = req.body;

      const emprestimo = await Emprestimo.findByPk(id_emprestimo);
      if (!emprestimo) return res.status(404).json({ error: 'Empréstimo não encontrado' });

      if (bloco && bloco !== emprestimo.local_retirada) {
        return res.status(400).json({ 
          error: 'Local de devolução inválido',
          message: `O material deve ser devolvido no mesmo local onde foi retirado: ${emprestimo.local_retirada}`,
          local_esperado: emprestimo.local_retirada,
          local_informado: bloco
        });
      }

      const dataAtual = new Date();
      const valorMulta = calcularMulta(emprestimo.data_devolucao_prevista, dataAtual);

      await emprestimo.update({
        status: 'devolvido',
        data_devolucao_real: dataAtual,
        local_devolucao: emprestimo.local_retirada, // Garante que o local de devolução seja o mesmo da retirada
        valor_multa: valorMulta
      });

      const material = await Material.findByPk(emprestimo.id_material);
      if (material) await material.update({ disponivel: 1 });

      res.json({ message: 'Devolução registrada via QR Code', emprestimo });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
};
