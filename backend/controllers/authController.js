const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Administrador = require('../models/administrador');
const Aluno = require('../models/aluno');

module.exports = {
  async login(req, res) {
    try {
      const { login, senha } = req.body;
      if (!login || !senha) {
        return res.status(400).json({ error: 'login e senha são obrigatórios' });
      }

      const admin = await Administrador.findOne({ where: { login } });
      if (!admin) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      const ok = await bcrypt.compare(senha, admin.senha);
      if (!ok) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      const payload = {
        id_admin: admin.id_admin,
        login: admin.login,
        nome: admin.nome,
        role: 'admin',
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.TOKEN_EXPIRATION || '1h',
      });

      return res.json({ token, user: payload });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  async alunoLogin(req, res) {
    try {
      const { ra, senha } = req.body;
      if (!ra || !senha) {
        return res.status(400).json({ error: 'ra e senha são obrigatórios' });
      }

      const aluno = await Aluno.findOne({ where: { ra } });
      if (!aluno || !aluno.senha) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      const ok = await bcrypt.compare(senha, aluno.senha);
      if (!ok) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      const payload = {
        id_aluno: aluno.id_aluno,
        ra: aluno.ra,
        nome: aluno.nome,
        role: 'aluno',
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.TOKEN_EXPIRATION || '1h',
      });

      return res.json({ token, user: payload });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  async alunoSetPassword(req, res) {
    try {
      const { ra, senha } = req.body;
      if (!ra || !senha) {
        return res.status(400).json({ error: 'ra e senha são obrigatórios' });
      }

      // Permitir admin ou o próprio aluno
      if (!req.user || (req.user.role !== 'admin' && !(req.user.role === 'aluno' && req.user.ra === ra))) {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      const aluno = await Aluno.findOne({ where: { ra } });
      if (!aluno) {
        return res.status(404).json({ error: 'Aluno não encontrado' });
      }

      const hash = await bcrypt.hash(senha, 10);
      await aluno.update({ senha: hash });

      return res.json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  async signup(req, res) {
    try {
      const { nome, login, senha, email } = req.body;
      if (!nome || !login || !senha || !email) {
        return res.status(400).json({ error: 'nome, login, senha e email são obrigatórios' });
      }

      const exists = await Administrador.findOne({ where: { login } });
      if (exists) {
        return res.status(400).json({ error: 'login já existe' });
      }

      const hash = await bcrypt.hash(senha, 10);
      const admin = await Administrador.create({
        nome,
        login,
        senha: hash,
        email,
      });

      return res.status(201).json({
        id_admin: admin.id_admin,
        nome: admin.nome,
        login: admin.login,
        email: admin.email,
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  async me(req, res) {
    try {
      return res.json({ user: req.user });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },
};