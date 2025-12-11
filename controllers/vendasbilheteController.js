const { poolPromise } = require('../db');

function normalizeDate(dateString) {
  if (!dateString) return null;
  const d = new Date(dateString);
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString(); // sempre "YYYY-MM-DDT00:00:00.000Z"
}

// Obter todas as vendasbilhete
const getVendasBilhete = async (req, res) => {
  try {
    const { empresa, idfilial, identidade, idmoeda, datainicial, datafinal, idvendedor } = req.query;
   // console.log('req.query::', req.query);
   // console.log('EMPRESA::', empresa);
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

    if ((idvendedor) && (idvendedor != '0')) {
      request.input('idvendedor', idvendedor);
      whereClause += ' AND vendasbilhetes.idvendedor = @idvendedor';
    }

    whereClause += ' GROUP BY vendasbilhetes.idvenda, vendasbilhetes.valortotal, vendasbilhetes.descontototal, vendasbilhetes.valorentrada,  ' + //
                   ' vendasbilhetes.observacao, vendasbilhetes.solicitante, vendasbilhetes.identidade, ' +
                   ' vendasbilhetes.id,  vendasbilhetes.empresa, vendasbilhetes.datavenda, entidades.nome, formapagamento.nome, ' +
                   ' vendasbilhetes.datavencimento, vendasbilhetes.idmoeda, vendasbilhetes.idvendedor, vendasbilhetes.idemissor, vendasbilhetes.idformapagamento, ' +
                   ' vendasbilhetes.idcentrocusto, vendasbilhetes.idfilial, vendasbilhetes.idfatura, vendasbilhetes.idreciboreceber, vendasbilhetes.idgrupo, ' +
                   ' entidades_1.nome, entidades_2.nome, recibosreceber.id, faturas.id, titulosreceber.valorpago, titulosreceber.idtitulo ';

    whereClause += ' ORDER BY vendasbilhetes.datavenda desc, vendasbilhetes.id ';

    const query =
     `SELECT vendasbilhetes.idvenda, ISNULL(vendasbilhetes.valortotal,0) AS valortotal, vendasbilhetes.descontototal, vendasbilhetes.valorentrada,
        vendasbilhetes.observacao, ISNULL(vendasbilhetes.solicitante,'') AS solicitante, vendasbilhetes.identidade, 
        vendasbilhetes.id,  vendasbilhetes.empresa, vendasbilhetes.datavenda, entidades.nome AS entidade, formapagamento.nome AS pagamento,
        vendasbilhetes.datavencimento, vendasbilhetes.idmoeda, vendasbilhetes.idvendedor, vendasbilhetes.idemissor, vendasbilhetes.idformapagamento,
        vendasbilhetes.idcentrocusto, vendasbilhetes.idfilial, vendasbilhetes.idfatura, vendasbilhetes.idreciboreceber, vendasbilhetes.idgrupo,
        entidades_1.nome AS vendedor, entidades_2.nome AS emissor, recibosreceber.id AS recibo, faturas.id AS fatura, ISNULL(titulosreceber.valorpago,0) AS valorpago, titulosreceber.idtitulo
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
//console.log('query::', query);
   const result = await request.query(query);
   res.json(result.recordset);
  // console.log('result::', result);     
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
      valorentrada,
    } = req.body;
    //console.log('REQ.BODY::', req.body);

    const dataVendaNorm = normalizeDate(datavenda);
    const dataVencimentoNorm = normalizeDate(datavencimento);

    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('datavenda', dataVendaNorm)
      .input('datavencimento', dataVencimentoNorm)
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
      valorentrada,
      idtitulo,
      idplanoconta,
    } = req.body;

    console.log('--- updateVendasBilhete START ---');
    console.log('params.idvenda =', req.params.idvenda);
    console.log('Recebido no body:', {
      datavenda,
      datavencimento,
      documento,
      valortotal,
      idtitulo,
      id,
      empresa,
    });

    const dataVendaNorm = normalizeDate(datavenda);
    const dataVencimentoNorm = normalizeDate(datavencimento);
   //console.log('Datas normalizadas:', { dataVendaNorm, dataVencimentoNorm });

    const pool = await poolPromise;

    // ====== UPDATE vendasbilhetes ======
    //console.log('Executando UPDATE em vendasbilhetes...');
    const updateResult = await pool
      .request()
      .input('idvenda', req.params.idvenda)
      .input('datavenda', dataVendaNorm)
      .input('datavencimento', dataVencimentoNorm)
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

      console.log('UPDATE result:', {
      rowsAffected: updateResult.rowsAffected,
      recordsetLength: updateResult.recordset ? updateResult.recordset.length : 0,
    });

    // ====== DELETE titulosreceber (sempre tenta remover) ======
    try {
      //console.log('Executando DELETE em titulosreceber (idvendabilhete =', req.params.idvenda, ')');
      const delResult = await pool.request()
        .input('idvenda', req.params.idvenda)
        .query(`
          DELETE FROM titulosreceber
          WHERE idvendabilhete = @idvenda
        `);
      //console.log('DELETE result:', { rowsAffected: delResult.rowsAffected });
    } catch (delErr) {
      console.error('Erro ao executar DELETE em titulosreceber:', delErr.message || delErr);
      // continuar — talvez não exista nenhum título para deletar
    }

    // ====== Se idtitulo > 0 -> INSERT titulosreceber ======
    if (typeof idtitulo === 'undefined') {
      console.warn('idtitulo está undefined no body. Nenhum título será inserido.');
    } else if (Number(idtitulo) > 0) {
      //console.log('idtitulo > 0, tentando inserir novo título. idtitulo =', idtitulo);
      try {
        const insertResult = await pool
          .request()
          .input('dataemissao', dataVendaNorm)
          .input('datavencimento', dataVencimentoNorm)
          .input('datacompetencia', dataVendaNorm)
          .input('descricao', 'Venda Aereo ' + id)
          .input('documento', id)
          .input('valor', valortotal)
          .input('valorpago', 0)
          .input('descontopago', 0)
          .input('juropago', 0)
          .input('parcela', 1)
          .input('identidade', identidade)
          .input('idmoeda', idmoeda)
          .input('idformapagamento', idformapagamento)
          .input('idplanoconta', idplanoconta)
          .input('idfilial', idfilial)
          .input('chave', chave)
          .input('empresa', empresa)
          .input('id', idtitulo)
          .input('idvendabilhete', req.params.idvenda)
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
              identidade,
              idmoeda,
              idformapagamento,
              idplanoconta,
              idfilial,
              chave,
              empresa,
              id,
              idvendabilhete
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
              @identidade,
              @idmoeda,
              @idformapagamento,
              @idplanoconta,
              @idfilial,
              @chave,
              @empresa,
              @id,
              @idvendabilhete
            )
          `);

        console.log('INSERT result:', {
          rowsAffected: insertResult.rowsAffected,
          recordset: insertResult.recordset,
        });

        if (insertResult.recordset && insertResult.recordset.length > 0) {
          console.log('INSERTED idtitulo =', insertResult.recordset[0].idtitulo);
        } else {
          console.warn('Nenhum idtitulo retornado no recordset do INSERT. Verifique a tabela OUTPUT ou permissões.');
        }
      } catch (insErr) {
        console.error('Erro ao inserir titulosreceber:', insErr.message || insErr);
        // opcional: você pode rethrow para abortar toda a operação
        // throw insErr;
      }
    } else {
      console.log('idtitulo <= 0, nenhum título será inserido (idtitulo =', idtitulo, ').');
    }

    console.log('--- updateVendasBilhete END (sucesso) ---');
    res.json({ success: true, message: 'Venda atualizada com sucesso' });

  } catch (error) {
    console.error('Erro geral em updateVendasBilhete:', error.message || error);
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
   //  console.log('req.query::', req.query);
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

    if ((idvendedor) && (idvendedor != '0')) {
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
    //console.log('QUERY::', query);
   const result = await request.query(query);
   //console.log('RESULT::', result);
   //console.log('DATA::', datainicial, datafinal);  
   //console.log('result::', result.recordset);
   //console.log('QUERY::', query);
   res.json(result.recordset);    
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Obter relatórios sintético de vendas bilhetes
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

    if ((idvendedor) && (idvendedor != '0')) {
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

    if(tipo == 'Cliente'){
    whereClause +=  ' GROUP BY  ' +
                    '		Entidades_3.nome  ';
    }else
    if(tipo == 'Emissao'){
    whereClause +=  ' GROUP BY  ' +
                    '		vendasbilhetes.datavenda  ';
    }else
    if(tipo == 'Vencimento'){
    whereClause +=  ' GROUP BY  ' +
                    '		vendasbilhetes.datavencimento  ';
    }else
    if(tipo == 'Vendedor'){
    whereClause +=  ' GROUP BY  ' +
                    '		Entidades_1.nome  ';
    }else
    if(tipo == 'Emissor'){
    whereClause +=  ' GROUP BY  ' +
                    '		Entidades_2.nome  ';
    }else
    if(tipo == 'Operadora'){
    whereClause +=  ' GROUP BY  ' +
                    '		Entidades_4.nome  ';
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
        whereClause += ' ORDER BY Entidades_3.nome '
    else
    if(tipo == 'Emissao')
      whereClause += ' ORDER BY vendasbilhetes.datavenda '
    else
    if(tipo == 'Vencimento')
      whereClause += ' ORDER BY vendasbilhetes.datavencimento '
    else
    if(tipo == 'Emissor')
      whereClause += ' ORDER BY Entidades_2.nome '
    else
    if(tipo == 'Vendedor')
      whereClause += ' ORDER BY Entidades_1.nome '
    else
    if(tipo == 'Operadora')
      whereClause += ' ORDER BY Entidades_4.nome ';

    let query = '';
    if(tipo == 'Cliente'){
     query =
     `SELECT      Entidades_3.nome AS entidade, 
                  SUM(ISNULL(titulosreceber.valorpago,0)) AS valorpago,
                  SUM(ISNULL(ItensVendaBilhete.ValorBilhete,0)) as valor,
                  SUM(ISNULL(ItensVendaBilhete.ValorTaxaBilhete,0)) as valortaxa,
                  SUM(ISNULL(ItensVendaBilhete.ValorTaxaServico,0)) as valorservico,
                  SUM(ISNULL(ItensVendaBilhete.ValorAssento,0)) as valoroutros		
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
    }else
    if(tipo == 'Emissao'){
     query =
     `SELECT      vendasbilhetes.datavenda AS dataemissao, 
                  SUM(ISNULL(titulosreceber.valorpago,0)) AS valorpago,
                  SUM(ISNULL(ItensVendaBilhete.ValorBilhete,0)) as valor,
                  SUM(ISNULL(ItensVendaBilhete.ValorTaxaBilhete,0)) as valortaxa,
                  SUM(ISNULL(ItensVendaBilhete.ValorTaxaServico,0)) as valorservico,
                  SUM(ISNULL(ItensVendaBilhete.ValorAssento,0)) as valoroutros		
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
    }else
    if(tipo == 'Vencimento'){
     query =
     `SELECT      vendasbilhetes.datavencimento, 
                  SUM(ISNULL(titulosreceber.valorpago,0)) AS valorpago,
                  SUM(ISNULL(ItensVendaBilhete.ValorBilhete,0)) as valor,
                  SUM(ISNULL(ItensVendaBilhete.ValorTaxaBilhete,0)) as valortaxa,
                  SUM(ISNULL(ItensVendaBilhete.ValorTaxaServico,0)) as valorservico,
                  SUM(ISNULL(ItensVendaBilhete.ValorAssento,0)) as valoroutros		
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
    }else
    if(tipo == 'Vendedor'){
     query =
     `SELECT      Entidades_1.nome AS vendedor, 
                  SUM(ISNULL(titulosreceber.valorpago,0)) AS valorpago,
                  SUM(ISNULL(ItensVendaBilhete.ValorBilhete,0)) as valor,
                  SUM(ISNULL(ItensVendaBilhete.ValorTaxaBilhete,0)) as valortaxa,
                  SUM(ISNULL(ItensVendaBilhete.ValorTaxaServico,0)) as valorservico,
                  SUM(ISNULL(ItensVendaBilhete.ValorAssento,0)) as valoroutros		
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
    }else
    if(tipo == 'Emissor'){
     query =
     `SELECT      Entidades_2.nome AS emissor, 
                  SUM(ISNULL(titulosreceber.valorpago,0)) AS valorpago,
                  SUM(ISNULL(ItensVendaBilhete.ValorBilhete,0)) as valor,
                  SUM(ISNULL(ItensVendaBilhete.ValorTaxaBilhete,0)) as valortaxa,
                  SUM(ISNULL(ItensVendaBilhete.ValorTaxaServico,0)) as valorservico,
                  SUM(ISNULL(ItensVendaBilhete.ValorAssento,0)) as valoroutros		
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
    }else
    if(tipo == 'Operadora'){
     query =
     `SELECT       
                  entidades_4.nome AS operadora,
                  SUM(ISNULL(titulosreceber.valorpago,0)) AS valorpago,
                  SUM(ISNULL(ItensVendaBilhete.ValorBilhete,0)) as valor,
                  SUM(ISNULL(ItensVendaBilhete.ValorTaxaBilhete,0)) as valortaxa,
                  SUM(ISNULL(ItensVendaBilhete.ValorTaxaServico,0)) as valorservico,
                  SUM(ISNULL(ItensVendaBilhete.ValorAssento,0)) as valoroutros		
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
    query =
     `SELECT      vendasbilhetes.id AS idvenda, 
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
                  SUM(ISNULL(ItensVendaBilhete.ValorAssento,0)) as valoroutros		
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

   //console.log('QUERY::', query);
   const result = await request.query(query);
   //console.log('DATA::', datainicial, datafinal);  
   //console.log('result::', result.recordset);
   res.json(result.recordset);    
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const getVencimentoCopet = async (req, res) => {
  try {
    const { empresa, datainicial, datafinal } = req.query;
   // console.log('req.query::', req.query);
   //  console.log('EMPRESA::', empresa);
    const sql = require('mssql');

    if (!empresa) {
      return res.status(400).json({
        success: false,
        message: 'O parâmetro "empresa" é obrigatório.'
      });
    }

    if (!datainicial || !datafinal) {
      return res.status(400).json({
        success: false,
        message: 'Os parâmetros "datainicial" e "datafinal" são obrigatórios.'
      });
    }

    const pool = await poolPromise;
    const request = pool.request();

    request.input('empresa', empresa);
    request.input('datainicial', datainicial);
    request.input('datafinal', datafinal);

    const query = `
      SELECT 
        copets.venctocopet,
        copets.venctocopetog,
        copets.venctocliente,
        copets.venctoclienteog
      FROM copets
      WHERE 
        copets.empresa = @empresa
        AND copets.id > 0
        AND copets.DataInicial <= @datainicial
        AND copets.DataFinal >= @datafinal
    `;

    const result = await request.query(query);
   // console.log('result::', result);
     
    const rows = result.recordset || [];

    // ⚠️ Se nenhum registro encontrado, retorna '' conforme solicitado
    if (rows.length === 0) {
      return res.json({
        success: true,
        vencimento: '',
        data: ''  // caso prefira [] basta trocar aqui
      });
    }

    // Quando encontra registros
    return res.json({
      success: true,
      vencimento: rows[0].venctocliente || '',
      data: rows
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Erro interno no servidor",
      error: error.message
    });
  }
};

const getBilheteCadastrado = async (req, res) => {
  try {
    const { empresa, bilhete, id } = req.query;
    const sql = require('mssql');

    // Validação
    if (!empresa) {
      return res.status(400).json({
        success: false,
        message: 'O parâmetro "empresa" é obrigatório.'
      });
    }

    if (!bilhete) {
      return res.status(400).json({
        success: false,
        message: 'O parâmetro "bilhete" é obrigatório.'
      });
    }

    const pool = await poolPromise;
    const request = pool.request();

    request.input('empresa', empresa);
    request.input('bilhete', bilhete);
    request.input('id', id);

    const query = `
      SELECT 
        CONCAT(
          'Nro Venda: ',
          COALESCE(VendasBilhetes.Id, ''),
          ' - ',
          COALESCE(Entidades.Nome, ''),
          ' - ',
          COALESCE(ItensVendaBilhete.Bilhete, '')
        ) AS descricao
      FROM Entidades
      INNER JOIN VendasBilhetes 
        ON Entidades.IdEntidade = VendasBilhetes.IdEntidade
      INNER JOIN ItensVendaBilhete 
        ON VendasBilhetes.IdVenda = ItensVendaBilhete.IdVenda
      WHERE 
        VendasBilhetes.empresa = @empresa
        AND VendasBilhetes.id > 0
        AND ItensVendaBilhete.bilhete = @bilhete
        AND ItensVendaBilhete.id <> @id
    `;

    const result = await request.query(query);
    const rows = result.recordset || [];
    // ⚠️ Se não encontrou nada, retorna '' conforme solicitado
    if (rows.length === 0) {
      return res.json({
        success: true,
        msg: '',
        data: ''
      });
    }

    // Registro encontrado
    return res.json({
      success: true,
      msg: rows[0].descricao || '',
      data: rows
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Erro interno no servidor",
      error: error.message
    });
  }
};

const getRav = async (req, res) => {
  try {
    const { empresa, idciaaerea, tipovoo, valor } = req.query;
    const sql = require("mssql");
    // console.log('req.query::', req.query);

    // Validações
    if (!empresa) {
      return res.status(400).json({
        success: false,
        message: 'O parâmetro "empresa" é obrigatório.',
      });
    }

    if (!idciaaerea) {
      return res.status(400).json({
        success: false,
        message: 'O parâmetro "idciaaerea" é obrigatório.',
      });
    }

    if (!tipovoo) {
      return res.status(400).json({
        success: false,
        message: 'O parâmetro "tipovoo" é obrigatório.',
      });
    }

    if (!valor) {
      return res.status(400).json({
        success: false,
        message: 'O parâmetro "valor" é obrigatório.',
      });
    }

    const pool = await poolPromise;
    const request = pool.request();

    request.input("empresa", empresa);
    request.input("idciaaerea", idciaaerea);
    request.input("tipovoo", tipovoo);
    request.input("valor", valor);

    let percentual = 0;
    let valorRav = 0;

    const whereClause = `
      WHERE Entidades.empresa = @empresa
        AND Entidades.identidade = @idciaaerea
    `;

    // ============================
    // 1️⃣ BUSCA COMISSÃO PRINCIPAL
    // ============================
    const queryBase = `
      SELECT 
        CAereas.PerComisNac,
        CAereas.PerComisInt
      FROM CAereas
      INNER JOIN Entidades ON CAereas.EntidadeID = Entidades.IdEntidade
      ${whereClause}
    `;

    const baseResult = await request.query(queryBase);
    const baseRows = baseResult.recordset || [];

    if (baseRows.length === 0) {
      // Nenhum registro encontrado → retorna vazio conforme padrão das outras APIs
      return res.json({
        success: true,
        percentual: '',
        valor: ''
      });
    }

    // Definição inicial
    if (tipovoo === "NACIONAL") {
      percentual = baseRows[0].PerComisNac || 0;
    } else {
      percentual = baseRows[0].PerComisInt || 0;
    }

    // =======================================
    // 2️⃣ SE PERCENTUAL = 0 → CONSULTA TABELAS
    // =======================================
    const buscarFaixa = async (campoValorIni, campoValorFin, campoValor, campoPerc) => {
      const queryFaixa = `
        SELECT 
          ISNULL(CAereas.${campoValor}, 0) AS valor,
          ISNULL(CAereas.${campoPerc}, 0) AS percentual
        FROM CAereas
        INNER JOIN Entidades ON CAereas.EntidadeID = Entidades.IdEntidade
        ${whereClause}
        AND CAereas.${campoValorIni} <= @valor 
        AND CAereas.${campoValorFin} >= @valor
      `;

      const faixaResult = await request.query(queryFaixa);
      return faixaResult.recordset[0] || null;
    };

    if (percentual === 0) {
      let faixa1, faixa2;

      if (tipovoo === "NACIONAL") {
        faixa1 = await buscarFaixa("ValorIniNac1", "ValorFinNac1", "ValorNac1", "PercNac1");
        faixa2 = await buscarFaixa("ValorIniNac2", "ValorFinNac2", "ValorNac2", "PercNac2");
      } else {
        faixa1 = await buscarFaixa("ValorIniInt1", "ValorFinInt1", "ValorInt1", "PercInt1");
        faixa2 = await buscarFaixa("ValorIniInt2", "ValorFinInt2", "ValorInt2", "PercInt2");
      }

      const faixa = faixa1 || faixa2;

      if (faixa) {
        if (faixa.percentual > 0) {
          percentual = faixa.percentual;
        } else {
          valorRav = faixa.valor;
        }
      }
    }

    // ======================
    // 3️⃣ RETORNO FINAL
    // ======================
    return res.json({
      success: true,
      percentual: percentual || '',
      valor: valorRav || ''
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Erro interno no servidor",
      error: error.message,
    });
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
  getRelatoriosSintetico,
  getVencimentoCopet,
  getBilheteCadastrado,
  getRav
};
