const { poolPromise } = require('../db');

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
      request.input('datainicial', datainicial);
      whereClause += ' AND titulosreceber.dataemissao >= @datainicial';
    }
    
    if (datafinal) {
      request.input('datafinal', datafinal);
      whereClause += ' AND titulosreceber.dataemissao <= @datafinal';
    }

    whereClause += ' ORDER BY titulosreceber.dataemissao desc ';

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

    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('idvenda',  req.params.idvenda)
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
            WHERE idvendabilhete = @idvenda
      `);

    if (result.recordset.length > 0) {
      res.json(result.recordset);//res.json(result.recordset[0]);
    } else {
      res.status(404).json({ success: false, message: 'titulo não encontrado.' });
    }

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
            valorpago = @valorpago,
            descontopago = @descontopago,
            juropago = @juropago,
            parcela = @parcela,
            idvendabilhete = @idvendabilhete,
            idvendahotel = @idvendahotel,
            idvendapacote = @idvendapacote,
            idfatura = @idfatura,
            identidade = @identidade,
            idmoeda = @idmoeda,
            idformapagamento = @idformapagamento,
            idplanoconta = @idplanoconta,
            idcentrocusto = @idcentrocusto,
            idfilial = @idfilial,
            chave = @chave,
            empresa = @empresa,
            comissao = @comissao,
            idnotacredito = @idnotacredito,
            idnotadebito = @idnotadebito,
            idreembolso = @idreembolso,
            id = @id,
            idnf = @idnf,
            numeronf = @numeronf,
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

module.exports = {
  getTituloReceber,
  getTituloReceberById,
  getTituloReceberByVendaBilhete,
  createTituloReceber,
  updateTituloReceber,
  deleteTituloReceber,
  deleteTituloReceberByVendaBilhete,
  deleteTituloReceberByVendaHotel,
};
