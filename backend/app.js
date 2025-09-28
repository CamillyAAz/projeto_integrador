const express = require('express');
const app = express();
const { sequelize } = require('./models');
const alunoRoutes = require('./routes/alunoRoutes');
const emprestimoRoutes = require('./routes/emprestimoRoutes');
const { swaggerUi, swaggerSpec } = require('./config/swagger');
const NotificationScheduler = require('./services/notificationScheduler');
const materialRoutes = require("./routes/materialRoutes");

app.use(express.json());
app.use('/alunos', alunoRoutes);
app.use('/emprestimos', emprestimoRoutes);
app.use('/notifications', require('./routes/notificationRoutes'));
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/materiais", materialRoutes);

const PORT = process.env.PORT || 3000;

sequelize.sync({ force: false }).then(() => {
  console.log('Banco de dados sincronizado');
  
  // Iniciar scheduler de notificações
  const notificationScheduler = new NotificationScheduler();
  notificationScheduler.start();
  
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Swagger disponível em: http://localhost:${PORT}/docs`);
  });
}).catch(err => {
  console.error('Erro ao conectar com o banco:', err);
});
