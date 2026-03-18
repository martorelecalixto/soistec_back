const fs = require('fs');
const https = require('https');

exports.carregarCertificado = (caminho, senha) => {
  const pfx = fs.readFileSync(caminho);

  return new https.Agent({
    pfx,
    passphrase: senha,
    rejectUnauthorized: false
  });
};