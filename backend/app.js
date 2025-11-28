const express = require('express');
const cors = require('cors');
const app = express();
const { sequelize } = require('./models');
const alunoRoutes = require('./routes/alunoRoutes');
const emprestimoRoutes = require('./routes/emprestimoRoutes');
const { swaggerUi, swaggerSpec } = require('./config/swagger');
const NotificationScheduler = require('./services/notificationScheduler');
const materialRoutes = require("./routes/materialRoutes");
const qrcodeRoutes = require('./routes/qrcodeRoutes');
const relatorioRoutes = require('./routes/relatorioRoutes');
const multaRoutes = require('./routes/multaRoutes');
const suspensaoRoutes = require('./routes/suspensaoRoutes');
const danoRoutes = require('./routes/danoRoutes');
const laboratorioRoutes = require('./routes/laboratorioRoutes');

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use('/alunos', alunoRoutes);
app.use('/emprestimos', emprestimoRoutes);
app.use('/notifications', require('./routes/notificationRoutes'));
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/materiais", materialRoutes);
app.use('/qrcode', qrcodeRoutes);
app.use('/api/relatorios', relatorioRoutes);
app.use('/api/multas', multaRoutes);
app.use('/api/suspensoes', suspensaoRoutes);
app.use('/api/danos', danoRoutes);
app.use('/api/laboratorios', laboratorioRoutes);

const PORT = process.env.PORT || 3000;

sequelize.sync({ alter: true, force: false }).then(() => {
  console.log('Banco de dados sincronizado');
  
  const notificationScheduler = new NotificationScheduler();
  notificationScheduler.start();
  
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Swagger disponível em: http://localhost:${PORT}/docs`);
  });
}).catch(err => {
  console.error('Erro ao conectar com o banco:', err);
});
