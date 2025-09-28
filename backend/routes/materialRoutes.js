const express = require("express");
const router = express.Router();
const materialController = require("../controllers/materialController");

/**
 * @swagger
 * tags:
 *   name: Materiais
 *   description: CRUD de materiais disponíveis
 */

/**
 * @swagger
 * /materiais:
 *   post:
 *     summary: Cadastrar um novo material
 *     tags: [Materiais]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               codigo:
 *                 type: string
 *               modelo:
 *                 type: string
 *               descricao:
 *                 type: string
 *               codigo_barras_qr:
 *                 type: string
 *               disponivel:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Material criado com sucesso
 */
router.post("/", materialController.create);

/**
 * @swagger
 * /materiais:
 *   get:
 *     summary: Listar todos os materiais
 *     tags: [Materiais]
 *     responses:
 *       200:
 *         description: Lista de materiais
 */
router.get("/", materialController.findAll);

/**
 * @swagger
 * /materiais/{id}:
 *   get:
 *     summary: Buscar material por ID
 *     tags: [Materiais]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Material encontrado
 *       404:
 *         description: Material não encontrado
 */
router.get("/:id", materialController.findById);

/**
 * @swagger
 * /materiais/{id}:
 *   put:
 *     summary: Atualizar material por ID
 *     tags: [Materiais]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Material atualizado
 *       404:
 *         description: Material não encontrado
 */
router.put("/:id", materialController.update);

/**
 * @swagger
 * /materiais/{id}:
 *   delete:
 *     summary: Deletar material por ID
 *     tags: [Materiais]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Material deletado
 *       404:
 *         description: Material não encontrado
 */
router.delete("/:id", materialController.remove);

module.exports = router;
