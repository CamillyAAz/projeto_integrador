const Laboratorio = require('../models/laboratorio');
const { Op } = require('sequelize');

module.exports = {
  async create(req, res) {
    try {
      const laboratorio = await Laboratorio.create(req.body);
      res.status(201).json({
        message: 'Laboratório criado com sucesso',
        laboratorio
      });
    } catch (err) {
      if (err.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ error: 'Código do laboratório já existe' });
      }
      res.status(400).json({ error: err.message });
    }
  },

  async findAll(req, res) {
    try {
      const { tipo, bloco, disponivel } = req.query;
      const whereClause = {};

      if (tipo) {
        whereClause.tipo = tipo;
      }

      if (bloco) {
        whereClause.bloco = bloco;
      }

      if (disponivel !== undefined) {
        whereClause.disponivel = disponivel === 'true';
      }

      const laboratorios = await Laboratorio.findAll({
        where: whereClause,
        order: [['nome', 'ASC']]
      });

      res.json({
        total: laboratorios.length,
        laboratorios
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async findOne(req, res) {
    try {
      const laboratorio = await Laboratorio.findByPk(req.params.id);
      
      if (!laboratorio) {
        return res.status(404).json({ error: 'Laboratório não encontrado' });
      }

      res.json(laboratorio);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async findByCodigo(req, res) {
    try {
      const laboratorio = await Laboratorio.findOne({
        where: { codigo: req.params.codigo }
      });

      if (!laboratorio) {
        return res.status(404).json({ error: 'Laboratório não encontrado' });
      }

      res.json(laboratorio);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async update(req, res) {
    try {
      const laboratorio = await Laboratorio.findByPk(req.params.id);

      if (!laboratorio) {
        return res.status(404).json({ error: 'Laboratório não encontrado' });
      }

      await laboratorio.update(req.body);

      res.json({
        message: 'Laboratório atualizado com sucesso',
        laboratorio
      });
    } catch (err) {
      if (err.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ error: 'Código do laboratório já existe' });
      }
      res.status(400).json({ error: err.message });
    }
  },

  async delete(req, res) {
    try {
      const laboratorio = await Laboratorio.findByPk(req.params.id);

      if (!laboratorio) {
        return res.status(404).json({ error: 'Laboratório não encontrado' });
      }

      await laboratorio.destroy();

      res.json({
        message: 'Laboratório excluído com sucesso'
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async toggleDisponibilidade(req, res) {
    try {
      const laboratorio = await Laboratorio.findByPk(req.params.id);

      if (!laboratorio) {
        return res.status(404).json({ error: 'Laboratório não encontrado' });
      }

      await laboratorio.update({
        disponivel: !laboratorio.disponivel
      });

      res.json({
        message: `Laboratório ${laboratorio.disponivel ? 'disponibilizado' : 'indisponibilizado'} com sucesso`,
        laboratorio
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async search(req, res) {
    try {
      const { termo } = req.query;

      if (!termo) {
        return res.status(400).json({ error: 'Termo de busca é obrigatório' });
      }

      const laboratorios = await Laboratorio.findAll({
        where: {
          [Op.or]: [
            { nome: { [Op.like]: `%${termo}%` } },
            { codigo: { [Op.like]: `%${termo}%` } },
            { bloco: { [Op.like]: `%${termo}%` } },
            { responsavel: { [Op.like]: `%${termo}%` } }
          ]
        },
        order: [['nome', 'ASC']]
      });

      res.json({
        total: laboratorios.length,
        laboratorios
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async estatisticas(req, res) {
    try {
      const total = await Laboratorio.count();
      const disponiveis = await Laboratorio.count({ where: { disponivel: true } });
      const indisponiveis = total - disponiveis;

      const porTipo = await Laboratorio.findAll({
        attributes: [
          'tipo',
          [Laboratorio.sequelize.fn('COUNT', Laboratorio.sequelize.col('tipo')), 'quantidade']
        ],
        group: ['tipo']
      });

      const porBloco = await Laboratorio.findAll({
        attributes: [
          'bloco',
          [Laboratorio.sequelize.fn('COUNT', Laboratorio.sequelize.col('bloco')), 'quantidade']
        ],
        group: ['bloco'],
        order: [[Laboratorio.sequelize.fn('COUNT', Laboratorio.sequelize.col('bloco')), 'DESC']]
      });

      const capacidadeTotal = await Laboratorio.sum('capacidade');

      res.json({
        resumo: {
          total_laboratorios: total,
          disponiveis,
          indisponiveis,
          capacidade_total: capacidadeTotal || 0
        },
        distribuicao_por_tipo: porTipo,
        distribuicao_por_bloco: porBloco
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};
