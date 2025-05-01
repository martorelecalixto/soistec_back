const express = require('express');
const cors = require('cors'); // Importa o CORS
require('dotenv').config();

const app = express();

// Rotas
const usuariosRoutes = require('./routes/usuariosRoutes');
const authRoutes = require('./routes/authRoutes'); // ✅ Importa as rotas de autenticação

// Swagger
const setupSwagger = require('./swagger');

// Ativa o CORS
app.use(cors());

// Suporte a JSON
app.use(express.json());

// Rotas da API
app.use('/api/usuarios', usuariosRoutes);
app.use('/auth/login', authRoutes); // ✅ Define rota para autenticação

// Swagger
setupSwagger(app);

// Inicialização do servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
