const express = require('express');
const router = express.Router();
const suspensaoController = require('../controllers/suspensaoController');

/**
 * @swagger
 * /api/suspensoes:
 *   post:
 *     summary: Criar nova suspensão
 *     tags: [Suspensões]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_aluno
 *               - motivo
 *             properties:
 *               id_aluno:
 *                 type: integer
 *               motivo:
 *                 type: string
 *                 enum: [multas_pendentes, danos_nao_pagos, atraso_recorrente, outros]
 *               descricao:
 *                 type: string
 *               valor_pendente:
 *                 type: number
 *               data_fim:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Suspensão criada com sucesso
 */
router.post('/', suspensaoController.criarSuspensao);

/**
 * @swagger
 * /api/suspensoes:
 *   get:
 *     summary: Listar suspensões
 *     tags: [Suspensões]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ativa, resolvida, cancelada]
 *       - in: query
 *         name: id_aluno
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de suspensões
 */
router.get('/', suspensaoController.listarSuspensoes);

/**
 * @swagger
 * /api/suspensoes/verificar/{id_aluno}:
 *   get:
 *     summary: Verificar se aluno está suspenso
 *     tags: [Suspensões]
 *     parameters:
 *       - in: path
 *         name: id_aluno
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Status de suspensão do aluno
 */
router.get('/verificar/:id_aluno', suspensaoController.verificarSuspensao);

/**
 * @swagger
 * /api/suspensoes/{id_suspensao}/resolver:
 *   put:
 *     summary: Resolver uma suspensão
 *     tags: [Suspensões]
 *     parameters:
 *       - in: path
 *         name: id_suspensao
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               resolvido_por:
 *                 type: integer
 *               observacoes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Suspensão resolvida
 */
router.put('/:id_suspensao/resolver', suspensaoController.resolverSuspensao);

/**
 * @swagger
 * /api/suspensoes/{id_suspensao}/cancelar:
 *   put:
 *     summary: Cancelar uma suspensão
 *     tags: [Suspensões]
 *     parameters:
 *       - in: path
 *         name: id_suspensao
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               motivo_cancelamento:
 *                 type: string
 *     responses:
 *       200:
 *         description: Suspensão cancelada
 */
router.put('/:id_suspensao/cancelar', suspensaoController.cancelarSuspensao);

/**
 * @swagger
 * /api/suspensoes/processar-automaticas:
 *   post:
 *     summary: Processar suspensões automáticas
 *     tags: [Suspensões]
 *     description: Verifica e cria suspensões automáticas para alunos com multas ou danos acima do limite
 *     responses:
 *       200:
 *         description: Processamento concluído
 */
router.post('/processar-automaticas', suspensaoController.processarSuspensoesAutomaticas);

/**
 * @swagger
 * /api/suspensoes/relatorio:
 *   get:
 *     summary: Relatório de suspensões
 *     tags: [Suspensões]
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
 *         description: Relatório de suspensões
 */
router.get('/relatorio', suspensaoController.relatorioSuspensoes);

module.exports = router;
