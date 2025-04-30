const express = require('express');
require('dotenv').config();

const app = express();
const usuariosRoutes = require('./routes/usuariosRoutes');
const setupSwagger = require('./swagger');

app.use(express.json());

// Rotas da API
app.use('/api/usuarios', usuariosRoutes);

// Configurar Swagger
setupSwagger(app);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
