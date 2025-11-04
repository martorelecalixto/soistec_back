
/*
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com", // ou o SMTP do seu provedor
  port: 465,
  secure: true, // true para 465, false para outros (587)
  auth: {
    user: process.env.EMAIL_USER, // seu e-mail
    pass: process.env.EMAIL_PASS, // senha ou app password
  },
});

async function sendEmail(to, subject, html) {
  await transporter.sendMail({
    from: `"Suporte Sistrade" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
}

module.exports = { sendEmail };
*/