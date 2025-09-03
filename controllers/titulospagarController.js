const { poolPromise } = require('../db');
const { v4: uuidv4 } = require('uuid');

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
      request.input('datainicial', datainicial); // Formata a data para incluir hora
      whereClause += ' AND titulospagar.datavencimento >= @datainicial';
    }
    
    if (datafinal) {
      request.input('datafinal', datafinal);
      whereClause += ' AND titulospagar.datavencimento <= @datafinal';
    }
    
    whereClause += ' ORDER BY titulospagar.datavencimento desc ';

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
   res.json(result.recordset);    
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Obter um titulo pagar pelo ID
const getTituloPagarById = async (req, res) => {
  try {
    const { idtitulo } = req.params;

    if (!idtitulo) {
      return res.status(400).json({ success: false, message: 'O parâmetro "idtitulo" é obrigatório.' });
    }

    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('idtitulo',  req.params.idtitulo)
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

// Obter um titulo pagar pelo IDVenda
const getTituloPagarByVendaBilhete = async (req, res) => {
  try {
    const { idvenda } = req.params;

    if (!idvenda) {
      return res.status(400).json({ success: false, message: 'O parâmetro "idtitulo" é obrigatório.' });
    }

    const sql = require('mssql');
    // Verifica se o parâmetro 'idvenda' foi fornecido  
    const pool = await poolPromise;
    const request = pool.request();
    request.input('idvenda', idvenda);

     const query =
          `SELECT 
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
            WHERE idvendabilhete = @idvenda
      `;

   const result = await request.query(query);
   res.json(result.recordset);    
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Obter baixa pagar pelo IDTitulo
const getBaixaPagarByTitulo = async (req, res) => {
  try {
    const { idtitulo } = req.params;

    if (!idtitulo) {
      return res.status(400).json({ success: false, message: 'O parâmetro "idtitulo" é obrigatório.' });
    }

    const sql = require('mssql');
    // Verifica se o parâmetro 'idtitulo' foi fornecido  
    const pool = await poolPromise;
    const request = pool.request();
    request.input('idtitulo', idtitulo);

     const query =
          `
            SELECT        
              BaixasPagar.idtitulopagar,  
              BaixasPagar.id, 
              Isnull(BaixasPagar.idlancamento,0) AS idlancamento,
              BaixasPagar.observacao, 
              BaixasPagar.valorpago, 
              BaixasPagar.descontopago, 
              BaixasPagar.juropago, 
              BaixasPagar.databaixa, 
              Bancos.Nome AS banco, 
              ContasBancarias.numeroconta, 
              FormaPagamento.Nome AS operacaobancaria
            FROM     TitulosPagar INNER JOIN
                    BaixasPagar ON TitulosPagar.IdTitulo = BaixasPagar.IdTituloPagar INNER JOIN
                    Bancos ON BaixasPagar.IdBanco = Bancos.IdBanco INNER JOIN
                    ContasBancarias ON BaixasPagar.IdContaBancaria = ContasBancarias.IdContaBancaria INNER JOIN
                    FormaPagamento ON BaixasPagar.IdOperacaoBancaria = FormaPagamento.IdFormaPagamento
         WHERE BaixasPagar.IdTituloPagar = @idtitulo
      `;

   const result = await request.query(query);
   res.json(result.recordset);    
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Criar um novo titulo
const createTituloPagar = async (req, res) => {
  try {
    console.log('createTituloPagar');

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
    console.log('Titulo Pagar Criado: ' + idtitulo);

    res.status(201).json({ success: true, idtitulo, message: 'titulo criada com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// Atualizar um titulo existente
const updateTituloPagar = async (req, res) => {
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
            parcela = @parcela,
            identidade = @identidade,
            idmoeda = @idmoeda,
            idformapagamento = @idformapagamento,
            idplanoconta = @idplanoconta,
            idcentrocusto = @idcentrocusto,
            idfilial = @idfilial
          WHERE idtitulo = @idtitulo
      `);

    res.json({ success: true, message: 'Titulo atualizad com sucesso' });
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
      .input('idtitulo', req.params.idtitulo)
      .query('DELETE FROM titulospagar WHERE idtitulo = @idtitulo');
    res.json({ success: true, message: 'Titulo deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// Deletar titulos da venda bilhete
const deleteTituloPagarByVendaBilhete = async (req, res) => {
  try {
    
    const pool = await poolPromise;
    await pool
      .request()
      .input('idvendabilhete', req.params.idvendabilhete)
      .query('DELETE FROM titulospagar WHERE idvendabilhete = @idvendabilhete');
    res.json({ success: true, message: 'Titulos deletados com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Deletar titulos da venda bilhete
const deleteTituloPagarByVendaHotel = async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input('idvendahotel', req.params.idvendahotel)
      .query('DELETE FROM titulospagar WHERE idvendahotel = @idvendahotel');
    res.json({ success: true, message: 'Titulos deletados com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Deletar uma baixa
const deleteBaixaPagar = async (req, res) => {
  try {

    const pool = await poolPromise;
    await pool
      .request()
      .input('id', req.params.id)
      .query('DELETE FROM baixaspagar WHERE id = @id');

    res.json({ success: true, message: 'Baixa deletada com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Deletar uma baixa
const deleteBaixasPagar = async (req, res) => {
  try {
    const { id, idlancamento, idtitulopagar, valorpago, descontopago, juropago } = req.query;
    const sql = require('mssql');


    const pool = await poolPromise;
    await pool
      .request()
      .input('id', id)
      .query('DELETE FROM baixaspagar WHERE id = @id');

      //console.log('Baixa Pagar Deletada: ' + id);

    const poolLanc = await poolPromise;
    await poolLanc
      .request()
      .input('idlancamento', idlancamento)
      .query('DELETE FROM lancamentos WHERE idlancamento = @idlancamento');

      console.log('Lançamento Deletado: ' + idlancamento);

    //**************TITULO PAGAR*************** */ 
    const poolRec = await poolPromise;
    const resultRec = await poolRec
      .request()
      .input('valorpago', valorpago)
      .input('descontopago', descontopago)
      .input('juropago', juropago)
      .input('idtitulopagar', idtitulopagar)
      .query(`
        UPDATE titulospagar SET
            valorpago = valorpago - @valorpago,
            descontopago = descontopago - @descontopago,
            juropago = juropago - @juropago
          WHERE idtitulo =  @idtitulopagar
      `);

      console.log('Titulo Pagar Atualizado: ' + idtitulopagar);

    res.json({ success: true, message: 'Baixa deletada com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Criar um nova baixa
const createBaixaPagar = async (req, res) => {
  try {

    const {
          databaixa,
          observacao,
          valorpago,
          descontopago,
          juropago,
          idtitulopagar,
          idbanco,
          idcontabancaria,
          idoperacaobancaria, 
          idfilial,
          empresa
    } = req.body;

    //**************LANCAMENTO***************** */

    const poolLanc = await poolPromise;
    const resultLanc = await poolLanc
      .request()
      .input('databaixa', databaixa)
      .input('observacao', observacao)
      .input('valorpago', valorpago * (-1))
      .input('descontopago', descontopago)
      .input('juropago', juropago)
      .input('idbanco', idbanco)
      .input('idcontabancaria', idcontabancaria)
      .input('idoperacaobancaria', idoperacaobancaria)
      .input('idfilial', idfilial)
      .input('chave', uuidv4())
      .input('empresa', empresa)
      .query(`
        INSERT INTO lancamentos (
            datapagamento,
            observacao,
            valorpago,
            descontopago,
            juropago,
            idbanco,
            idcontabancaria,
            idoperacaobancaria,
            idfilial,
            chave,
            empresa
        )
        OUTPUT INSERTED.idlancamento
        VALUES (
            @databaixa,
            @observacao,
            @valorpago,
            @descontopago,
            @juropago,
            @idbanco,
            @idcontabancaria,
            @idoperacaobancaria,
            @idfilial,
            @chave,
            @empresa
        )
      `);
    const idlancamento = resultLanc.recordset[0].idlancamento;

    //**************BAIXA PAGAR*************** */ 
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('databaixa', databaixa)
      .input('observacao', observacao)
      .input('valorpago', valorpago)
      .input('descontopago', descontopago)
      .input('juropago', juropago)
      .input('idtitulopagar', idtitulopagar)
      .input('idbanco', idbanco)
      .input('idcontabancaria', idcontabancaria)
      .input('idlancamento', idlancamento)
      .input('idoperacaobancaria', idoperacaobancaria)
      .input('idfilial', idfilial)
      .input('empresa', empresa)
      .query(`
        INSERT INTO baixaspagar (
            databaixa,
            observacao,
            valorpago,
            descontopago,
            juropago,
            idtitulopagar,
            idbanco,
            idcontabancaria,
            idlancamento,
            idoperacaobancaria,
            idfilial,
            empresa
        )
        OUTPUT INSERTED.id
        VALUES (
            @databaixa,
            @observacao,
            @valorpago,
            @descontopago,
            @juropago,
            @idtitulopagar,
            @idbanco,
            @idcontabancaria,
            @idlancamento,
            @idoperacaobancaria,
            @idfilial,
            @empresa
        )
      `);
    const idbaixa = result.recordset[0].id;

    //**************TITULO PAGAR*************** */ 
    const poolRec = await poolPromise;
    const resultRec = await poolRec
      .request()
      .input('valorpago', valorpago)
      .input('descontopago', descontopago)
      .input('juropago', juropago)
      .input('idtitulopagar', idtitulopagar)
      .query(`
        UPDATE titulospagar SET
            valorpago = valorpago + @valorpago,
            descontopago = descontopago + @descontopago,
            juropago = juropago + @juropago
          WHERE idtitulo =  @idtitulopagar
      `);

    res.status(201).json({ success: true, idbaixa, message: 'baixa criada com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Criar várias baixas
const createBaixasPagarGenerica = async (req, res) => {
  try {
    const baixas = req.body; // espera receber um array de objetos

    if (!Array.isArray(baixas)) {
      return res.status(400).json({ success: false, message: 'O body deve ser uma lista de baixas' });
    }

    const resultados = [];

    for (const baixa of baixas) {
      const {
        databaixa,
        observacao,
        valorpago,
        descontopago,
        juropago,
        idtitulopagar,
        idbanco,
        idcontabancaria,
        idoperacaobancaria,
        idfilial,
        empresa
      } = baixa;

      //************** LANCAMENTO ***************** */
      const poolLanc = await poolPromise;
      const resultLanc = await poolLanc
        .request()
        .input('databaixa', databaixa)
        .input('observacao', observacao)
        .input('valorpago', valorpago * (-1))
        .input('descontopago', descontopago)
        .input('juropago', juropago)
        .input('idbanco', idbanco)
        .input('idcontabancaria', idcontabancaria)
        .input('idoperacaobancaria', idoperacaobancaria)
        .input('idfilial', idfilial)        
        .input('chave', uuidv4())
        .input('empresa', empresa)
        .query(`
          INSERT INTO lancamentos (
              datapagamento,
              observacao,
              valorpago,
              descontopago,
              juropago,
              idbanco,
              idcontabancaria,
              idoperacaobancaria,
              idfilial,
              chave,
              empresa
          )
          OUTPUT INSERTED.idlancamento
          VALUES (
              @databaixa,
              @observacao,
              @valorpago,
              @descontopago,
              @juropago,
              @idbanco,
              @idcontabancaria,
              @idoperacaobancaria,
              @idfilial,
              @chave,
              @empresa
          )
        `);
      const idlancamento = resultLanc.recordset[0].idlancamento;

      //************** BAIXA RECEBER *************** */ 
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input('databaixa', databaixa)
        .input('observacao', observacao)
        .input('valorpago', valorpago)
        .input('descontopago', descontopago)
        .input('juropago', juropago)
        .input('idtitulopagar', idtitulopagar)
        .input('idbanco', idbanco)
        .input('idcontabancaria', idcontabancaria)
        .input('idlancamento', idlancamento)
        .input('idoperacaobancaria', idoperacaobancaria)
        .input('idfilial', idfilial)
        .input('empresa', empresa)
        .query(`
          INSERT INTO baixaspagar (
              databaixa,
              observacao,
              valorpago,
              descontopago,
              juropago,
              idtitulopagar,
              idbanco,
              idcontabancaria,
              idlancamento,
              idoperacaobancaria,
              idfilial,
              empresa
          )
          OUTPUT INSERTED.id
          VALUES (
              @databaixa,
              @observacao,
              @valorpago,
              @descontopago,
              @juropago,
              @idtitulopagar,
              @idbanco,
              @idcontabancaria,
              @idlancamento,
              @idoperacaobancaria,
              @idfilial,
              @empresa
          )
        `);
      const idbaixa = result.recordset[0].id;

      //************** TITULO PAGAR *************** */ 
      const poolPag = await poolPromise;
      await poolPag
        .request()
        .input('valorpago', valorpago)
        .input('descontopago', descontopago)
        .input('juropago', juropago)
        .input('idtitulopagar', idtitulopagar)
        .query(`
          UPDATE titulospagar SET
              valorpago = valorpago + @valorpago,
              descontopago = descontopago + @descontopago,
              juropago = juropago + @juropago
          WHERE idtitulo = @idtitulopagar
        `);

      resultados.push({ idbaixa, idlancamento, idtitulopagar });
    }

    //res.status(201).json({ success: true, resultados, message: 'Baixas criadas com sucesso' });
    res.status(201).json({ success: true, message: 'Baixas criadas com sucesso' });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Obter todos os titulos pagar
const getTituloPagarLancamento = async (req, res) => {
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
      request.input('datainicial', datainicial); // Formata a data para incluir hora
      whereClause += ' AND titulospagar.datavencimento >= @datainicial';
    }
    
    if (datafinal) {
      request.input('datafinal', datafinal);
      whereClause += ' AND titulospagar.datavencimento <= @datafinal';
    }
    
    whereClause += ' AND titulospagar.valor > titulospagar.valorpago ';
    whereClause += ' ORDER BY titulospagar.datavencimento desc ';

    const query =
     `
        SELECT 
            TitulosPagar.idtitulo,
            TitulosPagar.dataemissao,
            TitulosPagar.datavencimento,
            TitulosPagar.datacompetencia,
            TitulosPagar.descricao,
            TitulosPagar.documento,
            ISNULL(TitulosPagar.valor,0) AS valor,
            ISNULL(TitulosPagar.valorpago,0) AS valorpago, 
            ISNULL(TitulosPagar.descontopago,0) AS descontopago,
            ISNULL(TitulosPagar.juropago,0) AS juropago,
            (ISNULL(TitulosPagar.valor,0) - ISNULL(TitulosPagar.valorpago,0)) AS valoraberto,
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
            planoconta.nome AS planoconta,
            'PAGAR' AS tipo,
            CAST(0 AS BIT) AS selecionado
            FROM            TitulosPagar LEFT OUTER JOIN
                            PlanoConta ON TitulosPagar.IdPlanoConta = PlanoConta.IdPlanoConta LEFT OUTER JOIN
                            Entidades ON TitulosPagar.IdEntidade = Entidades.IdEntidade LEFT OUTER JOIN
                            FormaPagamento ON TitulosPagar.IdFormaPagamento = FormaPagamento.IdFormaPagamento

            ${whereClause}  `
   const result = await request.query(query);
   res.json(result.recordset);    
  } catch (error) {
    res.status(500).send(error.message);
  }
};

module.exports = {
  getTituloPagar,
  getTituloPagarById,
  getTituloPagarByVendaBilhete,
  getBaixaPagarByTitulo,
  createTituloPagar,
  updateTituloPagar,
  deleteTituloPagar,
  deleteTituloPagarByVendaBilhete,
  deleteTituloPagarByVendaHotel,
  deleteBaixaPagar,
  createBaixaPagar,
  deleteBaixasPagar,
  getTituloPagarLancamento,
  createBaixasPagarGenerica
};
