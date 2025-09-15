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
    const idVenda = req.params.idvenda; // pega da rota

   // console.log('Deletando Titulos da Venda Bilhete: ' + idVenda);

    const pool = await poolPromise;
    await pool
      .request()
      .input('idvendabilhete', idVenda) // passa corretamente
      .query('DELETE FROM titulosreceber WHERE idvendabilhete = @idvendabilhete');

    res.json({ success: true, message: 'Titulos deletados com sucesso' });
    //console.log('Titulos Deletados da Venda Bilhete: ' + idVenda);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};


/*
const deleteTituloReceberByVendaBilhete = async (req, res) => {
  try {
    console.log('Deletando Titulos da Venda Bilhete: ' + req.params.idvenda);
    const pool = await poolPromise;
    await pool
      .request()
      .input('idvendabilhete', req.params.idvendabilhete)
      .query('DELETE FROM titulosreceber WHERE idvendabilhete = @idvendabilhete');
    res.json({ success: true, message: 'Titulos deletados com sucesso' });
    console.log('Titulos Deletados da Venda Bilhete: ' + req.params.idvenda);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
*/

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
          idfilial,
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
      .input('idfilial', idfilial)
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
            @idtituloreceber,
            @idbanco,
            @idcontabancaria,
            @idlancamento,
            @idoperacaobancaria,
            @idfilial,
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

// Criar várias baixas
const createBaixasReceberGenerica = async (req, res) => {
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
        idtituloreceber,
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
        .input('valorpago', valorpago)
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
        .input('idtituloreceber', idtituloreceber)
        .input('idbanco', idbanco)
        .input('idcontabancaria', idcontabancaria)
        .input('idlancamento', idlancamento)
        .input('idoperacaobancaria', idoperacaobancaria)
        .input('idfilial', idfilial)
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
              @idtituloreceber,
              @idbanco,
              @idcontabancaria,
              @idlancamento,
              @idoperacaobancaria,
              @idfilial,
              @empresa
          )
        `);
      const idbaixa = result.recordset[0].id;

      //************** TITULO RECEBER *************** */ 
      const poolRec = await poolPromise;
      await poolRec
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
          WHERE idtitulo = @idtituloreceber
        `);

      resultados.push({ idbaixa, idlancamento, idtituloreceber });
    }

    //res.status(201).json({ success: true, resultados, message: 'Baixas criadas com sucesso' });
    res.status(201).json({ success: true, message: 'Baixas criadas com sucesso' });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Obter todos os titulos receber
const getTituloReceberLancamento = async (req, res) => {
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
    
    whereClause += ' AND titulosreceber.valor > titulosreceber.valorpago ';

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
            ISNULL(TitulosReceber.valor,0) AS valor,
            ISNULL(TitulosReceber.valorpago,0) AS valorpago,
            ISNULL(TitulosReceber.descontopago,0) AS descontopago,
            ISNULL(TitulosReceber.juropago,0) AS juropago,
            (ISNULL(TitulosReceber.valor,0) - ISNULL(TitulosReceber.valorpago,0)) AS valoraberto,
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
            planoconta.nome AS planoconta,
            'RECEBER' AS tipo,
            CAST(0 AS BIT) AS selecionado
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
  getTituloReceberLancamento,
  createBaixasReceberGenerica
};
