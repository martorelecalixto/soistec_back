const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verifica conexão com o servidor SMTP no startup (opcional, ajuda no debug)
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Erro ao conectar com servidor SMTP:", error);
  } else {
    console.log("✅ Conexão com servidor de e-mail estabelecida.");
  }
});

async function sendEmail({ from, to, subject, html, attachments }) {
  const mailOptions = {
    from: from || `"Suporte Sistrade" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  if (attachments && attachments.length > 0) {
    mailOptions.attachments = attachments;
  }

  return transporter.sendMail(mailOptions);
}

module.exports = { sendEmail };



/*versao 1
const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendEmail({ from, to, subject, html, attachments }) {
  return transporter.sendMail({
    from: from || `"Suporte Sistrade" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
    attachments,
  });
}

module.exports = { sendEmail };
*/