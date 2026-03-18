const { create } = require('xmlbuilder2');

exports.gerarXmlEmissao = (dados) => {
  //console.log('entrou xml emissao');

  const xml = create({ version: '1.0' })
    .ele('EnviarLoteRpsEnvio')
      .ele('LoteRps')
        .ele('Cnpj').txt(dados.cnpjPrestador).up()
        .ele('InscricaoMunicipal').txt(dados.inscricaoMunicipal).up()
        .ele('QuantidadeRps').txt(1).up()
      .up()
    .up()
    .end({ prettyPrint: true });
//console.log(xml);
  return xml;
};