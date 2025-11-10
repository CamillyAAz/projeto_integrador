const express = require('express');
const router = express.Router();
const relatorioController = require('../controllers/relatorioController');

// RF-11: Rotas de relatórios

/**
 * @swagger
 * /api/relatorios/geral:
 *   get:
 *     summary: Relatório geral de empréstimos
 *     tags: [Relatórios]
 *     parameters:
 *       - in: query
 *         name: data_inicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Data inicial do período (YYYY-MM-DD)
 *       - in: query
 *         name: data_fim
 *         schema:
 *           type: string
 *           format: date
 *         description: Data final do período (YYYY-MM-DD)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ativo, devolvido, atrasado]
 *         description: Filtrar por status
 *       - in: query
 *         name: bloco
 *         schema:
 *           type: string
 *         description: Filtrar por bloco/local
 *       - in: query
 *         name: periodo
 *         schema:
 *           type: string
 *           enum: [manhã, tarde, noite]
 *         description: Filtrar por período do dia
 *     responses:
 *       200:
 *         description: Relatório gerado com sucesso
 */
router.get('/geral', relatorioController.relatorioGeral);

/**
 * @swagger
 * /api/relatorios/aluno/{id_aluno}:
 *   get:
 *     summary: Relatório de empréstimos por aluno
 *     tags: [Relatórios]
 *     parameters:
 *       - in: path
 *         name: id_aluno
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do aluno
 *       - in: query
 *         name: data_inicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Data inicial do período
 *       - in: query
 *         name: data_fim
 *         schema:
 *           type: string
 *           format: date
 *         description: Data final do período
 *     responses:
 *       200:
 *         description: Relatório do aluno gerado com sucesso
 *       404:
 *         description: Aluno não encontrado
 */
router.get('/aluno/:id_aluno', relatorioController.relatorioPorAluno);

/**
 * @swagger
 * /api/relatorios/materiais/mais-emprestados:
 *   get:
 *     summary: Relatório dos materiais mais emprestados
 *     tags: [Relatórios]
 *     parameters:
 *       - in: query
 *         name: data_inicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Data inicial do período
 *       - in: query
 *         name: data_fim
 *         schema:
 *           type: string
 *           format: date
 *         description: Data final do período
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Quantidade de materiais a retornar
 *     responses:
 *       200:
 *         description: Ranking de materiais mais emprestados
 */
router.get('/materiais/mais-emprestados', relatorioController.relatorioMateriaisMaisEmprestados);

/**
 * @swagger
 * /api/relatorios/por-periodo:
 *   get:
 *     summary: Relatório de empréstimos por período do dia
 *     tags: [Relatórios]
 *     parameters:
 *       - in: query
 *         name: data_inicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Data inicial do período
 *       - in: query
 *         name: data_fim
 *         schema:
 *           type: string
 *           format: date
 *         description: Data final do período
 *     responses:
 *       200:
 *         description: Distribuição de empréstimos por período
 */
router.get('/por-periodo', relatorioController.relatorioPorPeriodo);

/**
 * @swagger
 * /api/relatorios/por-local:
 *   get:
 *     summary: Relatório de empréstimos por local (bloco)
 *     tags: [Relatórios]
 *     parameters:
 *       - in: query
 *         name: data_inicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Data inicial do período
 *       - in: query
 *         name: data_fim
 *         schema:
 *           type: string
 *           format: date
 *         description: Data final do período
 *     responses:
 *       200:
 *         description: Distribuição de empréstimos por bloco
 */
router.get('/por-local', relatorioController.relatorioPorLocal);

/**
 * @swagger
 * /api/relatorios/financeiro:
 *   get:
 *     summary: Relatório financeiro de multas
 *     tags: [Relatórios]
 *     parameters:
 *       - in: query
 *         name: data_inicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Data inicial do período
 *       - in: query
 *         name: data_fim
 *         schema:
 *           type: string
 *           format: date
 *         description: Data final do período
 *       - in: query
 *         name: status_pagamento
 *         schema:
 *           type: string
 *           enum: [pago, pendente]
 *         description: Filtrar por status de pagamento
 *     responses:
 *       200:
 *         description: Relatório financeiro gerado com sucesso
 */
router.get('/financeiro', relatorioController.relatorioFinanceiro);

/**
 * @swagger
 * /api/relatorios/dashboard:
 *   get:
 *     summary: Relatório consolidado para dashboard
 *     tags: [Relatórios]
 *     parameters:
 *       - in: query
 *         name: data_inicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Data inicial do período
 *       - in: query
 *         name: data_fim
 *         schema:
 *           type: string
 *           format: date
 *         description: Data final do período
 *     responses:
 *       200:
 *         description: Dashboard com estatísticas consolidadas
 */
router.get('/dashboard', relatorioController.relatorioDashboard);

/**
 * @swagger
 * /api/relatorios/exportar/csv:
 *   get:
 *     summary: Exportar relatório em formato CSV
 *     tags: [Relatórios]
 *     parameters:
 *       - in: query
 *         name: tipo
 *         required: true
 *         schema:
 *           type: string
 *         description: Tipo de relatório
 *       - in: query
 *         name: data_inicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Data inicial do período
 *       - in: query
 *         name: data_fim
 *         schema:
 *           type: string
 *           format: date
 *         description: Data final do período
 *     responses:
 *       200:
 *         description: Arquivo CSV para download
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 */
router.get('/exportar/csv', relatorioController.exportarCSV);

module.exports = router;
