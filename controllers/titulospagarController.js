const { poolPromise } = require('../db');
const { v4: uuidv4 } = require('uuid');

function normalizeDate(dateString) {
  if (!dateString) return null;
  const d = new Date(dateString);
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString(); // sempre "YYYY-MM-DDT00:00:00.000Z"
}

// Obter todos os titulos pagar
const getTituloPagar = async (req, res) => {
  try {
    const { empresa, idfilial, identidade, idmoeda, datainicial, datafinal, tituloinicial, titulofinal, 
      aereoinicial, aereofinal, servicoinicial, servicofinal } = req.query;
    const sql = require('mssql');
    //console.log('REQUISIÇÃO::', req.query);
    // Verifica se o parâmetro 'empresa' foi fornecido
    if (!empresa) {
      return res.status(400).json({ success: false, message: 'O parâmetro "empresa" é obrigatório.' });
    }

    // Parâmetros obrigatórios
    const pool = await poolPromise;
    const request = pool.request();

    request.input('empresa', empresa);

    // Parâmetros opcionais
    let whereClauseGeral = ' WHERE titulospagar.empresa = @empresa AND titulospagar.id > 0 ';
    let whereClauseSer = '';
    let whereClauseAer = '';
    let whereClause = ' AND IsNull(TitulosPagar.IdVendaBilhete,0) = 0  AND IsNull(TitulosPagar.IdVendaHotel,0) = 0';
    let orderClause = '';

    // Filtros opcionais
    if (idfilial) {
      request.input('idfilial', idfilial);
      whereClauseGeral += ' AND titulospagar.idfilial = @idfilial';
    }

    if (identidade) {
      request.input('identidade', identidade);
      whereClauseGeral += ' AND titulospagar.identidade = @identidade';
    }

    if (idmoeda) {
      request.input('idmoeda', idmoeda);
      whereClauseGeral += ' AND titulospagar.idmoeda = @idmoeda';
    }
    
    if (datainicial) {
      request.input('datainicial', datainicial); // Formata a data para incluir hora
      whereClauseGeral += ' AND titulospagar.datavencimento >= @datainicial';
    }
    
    if (datafinal) {
      request.input('datafinal', datafinal);
      whereClauseGeral += ' AND titulospagar.datavencimento <= @datafinal';
    }
    
    if (tituloinicial) {
      request.input('tituloinicial', tituloinicial);
      whereClauseGeral += ' AND titulosPagar.id >= @tituloinicial';
    }
    
    if (titulofinal) {
      request.input('titulofinal', titulofinal);
      whereClauseGeral += ' AND titulosPagar.id <= @titulofinal';
    }

    if (aereoinicial) {
      request.input('aereoinicial', aereoinicial);
      request.input('aereoinicial2', aereoinicial);
      whereClause += ' AND titulosPagar.idvendabilhete > 0';//como no inicio da clausula exige idvendabilhete= 0, aqui mantem esse filtro
      whereClauseSer += ' AND titulosPagar.idvendahotel = -1';
      whereClauseAer += ' AND vendasbilhetes.id >= @aereoinicial';
    }
    
    if (aereofinal) {
      request.input('aereofinal', aereofinal);
      request.input('aereofinal2', aereofinal);
      whereClause += ' AND titulosPagar.idvendabilhete > 0';//como no inicio da clausula exige idvendabilhete= 0, aqui mantem esse filtro
      whereClauseSer += ' AND titulosPagar.idvendahotel = -1';
      whereClauseAer += ' AND vendasbilhetes.id <= @aereofinal';
    }

    if (servicoinicial) {
      request.input('servicoinicial', servicoinicial);
      whereClause += ' AND titulosPagar.idvendahotel > 0';//como no inicio da clausula exige idvendahotel= 0, aqui mantem esse filtro
      whereClauseSer += ' AND vendashoteis.id >= @servicoinicial';
      whereClauseAer += ' AND titulosPagar.idvendahotel = -1';
    }
    
    if (servicofinal) {
      request.input('servicofinal', servicofinal);
      whereClause += ' AND titulosPagar.idvendahotel > 0';//como no inicio da clausula exige idvendahotel= 0, aqui mantem esse filtro
      whereClauseSer += ' AND vendashoteis.id <= @servicofinal';
      whereClauseAer += ' AND titulosPagar.idvendahotel = -1';
    }

    orderClause += ' ORDER BY TABELA.datavencimento desc ';

    let script =
     `
        SELECT        TABELA.idtitulo, TABELA.dataemissao, TABELA.datavencimento, TABELA.datacompetencia, 
                      TABELA.descricao, TABELA.documento, TABELA.valor, TABELA.valorpago, 
                      TABELA.descontopago, TABELA.juropago, TABELA.parcela, 
                      TABELA.idvendabilhete, TABELA.idvendahotel, TABELA.idvendapacote, TABELA.identidade, 
                      TABELA.idmoeda, TABELA.idformapagamento, TABELA.idplanoconta, TABELA.idcentrocusto, 
                      TABELA.idfilial, TABELA.chave, TABELA.empresa, 
                      TABELA.idnotacredito, TABELA.idnotadebito, TABELA.idreembolso, TABELA.id, 
                      TABELA.entidade, TABELA.pagamento, TABELA.planoconta
          FROM(
              SELECT        TitulosPagar.IdTitulo, TitulosPagar.DataEmissao, TitulosPagar.DataVencimento, TitulosPagar.DataCompetencia, TitulosPagar.Descricao, TitulosPagar.Documento, TitulosPagar.Valor, TitulosPagar.ValorPago, 
                                      TitulosPagar.DescontoPago, TitulosPagar.JuroPago, TitulosPagar.Parcela, TitulosPagar.IdVendaBilhete, TitulosPagar.IdVendaHotel, TitulosPagar.IdVendaPacote, 
                                      TitulosPagar.IdEntidade, TitulosPagar.IdMoeda, TitulosPagar.IdFormaPagamento, TitulosPagar.IdPlanoConta, TitulosPagar.IdCentroCusto, TitulosPagar.IdFilial, TitulosPagar.Chave, TitulosPagar.Empresa, 
                                      TitulosPagar.IdNotaCredito, TitulosPagar.IdNotaDebito, TitulosPagar.IdReembolso, TitulosPagar.Id, 
                                      Entidades.Nome AS entidade, FormaPagamento.Nome AS pagamento, PlanoConta.Nome AS planoconta
              FROM            TitulosPagar INNER JOIN
                                      VendasBilhetes ON TitulosPagar.IdVendaBilhete = VendasBilhetes.IdVenda LEFT OUTER JOIN
                                      Entidades ON TitulosPagar.IdEntidade = Entidades.IdEntidade LEFT OUTER JOIN
                                      FormaPagamento ON TitulosPagar.IdFormaPagamento = FormaPagamento.IdFormaPagamento LEFT OUTER JOIN
                                      PlanoConta ON TitulosPagar.IdPlanoConta = PlanoConta.IdPlanoConta

               ${whereClauseGeral} ${whereClauseAer} 

              UNION

              SELECT        TitulosPagar.IdTitulo, TitulosPagar.DataEmissao, TitulosPagar.DataVencimento, TitulosPagar.DataCompetencia, TitulosPagar.Descricao, TitulosPagar.Documento, TitulosPagar.Valor, TitulosPagar.ValorPago, 
                                      TitulosPagar.DescontoPago, TitulosPagar.JuroPago, TitulosPagar.Parcela, TitulosPagar.IdVendaBilhete, TitulosPagar.IdVendaHotel, TitulosPagar.IdVendaPacote, 
                                      TitulosPagar.IdEntidade, TitulosPagar.IdMoeda, TitulosPagar.IdFormaPagamento, TitulosPagar.IdPlanoConta, TitulosPagar.IdCentroCusto, TitulosPagar.IdFilial, TitulosPagar.Chave, TitulosPagar.Empresa, 
                                      TitulosPagar.IdNotaCredito, TitulosPagar.IdNotaDebito, TitulosPagar.IdReembolso, TitulosPagar.Id, 
                                      Entidades.Nome AS entidade, FormaPagamento.Nome AS pagamento, PlanoConta.Nome AS planoconta
              FROM            TitulosPagar INNER JOIN
                                      VendasHoteis ON TitulosPagar.IdVendaHotel = VendasHoteis.IdVenda LEFT OUTER JOIN
                                      Entidades ON TitulosPagar.IdEntidade = Entidades.IdEntidade LEFT OUTER JOIN
                                      FormaPagamento ON TitulosPagar.IdFormaPagamento = FormaPagamento.IdFormaPagamento LEFT OUTER JOIN
                                      PlanoConta ON TitulosPagar.IdPlanoConta = PlanoConta.IdPlanoConta

              ${whereClauseGeral} ${whereClauseSer}

              UNION

              SELECT        TitulosPagar.IdTitulo, TitulosPagar.DataEmissao, TitulosPagar.DataVencimento, TitulosPagar.DataCompetencia, TitulosPagar.Descricao, TitulosPagar.Documento, TitulosPagar.Valor, TitulosPagar.ValorPago, 
                                      TitulosPagar.DescontoPago, TitulosPagar.JuroPago, TitulosPagar.Parcela, TitulosPagar.IdVendaBilhete, TitulosPagar.IdVendaHotel, TitulosPagar.IdVendaPacote, 
                                      TitulosPagar.IdEntidade, TitulosPagar.IdMoeda, TitulosPagar.IdFormaPagamento, TitulosPagar.IdPlanoConta, TitulosPagar.IdCentroCusto, TitulosPagar.IdFilial, TitulosPagar.Chave, TitulosPagar.Empresa, 
                                      TitulosPagar.IdNotaCredito, TitulosPagar.IdNotaDebito, TitulosPagar.IdReembolso, TitulosPagar.Id, 
                                      Entidades.Nome AS entidade, FormaPagamento.Nome AS pagamento, PlanoConta.Nome AS planoconta
              FROM            TitulosPagar LEFT OUTER JOIN
                                      FormaPagamento ON TitulosPagar.IdFormaPagamento = FormaPagamento.IdFormaPagamento LEFT OUTER JOIN
                                      Entidades ON TitulosPagar.IdEntidade = Entidades.IdEntidade LEFT OUTER JOIN
                                      PlanoConta ON TitulosPagar.IdPlanoConta = PlanoConta.IdPlanoConta

              ${whereClauseGeral} ${whereClause}

                

          ) AS TABELA
          GROUP BY        TABELA.idtitulo, TABELA.dataemissao, TABELA.datavencimento, TABELA.datacompetencia, TABELA.descricao, TABELA.documento, TABELA.valor, TABELA.valorpago, 
                                  TABELA.descontopago, TABELA.juropago, TABELA.parcela, TABELA.idvendabilhete, TABELA.idvendahotel, TABELA.idvendapacote,  
                                  TABELA.identidade, TABELA.idmoeda, TABELA.idformapagamento, TABELA.idplanoconta, TABELA.idcentrocusto, TABELA.idfilial, TABELA.chave, TABELA.empresa, 
                                  TABELA.idnotacredito, TABELA.idnotadebito, TABELA.idreembolso, TABELA.id, 
                                  TABELA.entidade, TABELA.pagamento, TABELA.planoconta
     
            
      `
   const query = 
     `  ${script}  ${orderClause} `

    //console.log('QUERY::', query);
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

// Obter um titulo pagar pelo IDVenda hotel
const getTituloPagarByVendaHotel = async (req, res) => {
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
            WHERE idvendahotel = @idvenda
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

    const dataEmissaoNorm = normalizeDate(dataemissao);
    const dataCompetenciaNorm = normalizeDate(datacompetencia);
    const dataVencimentoNorm = normalizeDate(datavencimento);

    const pool = await poolPromise;
    await pool
      .request()
      .input('idtitulo', req.params.idtitulo)
      .input('dataemissao', dataEmissaoNorm)
      .input('datavencimento', dataVencimentoNorm)
      .input('datacompetencia', dataCompetenciaNorm)
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
    const idVenda = req.params.idvenda; // pega da rota

    const pool = await poolPromise;
    await pool
      .request()
      .input('idvendabilhete', idVenda) // passa corretamente
      .query('DELETE FROM titulospagar WHERE idvendabilhete = @idvendabilhete');

    res.json({ success: true, message: 'Titulos deletados com sucesso' });
    //console.log('Titulos Deletados da Venda Bilhete: ' + idVenda);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Deletar titulos da venda bilhete
const deleteTituloPagarByVendaHotel = async (req, res) => {
  try {
    const idVenda = req.params.idvenda; // pega da rota

    const pool = await poolPromise;
    await pool
      .request()
      .input('idvendahotel', idVenda) // passa corretamente
      .query('DELETE FROM titulospagar WHERE idvendahotel = @idvendahotel');

    res.json({ success: true, message: 'Titulos deletados com sucesso' });
    //console.log('Titulos Deletados da Venda Bilhete: ' + idVenda);
  } catch (error) {
    console.error(error);
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

  //    console.log('Lançamento Deletado: ' + idlancamento);

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

     // console.log('Titulo Pagar Atualizado: ' + idtitulopagar);

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
          empresa,
          idmoeda
    } = req.body;

    const dataBaixaNorm = normalizeDate(databaixa);

    //**************LANCAMENTO***************** */
    const poolLanc = await poolPromise;
    const resultLanc = await poolLanc
      .request()
      .input('databaixa', dataBaixaNorm)
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
      .input('idmoeda', idmoeda)
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
            empresa,
            idmoeda
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
            @empresa,
            @idmoeda
        )
      `);
    const idlancamento = resultLanc.recordset[0].idlancamento;

    //**************BAIXA PAGAR*************** */ 
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('databaixa', dataBaixaNorm)
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
        empresa,
        idmoeda
      } = baixa;

      const dataBaixaNorm = normalizeDate(databaixa);

      //************** LANCAMENTO ***************** */
      const poolLanc = await poolPromise;
      const resultLanc = await poolLanc
        .request()
        .input('databaixa', dataBaixaNorm)
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
        .input('idmoeda', idmoeda)
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
              empresa,
              idmoeda
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
              @empresa,
              @idmoeda
          )
        `);
      const idlancamento = resultLanc.recordset[0].idlancamento;

      //************** BAIXA PAGAR *************** */ 
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input('databaixa', dataBaixaNorm)
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

// Criar um novo titulo
const createTituloPagar = async (req, res) => {
  try {
    //console.log('createTituloPagar');

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

    const dataEmissaoNorm = normalizeDate(dataemissao);
    const dataCompetenciaNorm = normalizeDate(datacompetencia);
    const dataVencimentoNorm = normalizeDate(datavencimento);

    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('dataemissao', dataEmissaoNorm)
      .input('datavencimento', dataVencimentoNorm)
      .input('datacompetencia', dataCompetenciaNorm)
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
    //console.log('Titulo Pagar Criado: ' + idtitulo);

    res.status(201).json({ success: true, idtitulo, message: 'titulo criada com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Obter relatorios analítico de titulos a pagar
const getRelatoriosAnalitico = async (req, res) => {
  try {
    const { empresa, idfilial, identidade, idmoeda, datainicial, datafinal,
            vencimentoinicial, vencimentofinal, idformapagamento, idgrupo,
            tituloinicial, titulofinal, aereoinicial, aereofinal, servicoinicial, 
            servicofinal, tipo, situacao
     } = req.query;
    const sql = require('mssql');
   // console.log('REQUISIÇÃO::', req.query);
    //console.log('EMPRESA::', empresa);
    // Verifica se o parâmetro 'empresa' foi fornecido
    if (!empresa) {
      return res.status(400).json({ success: false, message: 'O parâmetro "empresa" é obrigatório.' });
    }    

    // Parâmetros obrigatórios
    const pool = await poolPromise;
    const request = pool.request();

    request.input('empresa', empresa);

    let groupClause = '';
    let orderClause = '';
    let script = '';

    // Parâmetros opcionais
    let whereClauseGeral = ' WHERE titulospagar.empresa = @empresa AND titulospagar.id > 0 ';
    let whereClauseSer = '';
    let whereClauseAer = '';
    let whereClauseFat = '';
    let whereClause = ' AND IsNull(titulospagar.IdVendaBilhete,0) = 0  AND IsNull(titulospagar.IdVendaHotel,0) = 0';


    // Filtros opcionais
    if (idfilial) {
      request.input('idfilial', idfilial);
      whereClauseGeral += ' AND titulospagar.idfilial = @idfilial';
    }

    if (identidade) {
      request.input('identidade', identidade);
      whereClauseGeral += ' AND titulospagar.identidade = @identidade';
    }

    if (idmoeda) {
      request.input('idmoeda', idmoeda);
      whereClauseGeral += ' AND titulospagar.idmoeda = @idmoeda';
    }
    
    if (idgrupo) {
      request.input('idgrupo', idgrupo);
      whereClauseGeral += ' AND (vendasbilhetes.idgrupo = @idgrupo OR vendashoteis.idgrupo = @idgrupo) ';
    }

    if (idformapagamento) {
      request.input('idformapagamento', idformapagamento);
      whereClauseGeral += ' AND titulospagar.idformapagamento = @idformapagamento';
    }

    if (datainicial) {
      request.input('datainicial', datainicial);
      whereClauseGeral += ' AND titulospagar.dataemissao >= @datainicial';
    }
    
    if (datafinal) {
      request.input('datafinal', datafinal);
      whereClauseGeral += ' AND titulospagar.dataemissao <= @datafinal';
    }

    if (vencimentoinicial) {
      request.input('vencimentoinicial', vencimentoinicial);
      whereClauseGeral += ' AND titulospagar.datavencimento >= @vencimentoinicial';
    }
    
    if (vencimentofinal) {
      request.input('vencimentofinal', vencimentofinal);
      whereClauseGeral += ' AND titulospagar.datavencimento <= @vencimentofinal';
    }

    if (tituloinicial) {
      request.input('tituloinicial', tituloinicial);
      whereClauseGeral += ' AND titulospagar.id >= @tituloinicial';
    }
    
    if (titulofinal) {
      request.input('titulofinal', titulofinal);
      whereClause += ' AND titulospagar.id <= @titulofinal';
    }

    if (aereoinicial) {
      request.input('aereoinicial', aereoinicial);
      request.input('aereoinicial2', aereoinicial);
      whereClause += ' AND titulospagar.idvendabilhete > 0';//como no inicio da clausula exige idvendabilhete= 0, aqui mantem esse filtro
      whereClauseSer += ' AND titulospagar.idvendahotel = -1';
      whereClauseAer += ' AND vendasbilhetes.id >= @aereoinicial';
      whereClauseFat += ' AND vendasbilhetes.id >= @aereoinicial2';
    }
    
    if (aereofinal) {
      request.input('aereofinal', aereofinal);
      request.input('aereofinal2', aereofinal);
      whereClause += ' AND titulospagar.idvendabilhete > 0';//como no inicio da clausula exige idvendabilhete= 0, aqui mantem esse filtro
      whereClauseSer += ' AND titulospagar.idvendahotel = -1';
      whereClauseAer += ' AND vendasbilhetes.id <= @aereofinal';
      whereClauseFat += ' AND vendasbilhetes.id <= @aereofinal2';
    }

    if (servicoinicial) {
      request.input('servicoinicial', servicoinicial);
      whereClause += ' AND titulospagar.idvendahotel > 0';//como no inicio da clausula exige idvendahotel= 0, aqui mantem esse filtro
      whereClauseSer += ' AND vendashoteis.id >= @servicoinicial';
      whereClauseAer += ' AND titulospagar.idvendahotel = -1';
      whereClauseFat += ' AND vendashoteis.id >= @servicoinicial';
    }
    
    if (servicofinal) {
      request.input('servicofinal', servicofinal);
      whereClause += ' AND titulospagar.idvendahotel > 0';//como no inicio da clausula exige idvendahote= 0, aqui mantem esse filtro
      whereClauseSer += ' AND vendashoteis.id <= @servicofinal';
      whereClauseAer += ' AND titulospagar.idvendahotel = -1';
      whereClauseFat += ' AND vendashoteis.id <= @servicofinal';
    }

    if(situacao == 'ABERTO')
      whereClauseGeral += ' AND titulospagar.valor > titulospagar.valorpago '
    if(situacao == 'QUITADO')
      whereClauseGeral += ' AND titulospagar.valor = titulospagar.valorpago '


    if(tipo == 'Fornecedor')
        orderClause += ' ORDER BY TABELA.entidade, TABELA.dataemissao, TABELA.idtitulo '
    else
    if(tipo == 'Emissao')
      orderClause += ' ORDER BY TABELA.dataemissao, TABELA.entidade, TABELA.idtitulo '
    else
    if(tipo == 'Vencimento')
      orderClause += ' ORDER BY TABELA.datavencimento, TABELA.entidade, TABELA.idtitulo '
    else
    if(tipo == 'Pagamento')
      orderClause += ' ORDER BY TABELA.pagamento, TABELA.dataemissao, TABELA.idtitulo '
    else
    if(tipo == 'PlanoConta')
      orderClause += ' ORDER BY TABELA.planoconta, TABELA.dataemissao, TABELA.idtitulo '
    else
    if(tipo == 'Baixa'){
      whereClause += ' AND BaixasPagar.id > 0   AND BaixasPagar.valorpago > 0 ';
      whereClauseSer += ' AND BaixasPagar.id > 0 AND BaixasPagar.valorpago > 0 ';
      whereClauseAer += ' AND BaixasPagar.id > 0 AND BaixasPagar.valorpago > 0 ';
      orderClause += ' ORDER BY TABELA.id, TABELA.datapagamento';
    }

    if(tipo == 'Baixa'){
      groupClause += ' GROUP BY   Entidades.Nome, Filiais.Nome, PlanoConta.Nome, FormaPagamento.Nome, titulospagar.Id, titulospagar.Valor, '+
                     ' titulospagar.ValorPago, titulospagar.Descricao, titulospagar.DataEmissao, titulospagar.DataVencimento, titulospagar.descontopago, ' + 
                     ' titulospagar.juropago, BaixasPagar.id, BaixasPagar.databaixa, BaixasPagar.ValorPago, BaixasPagar.juropago, ' +
                     ' BaixasPagar.descontopago, Bancos.nome, ContasBancarias.NumeroConta ';
    }else{
      groupClause += ' GROUP BY   Entidades.Nome, Filiais.Nome, PlanoConta.Nome, FormaPagamento.Nome, titulospagar.Id, titulospagar.Valor, titulospagar.ValorPago, titulospagar.Descricao, titulospagar.DataEmissao, titulospagar.DataVencimento, titulospagar.descontopago, titulospagar.juropago ';
    }

    if(tipo == 'Baixa'){
      script =
      `
        SELECT        TABELA.entidade, 
                      TABELA.filial, 
                      TABELA.planoconta, 
                      TABELA.pagamento,
                      TABELA.idtitulo, 
                      TABELA.valor, 
                      TABELA.valorpago, 
                      TABELA.valoraberto,
                      TABELA.descontopago, 
                      TABELA.juropago, 
                      TABELA.descricao, 
                      TABELA.dataemissao, 
                      TABELA.datavencimento,
                      TABELA.id,
                      TABELA.datapagamento,
                      TABELA.valorbaixa,
            					TABELA.contabancaria
        FROM(
        SELECT        Entidades.Nome AS entidade, 
                      Filiais.Nome AS filial, 
                      PlanoConta.Nome AS planoconta, 
                      FormaPagamento.Nome AS pagamento,
                      TitulosPagar.Id AS idtitulo, 
                      TitulosPagar.valor, 
                      isnull(TitulosPagar.valorpago,0) AS valorpago, 
                      (isnull(TitulosPagar.valor,0) - isnull(TitulosPagar.valorpago,0)) AS valoraberto,
                      isnull(TitulosPagar.descontopago,0) AS descontopago, 
                      isnull(TitulosPagar.juropago,0) AS juropago, 
                      TitulosPagar.descricao, 
                      TitulosPagar.dataemissao, 
                      TitulosPagar.datavencimento,
                      BaixasPagar.id,
                      BaixasPagar.databaixa AS datapagamento,
                      BaixasPagar.ValorPago AS valorbaixa,
            					(isnull(Bancos.nome, '') +'  '+ isnull(ContasBancarias.NumeroConta, '')) AS contabancaria
        FROM            PlanoConta INNER JOIN
                                Entidades INNER JOIN
                                TitulosPagar ON Entidades.IdEntidade = TitulosPagar.IdEntidade INNER JOIN
                                FormaPagamento ON TitulosPagar.IdFormaPagamento = FormaPagamento.IdFormaPagamento INNER JOIN
                                Filiais ON TitulosPagar.IdFilial = Filiais.IdFilial ON PlanoConta.IdPlanoConta = TitulosPagar.IdPlanoConta INNER JOIN
                                VendasHoteis ON TitulosPagar.IdVendaHotel = VendasHoteis.IdVenda LEFT OUTER JOIN
                                Grupos ON VendasHoteis.IdGrupo = Grupos.Id LEFT OUTER JOIN
                                ContasBancarias INNER JOIN
                                Lancamentos INNER JOIN
                                BaixasPagar ON Lancamentos.IdLancamento = BaixasPagar.IdLancamento ON ContasBancarias.IdContaBancaria = Lancamentos.IdContaBancaria INNER JOIN
                                Bancos ON ContasBancarias.IdBanco = Bancos.IdBanco ON TitulosPagar.IdTitulo = BaixasPagar.IdTituloPagar

         ${whereClauseGeral} ${whereClauseSer}   

        GROUP BY      Entidades.Nome, 
                      Filiais.Nome, 
                      PlanoConta.Nome, 
                      FormaPagamento.Nome,
                      TitulosPagar.Id, 
                      TitulosPagar.valor, 
                      TitulosPagar.valorpago, 
                      TitulosPagar.valor,
                      TitulosPagar.descontopago, 
                      TitulosPagar.juropago, 
                      TitulosPagar.descricao, 
                      TitulosPagar.dataemissao, 
                      TitulosPagar.datavencimento,
                      BaixasPagar.id,
                      BaixasPagar.databaixa,
                      BaixasPagar.ValorPago,
            					Bancos.nome,
                      ContasBancarias.NumeroConta
        
        UNION
        
        SELECT        Entidades.Nome AS entidade, 
                      Filiais.Nome AS filial, 
                      PlanoConta.Nome AS planoconta, 
                      FormaPagamento.Nome AS pagamento,
                      TitulosPagar.Id AS idtitulo, 
                      TitulosPagar.valor, 
                      isnull(TitulosPagar.valorpago,0) AS valorpago, 
                      (isnull(TitulosPagar.valor,0) - isnull(TitulosPagar.valorpago,0)) AS valoraberto,
                      isnull(TitulosPagar.descontopago,0) AS descontopago, 
                      isnull(TitulosPagar.juropago,0) AS juropago, 
                      TitulosPagar.descricao, 
                      TitulosPagar.dataemissao, 
                      TitulosPagar.datavencimento,
                      BaixasPagar.id,
                      BaixasPagar.databaixa AS datapagamento,
                      BaixasPagar.ValorPago AS valorbaixa,
            					(isnull(Bancos.nome, '') +'  '+ isnull(ContasBancarias.NumeroConta, '')) AS contabancaria
      FROM            PlanoConta INNER JOIN
                              Entidades INNER JOIN
                              TitulosPagar ON Entidades.IdEntidade = TitulosPagar.IdEntidade INNER JOIN
                              FormaPagamento ON TitulosPagar.IdFormaPagamento = FormaPagamento.IdFormaPagamento INNER JOIN
                              Filiais ON TitulosPagar.IdFilial = Filiais.IdFilial ON PlanoConta.IdPlanoConta = TitulosPagar.IdPlanoConta INNER JOIN
                              VendasBilhetes ON TitulosPagar.IdVendaBilhete = VendasBilhetes.IdVenda LEFT OUTER JOIN
                              Grupos ON VendasBilhetes.IdGrupo = Grupos.Id LEFT OUTER JOIN
                              ContasBancarias INNER JOIN
                              Lancamentos INNER JOIN
                              BaixasPagar ON Lancamentos.IdLancamento = BaixasPagar.IdLancamento ON ContasBancarias.IdContaBancaria = Lancamentos.IdContaBancaria INNER JOIN
                              Bancos ON ContasBancarias.IdBanco = Bancos.IdBanco ON TitulosPagar.IdTitulo = BaixasPagar.IdTituloPagar
                                
        ${whereClauseGeral} ${whereClauseAer} 

        GROUP BY      Entidades.Nome, 
                      Filiais.Nome, 
                      PlanoConta.Nome, 
                      FormaPagamento.Nome,
                      TitulosPagar.Id, 
                      TitulosPagar.valor, 
                      TitulosPagar.valorpago, 
                      TitulosPagar.valor,
                      TitulosPagar.descontopago, 
                      TitulosPagar.juropago, 
                      TitulosPagar.descricao, 
                      TitulosPagar.dataemissao, 
                      TitulosPagar.datavencimento,
                      BaixasPagar.id,
                      BaixasPagar.databaixa,
                      BaixasPagar.ValorPago,
            					Bancos.nome,
                      ContasBancarias.NumeroConta
       
        UNION
        
        SELECT        Entidades.Nome AS entidade, 
                      Filiais.Nome AS filial, 
                      PlanoConta.Nome AS planoconta, 
                      FormaPagamento.Nome AS pagamento,
                      TitulosPagar.Id AS idtitulo, 
                      TitulosPagar.valor, 
                      isnull(TitulosPagar.valorpago,0) AS valorpago, 
                      (isnull(TitulosPagar.valor,0) - isnull(TitulosPagar.valorpago,0)) AS valoraberto,
                      isnull(TitulosPagar.descontopago,0) AS descontopago, 
                      isnull(TitulosPagar.juropago,0) AS juropago, 
                      TitulosPagar.descricao, 
                      TitulosPagar.dataemissao, 
                      TitulosPagar.datavencimento,
                      BaixasPagar.id,
                      BaixasPagar.databaixa AS datapagamento,
                      BaixasPagar.ValorPago AS valorbaixa,
            					(isnull(Bancos.nome, '') +'  '+ isnull(ContasBancarias.NumeroConta, '')) AS contabancaria
          FROM            PlanoConta INNER JOIN
                                  Entidades INNER JOIN
                                  TitulosPagar ON Entidades.IdEntidade = TitulosPagar.IdEntidade INNER JOIN
                                  FormaPagamento ON TitulosPagar.IdFormaPagamento = FormaPagamento.IdFormaPagamento INNER JOIN
                                  Filiais ON TitulosPagar.IdFilial = Filiais.IdFilial ON PlanoConta.IdPlanoConta = TitulosPagar.IdPlanoConta LEFT OUTER JOIN
                                  ContasBancarias INNER JOIN
                                  Lancamentos INNER JOIN
                                  BaixasPagar ON Lancamentos.IdLancamento = BaixasPagar.IdLancamento ON ContasBancarias.IdContaBancaria = Lancamentos.IdContaBancaria INNER JOIN
                                  Bancos ON ContasBancarias.IdBanco = Bancos.IdBanco ON TitulosPagar.IdTitulo = BaixasPagar.IdTituloPagar

           ${whereClauseGeral} ${whereClause}
                                
        GROUP BY      Entidades.Nome, 
                      Filiais.Nome, 
                      PlanoConta.Nome, 
                      FormaPagamento.Nome,
                      TitulosPagar.Id, 
                      TitulosPagar.valor, 
                      TitulosPagar.valorpago, 
                      TitulosPagar.valor,
                      TitulosPagar.descontopago, 
                      TitulosPagar.juropago, 
                      TitulosPagar.descricao, 
                      TitulosPagar.dataemissao, 
                      TitulosPagar.datavencimento,
                      BaixasPagar.id,
                      BaixasPagar.databaixa,
                      BaixasPagar.ValorPago,
            					Bancos.nome,
                      ContasBancarias.NumeroConta

        
        ) as TABELA
        GROUP BY      TABELA.entidade, 
                      TABELA.filial, 
                      TABELA.planoconta, 
                      TABELA.pagamento,
                      TABELA.idtitulo, 
                      TABELA.valor, 
                      TABELA.valorpago, 
                      TABELA.valoraberto,
                      TABELA.descontopago, 
                      TABELA.juropago, 
                      TABELA.descricao, 
                      TABELA.dataemissao, 
                      TABELA.datavencimento,
                      TABELA.id,
                      TABELA.datapagamento,
                      TABELA.valorbaixa,
            					TABELA.contabancaria


       `
    }else{
      //console.log('GERAL');
      //const query =
    script =
      `
        SELECT        TABELA.entidade, TABELA.filial, TABELA.planoconta, TABELA.pagamento, TABELA.idtitulo, TABELA.Valor, TABELA.valorpago, TABELA.valoraberto, TABELA.descontopago, TABELA.juropago, 
                                TABELA.descricao, TABELA.dataemissao, TABELA.datavencimento 
        FROM(
        SELECT        Entidades.Nome AS entidade, Filiais.Nome AS filial, PlanoConta.Nome AS planoconta, FormaPagamento.Nome AS pagamento, TitulosPagar.Id AS idtitulo, TitulosPagar.Valor, ISNULL(TitulosPagar.ValorPago, 
                                0) AS valorpago, ISNULL(TitulosPagar.Valor, 0) - ISNULL(TitulosPagar.ValorPago, 0) AS valoraberto, ISNULL(TitulosPagar.DescontoPago, 0) AS descontopago, ISNULL(TitulosPagar.JuroPago, 0) AS juropago, 
                                TitulosPagar.Descricao, TitulosPagar.DataEmissao, TitulosPagar.DataVencimento
        FROM            PlanoConta INNER JOIN
                                Entidades INNER JOIN
                                TitulosPagar ON Entidades.IdEntidade = TitulosPagar.IdEntidade INNER JOIN
                                FormaPagamento ON TitulosPagar.IdFormaPagamento = FormaPagamento.IdFormaPagamento INNER JOIN
                                Filiais ON TitulosPagar.IdFilial = Filiais.IdFilial ON PlanoConta.IdPlanoConta = TitulosPagar.IdPlanoConta INNER JOIN
                                VendasHoteis ON TitulosPagar.IdVendaHotel = VendasHoteis.IdVenda LEFT OUTER JOIN
                                Grupos ON VendasHoteis.IdGrupo = Grupos.Id LEFT OUTER JOIN
                                ContasBancarias INNER JOIN
                                Lancamentos INNER JOIN
                                BaixasPagar ON Lancamentos.IdLancamento = BaixasPagar.IdLancamento ON ContasBancarias.IdContaBancaria = Lancamentos.IdContaBancaria INNER JOIN
                                Bancos ON ContasBancarias.IdBanco = Bancos.IdBanco ON TitulosPagar.IdTitulo = BaixasPagar.IdTituloPagar

         ${whereClauseGeral} ${whereClauseSer}   

        GROUP BY Entidades.Nome, Filiais.Nome, PlanoConta.Nome, FormaPagamento.Nome, TitulosPagar.Id, TitulosPagar.Valor, TitulosPagar.ValorPago, TitulosPagar.Descricao, TitulosPagar.DataEmissao, 
                                TitulosPagar.DataVencimento, TitulosPagar.DescontoPago, TitulosPagar.JuroPago
        
        UNION

        SELECT        Entidades.Nome AS entidade, Filiais.Nome AS filial, PlanoConta.Nome AS planoconta, FormaPagamento.Nome AS pagamento, TitulosPagar.Id AS idtitulo, TitulosPagar.Valor, ISNULL(TitulosPagar.ValorPago, 
                                0) AS valorpago, ISNULL(TitulosPagar.Valor, 0) - ISNULL(TitulosPagar.ValorPago, 0) AS valoraberto, ISNULL(TitulosPagar.DescontoPago, 0) AS descontopago, ISNULL(TitulosPagar.JuroPago, 0) AS juropago, 
                                TitulosPagar.Descricao, TitulosPagar.DataEmissao, TitulosPagar.DataVencimento
        FROM            PlanoConta INNER JOIN
                                Entidades INNER JOIN
                                TitulosPagar ON Entidades.IdEntidade = TitulosPagar.IdEntidade INNER JOIN
                                FormaPagamento ON TitulosPagar.IdFormaPagamento = FormaPagamento.IdFormaPagamento INNER JOIN
                                Filiais ON TitulosPagar.IdFilial = Filiais.IdFilial ON PlanoConta.IdPlanoConta = TitulosPagar.IdPlanoConta INNER JOIN
                                VendasBilhetes ON TitulosPagar.IdVendaBilhete = VendasBilhetes.IdVenda LEFT OUTER JOIN
                                Grupos ON VendasBilhetes.IdGrupo = Grupos.Id LEFT OUTER JOIN
                                ContasBancarias INNER JOIN
                                Lancamentos INNER JOIN
                                BaixasPagar ON Lancamentos.IdLancamento = BaixasPagar.IdLancamento ON ContasBancarias.IdContaBancaria = Lancamentos.IdContaBancaria INNER JOIN
                                Bancos ON ContasBancarias.IdBanco = Bancos.IdBanco ON TitulosPagar.IdTitulo = BaixasPagar.IdTituloPagar

        ${whereClauseGeral} ${whereClauseAer} 

        GROUP BY Entidades.Nome, Filiais.Nome, PlanoConta.Nome, FormaPagamento.Nome, TitulosPagar.Id, TitulosPagar.Valor, TitulosPagar.ValorPago, TitulosPagar.Descricao, TitulosPagar.DataEmissao, 
        TitulosPagar.DataVencimento, TitulosPagar.DescontoPago, TitulosPagar.JuroPago
        
        UNION

        
        SELECT        Entidades.Nome AS entidade, Filiais.Nome AS filial, PlanoConta.Nome AS planoconta, FormaPagamento.Nome AS pagamento, TitulosPagar.Id AS idtitulo, TitulosPagar.Valor, ISNULL(TitulosPagar.ValorPago, 0) 
                                AS valorpago, ISNULL(TitulosPagar.Valor, 0) - ISNULL(TitulosPagar.ValorPago, 0) AS valoraberto, ISNULL(TitulosPagar.DescontoPago, 0) AS descontopago, ISNULL(TitulosPagar.JuroPago, 0) AS juropago, 
                                TitulosPagar.Descricao, TitulosPagar.DataEmissao, TitulosPagar.DataVencimento
        FROM            PlanoConta INNER JOIN
                                Entidades INNER JOIN
                                TitulosPagar ON Entidades.IdEntidade = TitulosPagar.IdEntidade INNER JOIN
                                FormaPagamento ON TitulosPagar.IdFormaPagamento = FormaPagamento.IdFormaPagamento INNER JOIN
                                Filiais ON TitulosPagar.IdFilial = Filiais.IdFilial ON PlanoConta.IdPlanoConta = TitulosPagar.IdPlanoConta LEFT OUTER JOIN
                                ContasBancarias INNER JOIN
                                Lancamentos INNER JOIN
                                BaixasPagar ON Lancamentos.IdLancamento = BaixasPagar.IdLancamento ON ContasBancarias.IdContaBancaria = Lancamentos.IdContaBancaria INNER JOIN
                                Bancos ON ContasBancarias.IdBanco = Bancos.IdBanco ON TitulosPagar.IdTitulo = BaixasPagar.IdTituloPagar

        ${whereClauseGeral} ${whereClause}
                                
        GROUP BY Entidades.Nome, Filiais.Nome, PlanoConta.Nome, FormaPagamento.Nome, TitulosPagar.Id, TitulosPagar.Valor, TitulosPagar.ValorPago, TitulosPagar.Descricao, TitulosPagar.DataEmissao, 
                                TitulosPagar.DataVencimento, TitulosPagar.DescontoPago, TitulosPagar.JuroPago

        
        ) as TABELA
        GROUP BY TABELA.entidade, TABELA.filial, TABELA.planoconta, TABELA.pagamento, TABELA.idtitulo, TABELA.Valor, TABELA.valorpago, TABELA.valoraberto, TABELA.descontopago, TABELA.juropago, 
                 TABELA.descricao, TABELA.dataemissao, TABELA.datavencimento
                 
       

       `
    }

   const query = 
     `  ${script}  ${orderClause} `

   //console.log('QUERY::', query);

   const result = await request.query(query);
   //console.log('DATA::', datainicial, datafinal);  
   //console.log('result::', result.recordset);
  // console.log('QUERY::', query);
   res.json(result.recordset);    
  } catch (error) {
    res.status(500).send(error.message);
  }
};


module.exports = {
  getTituloPagar,
  getTituloPagarById,
  getTituloPagarByVendaBilhete,
  getTituloPagarByVendaHotel,
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
  createBaixasPagarGenerica,
  getRelatoriosAnalitico
};
