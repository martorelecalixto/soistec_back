const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const Mailjet = require('node-mailjet');

const app = express();
app.use(express.json());
app.use(cors());

// 🔧 Pasta de uploads temporários
const TEMP_DIR = './tmp_uploads';
fs.ensureDirSync(TEMP_DIR);

// ⚙️ Configuração do Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, TEMP_DIR),
  filename: (req, file, cb) => {
    const id = uuidv4();
    const ext = path.extname(file.originalname) || '.pdf';
    cb(null, `${id}${ext}`);
  },
});
const upload = multer({ storage });

// 📤 Conexão Mailjet (usa as chaves que funcionam!)
const mailjet = Mailjet.apiConnect(
  'd43574482f911cb7fd5aede5e23da3e1', // sua PUBLIC KEY
  '1f58e340f87a6e7dcf55c040ef09fb69'  // sua PRIVATE KEY
);

// 📁 Upload temporário do PDF
app.post('/api/emailanexo/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Arquivo não enviado' });

  const { filename, size, path: filePath } = req.file;
  const id = path.parse(filename).name;

  res.json({
    id,
    filename,
    size,
    path: filePath,
    url: `/temp/${filename}`,
  });
});

// 📬 Envio de e-mail com anexo PDF via Mailjet
app.post('/api/emailanexo/send', async (req, res) => {
  try {
    const { to, subject, text, pdfId, filename } = req.body;

    if (!to || !subject || !text || !pdfId || !filename) {
      return res.status(400).json({
        error: 'Campos obrigatórios: to, subject, text, pdfId, filename',
      });
    }

    const pdfPath = path.join(TEMP_DIR, `${pdfId}${path.extname(filename)}`);
    if (!fs.existsSync(pdfPath)) {
      return res.status(404).json({ error: `Arquivo não encontrado: ${pdfPath}` });
    }

    const pdfBuffer = fs.readFileSync(pdfPath);

    const requestBody = {
      Messages: [
        {
          From: {
            Email: 'no-reply@strive.com.br', // mascarado
            Name: 'Sistrade - Relatórios Automáticos',
          },
          To: [{ Email: to }],
          ReplyTo: {
            Email: 'financeiro@strive.com.br',
            Name: 'Financeiro Sistrade',
          },
          Subject: subject,
          TextPart: text,
          Attachments: [
            {
              ContentType: 'application/pdf',
              Filename: filename,
              Base64Content: pdfBuffer.toString('base64'),
            },
          ],
        },
      ],
    };

    const result = await mailjet.post('send', { version: 'v3.1' }).request(requestBody);

    // Remove o PDF temporário após envio
    await fs.remove(pdfPath);

    res.status(200).json({
      message: '✅ E-mail enviado com sucesso via Mailjet API.',
      response: result.body,
    });
  } catch (err) {
    console.error('❌ Erro ao enviar e-mail via Mailjet:', err);
    res.status(500).json({
      error: 'Erro ao enviar e-mail via Mailjet.',
      details: err.message || err,
    });
  }
});

// 🔌 Servir PDFs temporários via HTTP
app.use('/temp', express.static(TEMP_DIR));

// 🚀 Inicialização
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Backend rodando na porta ${PORT}`));













/*
require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const Mailjet = require('node-mailjet');

const app = express();
app.use(express.json());
app.use(cors());

// 🔧 Pasta de uploads temporários
const TEMP_DIR = process.env.TEMP_UPLOAD_DIR || './tmp_uploads';
fs.ensureDirSync(TEMP_DIR);

// ⚙️ Configuração do Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, TEMP_DIR),
  filename: (req, file, cb) => {
    const id = uuidv4();
    const ext = path.extname(file.originalname) || '.pdf';
    cb(null, `${id}${ext}`);
  },
});
const upload = multer({ storage });

// 📤 Conexão Mailjet
const mailjet = Mailjet.apiConnect(
  process.env.MJ_APIKEY_PUBLIC,
  process.env.MJ_APIKEY_PRIVATE
);

// 📁 Upload temporário do PDF
app.post('/api/emailanexo/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Arquivo não enviado' });

  const { filename, size, path: filePath } = req.file;
  const id = path.parse(filename).name;

  res.json({
    id,
    filename,
    size,
    path: filePath,
    url: `/temp/${filename}`,
  });
});

// 📬 Envio de e-mail com anexo PDF (Mailjet)
app.post('/api/emailanexo/send', async (req, res) => {
  try {
    const { to, subject, text, pdfId, filename } = req.body;

    if (!to || !subject || !text || !pdfId || !filename) {
      return res.status(400).json({
        error: 'Campos obrigatórios: to, subject, text, pdfId, filename',
      });
    }

    // Caminho do PDF temporário
    const pdfPath = path.join(TEMP_DIR, `${pdfId}${path.extname(filename)}`);
    if (!fs.existsSync(pdfPath)) {
      return res.status(404).json({ error: `Arquivo não encontrado: ${pdfPath}` });
    }

    const pdfBuffer = fs.readFileSync(pdfPath);

    const requestBody = {
      Messages: [
        {
          From: {
            Email: 'financeiro@strive.com.br',//'no-reply@strive.com.br', // remetente mascarado
            Name: 'Sistrade - Relatórios Automáticos',
          },
          To: [{ Email: to }],
          ReplyTo: {
            Email: 'martorele@hotmail.com', // responder para
            Name: 'Financeiro Sistrade',
          },
          Subject: subject,
          TextPart: text,
          Attachments: [
            {
              ContentType: 'application/pdf',
              Filename: filename,
              Base64Content: pdfBuffer.toString('base64'),
            },
          ],
        },
      ],
    };

    const result = await mailjet.post('send', { version: 'v3.1' }).request(requestBody);

    // Remover PDF temporário
    await fs.remove(pdfPath);

    res.status(200).json({
      message: '✅ E-mail enviado com sucesso via Mailjet API.',
      response: result.body,
    });
  } catch (err) {
    console.error('❌ Erro ao enviar e-mail via Mailjet:', err);
    res.status(500).json({
      error: 'Erro ao enviar e-mail via Mailjet.',
      details: err.message || err,
    });
  }
});

// 🔌 Servir PDFs temporários via HTTP
app.use('/temp', express.static(TEMP_DIR));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Backend rodando na porta ${PORT}`));
*/














