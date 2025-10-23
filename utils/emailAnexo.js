// backend/server.js
require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const nodemailer = require('nodemailer');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());
app.use(cors());

// Pasta para uploads temporários
const TEMP_DIR = process.env.TEMP_UPLOAD_DIR || './tmp_uploads';
fs.ensureDirSync(TEMP_DIR);

// Multer storage configurado para salvar com nome único
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, TEMP_DIR),
  filename: (req, file, cb) => {
    const id = uuidv4();
    const ext = path.extname(file.originalname) || '.pdf';
    cb(null, `${id}${ext}`);
  }
});
const upload = multer({ storage });

// Endpoint para upload de PDF (retorna id, filename, size)
app.post('/upload-temp-pdf', upload.single('file'), async (req, res) => {
   // console.log('Arquivo recebido para upload temporário:', req.file);
  if (!req.file) return res.status(400).json({ error: 'Arquivo não enviado' });
  const { filename, size } = req.file;
  const id = path.parse(filename).name;
  const url = `/temp/${filename}`; // opcional, não é servido publicamente por padrão
  res.json({ id, filename, size, path: req.file.path, url });
});

// Endpoint para enviar email com o PDF em anexo
app.post('/send-email', async (req, res) => {
  try {
    const { from, to, subject, text, pdfId, filename } = req.body;
    if (!to || !pdfId || !filename) {
      return res.status(400).json({ error: 'to, pdfId e filename são obrigatórios' });
    }

    // localiza arquivo por pdfId (assumindo extensão .pdf)
    const possible = await fs.readdir(TEMP_DIR);
    const match = possible.find(f => f.startsWith(pdfId));
    if (!match) return res.status(404).json({ error: 'Arquivo não encontrado' });
    const filePath = path.join(TEMP_DIR, match);

    // configura nodemailer
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const mailOptions = {
      from: from,// process.env.FROM_EMAIL,
      to,
      subject: subject || 'Documento',
      text: text || '',
      attachments: [
        { filename: filename, path: filePath }
      ]
    };

    const info = await transporter.sendMail(mailOptions);

    // opcional: remover arquivo temporário após envio
    try { await fs.remove(filePath); } catch (e) { console.warn('Não foi possível remover arquivo', e.message); }

    res.json({ ok: true, info });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao enviar email', details: err.message });
  }
});

// Opcional: endpoint para listar arquivos temporários (útil para debug)
app.get('/temp-files', async (req, res) => {
  const files = await fs.readdir(TEMP_DIR);
  res.json(files);
});

//const PORT = process.env.PORT || 3000;
//app.listen(PORT, () => console.log(`Backend rodando na porta ${PORT}`));
