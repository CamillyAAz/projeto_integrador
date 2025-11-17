const express = require('express');
const router = express.Router();
const Administrador = require('../models/administrador');

// Endpoint temporário para verificar admins existentes
router.get('/debug-admins', async (req, res) => {
  try {
    const admins = await Administrador.findAll({
      attributes: ['id_admin', 'nome', 'login', 'email']
    });
    res.json({ admins });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint para testar hash de senha (nunca faça isso em produção!)
router.post('/test-senha', async (req, res) => {
  try {
    const { login, senhaTeste } = req.body;
    const admin = await Administrador.findOne({ where: { login } });
    
    if (!admin) {
      return res.json({ encontrado: false });
    }
    
    const bcrypt = require('bcrypt');
    const senhaCorreta = await bcrypt.compare(senhaTeste, admin.senha);
    
    res.json({
      encontrado: true,
      senhaTestada: senhaTeste,
      senhaCorreta: senhaCorreta,
      hashNoBanco: admin.senha.substring(0, 20) + '...' // Mostra apenas parte por segurança
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;