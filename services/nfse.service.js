const axios = require('axios');
const certificadoService = require('./certificado.service');
const xmlService = require('./xml.service');
const { v4: uuidv4 } = require('uuid');

const URL_HOMOLOGACAO = "https://homologacao.nfse.gov.br/ws"; 
// ⚠ Ajustaremos depois para endpoint real

exports.autenticar = async ({ cnpj }) => {
  return {
    sucesso: true,
    mensagem: "Certificado validado (mock)",
    cnpj
  };
};

exports.emitir = async (dados) => {
 // console.log('ENTROU EMITIR');

  // 1️⃣ Gerar XML
  const xml = xmlService.gerarXmlEmissao(dados);

  // 2️⃣ Carregar certificado
  const agent = certificadoService.carregarCertificado(
    process.env.CERT_PATH,
    process.env.CERT_PASSWORD
  );

  // 3️⃣ Enviar para portal (ainda mockado)
  try {

    // Aqui será SOAP real depois
    // const response = await axios.post(URL_HOMOLOGACAO, xml, { httpsAgent: agent });

    return {
      sucesso: true,
      numero: uuidv4(),
      protocolo: uuidv4(),
      status: "AUTORIZADA (mock)",
      xml
    };

  } catch (error) {
    throw new Error("Erro ao emitir NFSe: " + error.message);
  }
};

exports.consultar = async ({ numero }) => {
  return {
    sucesso: true,
    numero,
    status: "AUTORIZADA (mock)"
  };
};

exports.cancelar = async ({ numero }) => {
  return {
    sucesso: true,
    numero,
    status: "CANCELADA (mock)"
  };
};