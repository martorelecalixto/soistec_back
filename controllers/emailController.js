const { sendEmail } = require("../utils/emailService");

async function enviarEmail(req, res) {
  try {
    // debug: ver o conteúdo recebido (útil para confirmar o que Flutter envia)
    console.log('--- receber /api/email ---');
    console.log('req.body:', req.body);
    console.log('req.files:', req.files);

    const { from, to, subject, body } = req.body;

    if (!to || !subject || !body) {
      return res.status(400).json({ error: "Campos obrigatórios ausentes." });
    }

    const html = `<div>${body}</div>`;

    // Garante que req.files sempre resulte em um array (mesmo que vazio)
    const files = req.files || [];

    // Mapeia para o formato que o nodemailer espera
    const formattedAttachments = files.map(file => ({
      filename: file.originalname || file.filename, // originalname quando disponível
      path: file.path, // path fornecido pelo multer (caminho no servidor)
      // opcional: contentType: file.mimetype
    }));

    // debug: mostrar os anexos formatados antes de enviar
    console.log('formattedAttachments:', formattedAttachments);

    // Envia email — include attachments somente se houver
    const mailOptions = {
      from,
      to,
      subject,
      html,
    };
    if (formattedAttachments.length > 0) {
      mailOptions.attachments = formattedAttachments;
    }

    await sendEmail(mailOptions);

    res.json({ success: true, message: "E-mail enviado com sucesso!" });
  } catch (error) {
    console.error("Erro ao enviar e-mail:", error);
    res.status(500).json({ error: "Falha ao enviar e-mail." });
  }
}

module.exports = { enviarEmail };




/*versão 1
const { sendEmail } = require("../utils/emailService");

async function enviarEmail(req, res) {
  try {
    const { from, to, subject, body } = req.body;

    if (!to || !subject || !body) {
      return res.status(400).json({ error: "Campos obrigatórios ausentes." });
    }

    const html = `<div>${body}</div>`;

    // Se houver arquivos, mapeie-os para o Nodemailer
    const formattedAttachments = req.files?.map(file => ({
      filename: file.originalname,
      path: file.path,
    }));

    await sendEmail({
      from,
      to,
      subject,
      html,
      attachments: formattedAttachments,
    });

    res.json({ success: true, message: "E-mail enviado com sucesso!" });
  } catch (error) {
    console.error("Erro ao enviar e-mail:", error);
    res.status(500).json({ error: "Falha ao enviar e-mail." });
  }
}

module.exports = { enviarEmail };
*/
