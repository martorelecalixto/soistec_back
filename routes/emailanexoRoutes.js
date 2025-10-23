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

/**
 * @route POST /email/upload
 * Faz upload de PDF temporário
 */
router.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Arquivo não enviado' });
  const { filename, size } = req.file;
  const id = path.parse(filename).name;
  res.json({ id, filename, size, path: req.file.path });
});

/**
 * @route POST /email/send
 * Envia e-mail com anexo
 */
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
