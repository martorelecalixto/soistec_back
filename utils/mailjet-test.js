import Mailjet from 'node-mailjet';
import fs from 'fs';

// Substitua por suas chaves reais
const mailjet = Mailjet.apiConnect(
  'd43574482f911cb7fd5aede5e23da3e1',
  '1f58e340f87a6e7dcf55c040ef09fb69'
);

const run = async () => {
  try {
    // Exemplo de PDF (teste simples)
    const pdfBuffer = fs.readFileSync('./teste.pdf');
    const base64Content = pdfBuffer.toString('base64');

    const requestBody = {
      Messages: [
        {
          From: {
            Email: 'no-reply@strive.com.br',
            Name: 'Sistrade',
          },
          To: [
            {
              Email: 'martorele@hotmail.com', // destino real
            },
          ],
          Subject: 'Teste direto Mailjet API',
          TextPart: 'Teste de envio via API Mailjet (sem SMTP).',
          Attachments: [
            {
              ContentType: 'application/pdf',
              Filename: 'teste.pdf',
              Base64Content: base64Content,
            },
          ],
        },
      ],
    };

    const result = await mailjet
      .post('send', { version: 'v3.1' })
      .request(requestBody);

    console.log('✅ Email enviado com sucesso!');
    console.log(result.body);
  } catch (err) {
    console.error('❌ Erro ao enviar email via Mailjet:', err);
  }
};

run();
