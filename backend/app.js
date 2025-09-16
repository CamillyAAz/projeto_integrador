const express = require('express');
const app = express();
const sequelize = require('./config/database');
const alunoRoutes = require('./routes/alunoRoutes');
const { swaggerUi, swaggerSpec } = require('./config/swagger');

app.use(express.json());
app.use('/alunos', alunoRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const PORT = process.env.PORT || 3000;

sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
});
