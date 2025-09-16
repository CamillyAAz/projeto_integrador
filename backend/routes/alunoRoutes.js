const express = require('express');
const router = express.Router();
const alunoController = require('../controllers/alunoController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Aluno:
 *       type: object
 *       properties:
 *         id_aluno:
 *           type: integer
 *         nome:
 *           type: string
 *         turma:
 *           type: string
 *         bloco:
 *           type: string
 *         email:
 *           type: string
 *         ativo:
 *           type: integer
 *         ra:
 *           type: string
 *   responses:
 *     NotFound:
 *       description: Não encontrado
 *     BadRequest:
 *       description: Requisição inválida
 */
/**
 * @swagger
 * /alunos:
 *   get:
 *     summary: Lista todos os alunos
 *     tags: [Aluno]
 *     responses:
 *       200:
 *         description: Lista de alunos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Aluno'
 *   post:
 *     summary: Cria um novo aluno
 *     tags: [Aluno]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Aluno'
 *     responses:
 *       201:
 *         description: Aluno criado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Aluno'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *
 * /alunos/{id}:
 *   get:
 *     summary: Busca um aluno pelo ID
 *     tags: [Aluno]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID do aluno
 *     responses:
 *       200:
 *         description: Aluno encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Aluno'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   put:
 *     summary: Atualiza um aluno pelo ID
 *     tags: [Aluno]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID do aluno
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Aluno'
 *     responses:
 *       200:
 *         description: Aluno atualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Aluno'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   delete:
 *     summary: Remove um aluno pelo ID
 *     tags: [Aluno]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID do aluno
 *     responses:
 *       204:
 *         description: Aluno removido
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */


/**
 * @swagger
 * /alunos/ra/{ra}:
 *   get:
 *     summary: Busca um aluno pelo RA
 *     tags: [Aluno]
 *     parameters:
 *       - in: path
 *         name: ra
 *         schema:
 *           type: string
 *         required: true
 *         description: RA do aluno
 *     responses:
 *       200:
 *         description: Aluno encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Aluno'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   put:
 *     summary: Atualiza um aluno pelo RA
 *     tags: [Aluno]
 *     parameters:
 *       - in: path
 *         name: ra
 *         schema:
 *           type: string
 *         required: true
 *         description: RA do aluno
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Aluno'
 *     responses:
 *       200:
 *         description: Aluno atualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Aluno'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   delete:
 *     summary: Remove um aluno pelo RA
 *     tags: [Aluno]
 *     parameters:
 *       - in: path
 *         name: ra
 *         schema:
 *           type: string
 *         required: true
 *         description: RA do aluno
 *     responses:
 *       204:
 *         description: Aluno removido
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

router.post('/', alunoController.create);
router.get('/', alunoController.findAll);
router.get('/ra/:ra', alunoController.findByRa);
router.put('/ra/:ra', alunoController.updateByRa);
router.delete('/ra/:ra', alunoController.deleteByRa);
router.get('/:id', alunoController.findOne);
router.put('/:id', alunoController.update);
router.delete('/:id', alunoController.delete);

module.exports = router;
