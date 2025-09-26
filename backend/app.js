const express = require('express');
const app = express();
const { sequelize } = require('./models');
const alunoRoutes = require('./routes/alunoRoutes');
const emprestimoRoutes = require('./routes/emprestimoRoutes');
const { swaggerUi, swaggerSpec } = require('./config/swagger');

app.use(express.json());
app.use('/alunos', alunoRoutes);
app.use('/emprestimos', emprestimoRoutes);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const PORT = process.env.PORT || 3000;

sequelize.sync({ force: false }).then(() => {
  console.log('Banco de dados sincronizado');
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
}).catch(err => {
  console.error('Erro ao conectar com o banco:', err);
});
