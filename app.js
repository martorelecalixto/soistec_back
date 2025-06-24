  const express = require('express');
const cors = require('cors'); // Importa o CORS
require('dotenv').config();

const app = express();

// Rotas 'em ordem alfabética'
const acomodacoesRoutes = require('./routes/acomodacoesRoutes'); 
const atividadesRoutes = require('./routes/atividadesRoutes'); 
const authRoutes = require('./routes/authRoutes'); 
const centrocustoRoutes = require('./routes/centrocustoRoutes');
const empresasRoutes = require('./routes/empresasRoutes'); 
const entidadesRoutes = require('./routes/entidadesRoutes'); 
const filiaisRoutes = require('./routes/filiaisRoutes'); 
const faturasRoutes = require('./routes/faturasRoutes'); 
const formaspagamentoRoutes = require('./routes/formaspagamentoRoutes');
const gruposRoutes = require('./routes/gruposRoutes');
const inctitulosreceberRoutes = require('./routes/inctitulosreceberRoutes');
const inctitulospagarRoutes = require('./routes/inctitulospagarRoutes');
const increcibosreceberRoutes = require('./routes/increcibosreceberRoutes');  
const incvendasbilheteRoutes = require('./routes/incvendasbilheteRoutes'); 
const incvendashotelRoutes = require('./routes/incvendashotelRoutes'); 
const itensvendabilheteRoutes = require('./routes/itensvendabilheteRoutes');
const itensvendahotelRoutes = require('./routes/itensvendahotelRoutes');
const moedasRoutes = require('./routes/moedasRoutes');
const planocontaRoutes = require('./routes/planocontaRoutes');
const recibosreceberRoutes = require('./routes/recibosreceberRoutes');
const tiposervicosRoutes = require('./routes/tiposervicohoteisRoutes');
const titulosreceberRoutes = require('./routes/titulosreceberRoutes');
const titulospagarRoutes = require('./routes/titulospagarRoutes');
const usuariosRoutes = require('./routes/usuariosRoutes');
const vendasbilheteRoutes = require('./routes/vendasbilheteRoutes'); 
const vendashotelRoutes = require('./routes/vendashotelRoutes'); 

// Swagger
const setupSwagger = require('./swagger');

// Ativa o CORS
app.use(cors());

// Suporte a JSON
app.use(express.json());

// Rotas da API 'em ordem alfabetica'
app.use('/api/acomodacoes', acomodacoesRoutes);
app.use('/api/atividades', atividadesRoutes); 
app.use('/auth', authRoutes); 
app.use('/api/centrocusto', centrocustoRoutes); 
app.use('/api/empresas', empresasRoutes); 
app.use('/api/entidades', entidadesRoutes); 
app.use('/api/faturas', faturasRoutes); 
app.use('/api/filiais', filiaisRoutes); 
app.use('/api/formaspagamento', formaspagamentoRoutes); 
app.use('/api/grupos', gruposRoutes); 
app.use('/api/increcibosreceber', increcibosreceberRoutes);
app.use('/api/inctitulospagar', inctitulospagarRoutes); 
app.use('/api/inctitulosreceber', inctitulosreceberRoutes); 
app.use('/api/incvendasbilhete', incvendasbilheteRoutes); 
app.use('/api/incvendashotel', incvendashotelRoutes); 
app.use('/api/itensvendabilhete', itensvendabilheteRoutes); 
app.use('/api/itensvendahotel', itensvendahotelRoutes); 
app.use('/api/moedas', moedasRoutes); 
app.use('/api/planoconta', planocontaRoutes); 
app.use('/api/recibosreceber', recibosreceberRoutes); 
app.use('/api/tiposervico', tiposervicosRoutes); 
app.use('/api/titulospagar', titulospagarRoutes); 
app.use('/api/titulosreceber', titulosreceberRoutes); 
app.use('/api/vendasbilhete', vendasbilheteRoutes); 
app.use('/api/vendashotel', vendashotelRoutes); 
app.use('/api/usuarios', usuariosRoutes);

// Swagger
setupSwagger(app);

// Inicialização do servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
