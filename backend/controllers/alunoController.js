const Aluno = require('../models/aluno');

module.exports = {
  async create(req, res) {
    try {
      const aluno = await Aluno.create(req.body);
      res.status(201).json(aluno);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async findAll(req, res) {
    try {
      const alunos = await Aluno.findAll();
      res.json(alunos);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async findOne(req, res) {
    try {
      const aluno = await Aluno.findByPk(req.params.id);
      if (!aluno) return res.status(404).json({ error: 'Aluno não encontrado' });
      res.json(aluno);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async update(req, res) {
    try {
      const aluno = await Aluno.findByPk(req.params.id);
      if (!aluno) return res.status(404).json({ error: 'Aluno não encontrado' });
      await aluno.update(req.body);
      res.json(aluno);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async delete(req, res) {
    try {
      const aluno = await Aluno.findByPk(req.params.id);
      if (!aluno) return res.status(404).json({ error: 'Aluno não encontrado' });
      await aluno.destroy();
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async findByRa(req, res) {
    try {
      const aluno = await Aluno.findOne({ where: { ra: req.params.ra } });
      if (!aluno) return res.status(404).json({ error: 'Aluno não encontrado' });
      res.json(aluno);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async updateByRa(req, res) {
    try {
      const aluno = await Aluno.findOne({ where: { ra: req.params.ra } });
      if (!aluno) return res.status(404).json({ error: 'Aluno não encontrado' });
      await aluno.update(req.body);
      res.json(aluno);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async deleteByRa(req, res) {
    try {
      const aluno = await Aluno.findOne({ where: { ra: req.params.ra } });
      if (!aluno) return res.status(404).json({ error: 'Aluno não encontrado' });
      await aluno.destroy();
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async verificar(req, res) {
    try {
      const aluno = await Aluno.findOne({ where: { ra: req.params.ra } });
      if (!aluno) return res.status(404).json({ exists: false, message: 'Aluno não encontrado' });
      res.json({ exists: true, id: aluno.id_aluno, nome: aluno.nome, ra: aluno.ra });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};
