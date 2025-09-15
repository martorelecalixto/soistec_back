const { poolPromise } = require('../db');

// Obter todas as configurações
const getConfiguracoes = async (req, res) => {
  try {
    const { empresa } = req.query;

    if (!empresa) {
      return res.status(400).json({ success: false, message: 'O parâmetro "empresa" é obrigatório.' });
    }
   // console.log('getConfiguracoes - empresa:', empresa);

    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('empresa', empresa)
      .query(
        `SELECT id, idformapagtohotelcli, idformapagtohotelfor, idformapagtohotelcomis, 
                idmoedapadrao, idfilialpadrao, empresa, idcontabancariapadrao, 
                mensagemfaturapadrao, condicoesespeciaisfatura, idplanocontaaereocli, idplanocontaaereofor, 
                idplanocontahotelcli, idplanocontahotelfor, idplanocontapacotefor, idplanocontapacotecli, 
                idplanocontahotelcomis, idplanocontafatura, idformapagamentofatura, idplanocontapagreembolso, 
                idplanocontarecreembolso, idcentrocustorecreembolso, idcentrocustopagreembolso, 
                lancamentotituloautomatico, utilizarcopet, separartaxanafatura, separarravnafatura, 
                separarcomissaonafatura, separardescontonafatura, faturacomformapagtodistinto, 
                emailde, emailremetente, emailsenha, emailsmtp, emailporta, ididiomapadrao, 
                idclientecaixa, idformapagamentoentrada, qtd_dia_dashboard
         FROM configuracoessistema
         WHERE empresa = @empresa
         `
      );
     //console.log('getConfiguracoes - result:', result.body);
     if (result.recordset.length > 0) {
      res.json(result.recordset[0]);
    } else {
      res.status(404).json({ success: false, message: 'Configuração não encontrada.' });
    }
  

  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Obter configuração pelo ID
const getConfiguracaoById = async (req, res) => {
  try {
    /*const { id } = req.params;

    if (!id) {
      return res.status(400).json({ success: false, message: 'O parâmetro "id" é obrigatório.' });
    }*/
    const { empresa } = req.query;

    if (!empresa) {
      return res.status(400).json({ success: false, message: 'O parâmetro "empresa" é obrigatório.' });
    }
   // console.log('getConfiguracaoById - empresa:', empresa);

    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('empresa', empresa)
      .query(
        `SELECT id, idformapagtohotelcli, idformapagtohotelfor, idformapagtohotelcomis, 
                idmoedapadrao, idfilialpadrao, empresa, idcontabancariapadrao, 
                mensagemfaturapadrao, condicoesespeciaisfatura, idplanocontaaereocli, idplanocontaaereofor, 
                idplanocontahotelcli, idplanocontahotelfor, idplanocontapacotefor, idplanocontapacotecli, 
                idplanocontahotelcomis, idplanocontafatura, idformapagamentofatura, idplanocontapagreembolso, 
                idplanocontarecreembolso, idcentrocustorecreembolso, idcentrocustopagreembolso, 
                lancamentotituloautomatico, utilizarcopet, separartaxanafatura, separarravnafatura, 
                separarcomissaonafatura, separardescontonafatura, faturacomformapagtodistinto, 
                emailde, emailremetente, emailsenha, emailsmtp, emailporta, ididiomapadrao, 
                idclientecaixa, idformapagamentoentrada, qtd_dia_dashboard
         FROM configuracoessistema
         WHERE empresa = @empresa`
      );

      //console.log('getConfiguracaoById - result:', result);

      if (result.recordset.length > 0) {
      res.json(result.recordset[0]);
    } else {
      res.status(404).json({ success: false, message: 'Configuração não encontrada.' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Criar uma nova configuração
const createConfiguracao = async (req, res) => {
  try {
    const {
      idformapagtohotelcli, idformapagtohotelfor, idformapagtohotelcomis, idmoedapadrao,
      idfilialpadrao, empresa, idcontabancariapadrao, mensagemfaturapadrao, condicoesespeciaisfatura,
      idplanocontaaereocli, idplanocontaaereofor, idplanocontahotelcli, idplanocontahotelfor,
      idplanocontapacotefor, idplanocontapacotecli, idplanocontahotelcomis, idplanocontafatura,
      idformapagamentofatura, idplanocontapagreembolso, idplanocontarecreembolso,
      idcentrocustorecreembolso, idcentrocustopagreembolso, lancamentotituloautomatico,
      utilizarcopet, separartaxanafatura, separarravnafatura, separarcomissaonafatura,
      separardescontonafatura, faturacomformapagtodistinto, emailde, emailremetente,
      emailsenha, emailsmtp, emailporta, ididiomapadrao, idclientecaixa, idformapagamentoentrada, 
      qtd_dia_dashboard
    } = req.body;

    const pool = await poolPromise;
    await pool.request()
      .input('idformapagtohotelcli', idformapagtohotelcli)
      .input('idformapagtohotelfor', idformapagtohotelfor)
      .input('idformapagtohotelcomis', idformapagtohotelcomis)
      .input('idmoedapadrao', idmoedapadrao)
      .input('idfilialpadrao', idfilialpadrao)
      .input('empresa', empresa)
      .input('idcontabancariapadrao', idcontabancariapadrao)
      .input('mensagemfaturapadrao', mensagemfaturapadrao)
      .input('condicoesespeciaisfatura', condicoesespeciaisfatura)
      .input('idplanocontaaereocli', idplanocontaaereocli)
      .input('idplanocontaaereofor', idplanocontaaereofor)
      .input('idplanocontahotelcli', idplanocontahotelcli)
      .input('idplanocontahotelfor', idplanocontahotelfor)
      .input('idplanocontapacotefor', idplanocontapacotefor)
      .input('idplanocontapacotecli', idplanocontapacotecli)
      .input('idplanocontahotelcomis', idplanocontahotelcomis)
      .input('idplanocontafatura', idplanocontafatura)
      .input('idformapagamentofatura', idformapagamentofatura)
      .input('idplanocontapagreembolso', idplanocontapagreembolso)
      .input('idplanocontarecreembolso', idplanocontarecreembolso)
      .input('idcentrocustorecreembolso', idcentrocustorecreembolso)
      .input('idcentrocustopagreembolso', idcentrocustopagreembolso)
      .input('lancamentotituloautomatico', lancamentotituloautomatico)
      .input('utilizarcopet', utilizarcopet)
      .input('separartaxanafatura', separartaxanafatura)
      .input('separarravnafatura', separarravnafatura)
      .input('separarcomissaonafatura', separarcomissaonafatura)
      .input('separardescontonafatura', separardescontonafatura)
      .input('faturacomformapagtodistinto', faturacomformapagtodistinto)
      .input('emailde', emailde)
      .input('emailremetente', emailremetente)
      .input('emailsenha', emailsenha)
      .input('emailsmtp', emailsmtp)
      .input('emailporta', emailporta)
      .input('ididiomapadrao', ididiomapadrao)
      .input('idclientecaixa', idclientecaixa)
      .input('idformapagamentoentrada', idformapagamentoentrada)
      .input('qtd_dia_dashboard', qtd_dia_dashboard)
      .query(
        `INSERT INTO configuracoessistema (
          idformapagtohotelcli, idformapagtohotelfor, idformapagtohotelcomis, idmoedapadrao,
          idfilialpadrao, empresa, idcontabancariapadrao, mensagemfaturapadrao, condicoesespeciaisfatura,
          idplanocontaaereocli, idplanocontaaereofor, idplanocontahotelcli, idplanocontahotelfor,
          idplanocontapacotefor, idplanocontapacotecli, idplanocontahotelcomis, idplanocontafatura,
          idformapagamentofatura, idplanocontapagreembolso, idplanocontarecreembolso,
          idcentrocustorecreembolso, idcentrocustopagreembolso, lancamentotituloautomatico,
          utilizarcopet, separartaxanafatura, separarravnafatura, separarcomissaonafatura,
          separardescontonafatura, faturacomformapagtodistinto, emailde, emailremetente,
          emailsenha, emailsmtp, emailporta, ididiomapadrao, idclientecaixa, idformapagamentoentrada, 
          qtd_dia_dashboard
        ) VALUES (
          @idformapagtohotelcli, @idformapagtohotelfor, @idformapagtohotelcomis, @idmoedapadrao,
          @idfilialpadrao, @empresa, @idcontabancariapadrao, @mensagemfaturapadrao, @condicoesespeciaisfatura,
          @idplanocontaaereocli, @idplanocontaaereofor, @idplanocontahotelcli, @idplanocontahotelfor,
          @idplanocontapacotefor, @idplanocontapacotecli, @idplanocontahotelcomis, @idplanocontafatura,
          @idformapagamentofatura, @idplanocontapagreembolso, @idplanocontarecreembolso,
          @idcentrocustorecreembolso, @idcentrocustopagreembolso, @lancamentotituloautomatico,
          @utilizarcopet, @separartaxanafatura, @separarravnafatura, @separarcomissaonafatura,
          @separardescontonafatura, @faturacomformapagtodistinto, @emailde, @emailremetente,
          @emailsenha, @emailsmtp, @emailporta, @ididiomapadrao, @idclientecaixa, @idformapagamentoentrada,
          @qtd_dia_dashboard
        )`
      );

    res.status(201).json({ success: true, message: 'Configuração criada com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Atualizar configuração
const updateConfiguracao = async (req, res) => {
  try {
   // console.log(req.params);
   // console.log('ENTROU AQUI');
   // console.log(req.params.id);
    const { id } = req.params;
    const {
      idformapagtohotelcli, idformapagtohotelfor, idformapagtohotelcomis, idmoedapadrao,
      idfilialpadrao,  idcontabancariapadrao, mensagemfaturapadrao, condicoesespeciaisfatura,
      idplanocontaaereocli, idplanocontaaereofor, idplanocontahotelcli, idplanocontahotelfor,
      idplanocontapacotefor, idplanocontapacotecli, idplanocontahotelcomis, idplanocontafatura,
      idformapagamentofatura, idplanocontapagreembolso, idplanocontarecreembolso,
      idcentrocustorecreembolso, idcentrocustopagreembolso, lancamentotituloautomatico,
      utilizarcopet, separartaxanafatura, separarravnafatura, separarcomissaonafatura,
      separardescontonafatura, faturacomformapagtodistinto, emailde, emailremetente,
      emailsenha, emailsmtp, emailporta, ididiomapadrao, idclientecaixa, idformapagamentoentrada,
      qtd_dia_dashboard
    } = req.body;

    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', req.params.id)
      .input('idformapagtohotelcli', idformapagtohotelcli)
      .input('idformapagtohotelfor', idformapagtohotelfor)
      .input('idformapagtohotelcomis', idformapagtohotelcomis)
      .input('idmoedapadrao', idmoedapadrao)
      .input('idfilialpadrao', idfilialpadrao)
      //.input('empresa', req.params.empresa)
      .input('idcontabancariapadrao', idcontabancariapadrao)
      .input('mensagemfaturapadrao', mensagemfaturapadrao)
      .input('condicoesespeciaisfatura', condicoesespeciaisfatura)
      .input('idplanocontaaereocli', idplanocontaaereocli)
      .input('idplanocontaaereofor', idplanocontaaereofor)
      .input('idplanocontahotelcli', idplanocontahotelcli)
      .input('idplanocontahotelfor', idplanocontahotelfor)
      .input('idplanocontapacotefor', idplanocontapacotefor)
      .input('idplanocontapacotecli', idplanocontapacotecli)
      .input('idplanocontahotelcomis', idplanocontahotelcomis)
      .input('idplanocontafatura', idplanocontafatura)
      .input('idformapagamentofatura', idformapagamentofatura)
      .input('idplanocontapagreembolso', idplanocontapagreembolso)
      .input('idplanocontarecreembolso', idplanocontarecreembolso)
      .input('idcentrocustorecreembolso', idcentrocustorecreembolso)
      .input('idcentrocustopagreembolso', idcentrocustopagreembolso)
      .input('lancamentotituloautomatico', lancamentotituloautomatico)
      .input('utilizarcopet', utilizarcopet)
      .input('separartaxanafatura', separartaxanafatura)
      .input('separarravnafatura', separarravnafatura)
      .input('separarcomissaonafatura', separarcomissaonafatura)
      .input('separardescontonafatura', separardescontonafatura)
      .input('faturacomformapagtodistinto', faturacomformapagtodistinto)
      .input('emailde', emailde)
      .input('emailremetente', emailremetente)
      .input('emailsenha', emailsenha)
      .input('emailsmtp', emailsmtp)
      .input('emailporta', emailporta)
      .input('ididiomapadrao', ididiomapadrao)
      .input('idclientecaixa', idclientecaixa)
      .input('idformapagamentoentrada', idformapagamentoentrada)
      .input('qtd_dia_dashboard', qtd_dia_dashboard)
      .query(
        `UPDATE configuracoessistema SET
          idformapagtohotelcli = @idformapagtohotelcli,
          idformapagtohotelfor = @idformapagtohotelfor,
          idformapagtohotelcomis = @idformapagtohotelcomis,
          idmoedapadrao = @idmoedapadrao,
          idfilialpadrao = @idfilialpadrao,
          idcontabancariapadrao = @idcontabancariapadrao,
          mensagemfaturapadrao = @mensagemfaturapadrao,
          condicoesespeciaisfatura = @condicoesespeciaisfatura,
          idplanocontaaereocli = @idplanocontaaereocli,
          idplanocontaaereofor = @idplanocontaaereofor,
          idplanocontahotelcli = @idplanocontahotelcli,
          idplanocontahotelfor = @idplanocontahotelfor,
          idplanocontapacotefor = @idplanocontapacotefor,
          idplanocontapacotecli = @idplanocontapacotecli,
          idplanocontahotelcomis = @idplanocontahotelcomis,
          idplanocontafatura = @idplanocontafatura,
          idformapagamentofatura = @idformapagamentofatura,
          idplanocontapagreembolso = @idplanocontapagreembolso,
          idplanocontarecreembolso = @idplanocontarecreembolso,
          idcentrocustorecreembolso = @idcentrocustorecreembolso,
          idcentrocustopagreembolso = @idcentrocustopagreembolso,
          lancamentotituloautomatico = @lancamentotituloautomatico,
          utilizarcopet = @utilizarcopet,
          separartaxanafatura = @separartaxanafatura,
          separarravnafatura = @separarravnafatura,
          separarcomissaonafatura = @separarcomissaonafatura,
          separardescontonafatura = @separardescontonafatura,
          faturacomformapagtodistinto = @faturacomformapagtodistinto,
          emailde = @emailde,
          emailremetente = @emailremetente,  
          emailsenha = @emailsenha,
          emailsmtp = @emailsmtp,
          emailporta = @emailporta, 
          ididiomapadrao = @ididiomapadrao,
          idclientecaixa = @idclientecaixa,
          idformapagamentoentrada = @idformapagamentoentrada,
          qtd_dia_dashboard = @qtd_dia_dashboard
        WHERE id = @id`
      );

    res.json({ success: true, message: 'configuração atualizada com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Excluir configuração
const deleteConfiguracao = async (req, res) => {
  try {
    const { id } = req.params;    
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('id', id)
      .query('DELETE FROM configuracoessistema WHERE id = @id');
    if (result.rowsAffected[0] > 0) {
      res.json({ success: true, message: 'Configuração excluída com sucesso' });
    } else {
      res.status(404).json({ success: false, message: 'Configuração não encontrada.' });
    } 
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getConfiguracoes,
  getConfiguracaoById,
  createConfiguracao,
  updateConfiguracao,
  deleteConfiguracao
};








