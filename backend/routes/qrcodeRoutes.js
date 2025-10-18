const express = require('express');
const router = express.Router();
const qrcodeController = require('../controllers/qrcodeController');

/**
 * @swagger
 * /qrcode/lab/{labId}:
 *   get:
 *     summary: Gera QRCode para laboratório
 *     tags: [QRCode]
 *     parameters:
 *       - in: path
 *         name: labId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do laboratório
 *     responses:
 *       200:
 *         description: QRCode gerado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/QRCodeResponse'
 *       400:
 *         description: Parâmetros inválidos
 *       500:
 *         description: Erro no servidor
 */
router.get('/lab/:labId', qrcodeController.generateLabQRCode);

/**
 * @swagger
 * /qrcode/computer/{computerId}:
 *   get:
 *     summary: Gera QRCode para computador (fluxo aluno)
 *     tags: [QRCode]
 *     parameters:
 *       - in: path
 *         name: computerId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do computador
 *     responses:
 *       200:
 *         description: QRCode gerado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/QRCodeResponse'
 *       400:
 *         description: Parâmetros inválidos
 *       500:
 *         description: Erro no servidor
 */
router.get('/computer/:computerId', qrcodeController.generateComputerQRCode);

/**
 * @swagger
 * /qrcode/material-release:
 *   post:
 *     summary: Gera QRCode para liberação de material (fluxo administrador)
 *     tags: [QRCode]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - materialId
 *               - alunoId
 *             properties:
 *               materialId:
 *                 type: string
 *                 description: ID do material
 *               alunoId:
 *                 type: string
 *                 description: ID do aluno
 *     responses:
 *       200:
 *         description: QRCode gerado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/QRCodeResponse'
 *       400:
 *         description: Parâmetros inválidos
 *       500:
 *         description: Erro no servidor
 */
router.post('/material-release', qrcodeController.generateMaterialReleaseQRCode);

/**
 * @swagger
 * /qrcode/process:
 *   post:
 *     summary: Processa um QRCode escaneado
 *     tags: [QRCode]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - qrcodeData
 *             properties:
 *               qrcodeData:
 *                 type: string
 *                 description: Dados do QRCode escaneado
 *     responses:
 *       200:
 *         description: QRCode processado com sucesso
 *       400:
 *         description: Parâmetros inválidos
 *       500:
 *         description: Erro no servidor
 */
router.post('/process', qrcodeController.processQRCode);

/**
 * @swagger
 * /qrcode/notebook-return:
 *   post:
 *     summary: Gera QRCode para devolução de notebook
 *     tags: [QRCode]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - notebookId
 *               - alunoId
 *             properties:
 *               notebookId:
 *                 type: string
 *                 description: ID do notebook
 *               alunoId:
 *                 type: string
 *                 description: ID do aluno
 *     responses:
 *       200:
 *         description: QRCode gerado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/QRCodeResponse'
 *       400:
 *         description: Parâmetros inválidos
 *       500:
 *         description: Erro no servidor
 */
router.post('/notebook-return', qrcodeController.generateNotebookReturnQRCode);

module.exports = router;