const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// 🧩 Importação das rotas
const acomodacoesRoutes = require('./routes/acomodacoesRoutes');
const atividadesRoutes = require('./routes/atividadesRoutes');
const authRoutes = require('./routes/authRoutes');
const bancosRoutes = require('./routes/bancosRoutes');
const centrocustoRoutes = require('./routes/centrocustoRoutes');
const contasbancariasRoutes = require('./routes/contasbancariasRoutes');
const configuracoesRoutes = require('./routes/configuracoesRoutes');
const copetsRoutes = require('./routes/copetsRoutes');
const empresasRoutes = require('./routes/empresasRoutes');
const entidadesRoutes = require('./routes/entidadesRoutes');
const filiaisRoutes = require('./routes/filiaisRoutes');
const faturasRoutes = require('./routes/faturasRoutes');
const formaspagamentoRoutes = require('./routes/formaspagamentoRoutes');
const graficosRoutes = require('./routes/graficosRoutes');
const gruposRoutes = require('./routes/gruposRoutes');
const incfaturasRoutes = require('./routes/incfaturasRoutes');
const increcibosreceberRoutes = require('./routes/increcibosreceberRoutes');
const inctitulospagarRoutes = require('./routes/inctitulospagarRoutes');
const inctitulosreceberRoutes = require('./routes/inctitulosreceberRoutes');
const incvendasbilheteRoutes = require('./routes/incvendasbilheteRoutes');
const incvendashotelRoutes = require('./routes/incvendashotelRoutes');
const itensvendabilheteRoutes = require('./routes/itensvendabilheteRoutes');
const itensvendahotelRoutes = require('./routes/itensvendahotelRoutes');
const moedasRoutes = require('./routes/moedasRoutes');
const planocontaRoutes = require('./routes/planocontaRoutes');
const recibosreceberRoutes = require('./routes/recibosreceberRoutes');
const tiposervicosRoutes = require('./routes/tiposervicohoteisRoutes');
const titulospagarRoutes = require('./routes/titulospagarRoutes');
const titulosreceberRoutes = require('./routes/titulosreceberRoutes');
const usuariosRoutes = require('./routes/usuariosRoutes');
const vendasbilheteRoutes = require('./routes/vendasbilheteRoutes');
const vendashotelRoutes = require('./routes/vendashotelRoutes');
const grupospermissoesRoutes = require('./routes/grupospermissoesRoutes');
const permissoesRoutes = require('./routes/permissoesRoutes');
const usuariosgruposRoutes = require('./routes/usuariosgruposRoutes');
const recursosRoutes = require('./routes/recursosRoutes');
const emailRoutes = require('./routes/emailRoutes');
const emailanexoRoutes = require('./routes/emailanexoRoutes');
const nfseRoutes = require('./routes/nfseRoutes');

// Swagger
const setupSwagger = require('./swagger');

// ✅ Middlewares globais (ordem importante)
app.use(cors());

// ⚠️ Deve vir ANTES das rotas (apenas uma vez)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Servir arquivos de upload estaticamente
// Isso permite que Nodemailer encontre os anexos via `path`
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Registro das rotas
app.use('/api/acomodacoes', acomodacoesRoutes);
app.use('/api/atividades', atividadesRoutes);
app.use('/auth', authRoutes);
app.use('/api/bancos', bancosRoutes);
app.use('/api/centrocusto', centrocustoRoutes);
app.use('/api/contasbancarias', contasbancariasRoutes);
app.use('/api/configuracoes', configuracoesRoutes);
app.use('/api/copets', copetsRoutes);
app.use('/api/empresas', empresasRoutes);
app.use('/api/email', emailRoutes); // ✅ correto
app.use('/api/emailanexo', emailanexoRoutes); // ✅ correto
app.use('/api/entidades', entidadesRoutes);
app.use('/api/faturas', faturasRoutes);
app.use('/api/filiais', filiaisRoutes);
app.use('/api/formaspagamento', formaspagamentoRoutes);
app.use('/api/graficos', graficosRoutes);
app.use('/api/grupos', gruposRoutes);
app.use('/api/incfaturas', incfaturasRoutes);
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
app.use('/api/grupospermissoes', grupospermissoesRoutes);
app.use('/api/permissoes', permissoesRoutes);
app.use('/api/usuariosgrupos', usuariosgruposRoutes);
app.use('/api/recursos', recursosRoutes);
app.use('/api/nfse', nfseRoutes);

// Swagger
setupSwagger(app);

// garante a existência da pasta temporária
//const TEMP_DIR = process.env.TEMP_UPLOAD_DIR || './tmp_uploads';
//fs.ensureDirSync(TEMP_DIR);


// =============================
// 🧹 LIMPEZA AUTOMÁTICA TEMP_UPLOADS
// =============================
const cron = require('node-cron');
const fs = require('fs-extra');

const TEMP_DIR = path.join(__dirname, 'tmp_uploads');

async function limparUploadsTemporarios() {
  try {
    await fs.ensureDir(TEMP_DIR);
    await fs.emptyDir(TEMP_DIR);
    //console.log('🧹 tmp_uploads limpa automaticamente às 03h00');
  } catch (err) {
    console.error('Erro ao limpar tmp_uploads:', err.message);
  }
}

cron.schedule('0 3 * * *', limparUploadsTemporarios);
limparUploadsTemporarios(); // também limpa na inicialização


// Inicialização do servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  //console.log(`🚀 Servidor rodando na porta ${PORT}`);
   console.log(`Servidor rodando na porta ${PORT}`);
});

