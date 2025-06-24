const { poolPromise } = require('../db');

// Obter todos os faturas
const getFatura = async (req, res) => {
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
    let whereClause = 'WHERE faturas.empresa = @empresa AND faturas.id > 0 ';

    // Filtros opcionais
    if (idfilial) {
      request.input('idfilial', idfilial);
      whereClause += ' AND faturas.idfilial = @idfilial';
    }

    if (identidade) {
      request.input('identidade', identidade);
      whereClause += ' AND faturas.identidade = @identidade';
    }

    if (idmoeda) {
      request.input('idmoeda', idmoeda);
      whereClause += ' AND faturas.idmoeda = @idmoeda';
    }
    
    if (datainicial) {
      request.input('datainicial', datainicial);
      whereClause += ' AND faturas.dataemissao >= @datainicial';
    }
    
    if (datafinal) {
      request.input('datafinal', datafinal);
      whereClause += ' AND faturas.dataemissao <= @datafinal';
    }

    whereClause += ' ORDER BY faturas.dataemissao desc ';

    const query =
     `
        SELECT 
            faturas.idfatura,
            faturas.dataemissao,
            faturas.datavencimento,
            faturas.descricao,
            faturas.valor,
            faturas.identidade,
            faturas.idmoeda,
            faturas.idfilial,
            faturas.empresa,
            faturas.id,
            entidades.nome AS entidade,
            CAST(0 AS BIT) AS selecionado
            FROM            faturas LEFT OUTER JOIN
                            Entidades ON entidades.IdEntidade = faturas.IdEntidade
            ${whereClause}  `
   const result = await request.query(query);
   //console.log(result);
   res.json(result.recordset);    
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Obter todos os faturas
const getEmissao = async (req, res) => {
  try {
    //console.log('getEmissao');
    const { empresa, idfilial, identidade, idmoeda, datainicial, datafinal, aereo, servico  } = req.query;
    const sql = require('mssql');
    // Verifica se o parâmetro 'empresa' foi fornecido
    if (!empresa) {
      return res.status(400).json({ success: false, message: 'O parâmetro "empresa" é obrigatório.' });
    }

    // Parâmetros obrigatórios
    const pool = await poolPromise;
    const request = pool.request();

    request.input('aereo', aereo);
    request.input('servico', servico);

    let scriptAereo = '';
    let scriptServico = '';
    let unionClause = '';
    if((aereo === 'true')&&(servico === 'true')) {
      unionClause = ' UNION ';
    }

    if( aereo === 'true') {
      
      request.input('empresa', empresa);
    
      // Parâmetros opcionais
      let whereClauseAereo = ' AND VendasBilhetes.empresa = @empresa  ';

      // Filtros opcionais
      if (idfilial) {
        request.input('idfilial', idfilial);
        whereClauseAereo += ' AND VendasBilhetes.idfilial = @idfilial';
      }

      if (identidade) {
        request.input('identidade', identidade);
        whereClauseAereo += ' AND VendasBilhetes.identidade = @identidade';
      }

      if (idmoeda) {
        request.input('idmoeda', idmoeda);
        whereClauseAereo += ' AND VendasBilhetes.idmoeda = @idmoeda';
      }
      
      if (datainicial) {
        request.input('datainicial', datainicial);
        whereClauseAereo += ' AND VendasBilhetes.datavenda >= @datainicial';
      }
      
      if (datafinal) {
        request.input('datafinal', datafinal);
        whereClauseAereo += ' AND VendasBilhetes.datavenda <= @datafinal';
      }

      scriptAereo = 
      `
        SELECT  VendasBilhetes.idvenda, ISNULL(VendasBilhetes.valortotal, 0) AS valortotal, 
                VendasBilhetes.observacao, ISNULL(VendasBilhetes.solicitante, '') AS solicitante, 
                VendasBilhetes.identidade, VendasBilhetes.id, 
                VendasBilhetes.empresa, FormaPagamento.Nome AS pagamento, 
                VendasBilhetes.datavencimento, VendasBilhetes.idformapagamento,
                VendasBilhetes.idcentrocusto, VendasBilhetes.idmoeda, Cast(0 AS BIT) AS selecionado,
                Entidades.nome AS entidade
        FROM            FormaPagamento RIGHT OUTER JOIN
                                VendasBilhetes INNER JOIN
                                Entidades ON VendasBilhetes.IdEntidade = Entidades.IdEntidade ON FormaPagamento.IdFormaPagamento = VendasBilhetes.IdFormaPagamento LEFT OUTER JOIN
                                Filiais ON VendasBilhetes.IdFilial = Filiais.IdFilial LEFT OUTER JOIN
                                ItensVendaBilhete ON VendasBilhetes.IdVenda = ItensVendaBilhete.IdVenda
        WHERE           ISNULL(VendasBilhetes.idfatura,0) > 0 ${whereClauseAereo} 

        GROUP BY VendasBilhetes.idvenda, VendasBilhetes.valortotal, 
                VendasBilhetes.observacao, VendasBilhetes.solicitante, 
                VendasBilhetes.identidade, VendasBilhetes.id, 
                VendasBilhetes.empresa, FormaPagamento.nome, 
                VendasBilhetes.datavencimento, VendasBilhetes.idformapagamento,
                VendasBilhetes.idcentroCusto, VendasBilhetes.idmoeda, Entidades.nome
       
        
        `
    }

    if(servico === 'true') {
      
      request.input('empresa2', empresa);
    
      // Parâmetros opcionais
      let whereClauseServico = ' AND VendasHoteis.empresa = @empresa2  ';

      // Filtros opcionais
      if (idfilial) {
        request.input('idfilial2', idfilial);
        whereClauseServico += ' AND VendasHoteis.idfilial = @idfilial2';
      }

      if (identidade) {
        request.input('identidade2', identidade);
        whereClauseServico += ' AND VendasHoteis.identidade = @identidade2';
      }

      if (idmoeda) {
        request.input('idmoeda2', idmoeda);
        whereClauseServico += ' AND VendasHoteis.idmoeda = @idmoeda2';
      }
      
      if (datainicial) {
        request.input('datainicial2', datainicial);
        whereClauseServico += ' AND VendasHoteis.datavenda >= @datainicial2';
      }
      
      if (datafinal) {
        request.input('datafinal2', datafinal);
        whereClauseServico += ' AND VendasHoteis.datavenda <= @datafinal2';
      }

      scriptServico = 
      `
      ${unionClause}
        SELECT  VendasHoteis.idvenda, ISNULL(VendasHoteis.valortotal, 0) AS valortotal, 
                VendasHoteis.observacao, ISNULL(VendasHoteis.solicitante, '') AS solicitante, 
                VendasHoteis.identidade, VendasHoteis.id, 
                VendasHoteis.empresa, FormaPagamento.nome AS pagamento, 
                VendasHoteis.datavencimento, VendasHoteis.idformapagamento,
                VendasHoteis.idcentrocusto, VendasHoteis.idmoeda, Cast(0 AS BIT) AS selecionado,
                Entidades.nome AS entidade
        FROM            FormaPagamento RIGHT OUTER JOIN
                                VendasHoteis INNER JOIN
                                Entidades ON VendasHoteis.IdEntidade = Entidades.IdEntidade ON FormaPagamento.IdFormaPagamento = VendasHoteis.IdFormaPagamento LEFT OUTER JOIN
                                Filiais ON VendasHoteis.IdFilial = Filiais.IdFilial LEFT OUTER JOIN
                                ItensVendaHotel ON VendasHoteis.IdVenda = ItensVendaHotel.IdVenda
        WHERE           ISNULL(VendasHoteis.idfatura,0) > 0
        ${whereClauseServico}
        GROUP BY VendasHoteis.idvenda, VendasHoteis.valortotal,
                VendasHoteis.observacao, VendasHoteis.solicitante,
                VendasHoteis.identidade, VendasHoteis.id, 
                VendasHoteis.empresa, FormaPagamento.nome, 
                VendasHoteis.datavencimento, VendasHoteis.idformapagamento,
                VendasHoteis.idcentrocusto, VendasHoteis.idmoeda, Entidades.nome
       
      `
    }
    
    //console.log('scriptAereo: '+ scriptAereo.toString());
    //console.log('scriptServico: '+ scriptServico.toString());  
    const query =
     `  ${scriptAereo} ${scriptServico}  `
   
    const result = await request.query(query);
    //console.log('RESULT::' + result.recordset);
    //console.log('RESULT2::' + result.body);
    
   res.json(result.recordset);    
  } catch (error) {
    res.status(500).send(error.message);
    //console.log(error.message); 
  }
};

// Obter uma fatura pelo ID
const getFaturaById = async (req, res) => {
  try {
    const { idfatura } = req.params;

    if (!idfatura) {
      return res.status(400).json({ success: false, message: 'O parâmetro "idfatura" é obrigatório.' });
    }

    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('idfatura', req.params.idfatura)
      .query(`
            faturas.idfatura,
            faturas.dataemissao,
            faturas.datavencimento,
            faturas.descricao,
            faturas.valor,
            faturas.identidade,
            faturas.idmoeda,
            faturas.idfilial,
            faturas.empresa,
            faturas.id,
            entidades.nome AS entidade
            FROM            faturas LEFT OUTER JOIN
                            Entidades ON faturas.IdEntidade = faturas.IdEntidade
            WHERE idfatura = @idfatura                
      `);

    if (result.recordset.length > 0) {
      res.json(result.recordset[0]);
    } else {
      res.status(404).json({ success: false, message: 'fatura não encontrado.' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// Criar um nova fatura
const createFatura = async (req, res) => {
  try {
    const {
          dataemissao,
          datavencimento,
          descricao,
          valor,
          identidade,
          idmoeda,
          idfilial,
          chave,
          empresa,
          id
    } = req.body;

    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('dataemissao', dataemissao)
      .input('datavencimento', datavencimento)
      .input('descricao', descricao)
      .input('valor', valor)
      .input('identidade', identidade)
      .input('idmoeda', idmoeda)
      .input('idfilial', idfilial)
      .input('chave', chave)
      .input('empresa', empresa)
      .input('id', id)
      .query(`
        INSERT INTO faturas (
            dataemissao,
            datavencimento,
            descricao,
            valor,
            identidade,
            idmoeda,
            idfilial,
            chave,
            empresa,
            id
        )
        OUTPUT INSERTED.idfatura
        VALUES (
            @dataemissao,
            @datavencimento,
            @descricao,
            @valor,
            @identidade,
            @idmoeda,
            @idfilial,
            @chave,
            @empresa,
            @id
        )
      `);

    const idtitulo = result.recordset[0].idtitulo;

    res.status(201).json({ success: true, idtitulo, message: 'fatura criada com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// Atualizar um fatura existente
const updateFatura = async (req, res) => {
  try {
   // console.log('ENTROU NA API');
    const {
          dataemissao,
          datavencimento,
          descricao,
          valor,
          identidade,
          idmoeda,
          idfilial,
          chave,
          empresa,
          id
    } = req.body;
    //console.log(req.body);
    const pool = await poolPromise;
    await pool
      .request()
      .input('idfatura', req.params.idfatura)
      .input('dataemissao', dataemissao)
      .input('datavencimento', datavencimento)
      .input('descricao', descricao)
      .input('valor', valor)
      .input('identidade', identidade)
      .input('idmoeda', idmoeda)
      .input('idfilial', idfilial)
      .input('chave', chave)
      .input('empresa', empresa)
      .input('id', id)
      .query(`
        UPDATE faturas SET
            dataemissao = @dataemissao,
            datavencimento = @datavencimento,
            descricao = @descricao,
            valor = @valor,
            identidade = @identidade,
            idmoeda = @idmoeda,
            idfilial = @idfilial,
            chave = @chave,
            empresa = @empresa,
            id = @id
          WHERE idfatura = @idfatura
      `);

    res.json({ success: true, message: 'Fatura atualizado com sucesso' });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};


// Deletar um fatura
const deleteFatura = async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input('idfatura', req.params.idfatura)
      .query('DELETE FROM faturas WHERE idfatura = @idfatura');
    res.json({ success: true, message: 'Fatura deletada com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


module.exports = {
  getFatura,
  getFaturaById,
  createFatura,
  updateFatura,
  deleteFatura,
  getEmissao,
};
