const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const authController = require('../controllers/authController');

router.post('/login', authController.login);
router.post('/aluno-login', authController.alunoLogin);
router.post('/signup', authController.signup);
router.get('/me', authenticate, authController.me);
router.post('/aluno/set-password', authenticate, authController.alunoSetPassword);
router.get('/admin/verificar/:login', authController.verificarAdmin);

module.exports = router;