/*
require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const Mailjet = require('node-mailjet');

const app = express();
app.use(express.json());
app.use(cors());

// 🔧 Pasta de uploads temporários
const TEMP_DIR = process.env.TEMP_UPLOAD_DIR || './tmp_uploads';
fs.ensureDirSync(TEMP_DIR);

// ⚙️ Configuração do Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, TEMP_DIR),
  filename: (req, file, cb) => {
    const id = uuidv4();
    const ext = path.extname(file.originalname) || '.pdf';
    cb(null, `${id}${ext}`);
  },
});
const upload = multer({ storage });

// 📁 Upload temporário do PDF
app.post('/api/emailanexo/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Arquivo não enviado' });

  const { filename, size, path: filePath } = req.file;
  const id = path.parse(filename).name;

  res.json({
    id,
    filename,
    size,
    path: filePath,
    url: `/temp/${filename}`,
  });
});

// 📬 Configuração da API do Mailjet
const mailjet = Mailjet.apiConnect(
  process.env.MJ_APIKEY_PUBLIC || 'd43574482f911cb7fd5aede5e23da3e1',
  process.env.MJ_APIKEY_PRIVATE || '1f58e340f87a6e7dcf55c040ef09fb69'
);

// 📤 Envio de e-mail com anexo PDF
app.post('/api/emailanexo/send', async (req, res) => {
  try {
    const { from, to, subject, text, pdfId, filename } = req.body;

    if (!to || !subject || !text || !pdfId || !filename) {
      return res.status(400).json({
        error: 'Campos obrigatórios: to, subject, text, pdfId, filename',
      });
    }

    const pdfPath = path.join(TEMP_DIR, `${pdfId}${path.extname(filename)}`);
    if (!fs.existsSync(pdfPath)) {
      return res.status(404).json({ error: `Arquivo não encontrado: ${pdfPath}` });
    }

    const pdfBuffer = fs.readFileSync(pdfPath);

    const requestBody = {
      Messages: [
        {
          From: {
            Email: 'financeiro@strive.com.br',
            Name: 'Sistrade',
          },
          To: [{ Email: to }],
          Subject: subject,
          TextPart: text,
          Attachments: [
            {
              ContentType: 'application/pdf',
              Filename: filename,
              Base64Content: pdfBuffer.toString('base64'),
            },
          ],
        },
      ],
    };

    const result = await mailjet.post('send', { version: 'v3.1' }).request(requestBody);

    //console.log(`✅ E-mail enviado para ${to}`);
    return res.status(200).json({
      message: 'E-mail enviado com sucesso via Mailjet API.',
      response: result.body,
    });
  } catch (err) {
    console.error('❌ Erro ao enviar e-mail via Mailjet:', err);
    return res.status(500).json({
      error: 'Erro ao enviar e-mail via Mailjet.',
      details: err.message || err,
    });
  }
});

// 🧩 Endpoint auxiliar (listar arquivos temporários)
app.get('/api/emailanexo/temp-files', async (req, res) => {
  const files = await fs.readdir(TEMP_DIR);
  res.json(files);
});

// 🔌 Servir PDFs temporários via HTTP
app.use('/temp', express.static(TEMP_DIR));

// 🚀 Inicialização do servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Backend rodando na porta ${PORT}`));

*/