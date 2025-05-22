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
const vendasbilheteRoutes = require('./routes/vendasbilheteRoutes'); 
const itensvendabilheteRoutes = require('./routes/itensvendabilheteRoutes');
const moedasRoutes = require('./routes/moedasRoutes');
const centrocustoRoutes = require('./routes/centrocustoRoutes');
const formaspagamentoRoutes = require('./routes/formaspagamentoRoutes');
const planocontaRoutes = require('./routes/planocontaRoutes');
const gruposRoutes = require('./routes/gruposRoutes');
const recibosreceberRoutes = require('./routes/recibosreceberRoutes');
const incvendasbilheteRoutes = require('./routes/incvendasbilheteRoutes'); 
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
app.use('/api/vendasbilhete', vendasbilheteRoutes); 
app.use('/api/itensvendabilhete', itensvendabilheteRoutes); 
app.use('/api/moedas', moedasRoutes); 
app.use('/api/centrocusto', centrocustoRoutes); 
app.use('/api/formaspagamento', formaspagamentoRoutes); 
app.use('/api/planoconta', planocontaRoutes); 
app.use('/api/grupos', gruposRoutes); 
app.use('/api/recibosreceber', recibosreceberRoutes); 
app.use('/api/incvendasbilhete', incvendasbilheteRoutes); 

// Swagger
setupSwagger(app);

// Inicialização do servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
