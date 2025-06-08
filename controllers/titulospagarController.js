const { poolPromise } = require('../db');

// Obter todos os titulos pagar
const getTituloPagar = async (req, res) => {
  try {
    const { empresa, idfilial, identidade, idmoeda, datainicial, datafinal  } = req.query;
    const sql = require('mssql');
    // Verifica se o parâmetro 'empresa' foi fornecido
    if (!empresa) {
      return res.status(400).json({ success: false, message: 'O parâmetro "empresa" é obrigatório.' });
    }

    // Parâmetros obrigatórios
    const pool = await poolPromise;
    const request = pool.request();

    request.input('empresa', empresa);

    // Parâmetros opcionais
    let whereClause = 'WHERE titulospagar.empresa = @empresa AND titulospagar.id > 0 ';

    // Filtros opcionais
    if (idfilial) {
      request.input('idfilial', idfilial);
      whereClause += ' AND titulospagar.idfilial = @idfilial';
    }

    if (identidade) {
      request.input('identidade', identidade);
      whereClause += ' AND titulospagar.identidade = @identidade';
    }

    if (idmoeda) {
      request.input('idmoeda', idmoeda);
      whereClause += ' AND titulospagar.idmoeda = @idmoeda';
    }
    
    if (datainicial) {
      request.input('datainicial', datainicial);
      whereClause += ' AND titulospagar.dataemissao >= @datainicial';
    }
    
    if (datafinal) {
      request.input('datafinal', datafinal);
      whereClause += ' AND titulospagar.dataemissao <= @datafinal';
    }

    whereClause += ' ORDER BY titulospagar.dataemissao desc ';

    const query =
     `
        SELECT 
            TitulosPagar.idtitulo,
            TitulosPagar.dataemissao,
            TitulosPagar.datavencimento,
            TitulosPagar.datacompetencia,
            TitulosPagar.descricao,
            TitulosPagar.documento,
            TitulosPagar.valor,
            TitulosPagar.valorpago,
            TitulosPagar.descontopago,
            TitulosPagar.juropago,
            TitulosPagar.parcela,
            TitulosPagar.idvendabilhete,
            TitulosPagar.idvendahotel,
            TitulosPagar.idvendapacote,
            TitulosPagar.identidade,
            TitulosPagar.idmoeda,
            TitulosPagar.idformapagamento,
            TitulosPagar.idplanoconta,
            TitulosPagar.idcentrocusto,
            TitulosPagar.idfilial,
            TitulosPagar.chave,
            TitulosPagar.empresa,
            TitulosPagar.idnotacredito,
            TitulosPagar.idnotadebito,
            TitulosPagar.idreembolso,
            TitulosPagar.id,
            entidades.nome AS entidade,
            formapagamento.nome AS pagamento,
            planoconta.nome AS planoconta
            FROM            TitulosPagar LEFT OUTER JOIN
                            PlanoConta ON TitulosPagar.IdPlanoConta = PlanoConta.IdPlanoConta LEFT OUTER JOIN
                            Entidades ON TitulosPagar.IdEntidade = Entidades.IdEntidade LEFT OUTER JOIN
                            FormaPagamento ON TitulosPagar.IdFormaPagamento = FormaPagamento.IdFormaPagamento

            ${whereClause}  `
   const result = await request.query(query);
   //console.log(result.recordset);
   res.json(result.recordset);    
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Obter um titulo pagar pelo ID
const getTituloPagarById = async (req, res) => {
  try {
    const { idvenda } = req.params;

    if (!idvenda) {
      return res.status(400).json({ success: false, message: 'O parâmetro "idtitulo" é obrigatório.' });
    }

    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('idtitulo', req.params.idtitulo)
      .query(`
          SELECT 
            TitulosPagar.idtitulo,
            TitulosPagar.dataemissao,
            TitulosPagar.datavencimento,
            TitulosPagar.datacompetencia,
            TitulosPagar.descricao,
            TitulosPagar.documento,
            TitulosPagar.valor,
            TitulosPagar.valorpago,
            TitulosPagar.descontopago,
            TitulosPagar.juropago,
            TitulosPagar.parcela,
            TitulosPagar.idvendabilhete,
            TitulosPagar.idvendahotel,
            TitulosPagar.idvendapacote,
            TitulosPagar.identidade,
            TitulosPagar.idmoeda,
            TitulosPagar.idformapagamento,
            TitulosPagar.idplanoconta,
            TitulosPagar.idcentrocusto,
            TitulosPagar.idfilial,
            TitulosPagar.chave,
            TitulosPagar.empresa,
            TitulosPagar.idnotacredito,
            TitulosPagar.idnotadebito,
            TitulosPagar.idreembolso,
            TitulosPagar.id,
            entidades.nome AS entidade,
            formapagamento.nome AS pagamento,
            planoconta.nome AS planoconta
            FROM            TitulosPagar LEFT OUTER JOIN
                            PlanoConta ON TitulosPagar.IdPlanoConta = PlanoConta.IdPlanoConta LEFT OUTER JOIN
                            Entidades ON TitulosPagar.IdEntidade = Entidades.IdEntidade LEFT OUTER JOIN
                            FormaPagamento ON TitulosPagar.IdFormaPagamento = FormaPagamento.IdFormaPagamento
            WHERE idtitulo = @idtitulo                
      `);

    if (result.recordset.length > 0) {
      res.json(result.recordset[0]);
    } else {
      res.status(404).json({ success: false, message: 'titulo não encontrado.' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// Criar um novo titulo
const createTituloPagar = async (req, res) => {
  try {
    const {
          dataemissao,
          datavencimento,
          datacompetencia,
          descricao,
          documento,
          valor,
          valorpago,
          descontopago,
          juropago,
          parcela,
          idvendabilhete,
          idvendahotel,
          idvendapacote,
          identidade,
          idmoeda,
          idformapagamento,
          idplanoconta,
          idcentrocusto,
          idfilial,
          chave,
          empresa,
          idnotacredito,
          idnotadebito,
          idreembolso,
          id
    } = req.body;

    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('dataemissao', dataemissao)
      .input('datavencimento', datavencimento)
      .input('datacompetencia', datacompetencia)
      .input('descricao', descricao)
      .input('documento', documento)
      .input('valor', valor)
      .input('valorpago', valorpago)
      .input('descontopago', descontopago)
      .input('juropago', juropago)
      .input('parcela', parcela)
      .input('idvendabilhete', idvendabilhete)
      .input('idvendahotel', idvendahotel)
      .input('idvendapacote', idvendapacote)
      .input('identidade', identidade)
      .input('idmoeda', idmoeda)
      .input('idformapagamento', idformapagamento)
      .input('idplanoconta', idplanoconta)
      .input('idcentrocusto', idcentrocusto)
      .input('idfilial', idfilial)
      .input('chave', chave)
      .input('empresa', empresa)
      .input('idnotacredito', idnotacredito)
      .input('idnotadebito', idnotadebito)
      .input('idreembolso', idreembolso)
      .input('id', id)
      .query(`
        INSERT INTO titulospagar (
            dataemissao,
            datavencimento,
            datacompetencia,
            descricao,
            documento,
            valor,
            valorpago,
            descontopago,
            juropago,
            parcela,
            idvendabilhete,
            idvendahotel,
            idvendapacote,
            identidade,
            idmoeda,
            idformapagamento,
            idplanoconta,
            idcentrocusto,
            idfilial,
            chave,
            empresa,
            idnotacredito,
            idnotadebito,
            idreembolso,
            id
        )
        OUTPUT INSERTED.idtitulo
        VALUES (
            @dataemissao,
            @datavencimento,
            @datacompetencia,
            @descricao,
            @documento,
            @valor,
            @valorpago,
            @descontopago,
            @juropago,
            @parcela,
            @idvendabilhete,
            @idvendahotel,
            @idvendapacote,
            @identidade,
            @idmoeda,
            @idformapagamento,
            @idplanoconta,
            @idcentrocusto,
            @idfilial,
            @chave,
            @empresa,
            @idnotacredito,
            @idnotadebito,
            @idreembolso,
            @id
        )
      `);

    const idtitulo = result.recordset[0].idtitulo;

    res.status(201).json({ success: true, idtitulo, message: 'titulo criada com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// Atualizar um titulo existente
const updateTituloPagar = async (req, res) => {
  try {
   // console.log('ENTROU NA API');
    const {
          dataemissao,
          datavencimento,
          datacompetencia,
          descricao,
          documento,
          valor,
          valorpago,
          descontopago,
          juropago,
          parcela,
          idvendabilhete,
          idvendahotel,
          idvendapacote,
          identidade,
          idmoeda,
          idformapagamento,
          idplanoconta,
          idcentrocusto,
          idfilial,
          chave,
          empresa,
          idnotacredito,
          idnotadebito,
          idreembolso,
          id
    } = req.body;
    //console.log(req.body);
    const pool = await poolPromise;
    await pool
      .request()
      .input('idtitulo', req.params.idtitulo)
      .input('dataemissao', dataemissao)
      .input('datavencimento', datavencimento)
      .input('datacompetencia', datacompetencia)
      .input('descricao', descricao)
      .input('documento', documento)
      .input('valor', valor)
      .input('valorpago', valorpago)
      .input('descontopago', descontopago)
      .input('juropago', juropago)
      .input('parcela', parcela)
      .input('idvendabilhete', idvendabilhete)
      .input('idvendahotel', idvendahotel)
      .input('idvendapacote', idvendapacote)
      .input('identidade', identidade)
      .input('idmoeda', idmoeda)
      .input('idformapagamento', idformapagamento)
      .input('idplanoconta', idplanoconta)
      .input('idcentrocusto', idcentrocusto)
      .input('idfilial', idfilial)
      .input('chave', chave)
      .input('empresa', empresa)
      .input('idnotacredito', idnotacredito)
      .input('idnotadebito', idnotadebito)
      .input('idreembolso', idreembolso)
      .input('id', id)
      .query(`
        UPDATE TitulosPagar SET
            dataemissao = @dataemissao,
            datavencimento = @datavencimento,
            datacompetencia = @datacompetencia,
            descricao = @descricao,
            documento = @documento,
            valor = @valor,
            valorpago = @valorpago,
            descontopago = @descontopago,
            juropago = @juropago,
            parcela = @parcela,
            idvendabilhete = @idvendabilhete,
            idvendahotel = @idvendahotel,
            idvendapacote = @idvendapacote,
            identidade = @identidade,
            idmoeda = @idmoeda,
            idformapagamento = @idformapagamento,
            idplanoconta = @idplanoconta,
            idcentrocusto = @idcentrocusto,
            idfilial = @idfilial,
            chave = @chave,
            empresa = @empresa,
            idnotacredito = @idnotacredito,
            idnotadebito = @idnotadebito,
            idreembolso = @idreembolso,
            id = @id
          WHERE idtitulo = @idtitulo
      `);

    res.json({ success: true, message: 'Titulo atualizado com sucesso' });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};


// Deletar um titulo
const deleteTituloPagar = async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input('idtitulo', req.params.idvenda)
      .query('DELETE FROM titulospagar WHERE idtitulo = @idtitulo');
    res.json({ success: true, message: 'Titulo deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


module.exports = {
  getTituloPagar,
  getTituloPagarById,
  createTituloPagar,
  updateTituloPagar,
  deleteTituloPagar,
};
