const express = require('express');
const router = express.Router();
const danoController = require('../controllers/danoController');

/**
 * @swagger
 * /api/danos:
 *   post:
 *     summary: Registrar novo dano
 *     tags: [Danos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_emprestimo
 *               - descricao_dano
 *               - gravidade
 *             properties:
 *               id_emprestimo:
 *                 type: integer
 *               descricao_dano:
 *                 type: string
 *               gravidade:
 *                 type: string
 *                 enum: [leve, moderado, grave, perda_total]
 *               valor_reparo:
 *                 type: number
 *                 format: decimal
 *               observacoes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Dano registrado com sucesso
 */
router.post('/', danoController.registrarDano);

/**
 * @swagger
 * /api/danos:
 *   get:
 *     summary: Listar danos
 *     tags: [Danos]
 *     parameters:
 *       - in: query
 *         name: status_reparo
 *         schema:
 *           type: string
 *           enum: [pendente, em_reparo, reparado, irreparavel]
 *       - in: query
 *         name: gravidade
 *         schema:
 *           type: string
 *           enum: [leve, moderado, grave, perda_total]
 *       - in: query
 *         name: id_aluno
 *         schema:
 *           type: integer
 *       - in: query
 *         name: id_material
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de danos
 */
router.get('/', danoController.listarDanos);

/**
 * @swagger
 * /api/danos/{id_dano}:
 *   get:
 *     summary: Obter detalhes de um dano
 *     tags: [Danos]
 *     parameters:
 *       - in: path
 *         name: id_dano
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalhes do dano
 *       404:
 *         description: Dano não encontrado
 */
router.get('/:id_dano', danoController.obterDano);

/**
 * @swagger
 * /api/danos/{id_dano}/status:
 *   put:
 *     summary: Atualizar status de reparo
 *     tags: [Danos]
 *     parameters:
 *       - in: path
 *         name: id_dano
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status_reparo
 *             properties:
 *               status_reparo:
 *                 type: string
 *                 enum: [pendente, em_reparo, reparado, irreparavel]
 *               observacoes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Status atualizado
 */
router.put('/:id_dano/status', danoController.atualizarStatusReparo);

/**
 * @swagger
 * /api/danos/{id_dano}/pagar:
 *   post:
 *     summary: Registrar pagamento de dano
 *     tags: [Danos]
 *     parameters:
 *       - in: path
 *         name: id_dano
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - valor_pago
 *             properties:
 *               valor_pago:
 *                 type: number
 *                 format: decimal
 *               forma_pagamento:
 *                 type: string
 *     responses:
 *       200:
 *         description: Pagamento registrado
 */
router.post('/:id_dano/pagar', danoController.pagarDano);

/**
 * @swagger
 * /api/danos/relatorio/geral:
 *   get:
 *     summary: Relatório geral de danos
 *     tags: [Danos]
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
 *       - in: query
 *         name: gravidade
 *         schema:
 *           type: string
 *           enum: [leve, moderado, grave, perda_total]
 *     responses:
 *       200:
 *         description: Relatório de danos
 */
router.get('/relatorio/geral', danoController.relatorioDanos);

module.exports = router;
