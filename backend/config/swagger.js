const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Sistema de Empréstimos - API',
      version: '2.0.0',
      description: 'API completa para gestão de empréstimos, multas, danos e suspensões',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de Desenvolvimento',
      },
    ],
    tags: [
      {
        name: 'Alunos',
        description: 'Gerenciamento de alunos',
      },
      {
        name: 'Materiais',
        description: 'Gerenciamento de materiais',
      },
      {
        name: 'Empréstimos',
        description: 'Gerenciamento de empréstimos',
      },
      {
        name: 'Multas',
        description: 'Aplicação e gerenciamento de multas',
      },
      {
        name: 'Suspensões',
        description: 'Gerenciamento de suspensões de alunos',
      },
      {
        name: 'Danos',
        description: 'Registro e gerenciamento de danos em materiais',
      },
      {
        name: 'Relatórios',
        description: 'Relatórios e estatísticas do sistema',
      },
      {
        name: 'QR Code',
        description: 'Operações via QR Code',
      },
      {
        name: 'Notificações',
        description: 'Sistema de notificações',
      },
    ],
  },
  apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = { swaggerUi, swaggerSpec };
