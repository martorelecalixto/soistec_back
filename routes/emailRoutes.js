const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { enviarEmail } = require('../controllers/emailController');

// 🧩 Configuração do multer com tratamento de nomes e tipos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads')); // garante caminho correto
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});

// 💾 Filtro opcional (aceitar apenas tipos comuns)
const fileFilter = (req, file, cb) => {
  const allowed = [
    'application/pdf',
    'image/png',
    'image/jpeg',
    'text/plain',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(null, false);
};

const upload = multer({ storage, fileFilter });

// 📩 Rota principal de envio de e-mail
router.post('/', upload.array('attachments'), enviarEmail);

module.exports = router;




/*versao 1
const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // pasta temporária
const { enviarEmail } = require('../controllers/emailController');

router.post('/', upload.array('attachments'), enviarEmail);

module.exports = router;
*/