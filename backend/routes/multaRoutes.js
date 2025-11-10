const express = require('express');
const router = express.Router();
const multaController = require('../controllers/multaController');

/**
 * @swagger
 * /api/multas/{id_emprestimo}/aplicar:
 *   post:
 *     summary: Aplicar multa a um empréstimo
 *     tags: [Multas]
 *     parameters:
 *       - in: path
 *         name: id_emprestimo
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do empréstimo
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               data_devolucao_real:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Multa aplicada com sucesso
 *       400:
 *         description: Erro ao aplicar multa
 */
router.post('/:id_emprestimo/aplicar', multaController.aplicarMulta);

/**
 * @swagger
 * /api/multas:
 *   get:
 *     summary: Listar todas as multas
 *     tags: [Multas]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pago, pendente]
 *         description: Filtrar por status de pagamento
 *       - in: query
 *         name: id_aluno
 *         schema:
 *           type: integer
 *         description: Filtrar por ID do aluno
 *     responses:
 *       200:
 *         description: Lista de multas
 */
router.get('/', multaController.listarMultas);

/**
 * @swagger
 * /api/multas/{id_emprestimo}/pagar:
 *   post:
 *     summary: Registrar pagamento de multa
 *     tags: [Multas]
 *     parameters:
 *       - in: path
 *         name: id_emprestimo
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do empréstimo
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               valor_pago:
 *                 type: number
 *                 format: decimal
 *               forma_pagamento:
 *                 type: string
 *     responses:
 *       200:
 *         description: Pagamento registrado com sucesso
 */
router.post('/:id_emprestimo/pagar', multaController.pagarMulta);

/**
 * @swagger
 * /api/multas/calcular:
 *   get:
 *     summary: Calcular valor de multa por atraso
 *     tags: [Multas]
 *     parameters:
 *       - in: query
 *         name: data_prevista
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Data de devolução prevista
 *       - in: query
 *         name: data_real
 *         schema:
 *           type: string
 *           format: date
 *         description: Data de devolução real (padrão: hoje)
 *     responses:
 *       200:
 *         description: Cálculo da multa
 */
router.get('/calcular', multaController.calcularMulta);

/**
 * @swagger
 * /api/multas/relatorio:
 *   get:
 *     summary: Relatório de multas
 *     tags: [Multas]
 *     parameters:
 *       - in: query
 *         name: data_inicio
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: data_fim
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Relatório completo de multas
 */
router.get('/relatorio', multaController.relatorioMultas);

module.exports = router;
