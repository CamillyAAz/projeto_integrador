const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

/**
 * @swagger
 * components:
 *   schemas:
 *     TestMessage:
 *       type: object
 *       required:
 *         - phoneNumber
 *         - message
 *       properties:
 *         phoneNumber:
 *           type: string
 *           description: Número do telefone (formato brasileiro)
 *           example: "45999999999"
 *         message:
 *           type: string
 *           description: Mensagem a ser enviada
 *           example: "Teste de mensagem do sistema"
 *     NotificationResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         result:
 *           type: object
 */

/**
 * @swagger
 * /notifications/test-message:
 *   post:
 *     summary: Enviar mensagem de teste via WhatsApp
 *     tags: [Notificações]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TestMessage'
 *     responses:
 *       200:
 *         description: Mensagem enviada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotificationResponse'
 *       400:
 *         description: Dados inválidos
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /notifications/test-automatic:
 *   post:
 *     summary: Executar teste automático de notificações
 *     tags: [Notificações]
 *     description: Testa o sistema de notificações com dados fictícios
 *     responses:
 *       200:
 *         description: Teste executado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotificationResponse'
 *       500:
 *         description: Erro no teste
 */

/**
 * @swagger
 * /notifications/check-due-dates:
 *   post:
 *     summary: Verificar prazos de empréstimos manualmente
 *     tags: [Notificações]
 *     description: Executa verificação manual de empréstimos com vencimento próximo
 *     responses:
 *       200:
 *         description: Verificação executada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotificationResponse'
 *       500:
 *         description: Erro na verificação
 */

/**
 * @swagger
 * /notifications/check-overdue:
 *   post:
 *     summary: Verificar empréstimos atrasados manualmente
 *     tags: [Notificações]
 *     description: Executa verificação manual de empréstimos em atraso
 *     responses:
 *       200:
 *         description: Verificação executada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotificationResponse'
 *       500:
 *         description: Erro na verificação
 */

router.post('/test-message', notificationController.testSimpleMessage);
router.post('/test-automatic', notificationController.testAutomaticNotifications);
router.post('/check-due-dates', notificationController.checkDueDates);
router.post('/check-overdue', notificationController.checkOverdueLoans);

module.exports = router;