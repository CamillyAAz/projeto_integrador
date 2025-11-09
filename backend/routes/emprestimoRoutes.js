const express = require('express');
const router = express.Router();
const emprestimoController = require('../controllers/emprestimoController');

/**
 * @swagger
 * /emprestimos/multas/pendentes:
 *   get:
 *     summary: Busca multas pendentes de pagamento
 *     tags: [Empréstimo]
 *     responses:
 *       200:
 *         description: Lista de multas pendentes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id_multa:
 *                     type: integer
 *                   id_emprestimo:
 *                     type: integer
 *                   valor:
 *                     type: number
 *                     format: float
 *                   data_geracao:
 *                     type: string
 *                     format: date-time
 *                   status:
 *                     type: string
 *                     enum: [pendente, pago]
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Emprestimo:
 *       type: object
 *       properties:
 *         id_emprestimo:
 *           type: integer
 *         id_aluno:
 *           type: integer
 *         id_material:
 *           type: integer
 *         id_admin:
 *           type: integer
 *         data_retirada:
 *           type: string
 *           format: date-time
 *         data_devolucao_prevista:
 *           type: string
 *           format: date-time
 *         data_devolucao_real:
 *           type: string
 *           format: date-time
 *         periodo:
 *           type: string
 *           enum: [manhã, tarde, noite]
 *         local_retirada:
 *           type: string
 *         local_devolucao:
 *           type: string
 *         status:
 *           type: string
 *           enum: [ativo, devolvido, atrasado]
 *         aprovado_admin:
 *           type: integer
 */

/**
 * @swagger
 * /emprestimos/qrcode/aprovar:
 *   post:
 *     summary: Aprova um empréstimo via QR Code
 *     tags: [Empréstimo]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ra_aluno: { type: string }
 *               cod_material: { type: string }
 *               bloco: { type: string }
 *               descricao: { type: string }
 *               data_retirada: { type: string, format: date-time }
 *               data_devolucao_prevista: { type: string, format: date-time }
 *               periodo: { type: string, enum: [manhã, tarde, noite] }
 *               valor_multa: { type: number }
 *     responses:
 *       201:
 *         description: Empréstimo aprovado
 */
router.post('/qrcode/aprovar', emprestimoController.aprovarViaQr);

/**
 * @swagger
 * /emprestimos/qrcode/devolver:
 *   post:
 *     summary: Registra devolução via QR Code
 *     tags: [Empréstimo]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_emprestimo: { type: integer }
 *     responses:
 *       200:
 *         description: Devolução realizada
 */
router.post('/qrcode/devolver', emprestimoController.devolverViaQr);

router.post('/', emprestimoController.create);
router.get('/', emprestimoController.findAll);
router.get('/:id', emprestimoController.findOne);
router.put('/:id', emprestimoController.update);
router.delete('/:id', emprestimoController.delete);
router.get('/aluno/:alunoId', emprestimoController.findByAluno);
router.get('/status/:status', emprestimoController.findByStatus);
router.patch('/:id/aprovar', emprestimoController.aprovar);
router.patch('/:id/devolver', emprestimoController.devolver);

// Rota para consultar multas pendentes por aluno
router.get('/multas/aluno/:alunoId', emprestimoController.consultarMultasPendentes);

module.exports = router;
