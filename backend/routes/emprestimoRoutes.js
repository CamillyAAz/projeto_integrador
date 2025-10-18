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
 * /emprestimos:
 *   get:
 *     summary: Lista todos os empréstimos
 *     tags: [Empréstimo]
 *     responses:
 *       200:
 *         description: Lista de empréstimos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Emprestimo'
 *   post:
 *     summary: Cria um novo empréstimo
 *     tags: [Empréstimo]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Emprestimo'
 *     responses:
 *       201:
 *         description: Empréstimo criado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Emprestimo'
 *       400:
 *         description: Requisição inválida
 */

/**
 * @swagger
 * /emprestimos/{id}:
 *   get:
 *     summary: Busca um empréstimo pelo ID
 *     tags: [Empréstimo]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID do empréstimo
 *     responses:
 *       200:
 *         description: Empréstimo encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Emprestimo'
 *       404:
 *         description: Empréstimo não encontrado
 *   put:
 *     summary: Atualiza um empréstimo pelo ID
 *     tags: [Empréstimo]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID do empréstimo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Emprestimo'
 *     responses:
 *       200:
 *         description: Empréstimo atualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Emprestimo'
 *       400:
 *         description: Requisição inválida
 *       404:
 *         description: Empréstimo não encontrado
 *   delete:
 *     summary: Remove um empréstimo pelo ID
 *     tags: [Empréstimo]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID do empréstimo
 *     responses:
 *       204:
 *         description: Empréstimo removido
 *       404:
 *         description: Empréstimo não encontrado
 */

/**
 * @swagger
 * /emprestimos/aluno/{alunoId}:
 *   get:
 *     summary: Busca empréstimos de um aluno
 *     tags: [Empréstimo]
 *     parameters:
 *       - in: path
 *         name: alunoId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID do aluno
 *     responses:
 *       200:
 *         description: Lista de empréstimos do aluno
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Emprestimo'
 */

/**
 * @swagger
 * /emprestimos/status/{status}:
 *   get:
 *     summary: Busca empréstimos por status
 *     tags: [Empréstimo]
 *     parameters:
 *       - in: path
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ativo, devolvido, atrasado]
 *         required: true
 *         description: Status do empréstimo
 *     responses:
 *       200:
 *         description: Lista de empréstimos com o status especificado
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Emprestimo'
 */

/**
 * @swagger
 * /emprestimos/{id}/aprovar:
 *   patch:
 *     summary: Aprova um empréstimo
 *     tags: [Empréstimo]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID do empréstimo
 *     responses:
 *       200:
 *         description: Empréstimo aprovado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Emprestimo'
 *       404:
 *         description: Empréstimo não encontrado
 */

/**
 * @swagger
 * /emprestimos/{id}/devolver:
 *   patch:
 *     summary: Registra a devolução de um empréstimo
 *     tags: [Empréstimo]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID do empréstimo
 *     responses:
 *       200:
 *         description: Devolução registrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Emprestimo'
 *       404:
 *         description: Empréstimo não encontrado
 */

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