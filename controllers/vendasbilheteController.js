const { poolPromise } = require('../db');

// Obter todas as vendasbilhete
const getVendasBilhete = async (req, res) => {
  try {
    const { empresa, idfilial, identidade, idmoeda, datainicial, datafinal } = req.query;
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
    let whereClause = 'WHERE vendasbilhetes.empresa = @empresa AND vendasbilhetes.id > 0 ';

    // Filtros opcionais
    if (idfilial) {
      request.input('idfilial', idfilial);
      whereClause += ' AND vendasbilhetes.idfilial = @idfilial';
    }

    if (identidade) {
      request.input('identidade', identidade);
      whereClause += ' AND vendasbilhetes.identidade = @identidade';
    }

    if (idmoeda) {
      request.input('idmoeda', idmoeda);
      whereClause += ' AND vendasbilhetes.idmoeda = @idmoeda';
    }
    
    if (datainicial) {
      request.input('datainicial', datainicial);
      whereClause += ' AND vendasbilhetes.datavenda >= @datainicial';
    }
    
    if (datafinal) {
      request.input('datafinal', datafinal);
      whereClause += ' AND vendasbilhetes.datavenda <= @datafinal';
    }

    whereClause += ' GROUP BY vendasbilhetes.idvenda, vendasbilhetes.valortotal, vendasbilhetes.descontototal, vendasbilhetes.valorentrada,  ' + //
                   ' vendasbilhetes.observacao, vendasbilhetes.solicitante, vendasbilhetes.identidade, ' +
                   ' vendasbilhetes.id,  vendasbilhetes.empresa, vendasbilhetes.datavenda, entidades.nome, formapagamento.nome, ' +
                   ' vendasbilhetes.datavencimento, vendasbilhetes.idmoeda, vendasbilhetes.idvendedor, vendasbilhetes.idemissor, vendasbilhetes.idformapagamento, ' +
                   ' vendasbilhetes.idcentrocusto, vendasbilhetes.idfilial, vendasbilhetes.idfatura, vendasbilhetes.idreciboreceber, vendasbilhetes.idgrupo, ' +
                   ' entidades_1.nome, entidades_2.nome, recibosreceber.id, faturas.id, titulosreceber.valorpago ';

    whereClause += ' ORDER BY vendasbilhetes.datavenda desc, vendasbilhetes.id ';

    const query =
     `SELECT vendasbilhetes.idvenda, ISNULL(vendasbilhetes.valortotal,0) AS valortotal, vendasbilhetes.descontototal, vendasbilhetes.valorentrada,
        vendasbilhetes.observacao, ISNULL(vendasbilhetes.solicitante,'') AS solicitante, vendasbilhetes.identidade, 
        vendasbilhetes.id,  vendasbilhetes.empresa, vendasbilhetes.datavenda, entidades.nome AS entidade, formapagamento.nome AS pagamento,
        vendasbilhetes.datavencimento, vendasbilhetes.idmoeda, vendasbilhetes.idvendedor, vendasbilhetes.idemissor, vendasbilhetes.idformapagamento,
        vendasbilhetes.idcentrocusto, vendasbilhetes.idfilial, vendasbilhetes.idfatura, vendasbilhetes.idreciboreceber, vendasbilhetes.idgrupo,
        entidades_1.nome AS vendedor, entidades_2.nome AS emissor, recibosreceber.id AS recibo, faturas.id AS fatura, ISNULL(titulosreceber.valorpago,0) AS valorpago
      FROM            Entidades AS entidades_2 RIGHT OUTER JOIN
                              FormaPagamento RIGHT OUTER JOIN
                              VendasBilhetes INNER JOIN
                              Entidades ON VendasBilhetes.IdEntidade = Entidades.IdEntidade LEFT OUTER JOIN
                              TitulosReceber ON VendasBilhetes.IdVenda = TitulosReceber.IdVendaBilhete ON FormaPagamento.IdFormaPagamento = VendasBilhetes.IdFormaPagamento LEFT OUTER JOIN
                              Entidades AS entidades_1 ON VendasBilhetes.IdVendedor = entidades_1.IdEntidade ON entidades_2.IdEntidade = VendasBilhetes.IdEmissor LEFT OUTER JOIN
                              Moeda ON VendasBilhetes.IdMoeda = Moeda.IdMoeda LEFT OUTER JOIN
                              Faturas ON VendasBilhetes.IdFatura = Faturas.IdFatura LEFT OUTER JOIN
                              Filiais ON VendasBilhetes.IdFilial = Filiais.IdFilial LEFT OUTER JOIN
                              RecibosReceber ON VendasBilhetes.IdReciboReceber = RecibosReceber.IdRecibo LEFT OUTER JOIN
                              Grupos ON VendasBilhetes.IdGrupo = Grupos.Id LEFT OUTER JOIN
                              ItensVendaBilhete ON VendasBilhetes.IdVenda = ItensVendaBilhete.IdVenda ${whereClause}  `
   const result = await request.query(query);
   //console.log('DATA::', datainicial, datafinal);  
   //console.log('result::', result.recordset);
   //console.log('QUERY::', query);
   res.json(result.recordset);    
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Obter uma vendasb pelo ID
const getVendasBilheteById = async (req, res) => {
  try {
    const { idvenda } = req.params;

    if (!idvenda) {
      return res.status(400).json({ success: false, message: 'O parâmetro "idvenda" é obrigatório.' });
    }

    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('idvenda', idvenda)
      .query(`
        SELECT vendasbilhetes.idvenda, ISNULL(vendasbilhetes.valortotal,0) AS valortotal, vendasbilhetes.descontototal, vendasbilhetes.valorentrada,
            vendasbilhetes.observacao, ISNULL(vendasbilhetes.solicitante,'') AS solicitante, vendasbilhetes.identidade, 
            vendasbilhetes.id,  vendasbilhetes.empresa, vendasbilhetes.datavenda, entidades.nome AS entidade, formapagamento.nome AS pagamento,
            vendasbilhetes.datavencimento, vendasbilhetes.idmoeda, vendasbilhetes.idvendedor, vendasbilhetes.idemissor, vendasbilhetes.idformapagamento,
            vendasbilhetes.idcentrocusto, vendasbilhetes.idfilial, vendasbilhetes.idfatura, vendasbilhetes.idreciboreceber, vendasbilhetes.idgrupo,
            entidades_1.nome AS vendedor, entidades_2.nome AS emissor
            FROM vendasbilhetes INNER JOIN
                entidades ON vendasbilhetes.identidade = entidades.identidade LEFT OUTER JOIN
                filiais ON vendasbilhetes.idfilial = filiais.idfilial LEFT OUTER JOIN
                moeda ON vendasbilhetes.idmoeda = moeda.idmoeda LEFT OUTER JOIN
                formapagamento ON vendasbilhetes.idformapagamento = formapagamento.idformapagamento LEFT OUTER JOIN
                entidades entidades_2 ON vendasbilhetes.idemissor = entidades_2.identidade LEFT OUTER JOIN
                entidades entidades_1 ON vendasbilhetes.idvendedor = entidades_1.identidade LEFT OUTER JOIN
                grupos ON vendasbilhetes.idgrupo = grupos.id LEFT OUTER JOIN
                itensvendabilhete ON vendasbilhetes.idvenda = itensvendabilhete.idvenda   
        WHERE vendasbilhetes.idvenda = @idvenda

        GROUP BY vendasbilhetes.idvenda, vendasbilhetes.valortotal, vendasbilhetes.descontototal, vendasbilhetes.valorentrada,
                  vendasbilhetes.observacao, vendasbilhetes.solicitante, vendasbilhetes.identidade, 
                  vendasbilhetes.id,  vendasbilhetes.empresa, vendasbilhetes.datavenda, entidades.nome, formapagamento.nome,
                  vendasbilhetes.datavencimento, vendasbilhetes.idmoeda, vendasbilhetes.idvendedor, vendasbilhetes.idemissor, vendasbilhetes.idformapagamento, 
                  vendasbilhetes.idcentrocusto, vendasbilhetes.idfilial, vendasbilhetes.idfatura, vendasbilhetes.idreciboreceber, vendasbilhetes.idgrupo,
                  entidades_1.nome, entidades_2.nome 

      `);

    if (result.recordset.length > 0) {
      res.json(result.recordset[0]);
    } else {
      res.status(404).json({ success: false, message: 'Venda não encontrada.' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Obter baixa dos títulos da venda
const getTemBaixa = async (req, res) => {
  try {

    const { idvenda } = req.params;

    if (!idvenda) {
      return res.status(400).json({ success: false, message: 'O parâmetro "idvenda" é obrigatório.' });
    }

    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('idvenda', idvenda)
      .query(`
          SELECT    COUNT(IDTITULO) AS qtd
          FROM            TitulosReceber
          WHERE ISNULL(ValorPago,0) > 0 
          AND IdVendaBilhete = @idvenda
      `);

    if (result.recordset.length > 0) {
      res.json(result.recordset[0]);
    } else {
      res.status(404).json({ success: false, message: 'Venda não encontrada.' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Criar uma nova venda
const createVendasBilhete = async (req, res) => {
  try {
    const {
      datavenda,
      datavencimento,
      documento,
      valortotal,
      descontototal,
      cartao_sigla,
      cartao_numero,
      cartao_mesvencimento,
      cartao_anovencimento,
      observacao,
      solicitante,
      identidade,
      idvendedor,
      idemissor,
      idmoeda,
      idformapagamento,
      idfilial,
      idfatura,
      idreciboreceber,
      chave,
      excluido,
      empresa,
      idcentrocusto,
      idgrupo,
      id,
      valorentrada
    } = req.body;

    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('datavenda', datavenda)
      .input('datavencimento', datavencimento)
      .input('documento', documento)
      .input('valortotal', valortotal)
      .input('descontototal', descontototal)
      .input('cartao_sigla', cartao_sigla)
      .input('cartao_numero', cartao_numero)
      .input('cartao_mesvencimento', cartao_mesvencimento)
      .input('cartao_anovencimento', cartao_anovencimento)
      .input('observacao', observacao)
      .input('solicitante', solicitante)
      .input('identidade', identidade)
      .input('idvendedor', idvendedor)
      .input('idemissor', idemissor)
      .input('idmoeda', idmoeda)
      .input('idformapagamento', idformapagamento)
      .input('idfilial', idfilial)
      .input('idfatura', idfatura)
      .input('idreciboreceber', idreciboreceber)
      .input('chave', chave)
      .input('excluido', excluido)
      .input('empresa', empresa)
      .input('idcentrocusto', idcentrocusto)
      .input('idgrupo', idgrupo)
      .input('id', id)
      .input('valorentrada', valorentrada)
      .query(`
        INSERT INTO vendasbilhetes (
          datavenda, datavencimento, documento, valortotal, descontototal,
          cartao_sigla, cartao_numero, cartao_mesvencimento, cartao_anovencimento,
          observacao, solicitante, identidade, idvendedor, idemissor, idmoeda,
          idformapagamento, idfilial, idfatura, idreciboreceber, chave, excluido,
          empresa, idcentrocusto, idgrupo, id, valorentrada
        )
        OUTPUT INSERTED.idvenda
        VALUES (
          @datavenda, @datavencimento, @documento, @valortotal, @descontototal,
          @cartao_sigla, @cartao_numero, @cartao_mesvencimento, @cartao_anovencimento,
          @observacao, @solicitante, @identidade, @idvendedor, @idemissor, @idmoeda,
          @idformapagamento, @idfilial, @idfatura, @idreciboreceber, @chave, @excluido,
          @empresa, @idcentrocusto, @idgrupo, @id, @valorentrada
        )
      `);

    const idvenda = result.recordset[0].idvenda;

    res.status(201).json({ success: true, idvenda, message: 'Venda criada com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Atualizar uma vendas existente
const updateVendasBilhete = async (req, res) => {
  try {
    const {
      datavenda,
      datavencimento,
      documento,
      valortotal,
      descontototal,
      cartao_sigla,
      cartao_numero,
      cartao_mesvencimento,
      cartao_anovencimento,
      observacao,
      solicitante,
      identidade,
      idvendedor,
      idemissor,
      idmoeda,
      idformapagamento,
      idfilial,
      idfatura,
      idreciboreceber,
      chave,
      excluido,
      empresa,
      idcentrocusto,
      idgrupo,
      id,
      valorentrada
    } = req.body;
    const pool = await poolPromise;
    await pool
      .request()
      .input('idvenda', req.params.idvenda)
      .input('datavenda', datavenda)
      .input('datavencimento', datavencimento)
      .input('documento', documento)
      .input('valortotal', valortotal)
      .input('descontototal', descontototal)
      .input('cartao_sigla', cartao_sigla)
      .input('cartao_numero', cartao_numero)
      .input('cartao_mesvencimento', cartao_mesvencimento)
      .input('cartao_anovencimento', cartao_anovencimento)
      .input('observacao', observacao)
      .input('solicitante', solicitante)
      .input('identidade', identidade)
      .input('idvendedor', idvendedor)
      .input('idemissor', idemissor)
      .input('idmoeda', idmoeda)
      .input('idformapagamento', idformapagamento)
      .input('idfilial', idfilial)
      .input('idfatura', idfatura)
      .input('idreciboreceber', idreciboreceber)
      .input('chave', chave)
      .input('excluido', excluido)
      .input('empresa', empresa)
      .input('idcentrocusto', idcentrocusto)
      .input('idgrupo', idgrupo)
      .input('id', id)
      .input('valorentrada', valorentrada)
      .query(`
        UPDATE vendasbilhetes SET
          datavenda = @datavenda,
          datavencimento = @datavencimento,
          documento = @documento,
          valortotal = @valortotal,
          descontototal = @descontototal,
          cartao_sigla = @cartao_sigla,
          cartao_numero = @cartao_numero,
          cartao_mesvencimento = @cartao_mesvencimento,
          cartao_anovencimento = @cartao_anovencimento,
          observacao = @observacao,
          solicitante = @solicitante,
          identidade = @identidade,
          idvendedor = @idvendedor,
          idemissor = @idemissor,
          idmoeda = @idmoeda,
          idformapagamento = @idformapagamento,
          idfilial = @idfilial,
          idfatura = @idfatura,
          idreciboreceber = @idreciboreceber,
          chave = @chave,
          excluido = @excluido,
          empresa = @empresa,
          idcentrocusto = @idcentrocusto,
          idgrupo = @idgrupo,
          id = @id,
          valorentrada = @valorentrada
        WHERE idvenda = @idvenda
      `);

    res.json({ success: true, message: 'Venda atualizada com sucesso' });
  } catch (error) {
    
    res.status(500).json({ success: false, message: error.message });
  }
};

// Deletar uma vendas
const deleteVendasBilhete = async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input('idvenda', req.params.idvenda)
      .query('DELETE FROM vendasbilhetes WHERE idvenda = @idvenda');
    res.json({ success: true, message: 'Venda deletada com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Obter relatorios analítico de vendas bilhetes
const getRelatoriosAnalitico = async (req, res) => {
  try {
    const { empresa, idfilial, identidade, idmoeda, datainicial, datafinal,
      vencimentoinicial, vencimentofinal, idformapagamento, idvendedor, idemissor,  idgrupo,
      aereoinicial, aereofinal, faturainicial, faturafinal, pax, tipo, idoperadora
     } = req.query;
    const sql = require('mssql');
    //console.log('REQUISIÇÃO::', req.query);
    //console.log('EMPRESA::', empresa);
    // Verifica se o parâmetro 'empresa' foi fornecido
    if (!empresa) {
      return res.status(400).json({ success: false, message: 'O parâmetro "empresa" é obrigatório.' });
    }
    

    // Parâmetros obrigatórios
    const pool = await poolPromise;
    const request = pool.request();

    request.input('empresa', empresa);

    // Parâmetros opcionais
    let whereClause = 'WHERE vendasbilhetes.empresa = @empresa AND vendasbilhetes.id > 0 ';

    // Filtros opcionais
    if (idfilial) {
      request.input('idfilial', idfilial);
      whereClause += ' AND vendasbilhetes.idfilial = @idfilial';
    }

    if (identidade) {
      request.input('identidade', identidade);
      whereClause += ' AND vendasbilhetes.identidade = @identidade';
    }

    if (idmoeda) {
      request.input('idmoeda', idmoeda);
      whereClause += ' AND vendasbilhetes.idmoeda = @idmoeda';
    }
    
    if (idgrupo) {
      request.input('idgrupo', idgrupo);
      whereClause += ' AND vendasbilhetes.idgrupo = @idgrupo';
    }

    if (idformapagamento) {
      request.input('idformapagamento', idformapagamento);
      whereClause += ' AND vendasbilhetes.idformapagamento = @idformapagamento';
    }

    if (idvendedor) {
      request.input('idvendedor', idvendedor);
      whereClause += ' AND vendasbilhetes.idvendedor = @idvendedor';
    }

    if (idemissor) {
      request.input('idemissor', idemissor);
      whereClause += ' AND vendasbilhetes.idemissor = @idemissor';
    }

    if (datainicial) {
      request.input('datainicial', datainicial);
      whereClause += ' AND vendasbilhetes.datavenda >= @datainicial';
    }
    
    if (datafinal) {
      request.input('datafinal', datafinal);
      whereClause += ' AND vendasbilhetes.datavenda <= @datafinal';
    }

    if (vencimentoinicial) {
      request.input('vencimentoinicial', vencimentoinicial);
      whereClause += ' AND vendasbilhetes.datavencimento >= @vencimentoinicial';
    }
    
    if (vencimentofinal) {
      request.input('vencimentofinal', vencimentofinal);
      whereClause += ' AND vendasbilhetes.datavencimento <= @vencimentofinal';
    }

    if (pax) {
      request.input('pax', `%${pax}%`);
      whereClause += ' AND ItensVendaBilhete.pax LIKE @pax';
    }

    if (aereoinicial) {
      request.input('aereoinicial', aereoinicial);
      whereClause += ' AND vendasbilhetes.id >= @aereoinicial';
    }
    
    if (aereofinal) {
      request.input('aereofinal', aereofinal);
      whereClause += ' AND vendasbilhetes.id <= @aereofinal';
    }

    if (faturainicial) {
      request.input('faturainicial', faturainicial);
      whereClause += ' AND Faturas.id >= @faturainicial';
    }
    
    if (faturafinal) {
      request.input('faturafinal', faturafinal);
      whereClause += ' AND Faturas.id <= @faturafinal';
    }

    if (idoperadora) {
      request.input('idoperadora', idoperadora);
      whereClause += ' AND ItensVendaBilhete.idoperadora = @idoperadora';
    }

    if(tipo == 'Cliente')
        whereClause += ' ORDER BY Entidades_3.nome, vendasbilhetes.datavenda, vendasbilhetes.id '
    else
    if(tipo == 'Emissao')
      whereClause += ' ORDER BY vendasbilhetes.datavenda, Entidades_3.nome, vendasbilhetes.id '
    else
    if(tipo == 'Vencimento')
      whereClause += ' ORDER BY vendasbilhetes.datavencimento, Entidades_3.nome, vendasbilhetes.id '
    else
    if(tipo == 'Emissor')
      whereClause += ' ORDER BY Entidades_2.nome, vendasbilhetes.datavenda, vendasbilhetes.id '
    else
    if(tipo == 'Vendedor')
      whereClause += ' ORDER BY Entidades_1.nome, vendasbilhetes.datavenda, vendasbilhetes.id '
    else
    if(tipo == 'Operadora')
      whereClause += ' ORDER BY Entidades_4.nome, vendasbilhetes.datavenda, vendasbilhetes.id ';

    const query =
     `SELECT        ItensVendaBilhete.id, 
                    VendasBilhetes.Id AS idvenda, 
                    entidades_3.Nome AS entidade, 
                    FormaPagamento.Nome AS pagamento, 
                    VendasBilhetes.datavenda AS dataemissao, 
                    VendasBilhetes.datavencimento, 
                    isnull(RecibosReceber.Id,0) AS idrecibo, 
                    isnull(Faturas.Id,0) AS idfatura, 
                    Entidades_4.Nome AS operadora, 
                    Entidades.Nome AS fornecedor, 
                    Entidades_1.Nome AS vendedor, 
                    Entidades_2.Nome AS emissor, 
                    ItensVendaBilhete.pax, 
                    (isnull(ItensVendaBilhete.pax,'')+ ' ' + isnull(ItensVendaBilhete.bilhete,'')+ ' ' +
                    isnull(Entidades.sigla,'')+ ' ' +isnull(ItensVendaBilhete.trecho,'')) AS descricao, 
                    isnull(ItensVendaBilhete.valorbilhete,0) AS valor, 
                    isnull(ItensVendaBilhete.valortaxabilhete,0) AS valortaxa,
                    isnull(ItensVendaBilhete.valortaxaservico,0) AS valorservico, 
                    isnull(ItensVendaBilhete.valorassento,0) AS valoroutros
            FROM            Entidades AS entidades_2 RIGHT OUTER JOIN
                      Entidades AS entidades_1 RIGHT OUTER JOIN
                      Entidades INNER JOIN
                      ItensVendaBilhete ON Entidades.IdEntidade = ItensVendaBilhete.IdCiaAerea INNER JOIN
                      Entidades AS Entidades_4 ON ItensVendaBilhete.IdOperadora = Entidades_4.IdEntidade RIGHT OUTER JOIN
                      Faturas RIGHT OUTER JOIN
                      VendasBilhetes INNER JOIN
                      Entidades AS Entidades_3 ON VendasBilhetes.IdEntidade = Entidades_3.IdEntidade ON 
                      Faturas.IdFatura = VendasBilhetes.IdFatura ON ItensVendaBilhete.IdVenda = VendasBilhetes.IdVenda ON 
                      entidades_1.IdEntidade = VendasBilhetes.IdVendedor ON entidades_2.IdEntidade = VendasBilhetes.IdEmissor LEFT OUTER JOIN
                      RecibosReceber ON VendasBilhetes.IdReciboReceber = RecibosReceber.IdRecibo LEFT OUTER JOIN
                      TitulosReceber ON VendasBilhetes.IdVenda = TitulosReceber.IdVendaBilhete LEFT OUTER JOIN
                      FormaPagamento ON VendasBilhetes.IdFormaPagamento = FormaPagamento.IdFormaPagamento LEFT OUTER JOIN
                      Moeda ON VendasBilhetes.IdMoeda = Moeda.IdMoeda LEFT OUTER JOIN
                      Filiais ON VendasBilhetes.IdFilial = Filiais.IdFilial LEFT OUTER JOIN
                      Grupos ON VendasBilhetes.IdGrupo = Grupos.Id                         
                              
    ${whereClause}  `
   const result = await request.query(query);
   //console.log('DATA::', datainicial, datafinal);  
   //console.log('result::', result.recordset);
   //console.log('QUERY::', query);
   res.json(result.recordset);    
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Obter relatorios sintetico de vendas bilhetes
const getRelatoriosSintetico = async (req, res) => {
  try {
    const { empresa, idfilial, identidade, idmoeda, datainicial, datafinal,
      vencimentoinicial, vencimentofinal, idformapagamento, idvendedor, idemissor,  idgrupo,
      aereoinicial, aereofinal, faturainicial, faturafinal, pax, tipo, idoperadora
     } = req.query;
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
    let whereClause = 'WHERE vendasbilhetes.empresa = @empresa AND vendasbilhetes.id > 0 ';

    // Filtros opcionais
    if (idfilial) {
      request.input('idfilial', idfilial);
      whereClause += ' AND vendasbilhetes.idfilial = @idfilial';
    }

    if (identidade) {
      request.input('identidade', identidade);
      whereClause += ' AND vendasbilhetes.identidade = @identidade';
    }

    if (idmoeda) {
      request.input('idmoeda', idmoeda);
      whereClause += ' AND vendasbilhetes.idmoeda = @idmoeda';
    }
    
    if (idgrupo) {
      request.input('idgrupo', idgrupo);
      whereClause += ' AND vendasbilhetes.idgrupo = @idgrupo';
    }

    if (idformapagamento) {
      request.input('idformapagamento', idformapagamento);
      whereClause += ' AND vendasbilhetes.idformapagamento = @idformapagamento';
    }

    if (idvendedor) {
      request.input('idvendedor', idvendedor);
      whereClause += ' AND vendasbilhetes.idvendedor = @idvendedor';
    }

    if (idemissor) {
      request.input('idemissor', idemissor);
      whereClause += ' AND vendasbilhetes.idemissor = @idemissor';
    }

    if (datainicial) {
      request.input('datainicial', datainicial);
      whereClause += ' AND vendasbilhetes.datavenda >= @datainicial';
    }
    
    if (datafinal) {
      request.input('datafinal', datafinal);
      whereClause += ' AND vendasbilhetes.datavenda <= @datafinal';
    }

    if (vencimentoinicial) {
      request.input('vencimentoinicial', vencimentoinicial);
      whereClause += ' AND vendasbilhetes.datavencimento >= @vencimentoinicial';
    }
    
    if (vencimentofinal) {
      request.input('vencimentofinal', vencimentofinal);
      whereClause += ' AND vendasbilhetes.datavencimento <= @vencimentofinal';
    }

    if (pax) {
      request.input('pax', `%${pax}%`);
      whereClause += ' AND ItensVendaBilhete.pax LIKE @pax';
    }

    if (aereoinicial) {
      request.input('aereoinicial', aereoinicial);
      whereClause += ' AND vendasbilhetes.id >= @aereoinicial';
    }
    
    if (aereofinal) {
      request.input('aereofinal', aereofinal);
      whereClause += ' AND vendasbilhetes.id <= @aereofinal';
    }

    if (faturainicial) {
      request.input('faturainicial', faturainicial);
      whereClause += ' AND Faturas.id >= @faturainicial';
    }
    
    if (faturafinal) {
      request.input('faturafinal', faturafinal);
      whereClause += ' AND Faturas.id <= @faturafinal';
    }

    if (idoperadora) {
      request.input('idoperadora', idoperadora);
      whereClause += ' AND ItensVendaBilhete.idoperadora = @idoperadora';
    }

    if(tipo == 'Operadora'){
    whereClause +=  ' GROUP BY vendasbilhetes.id, ' +
                    '   vendasbilhetes.observacao,  ' +
                    '		vendasbilhetes.solicitante, ' +
                    '   vendasbilhetes.datavenda,  ' +
                    '		Entidades_3.nome,  ' +
                    '		Entidades_4.nome,  ' +
                    '		formapagamento.nome, ' + 
                    '		filiais.nome, ' +
                    '   vendasbilhetes.datavencimento,  ' +
                    '   entidades_1.nome,  ' +
                    '		entidades_2.nome,  ' +
                    '		recibosreceber.id,  ' +
                    '		faturas.id,  ' +
                    '		titulosreceber.valorpago ';
    }else{
    whereClause +=  ' GROUP BY vendasbilhetes.id, ' +
                    '   vendasbilhetes.observacao,  ' +
                    '		vendasbilhetes.solicitante, ' +
                    '   vendasbilhetes.datavenda,  ' +
                    '		Entidades_3.nome,  ' +
                    '		formapagamento.nome, ' + 
                    '		filiais.nome, ' +
                    '   vendasbilhetes.datavencimento,  ' +
                    '   entidades_1.nome,  ' +
                    '		entidades_2.nome,  ' +
                    '		recibosreceber.id,  ' +
                    '		faturas.id,  ' +
                    '		titulosreceber.valorpago ';
    }

    if(tipo == 'Cliente')
        whereClause += ' ORDER BY Entidades_3.nome, vendasbilhetes.datavenda, vendasbilhetes.id '
    else
    if(tipo == 'Emissao')
      whereClause += ' ORDER BY vendasbilhetes.datavenda, Entidades_3.nome, vendasbilhetes.id '
    else
    if(tipo == 'Vencimento')
      whereClause += ' ORDER BY vendasbilhetes.datavencimento, Entidades_3.nome, vendasbilhetes.id '
    else
    if(tipo == 'Emissor')
      whereClause += ' ORDER BY Entidades_2.nome, vendasbilhetes.datavenda, vendasbilhetes.id '
    else
    if(tipo == 'Vendedor')
      whereClause += ' ORDER BY Entidades_1.nome, vendasbilhetes.datavenda, vendasbilhetes.id '
    else
    if(tipo == 'Operadora')
      whereClause += ' ORDER BY Entidades_4.nome, vendasbilhetes.datavenda, vendasbilhetes.id ';

    if(tipo == 'Operadora'){
    const query =
     `SELECT      vendasbilhetes.id, 
                  vendasbilhetes.observacao, 
                  ISNULL(vendasbilhetes.solicitante,'') AS solicitante, 
                  Entidades_3.nome AS entidade, 
                  formapagamento.nome AS pagamento,
                  vendasbilhetes.datavenda AS dataemissao, 
                  vendasbilhetes.datavencimento,  
                  entidades_1.nome AS vendedor, 
                  entidades_2.nome AS emissor, 
                  entidades_4.nome AS operadora,
                  filiais.nome AS filial,
                  isnull(recibosreceber.id,0) AS idrecibo, 
                  isnull(faturas.id,0) AS idfatura, 
                  ISNULL(titulosreceber.valorpago,0) AS valorpago,
                  SUM(ISNULL(ItensVendaBilhete.ValorBilhete,0)) as valor,
                  SUM(ISNULL(ItensVendaBilhete.ValorTaxaBilhete,0)) as valortaxa,
                  SUM(ISNULL(ItensVendaBilhete.ValorTaxaServico,0)) as valorservico,
                  SUM(ISNULL(ItensVendaBilhete.ValorAssento,0)) as valorassento		
            FROM            Entidades AS entidades_2 RIGHT OUTER JOIN
                      Entidades AS entidades_1 RIGHT OUTER JOIN
                      Entidades INNER JOIN
                      ItensVendaBilhete ON Entidades.IdEntidade = ItensVendaBilhete.IdCiaAerea INNER JOIN
                      Entidades AS Entidades_4 ON ItensVendaBilhete.IdOperadora = Entidades_4.IdEntidade RIGHT OUTER JOIN
                      Faturas RIGHT OUTER JOIN
                      VendasBilhetes INNER JOIN
                      Entidades AS Entidades_3 ON VendasBilhetes.IdEntidade = Entidades_3.IdEntidade ON 
                      Faturas.IdFatura = VendasBilhetes.IdFatura ON ItensVendaBilhete.IdVenda = VendasBilhetes.IdVenda ON 
                      entidades_1.IdEntidade = VendasBilhetes.IdVendedor ON entidades_2.IdEntidade = VendasBilhetes.IdEmissor LEFT OUTER JOIN
                      RecibosReceber ON VendasBilhetes.IdReciboReceber = RecibosReceber.IdRecibo LEFT OUTER JOIN
                      TitulosReceber ON VendasBilhetes.IdVenda = TitulosReceber.IdVendaBilhete LEFT OUTER JOIN
                      FormaPagamento ON VendasBilhetes.IdFormaPagamento = FormaPagamento.IdFormaPagamento LEFT OUTER JOIN
                      Moeda ON VendasBilhetes.IdMoeda = Moeda.IdMoeda LEFT OUTER JOIN
                      Filiais ON VendasBilhetes.IdFilial = Filiais.IdFilial LEFT OUTER JOIN
                      Grupos ON VendasBilhetes.IdGrupo = Grupos.Id                         
        ${whereClause}  `
    }else{
    const query =
     `SELECT      vendasbilhetes.id, 
                  vendasbilhetes.observacao, 
                  ISNULL(vendasbilhetes.solicitante,'') AS solicitante, 
                  Entidades_3.nome AS entidade, 
                  formapagamento.nome AS pagamento,
                  vendasbilhetes.datavenda AS dataemissao, 
                  vendasbilhetes.datavencimento,  
                  entidades_1.nome AS vendedor, 
                  entidades_2.nome AS emissor, 
                  filiais.nome AS filial,
                  isnull(recibosreceber.id,0) AS idrecibo, 
                  isnull(faturas.id,0) AS idfatura, 
                  ISNULL(titulosreceber.valorpago,0) AS valorpago,
                  SUM(ISNULL(ItensVendaBilhete.ValorBilhete,0)) as valor,
                  SUM(ISNULL(ItensVendaBilhete.ValorTaxaBilhete,0)) as valortaxa,
                  SUM(ISNULL(ItensVendaBilhete.ValorTaxaServico,0)) as valorservico,
                  SUM(ISNULL(ItensVendaBilhete.ValorAssento,0)) as valorassento		
            FROM            Entidades AS entidades_2 RIGHT OUTER JOIN
                      Entidades AS entidades_1 RIGHT OUTER JOIN
                      Entidades INNER JOIN
                      ItensVendaBilhete ON Entidades.IdEntidade = ItensVendaBilhete.IdCiaAerea INNER JOIN
                      Entidades AS Entidades_4 ON ItensVendaBilhete.IdOperadora = Entidades_4.IdEntidade RIGHT OUTER JOIN
                      Faturas RIGHT OUTER JOIN
                      VendasBilhetes INNER JOIN
                      Entidades AS Entidades_3 ON VendasBilhetes.IdEntidade = Entidades_3.IdEntidade ON 
                      Faturas.IdFatura = VendasBilhetes.IdFatura ON ItensVendaBilhete.IdVenda = VendasBilhetes.IdVenda ON 
                      entidades_1.IdEntidade = VendasBilhetes.IdVendedor ON entidades_2.IdEntidade = VendasBilhetes.IdEmissor LEFT OUTER JOIN
                      RecibosReceber ON VendasBilhetes.IdReciboReceber = RecibosReceber.IdRecibo LEFT OUTER JOIN
                      TitulosReceber ON VendasBilhetes.IdVenda = TitulosReceber.IdVendaBilhete LEFT OUTER JOIN
                      FormaPagamento ON VendasBilhetes.IdFormaPagamento = FormaPagamento.IdFormaPagamento LEFT OUTER JOIN
                      Moeda ON VendasBilhetes.IdMoeda = Moeda.IdMoeda LEFT OUTER JOIN
                      Filiais ON VendasBilhetes.IdFilial = Filiais.IdFilial LEFT OUTER JOIN
                      Grupos ON VendasBilhetes.IdGrupo = Grupos.Id                         
        ${whereClause}  `
    }
   const result = await request.query(query);
   //console.log('DATA::', datainicial, datafinal);  
   console.log('result::', result.recordset);
   console.log('QUERY::', query);
   res.json(result.recordset);    
  } catch (error) {
    res.status(500).send(error.message);
  }
};

module.exports = {
  getVendasBilhete,
  getVendasBilheteById,
  createVendasBilhete,
  updateVendasBilhete,
  deleteVendasBilhete,
  getTemBaixa,
  getRelatoriosAnalitico,
  getRelatoriosSintetico
};
