const Emprestimo = require('../models/emprestimo');
const { Aluno, Material } = require('../models');
const WhatsAppNotificationService = require('../services/whatsappNotificationService');

const whatsappService = new WhatsAppNotificationService();

module.exports = {
  async create(req, res) {
    try {
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
      
      await emprestimo.update({ 
        status: 'devolvido',
        data_devolucao_real: new Date()
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
};