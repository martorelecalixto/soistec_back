const express = require('express');
const cors = require('cors'); // Importa o CORS
require('dotenv').config();

const app = express();

// Rotas
const usuariosRoutes = require('./routes/usuariosRoutes');
const authRoutes = require('./routes/authRoutes'); 
const filiaisRoutes = require('./routes/filiaisRoutes'); 
const atividadesRoutes = require('./routes/atividadesRoutes'); 
const empresasRoutes = require('./routes/empresasRoutes'); 
const entidadesRoutes = require('./routes/entidadesRoutes'); 

// Swagger
const setupSwagger = require('./swagger');

// Ativa o CORS
app.use(cors());

// Suporte a JSON
app.use(express.json());

// Rotas da API
app.use('/api/usuarios', usuariosRoutes);
app.use('/auth', authRoutes); 
app.use('/api/filiais', filiaisRoutes); 
app.use('/api/atividades', atividadesRoutes); 
app.use('/api/empresas', empresasRoutes); 
app.use('/api/entidades', entidadesRoutes); 

// Swagger
setupSwagger(app);

// Inicialização do servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
