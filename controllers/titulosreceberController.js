const { poolPromise } = require('../db');
const { v4: uuidv4 } = require('uuid');

// Obter todos os titulos receber
const getTituloReceber = async (req, res) => {
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
    let whereClause = 'WHERE titulosreceber.empresa = @empresa AND titulosreceber.id > 0 ';

    // Filtros opcionais
    if (idfilial) {
      request.input('idfilial', idfilial);
      whereClause += ' AND titulosreceber.idfilial = @idfilial';
    }

    if (identidade) {
      request.input('identidade', identidade);
      whereClause += ' AND titulosreceber.identidade = @identidade';
    }

    if (idmoeda) {
      request.input('idmoeda', idmoeda);
      whereClause += ' AND titulosreceber.idmoeda = @idmoeda';
    }
    
    if (datainicial) {
      request.input('datainicial', datainicial); // Formata a data para incluir hora
      whereClause += ' AND titulosreceber.datavencimento >= @datainicial';
    }
    
    if (datafinal) {
      request.input('datafinal', datafinal);
      whereClause += ' AND titulosreceber.datavencimento <= @datafinal';
    }
    
    whereClause += ' ORDER BY titulosreceber.datavencimento desc ';

    const query =
     `
        SELECT 
            TitulosReceber.idtitulo,
            TitulosReceber.dataemissao,
            TitulosReceber.datavencimento,
            TitulosReceber.datacompetencia,
            TitulosReceber.descricao,
            TitulosReceber.documento,
            TitulosReceber.valor,
            TitulosReceber.valorpago,
            TitulosReceber.descontopago,
            TitulosReceber.juropago,
            TitulosReceber.parcela,
            TitulosReceber.idvendabilhete,
            TitulosReceber.idvendahotel,
            TitulosReceber.idvendapacote,
            TitulosReceber.idfatura,
            TitulosReceber.identidade,
            TitulosReceber.idmoeda,
            TitulosReceber.idformapagamento,
            TitulosReceber.idplanoconta,
            TitulosReceber.idcentrocusto,
            TitulosReceber.idfilial,
            TitulosReceber.chave,
            TitulosReceber.empresa,
            TitulosReceber.comissao,
            TitulosReceber.idnotacredito,
            TitulosReceber.idnotadebito,
            TitulosReceber.idreembolso,
            TitulosReceber.id,
            TitulosReceber.idnf,
            TitulosReceber.numeronf,
            TitulosReceber.titulovalorentrada,
            entidades.nome AS entidade,
            formapagamento.nome AS pagamento,
            planoconta.nome AS planoconta
            FROM            TitulosReceber LEFT OUTER JOIN
                            PlanoConta ON TitulosReceber.IdPlanoConta = PlanoConta.IdPlanoConta LEFT OUTER JOIN
                            Entidades ON TitulosReceber.IdEntidade = Entidades.IdEntidade LEFT OUTER JOIN
                            FormaPagamento ON TitulosReceber.IdFormaPagamento = FormaPagamento.IdFormaPagamento

            ${whereClause}  `
   const result = await request.query(query);
   res.json(result.recordset);    
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Obter um titulo receber pelo ID
const getTituloReceberById = async (req, res) => {
  try {
//console.log('entrou');
    const { idtitulo } = req.params;

    //console.log('ID Titulo Receber: ' + req.params.idtitulo);

    if (!idtitulo) {
      return res.status(400).json({ success: false, message: 'O parâmetro "idtitulo" é obrigatório.' });
    }
//console.log('PASSOU');
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('idtitulo',  req.params.idtitulo)
      .query(`
          SELECT 
            TitulosReceber.idtitulo,
            TitulosReceber.dataemissao,
            TitulosReceber.datavencimento,
            TitulosReceber.datacompetencia,
            TitulosReceber.descricao,
            TitulosReceber.documento,
            TitulosReceber.valor,
            TitulosReceber.valorpago,
            TitulosReceber.descontopago,
            TitulosReceber.juropago,
            TitulosReceber.parcela,
            TitulosReceber.idvendabilhete,
            TitulosReceber.idvendahotel,
            TitulosReceber.idvendapacote,
            TitulosReceber.idfatura,
            TitulosReceber.identidade,
            TitulosReceber.idmoeda,
            TitulosReceber.idformapagamento,
            TitulosReceber.idplanoconta,
            TitulosReceber.idcentrocusto,
            TitulosReceber.idfilial,
            TitulosReceber.chave,
            TitulosReceber.empresa,
            TitulosReceber.comissao,
            TitulosReceber.idnotacredito,
            TitulosReceber.idnotadebito,
            TitulosReceber.idreembolso,
            TitulosReceber.id,
            TitulosReceber.idnf,
            TitulosReceber.numeronf,
            TitulosReceber.titulovalorentrada,
            entidades.nome AS entidade,
            formapagamento.nome AS pagamento,
            planoconta.nome AS planoconta
            FROM            TitulosReceber LEFT OUTER JOIN
                            PlanoConta ON TitulosReceber.IdPlanoConta = PlanoConta.IdPlanoConta LEFT OUTER JOIN
                            Entidades ON TitulosReceber.IdEntidade = Entidades.IdEntidade LEFT OUTER JOIN
                            FormaPagamento ON TitulosReceber.IdFormaPagamento = FormaPagamento.IdFormaPagamento
            WHERE idtitulo = @idtitulo
      `);
//console.log('TITULO RECEBER ID: ' + idtitulo);
  //  console.log(result.recordset);
    if (result.recordset.length > 0) {
      res.json(result.recordset[0]);
    } else {
      res.status(404).json({ success: false, message: 'titulo não encontrado.' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Obter um titulo receber pelo IDVenda
const getTituloReceberByVendaBilhete = async (req, res) => {
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

    //const result = await pool
     // .request()
     // .input('idvenda',  req.params.idvenda)
     // .query(`
     const query =
          `SELECT 
            TitulosReceber.idtitulo,
            TitulosReceber.dataemissao,
            TitulosReceber.datavencimento,
            TitulosReceber.datacompetencia,
            TitulosReceber.descricao,
            TitulosReceber.documento,
            TitulosReceber.valor,
            TitulosReceber.valorpago,
            TitulosReceber.descontopago,
            TitulosReceber.juropago,
            TitulosReceber.parcela,
            TitulosReceber.idvendabilhete,
            TitulosReceber.idvendahotel,
            TitulosReceber.idvendapacote,
            TitulosReceber.idfatura,
            TitulosReceber.identidade,
            TitulosReceber.idmoeda,
            TitulosReceber.idformapagamento,
            TitulosReceber.idplanoconta,
            TitulosReceber.idcentrocusto,
            TitulosReceber.idfilial,
            TitulosReceber.chave,
            TitulosReceber.empresa,
            TitulosReceber.comissao,
            TitulosReceber.idnotacredito,
            TitulosReceber.idnotadebito,
            TitulosReceber.idreembolso,
            TitulosReceber.id,
            TitulosReceber.idnf,
            TitulosReceber.numeronf,
            TitulosReceber.titulovalorentrada,
            entidades.nome AS entidade,
            formapagamento.nome AS pagamento,
            planoconta.nome AS planoconta
            FROM            TitulosReceber LEFT OUTER JOIN
                            PlanoConta ON TitulosReceber.IdPlanoConta = PlanoConta.IdPlanoConta LEFT OUTER JOIN
                            Entidades ON TitulosReceber.IdEntidade = Entidades.IdEntidade LEFT OUTER JOIN
                            FormaPagamento ON TitulosReceber.IdFormaPagamento = FormaPagamento.IdFormaPagamento
            WHERE idvendabilhete = @idvenda
      `;

   const result = await request.query(query);
   res.json(result.recordset);    
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Obter baixa receber pelo IDTitulo
const getBaixaReceberByTitulo = async (req, res) => {
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
              BaixasReceber.idtituloreceber,  
              BaixasReceber.id, 
              Isnull(BaixasReceber.idlancamento,0) AS idlancamento,
              BaixasReceber.observacao, 
              BaixasReceber.valorpago, 
              BaixasReceber.descontopago, 
              BaixasReceber.juropago, 
              BaixasReceber.databaixa, 
              Bancos.Nome AS banco, 
              ContasBancarias.numeroconta, 
              FormaPagamento.Nome AS operacaobancaria
            FROM     TitulosReceber INNER JOIN
                    BaixasReceber ON TitulosReceber.IdTitulo = BaixasReceber.IdTituloReceber INNER JOIN
                    Bancos ON BaixasReceber.IdBanco = Bancos.IdBanco INNER JOIN
                    ContasBancarias ON BaixasReceber.IdContaBancaria = ContasBancarias.IdContaBancaria INNER JOIN
                    FormaPagamento ON BaixasReceber.IdOperacaoBancaria = FormaPagamento.IdFormaPagamento
         WHERE BaixasReceber.IdTituloReceber = @idtitulo
      `;

   const result = await request.query(query);
   res.json(result.recordset);    
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Criar um novo titulo
const createTituloReceber = async (req, res) => {
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
          idfatura,
          identidade,
          idmoeda,
          idformapagamento,
          idplanoconta,
          idcentrocusto,
          idfilial,
          chave,
          empresa,
          comissao,
          idnotacredito,
          idnotadebito,
          idreembolso,
          id,
          idnf,
          numeronf,
          titulovalorentrada
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
      .input('idfatura', idfatura)
      .input('identidade', identidade)
      .input('idmoeda', idmoeda)
      .input('idformapagamento', idformapagamento)
      .input('idplanoconta', idplanoconta)
      .input('idcentrocusto', idcentrocusto)
      .input('idfilial', idfilial)
      .input('chave', chave)
      .input('empresa', empresa)
      .input('comissao', comissao)
      .input('idnotacredito', idnotacredito)
      .input('idnotadebito', idnotadebito)
      .input('idreembolso', idreembolso)
      .input('id', id)
      .input('idnf', idnf)
      .input('numeronf', numeronf)
      .input('titulovalorentrada', titulovalorentrada)
      .query(`
        INSERT INTO titulosreceber (
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
            idfatura,
            identidade,
            idmoeda,
            idformapagamento,
            idplanoconta,
            idcentrocusto,
            idfilial,
            chave,
            empresa,
            comissao,
            idnotacredito,
            idnotadebito,
            idreembolso,
            id,
            idnf,
            numeronf,
            titulovalorentrada
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
            @idfatura,
            @identidade,
            @idmoeda,
            @idformapagamento,
            @idplanoconta,
            @idcentrocusto,
            @idfilial,
            @chave,
            @empresa,
            @comissao,
            @idnotacredito,
            @idnotadebito,
            @idreembolso,
            @id,
            @idnf,
            @numeronf,
            @titulovalorentrada
        )
      `);
    const idtitulo = result.recordset[0].idtitulo;

    res.status(201).json({ success: true, idtitulo, message: 'titulo criada com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// Atualizar um titulo existente
const updateTituloReceber = async (req, res) => {
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
          idfatura,
          identidade,
          idmoeda,
          idformapagamento,
          idplanoconta,
          idcentrocusto,
          idfilial,
          chave,
          empresa,
          comissao,
          idnotacredito,
          idnotadebito,
          idreembolso,
          id,
          idnf,
          numeronf,
          titulovalorentrada
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
      .input('idfatura', idfatura)
      .input('identidade', identidade)
      .input('idmoeda', idmoeda)
      .input('idformapagamento', idformapagamento)
      .input('idplanoconta', idplanoconta)
      .input('idcentrocusto', idcentrocusto)
      .input('idfilial', idfilial)
      .input('chave', chave)
      .input('empresa', empresa)
      .input('comissao', comissao)
      .input('idnotacredito', idnotacredito)
      .input('idnotadebito', idnotadebito)
      .input('idreembolso', idreembolso)
      .input('id', id)
      .input('idnf', idnf)
      .input('numeronf', numeronf)
      .input('titulovalorentrada', titulovalorentrada)
      .query(`
        UPDATE TitulosReceber SET
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
            idfilial = @idfilial,
            comissao = @comissao,
            titulovalorentrada = @titulovalorentrada
          WHERE idtitulo = @idtitulo
      `);

    res.json({ success: true, message: 'Titulo atualizada com sucesso' });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};


// Deletar um titulo
const deleteTituloReceber = async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input('idtitulo', req.params.idtitulo)
      .query('DELETE FROM titulosreceber WHERE idtitulo = @idtitulo');
    res.json({ success: true, message: 'Titulo deletada com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// Deletar titulos da venda bilhete
const deleteTituloReceberByVendaBilhete = async (req, res) => {
  try {
    
    const pool = await poolPromise;
    await pool
      .request()
      .input('idvendabilhete', req.params.idvendabilhete)
      .query('DELETE FROM titulosreceber WHERE idvendabilhete = @idvendabilhete');
    res.json({ success: true, message: 'Titulos deletados com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Deletar titulos da venda bilhete
const deleteTituloReceberByVendaHotel = async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input('idvendahotel', req.params.idvendahotel)
      .query('DELETE FROM titulosreceber WHERE idvendahotel = @idvendahotel');
    res.json({ success: true, message: 'Titulos deletados com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Deletar uma baixa
const deleteBaixaReceber = async (req, res) => {
  try {
    console.log('Deletando Baixa Receber ANTIGA');

    const pool = await poolPromise;
    await pool
      .request()
      .input('id', req.params.id)
      .query('DELETE FROM baixasreceber WHERE id = @id');

    res.json({ success: true, message: 'Baixa deletada com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Deletar uma baixa
const deleteBaixasReceber = async (req, res) => {
  try {
    console.log('Deletando Baixa Receber');
    const { id, idlancamento, idtituloreceber, valorpago, descontopago, juropago } = req.query;
    const sql = require('mssql');

    /*
await pool
  .request()
  .input('id', sql.Int, id)
  .query('DELETE FROM baixasreceber WHERE id = @id');

await pool
  .request()
  .input('idlancamento', sql.Int, idlancamento)
  .query('DELETE FROM lancamentos WHERE idlancamento = @idlancamento');

await pool
  .request()
  .input('valorpago', sql.Decimal(18,2), valorpago)
  .input('descontopago', sql.Decimal(18,2), descontopago)
  .input('juropago', sql.Decimal(18,2), juropago)
  .input('idtituloreceber', sql.Int, idtituloreceber)
  .query(`
    UPDATE titulosreceber SET
        valorpago = valorpago - @valorpago,
        descontopago = descontopago - @descontopago,
        juropago = juropago - @juropago
      WHERE idtitulo = @idtituloreceber
  `);
*/

    //request.input('id', id);

    const pool = await poolPromise;
    await pool
      .request()
      .input('id', id)
      .query('DELETE FROM baixasreceber WHERE id = @id');

      console.log('Baixa Receber Deletada: ' + id);

    const poolLanc = await poolPromise;
    await poolLanc
      .request()
      .input('idlancamento', idlancamento)
      .query('DELETE FROM lancamentos WHERE idlancamento = @idlancamento');

      console.log('Lançamento Deletado: ' + idlancamento);

    //**************TITULO RECEBER*************** */ 
    const poolRec = await poolPromise;
    const resultRec = await poolRec
      .request()
      .input('valorpago', valorpago)
      .input('descontopago', descontopago)
      .input('juropago', juropago)
      .input('idtituloreceber', idtituloreceber)
      .query(`
        UPDATE titulosreceber SET
            valorpago = valorpago - @valorpago,
            descontopago = descontopago - @descontopago,
            juropago = juropago - @juropago
          WHERE idtitulo =  @idtituloreceber
      `);

      console.log('Titulo Receber Atualizado: ' + idtituloreceber);

    res.json({ success: true, message: 'Baixa deletada com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Criar um nova baixa
const createBaixaReceber = async (req, res) => {
  try {

    const {
          databaixa,
          observacao,
          valorpago,
          descontopago,
          juropago,
          idtituloreceber,
          idbanco,
          idcontabancaria,
          idoperacaobancaria, 
          empresa
    } = req.body;

    //**************LANCAMENTO***************** */

    const poolLanc = await poolPromise;
    const resultLanc = await poolLanc
      .request()
      .input('databaixa', databaixa)
      .input('observacao', observacao)
      .input('valorpago', valorpago)
      .input('descontopago', descontopago)
      .input('juropago', juropago)
      .input('idbanco', idbanco)
      .input('idcontabancaria', idcontabancaria)
      .input('idoperacaobancaria', idoperacaobancaria)
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
            @chave,
            @empresa
        )
      `);
    const idlancamento = resultLanc.recordset[0].idlancamento;

    //**************BAIXA RECEBER*************** */ 
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('databaixa', databaixa)
      .input('observacao', observacao)
      .input('valorpago', valorpago)
      .input('descontopago', descontopago)
      .input('juropago', juropago)
      .input('idtituloreceber', idtituloreceber)
      .input('idbanco', idbanco)
      .input('idcontabancaria', idcontabancaria)
      .input('idlancamento', idlancamento)
      .input('idoperacaobancaria', idoperacaobancaria)
      .input('empresa', empresa)
      .query(`
        INSERT INTO baixasreceber (
            databaixa,
            observacao,
            valorpago,
            descontopago,
            juropago,
            idtituloreceber,
            idbanco,
            idcontabancaria,
            idlancamento,
            idoperacaobancaria,
            empresa
        )
        OUTPUT INSERTED.id
        VALUES (
            @databaixa,
            @observacao,
            @valorpago,
            @descontopago,
            @juropago,
            @idtituloreceber,
            @idbanco,
            @idcontabancaria,
            @idlancamento,
            @idoperacaobancaria,
            @empresa
        )
      `);
    const idbaixa = result.recordset[0].id;

    //**************TITULO RECEBER*************** */ 
    const poolRec = await poolPromise;
    const resultRec = await poolRec
      .request()
      .input('valorpago', valorpago)
      .input('descontopago', descontopago)
      .input('juropago', juropago)
      .input('idtituloreceber', idtituloreceber)
      .query(`
        UPDATE titulosreceber SET
            valorpago = valorpago + @valorpago,
            descontopago = descontopago + @descontopago,
            juropago = juropago + @juropago
          WHERE idtitulo =  @idtituloreceber
      `);

    res.status(201).json({ success: true, idbaixa, message: 'baixa criada com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getTituloReceber,
  getTituloReceberById,
  getTituloReceberByVendaBilhete,
  getBaixaReceberByTitulo,
  createTituloReceber,
  updateTituloReceber,
  deleteTituloReceber,
  deleteTituloReceberByVendaBilhete,
  deleteTituloReceberByVendaHotel,
  deleteBaixaReceber,
  createBaixaReceber,
  deleteBaixasReceber,
};
