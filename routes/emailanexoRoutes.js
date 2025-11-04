const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');
const Mailjet = require('node-mailjet');

const router = express.Router();

// 📂 Pasta temporária
const TEMP_DIR = './tmp_uploads';
fs.ensureDirSync(TEMP_DIR);

// 📤 Mailjet direto (sem SMTP)
const mailjet = Mailjet.apiConnect(
  'd43574482f911cb7fd5aede5e23da3e1',
  '1f58e340f87a6e7dcf55c040ef09fb69'
);

// ⚙️ Upload temporário
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, TEMP_DIR),
  filename: (req, file, cb) => cb(null, `${uuidv4()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage });

// 📁 Upload do PDF
router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Arquivo não enviado' });
//console.log('ENTROU UPLOAD');
  const id = path.parse(req.file.filename).name;
  res.json({
    id,
    filename: req.file.filename,
    path: req.file.path
  });
});

// 📬 Envio de e-mail
router.post('/send', async (req, res) => {
  try {
    const { to, subject, text, pdfId, filename } = req.body;
    //console.log('ENTROU aqui SEND');
    const pdfPath = path.join(TEMP_DIR, `${pdfId}${path.extname(filename)}`);
    if (!fs.existsSync(pdfPath)) {
      return res.status(404).json({ error: `Arquivo não encontrado: ${pdfPath}` });
    }
    //console.log('Caminho do PDF:', pdfPath);
    //console.log('to:', to);
    //console.log('subject:', subject);
    //console.log('text:', text);
    //console.log('filename:', filename);
    const pdfBuffer = fs.readFileSync(pdfPath);

    const requestBody = {
      Messages: [
        {
          From: {
            Email: 'financeiro@strive.com.br',//no-reply
            Name: 'Sistrade - Relatórios Automáticos'
          },
          To: [{ Email: to }],
          Subject: subject,
          TextPart: text,
          Attachments: [
            {
              ContentType: 'application/pdf',
              Filename: filename,
              Base64Content: pdfBuffer.toString('base64')
            }
          ]
        }
      ]
    };

    const result = await mailjet.post('send', { version: 'v3.1' }).request(requestBody);
    //console.log('Resultado do envio Mailjet:', result.body);
    // remove arquivo temporário
    await fs.remove(pdfPath);

    res.json({ message: '✅ E-mail enviado com sucesso via Mailjet API', result: result.body });
  } catch (err) {
    console.error('❌ Erro ao enviar e-mail via Mailjet:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;






/*
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');

const TEMP_DIR = process.env.TEMP_UPLOAD_DIR || './tmp_uploads';
fs.ensureDirSync(TEMP_DIR);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, TEMP_DIR),
  filename: (req, file, cb) => {
    const id = uuidv4();
    const ext = path.extname(file.originalname) || '.pdf';
    cb(null, `${id}${ext}`);
  },
});
const upload = multer({ storage });

// Upload do PDF
router.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Arquivo não enviado' });
  const { filename, size } = req.file;
  const id = path.parse(filename).name;
  res.json({ id, filename, size, path: req.file.path });
});

// Envio do e-mail
router.post('/send', async (req, res) => {
  try {
    const { from, to, subject, text, pdfId, filename } = req.body;

    console.log('📧 Enviando e-mail...');
    console.log({ from, to, subject, pdfId, filename });

    if (!to || !pdfId || !filename) {
      return res.status(400).json({ error: 'Campos obrigatórios ausentes.' });
    }

    const match = (await fs.readdir(TEMP_DIR)).find(f => f.startsWith(pdfId));
    if (!match) return res.status(404).json({ error: 'Arquivo PDF não encontrado.' });

    const filePath = path.join(TEMP_DIR, match);

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true', // true se porta 465
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: from || process.env.FROM_EMAIL || process.env.SMTP_USER,
      to: to.trim(),
      subject: subject || 'Documento em anexo',
      text: text || '',
      attachments: [{ filename, path: filePath }],
    };

    console.log('📤 Enviando via SMTP...');
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ E-mail enviado:', info.messageId);

    try {
      await fs.remove(filePath);
    } catch (e) {
      console.warn('⚠️ Falha ao remover arquivo temporário:', e.message);
    }

    res.json({ ok: true, info });
  } catch (err) {
    console.error('❌ Erro ao enviar email:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

*/








/*
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');

// Diretório temporário
const TEMP_DIR = process.env.TEMP_UPLOAD_DIR || './tmp_uploads';
fs.ensureDirSync(TEMP_DIR);

// Configuração do Multer (upload temporário com nome único)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, TEMP_DIR),
  filename: (req, file, cb) => {
    const id = uuidv4();
    const ext = path.extname(file.originalname) || '.pdf';
    cb(null, `${id}${ext}`);
  }
});
const upload = multer({ storage });


 //* @route POST /email/upload
 //* Faz upload de PDF temporário
 
router.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Arquivo não enviado' });
  const { filename, size } = req.file;
  const id = path.parse(filename).name;
  res.json({ id, filename, size, path: req.file.path });
});


 //* @route POST /email/send
 //* Envia e-mail com anexo
 
router.post('/send', async (req, res) => {
  try {
    const { to, subject, text, pdfId, filename } = req.body;

    if (!to || !pdfId || !filename) {
      return res.status(400).json({ error: 'Campos obrigatórios: to, pdfId e filename.' });
    }

    // Localiza o arquivo temporário
    const files = await fs.readdir(TEMP_DIR);
    const match = files.find(f => f.startsWith(pdfId));
    if (!match) return res.status(404).json({ error: 'Arquivo não encontrado.' });
    const filePath = path.join(TEMP_DIR, match);

    // Configuração SMTP
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
      from: process.env.FROM_EMAIL,
      to,
      subject: subject || 'Documento',
      text: text || '',
      attachments: [{ filename, path: filePath }]
    };

    const info = await transporter.sendMail(mailOptions);

    // Remove o arquivo após o envio
    try { await fs.remove(filePath); } catch (e) { console.warn('Não foi possível remover arquivo:', e.message); }

    res.json({ ok: true, info });
  } catch (err) {
    console.error('Erro ao enviar email:', err);
    res.status(500).json({ error: 'Falha ao enviar e-mail', details: err.message });
  }
});

module.exports = router;
*/