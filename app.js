const express = require('express');
const cors = require('cors'); // ✅ Importa o CORS
require('dotenv').config();

const app = express();
const usuariosRoutes = require('./routes/usuariosRoutes');
const setupSwagger = require('./swagger');

// ✅ Ativa o CORS para todas as origens (ou configure uma origem específica)
app.use(cors());

app.use(express.json());

// Rotas da API
app.use('/api/usuarios', usuariosRoutes);

// Configurar Swagger
setupSwagger(app);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
