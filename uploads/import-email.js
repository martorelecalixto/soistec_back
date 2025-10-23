import Imap from "imap-simple";
import { simpleParser } from "mailparser";
import fs from "fs";

const { poolPromise } = require('../db');
const config = {
  imap: {
    user: "martorele@gmail.com",
    password: "@Eler0t7a",
    host: "imap.dominio.com",
    port: 993,
    tls: true,
    authTimeout: 10000,
  },
};

async function buscarEmails() {
  const connection = await Imap.connect(config);
  await connection.openBox("INBOX");

  const searchCriteria = ["UNSEEN", ["SUBJECT", "Relatório de Vendas"]];
  const fetchOptions = { bodies: [""], struct: true };

  const messages = await connection.search(searchCriteria, fetchOptions);

  for (const msg of messages) {
    const all = msg.parts.find((p) => p.which === "");
    const parsed = await simpleParser(all.body);

    for (const anexo of parsed.attachments || []) {
      if (anexo.filename.endsWith(".csv")) {
        const path = `./uploads/${anexo.filename}`;
        fs.writeFileSync(path, anexo.content);
        console.log(`Anexo salvo: ${anexo.filename}`);
        // Aqui você pode chamar a função de importação do CSV
      }
    }
  }

  connection.end();
}

buscarEmails().catch(console.error);
