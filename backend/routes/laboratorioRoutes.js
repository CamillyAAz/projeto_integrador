const express = require('express');
const router = express.Router();
const laboratorioController = require('../controllers/laboratorioController');

/**
 * @swagger
 * tags:
 *   name: Laboratórios
 *   description: Gerenciamento de laboratórios
 */

/**
 * @swagger
 * /api/laboratorios:
 *   post:
 *     summary: Criar um novo laboratório
 *     tags: [Laboratórios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - bloco
 *             properties:
 *               nome:
 *                 type: string
 *                 example: "Laboratório de Informática 1"
 *               descricao:
 *                 type: string
 *                 example: "Laboratório com 40 computadores"
 *               bloco:
 *                 type: string
 *                 example: "Bloco A"
 *               capacidade:
 *                 type: integer
 *                 example: 40
 *               equipamentos:
 *                 type: string
 *                 example: "40 computadores Dell, Projetor, Quadro branco"
 *               disponivel:
 *                 type: boolean
 *                 example: true
 *               responsavel:
 *                 type: string
 *                 example: "Prof. João Silva"
 *     responses:
 *       201:
 *         description: Laboratório criado com sucesso
 *       400:
 *         description: Erro de validação
 */
router.post('/', laboratorioController.create);

/**
 * @swagger
 * /api/laboratorios:
 *   get:
 *     summary: Listar todos os laboratórios
 *     tags: [Laboratórios]
 *     parameters:
 *       - in: query
 *         name: bloco
 *         schema:
 *           type: string
 *         description: Filtrar por bloco
 *       - in: query
 *         name: disponivel
 *         schema:
 *           type: boolean
 *         description: Filtrar por disponibilidade
 *     responses:
 *       200:
 *         description: Lista de laboratórios
 */
router.get('/', laboratorioController.findAll);

/**
 * @swagger
 * /api/laboratorios/buscar:
 *   get:
 *     summary: Buscar laboratórios por termo
 *     tags: [Laboratórios]
 *     parameters:
 *       - in: query
 *         name: termo
 *         required: true
 *         schema:
 *           type: string
 *         description: Termo de busca (nome, bloco, responsável)
 *     responses:
 *       200:
 *         description: Resultados da busca
 *       400:
 *         description: Termo de busca não informado
 */
router.get('/buscar', laboratorioController.search);

/**
 * @swagger
 * /api/laboratorios/estatisticas:
 *   get:
 *     summary: Obter estatísticas dos laboratórios
 *     tags: [Laboratórios]
 *     responses:
 *       200:
 *         description: Estatísticas dos laboratórios
 */
router.get('/estatisticas', laboratorioController.estatisticas);

/**
 * @swagger
 * /api/laboratorios/{id}:
 *   get:
 *     summary: Buscar laboratório por ID
 *     tags: [Laboratórios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do laboratório
 *     responses:
 *       200:
 *         description: Dados do laboratório
 *       404:
 *         description: Laboratório não encontrado
 */
router.get('/:id', laboratorioController.findOne);

/**
 * @swagger
 * /api/laboratorios/{id}:
 *   put:
 *     summary: Atualizar laboratório
 *     tags: [Laboratórios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do laboratório
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               descricao:
 *                 type: string
 *               bloco:
 *                 type: string
 *               capacidade:
 *                 type: integer
 *               equipamentos:
 *                 type: string
 *               disponivel:
 *                 type: boolean
 *               responsavel:
 *                 type: string
 *     responses:
 *       200:
 *         description: Laboratório atualizado com sucesso
 *       404:
 *         description: Laboratório não encontrado
 */
router.put('/:id', laboratorioController.update);

/**
 * @swagger
 * /api/laboratorios/{id}/toggle-disponibilidade:
 *   patch:
 *     summary: Alternar disponibilidade do laboratório
 *     tags: [Laboratórios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do laboratório
 *     responses:
 *       200:
 *         description: Disponibilidade alterada com sucesso
 *       404:
 *         description: Laboratório não encontrado
 */
router.patch('/:id/toggle-disponibilidade', laboratorioController.toggleDisponibilidade);

/**
 * @swagger
 * /api/laboratorios/{id}:
 *   delete:
 *     summary: Excluir laboratório
 *     tags: [Laboratórios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do laboratório
 *     responses:
 *       200:
 *         description: Laboratório excluído com sucesso
 *       404:
 *         description: Laboratório não encontrado
 */
router.delete('/:id', laboratorioController.delete);

module.exports = router;
