require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const { sequelize } = require('./models');
const alunoRoutes = require('./routes/alunoRoutes');
const authRoutes = require('./routes/authRoutes');
const emprestimoRoutes = require('./routes/emprestimoRoutes');
// const { swaggerUi, swaggerSpec } = require('./config/swagger');
const NotificationScheduler = require('./services/notificationScheduler');
const materialRoutes = require("./routes/materialRoutes");
const qrcodeRoutes = require('./routes/qrcodeRoutes');
const relatorioRoutes = require('./routes/relatorioRoutes');
// const multaRoutes = require('./routes/multaRoutes');
const suspensaoRoutes = require('./routes/suspensaoRoutes');
const danoRoutes = require('./routes/danoRoutes');

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Endpoint de teste simples para verificar se o backend está funcionando
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend funcionando!', timestamp: new Date().toISOString() });
});
app.use('/api/auth', authRoutes);
app.use('/alunos', alunoRoutes);
app.use('/notificacoes', require('./routes/notificationRoutes'));
app.use('/emprestimos', emprestimoRoutes);
app.use('/notifications', require('./routes/notificationRoutes'));
// app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/materiais", materialRoutes);
app.use('/qrcode', qrcodeRoutes);
app.use('/api/relatorios', relatorioRoutes);
// app.use('/api/multas', multaRoutes);
app.use('/api/suspensoes', suspensaoRoutes);
app.use('/api/danos', danoRoutes);

// Rota debug temporária
const debugRoutes = require('./routes/debugRoutes');
app.use('/api/debug', debugRoutes);

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
