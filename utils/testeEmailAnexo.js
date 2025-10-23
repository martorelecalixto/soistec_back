// testEmailAnexo.js
import { enviarEmailComAnexo } from './utils/emailAnexo.js'; // ajuste o nome da função exportada

async function testarEnvio() {
  try {
    const resultado = await enviarEmailComAnexo({
      para: 'destinatario@teste.com',
      assunto: 'Teste de envio',
      corpo: 'Olá! Este é um teste de envio de e-mail com anexo.',
      caminhoAnexo: './teste.pdf', // coloque um arquivo que exista
    });

    console.log('✅ E-mail enviado com sucesso:', resultado);
  } catch (erro) {
    console.error('❌ Erro ao enviar e-mail:', erro);
  }
}

testarEnvio();
