const { poolPromise } = require('../db');

// Obter todas as vendashotel
const getVendasHotel = async (req, res) => {
  try {
    const { empresa, idfilial, identidade, idmoeda, datainicial, datafinal, idvendedor } = req.query;
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
    let whereClause = 'WHERE vendashoteis.empresa = @empresa AND vendashoteis.id > 0 ';

    // Filtros opcionais
    if (idfilial) {
      request.input('idfilial', idfilial);
      whereClause += ' AND vendashoteis.idfilial = @idfilial';
    }

    if (identidade) {
      request.input('identidade', identidade);
      whereClause += ' AND vendashoteis.identidade = @identidade';
    }

    if (idmoeda) {
      request.input('idmoeda', idmoeda);
      whereClause += ' AND vendashoteis.idmoeda = @idmoeda';
    }
    
    if (datainicial) {
      request.input('datainicial', datainicial);
      whereClause += ' AND vendashoteis.datavenda >= @datainicial';
    }
    
    if (datafinal) {
      request.input('datafinal', datafinal);
      whereClause += ' AND vendashoteis.datavenda <= @datafinal';
    }

    if ((idvendedor) && (idvendedor != '0')) {

      request.input('idvendedor', idvendedor);
      whereClause += ' AND vendashoteis.idvendedor = @idvendedor';
    }

    whereClause += 
                ' GROUP BY ' +
                '    vendashoteis.idvenda, ' +
                '    vendashoteis.datavenda, ' +
                '    vendashoteis.datavencimento, ' +
                '    vendashoteis.documento, ' +
                '    vendashoteis.valortotal, ' +
                '    vendashoteis.descontototal, ' +
                '    vendashoteis.valortaxatotal, ' +
                '    vendashoteis.valoroutrostotal, ' +
                '    vendashoteis.valordutotal, ' +
                '    vendashoteis.valorcomissaototal, ' +
                '    vendashoteis.valorfornecedortotal, ' +
                '    vendashoteis.cartao_sigla, ' +
                '    vendashoteis.cartao_numero, ' +
                '    vendashoteis.cartao_mesvencimento, ' +
                '    vendashoteis.cartao_anovencimento, ' +
                '    vendashoteis.observacao, ' +
                '    vendashoteis.solicitante, ' +
                '    vendashoteis.identidade, ' +
                '    vendashoteis.idvendedor, ' +
                '    vendashoteis.idemissor, ' +
                '    vendashoteis.idmoeda, ' +
                '    vendashoteis.idformapagamento, ' +
                '    vendashoteis.idfilial, ' +
                '    vendashoteis.idfatura, ' +
                '    vendashoteis.idreciboreceber, ' +
                '    vendashoteis.chave, ' +
                '    vendashoteis.excluido, ' +
                '    vendashoteis.empresa, ' +
                '    vendashoteis.idcentrocusto, ' +
                '    vendashoteis.idgrupo, ' +
                '    vendashoteis.id, ' +
                '    vendashoteis.valorentrada, ' +
                '    entidades.nome, ' +
                '    formapagamento.nome, ' +
                '    entidades_1.nome, ' +
                '    entidades_2.nome, '+
                '    recibosreceber.id, '+
                '    faturas.id,'+
                '    titulosreceber.valorpago';

    whereClause += ' ORDER BY vendashoteis.datavenda desc, vendashoteis.id ';

    const query =
     `
        SELECT 
            vendashoteis.idvenda,
            vendashoteis.datavenda,
            vendashoteis.datavencimento,
            vendashoteis.documento,
            vendashoteis.valortotal,
            vendashoteis.descontototal,
            vendashoteis.valortaxatotal,
            vendashoteis.valoroutrostotal,
            vendashoteis.valordutotal,
            vendashoteis.valorcomissaototal,
            vendashoteis.valorfornecedortotal,
            vendashoteis.cartao_sigla,
            vendashoteis.cartao_numero,
            vendashoteis.cartao_mesvencimento,
            vendashoteis.cartao_anovencimento,
            vendashoteis.observacao,
            vendashoteis.solicitante,
            vendashoteis.identidade,
            vendashoteis.idvendedor,
            vendashoteis.idemissor,
            vendashoteis.idmoeda,
            vendashoteis.idformapagamento,
            vendashoteis.idfilial,
            vendashoteis.idfatura,
            vendashoteis.idreciboreceber,
            vendashoteis.chave,
            vendashoteis.excluido,
            vendashoteis.empresa,
            vendashoteis.idcentrocusto,
            vendashoteis.idgrupo,
            vendashoteis.id,
            vendashoteis.valorentrada,
            entidades.nome AS entidade,
            formapagamento.nome AS pagamento,
            entidades_1.nome AS vendedor,
            entidades_2.nome AS emissor,
            recibosreceber.id AS recibo, 
            faturas.id AS fatura, 
            ISNULL(titulosreceber.valorpago,0) AS valorpago
        FROM            Entidades AS entidades_2 RIGHT OUTER JOIN
                        FormaPagamento RIGHT OUTER JOIN
                        vendashoteis INNER JOIN
                        Entidades ON vendashoteis.IdEntidade = Entidades.IdEntidade LEFT OUTER JOIN
                        TitulosReceber ON vendashoteis.IdVenda = TitulosReceber.IdVendaHotel ON FormaPagamento.IdFormaPagamento = vendashoteis.IdFormaPagamento LEFT OUTER JOIN
                        Entidades AS entidades_1 ON vendashoteis.IdVendedor = entidades_1.IdEntidade ON entidades_2.IdEntidade = vendashoteis.IdEmissor LEFT OUTER JOIN
                        Moeda ON vendashoteis.IdMoeda = Moeda.IdMoeda LEFT OUTER JOIN
                        Faturas ON vendashoteis.IdFatura = Faturas.IdFatura LEFT OUTER JOIN
                        Filiais ON vendashoteis.IdFilial = Filiais.IdFilial LEFT OUTER JOIN
                        RecibosReceber ON vendashoteis.IdReciboReceber = RecibosReceber.IdRecibo LEFT OUTER JOIN
                        Grupos ON vendashoteis.IdGrupo = Grupos.Id LEFT OUTER JOIN
                        ItensVendaHotel ON vendashoteis.IdVenda = ItensVendaHotel.IdVenda ${whereClause}  `
   const result = await request.query(query);
   //console.log(result.recordset);
   res.json(result.recordset);    
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Obter uma vendashotel pelo ID
const getVendasHotelById = async (req, res) => {
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
          SELECT 
              vendashoteis.idvenda,
              vendashoteis.datavenda,
              vendashoteis.datavencimento,
              vendashoteis.documento,
              vendashoteis.valortotal,
              vendashoteis.descontototal,
              vendashoteis.valortaxatotal,
              vendashoteis.valoroutrostotal,
              vendashoteis.valordutotal,
              vendashoteis.valorcomissaototal,
              vendashoteis.valorfornecedortotal,
              vendashoteis.cartao_sigla,
              vendashoteis.cartao_numero,
              vendashoteis.cartao_mesvencimento,
              vendashoteis.cartao_anovencimento,
              vendashoteis.observacao,
              vendashoteis.solicitante,
              vendashoteis.identidade,
              vendashoteis.idvendedor,
              vendashoteis.idemissor,
              vendashoteis.idmoeda,
              vendashoteis.idformapagamento,
              vendashoteis.idfilial,
              vendashoteis.idfatura,
              vendashoteis.idreciboreceber,
              vendashoteis.chave,
              vendashoteis.excluido,
              vendashoteis.empresa,
              vendashoteis.idcentrocusto,
              vendashoteis.idgrupo,
              vendashoteis.id,
              vendashoteis.valorentrada,
              entidades.nome AS entidade,
              formapagamento.nome AS pagamento,
              entidades_1.nome AS vendedor,
              entidades_2.nome AS emissor
          FROM vendashoteis INNER JOIN
              entidades ON vendashoteis.identidade = entidades.identidade LEFT OUTER JOIN
              filiais ON vendashoteis.idfilial = filiais.idfilial LEFT OUTER JOIN
              moeda ON vendashoteis.idmoeda = moeda.idmoeda LEFT OUTER JOIN
              formapagamento ON vendashoteis.idformapagamento = formapagamento.idformapagamento LEFT OUTER JOIN
              entidades entidades_2 ON vendashoteis.idemissor = entidades_2.identidade LEFT OUTER JOIN
              entidades entidades_1 ON vendashoteis.idvendedor = entidades_1.identidade LEFT OUTER JOIN
              grupos ON vendashoteis.idgrupo = grupos.id LEFT OUTER JOIN
              itensvendahotel ON vendashoteis.idvenda = itensvendahotel.idvenda

          GROUP BY 
              vendashoteis.idvenda,
              vendashoteis.datavenda,
              vendashoteis.datavencimento,
              vendashoteis.documento,
              vendashoteis.valortotal,
              vendashoteis.descontototal,
              vendashoteis.valortaxatotal,
              vendashoteis.valoroutrostotal,
              vendashoteis.valordutotal,
              vendashoteis.valorcomissaototal,
              vendashoteis.valorfornecedortotal,
              vendashoteis.cartao_sigla,
              vendashoteis.cartao_numero,
              vendashoteis.cartao_mesvencimento,
              vendashoteis.cartao_anovencimento,
              vendashoteis.observacao,
              vendashoteis.solicitante,
              vendashoteis.identidade,
              vendashoteis.idvendedor,
              vendashoteis.idemissor,
              vendashoteis.idmoeda,
              vendashoteis.idformapagamento,
              vendashoteis.idfilial,
              vendashoteis.idfatura,
              vendashoteis.idreciboreceber,
              vendashoteis.chave,
              vendashoteis.excluido,
              vendashoteis.empresa,
              vendashoteis.idcentrocusto,
              vendashoteis.idgrupo,
              vendashoteis.id,
              vendashoteis.valorentrada,
              entidades.nome,
              formapagamento.nome,
              entidades_1.nome,
              entidades_2.nome
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
const createVendasHotel = async (req, res) => {
  try {
    const {
      datavenda,
      datavencimento,
      documento,
      valortotal,
      descontototal,
      valortaxatotal,
      valoroutrostotal,
      valordutotal,
      valorcomissaototal,
      valorfornecedortotal,
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
      .input('valortaxatotal', valortaxatotal)
      .input('valoroutrostotal', valoroutrostotal)
      .input('valordutotal', valordutotal)
      .input('valorcomissaototal', valorcomissaototal)
      .input('valorfornecedortotal', valorfornecedortotal)
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
        INSERT INTO vendashoteis (
          datavenda, datavencimento, documento, valortotal, descontototal,
          valortaxatotal, valoroutrostotal, valordutotal, valorcomissaototal, 
          valorfornecedortotal,
          cartao_sigla, cartao_numero, cartao_mesvencimento, cartao_anovencimento,
          observacao, solicitante, identidade, idvendedor, idemissor, idmoeda,
          idformapagamento, idfilial, idfatura, idreciboreceber, chave, excluido,
          empresa, idcentrocusto, idgrupo, id, valorentrada
        )
        OUTPUT INSERTED.idvenda
        VALUES (
          @datavenda, @datavencimento, @documento, @valortotal, @descontototal,
          @valortaxatotal, @valoroutrostotal, @valordutotal, @valorcomissaototal, 
          @valorfornecedortotal,
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
const updateVendasHotel = async (req, res) => {
  try {
   // console.log('ENTROU NA API');
    const {
      datavenda,
      datavencimento,
      documento,
      valortotal,
      descontototal,
      valortaxatotal,
      valoroutrostotal,
      valordutotal,
      valorcomissaototal,
      valorfornecedortotal,
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
    //console.log(req.body);
    const pool = await poolPromise;
    await pool
      .request()
      .input('idvenda', req.params.idvenda)
      .input('datavenda', datavenda)
      .input('datavencimento', datavencimento)
      .input('documento', documento)
      .input('valortotal', valortotal)
      .input('descontototal', descontototal)
      .input('valortaxatotal', valortaxatotal)
      .input('valoroutrostotal', valoroutrostotal)
      .input('valordutotal', valordutotal)
      .input('valorcomissaototal', valorcomissaototal)
      .input('valorfornecedortotal', valorfornecedortotal)
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
        UPDATE vendashoteis SET
          datavenda = @datavenda,
          datavencimento = @datavencimento,
          documento = @documento,
          valortotal = @valortotal,
          descontototal = @descontototal,
          valortaxatotal = @valortaxatotal,
          valoroutrostotal = @valoroutrostotal,
          valordutotal = @valordutotal,
          valorcomissaototal = @valorcomissaototal,
          valorfornecedortotal = @valorfornecedortotal,
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
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Deletar uma vendas
const deleteVendasHotel = async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input('idvenda', req.params.idvenda)
      .query('DELETE FROM vendashoteis WHERE idvenda = @idvenda');
    res.json({ success: true, message: 'Venda deletada com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Obter baixa dos títulos da venda
const getTemBaixa = async (req, res) => {
  try {
    const tembaixa = false

    const { idvenda } = req.params;

    if (!idvenda) {
      return res.status(400).json({ success: false, message: 'O parâmetro "idvenda" é obrigatório.' });
    }

    const pool = await poolPromise;
    const result1 = await pool
      .request()
      .input('idvenda', idvenda)
      .query(`
          SELECT    COUNT(IDTITULO) AS qtd
          FROM            TitulosReceber
          WHERE ISNULL(ValorPago,0) > 0 
          AND IdVendaHotel = @idvenda
      `);

    if (result1.recordset.length > 0) {
      tembaixa = true;
    }

    const result2 = await pool
      .request()
      .input('idvenda', idvenda)
      .query(`
          SELECT    COUNT(IDTITULO) AS qtd
          FROM            TitulosReceber
          WHERE ISNULL(ValorPago,0) > 0 
          AND IdVendaHotel = @idvenda
      `);

    if (result2.recordset.length > 0) {
      tembaixa = true;
    }
    if (tembaixa) {
      res.json({ qtd: 1 });
    } else {
      res.status(404).json({ success: false, message: 'Venda não encontrada.' });
    }
    
      /*
    if (result.recordset.length > 0) {
      res.json(result.recordset[0]);
    } else {
      res.status(404).json({ success: false, message: 'Venda não encontrada.' });
    }*/

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Obter relatorios analítico de vendas hoteis
const getRelatoriosAnalitico = async (req, res) => {
  try {
    const { empresa, idfilial, identidade, idmoeda, datainicial, datafinal,
      vencimentoinicial, vencimentofinal, idformapagamento, idvendedor, idemissor,  idgrupo,
      servicoinicial, servicofinal, faturainicial, faturafinal, pax, tipo, idoperadora
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
    let whereClause = 'WHERE vendashoteis.empresa = @empresa AND vendashoteis.id > 0 ';

    // Filtros opcionais
    if (idfilial) {
      request.input('idfilial', idfilial);
      whereClause += ' AND vendashoteis.idfilial = @idfilial';
    }

    if (identidade) {
      request.input('identidade', identidade);
      whereClause += ' AND vendashoteis.identidade = @identidade';
    }

    if (idmoeda) {
      request.input('idmoeda', idmoeda);
      whereClause += ' AND vendashoteis.idmoeda = @idmoeda';
    }
    
    if (idgrupo) {
      request.input('idgrupo', idgrupo);
      whereClause += ' AND vendashoteis.idgrupo = @idgrupo';
    }

    if (idformapagamento) {
      request.input('idformapagamento', idformapagamento);
      whereClause += ' AND vendashoteis.idformapagamento = @idformapagamento';
    }

    if ((idvendedor) && (idvendedor != '0')) {
      request.input('idvendedor', idvendedor);
      whereClause += ' AND vendashoteis.idvendedor = @idvendedor';
    }

    if (idemissor) {
      request.input('idemissor', idemissor);
      whereClause += ' AND vendashoteis.idemissor = @idemissor';
    }

    if (datainicial) {
      request.input('datainicial', datainicial);
      whereClause += ' AND vendashoteis.datavenda >= @datainicial';
    }
    
    if (datafinal) {
      request.input('datafinal', datafinal);
      whereClause += ' AND vendashoteis.datavenda <= @datafinal';
    }

    if (vencimentoinicial) {
      request.input('vencimentoinicial', vencimentoinicial);
      whereClause += ' AND vendashoteis.datavencimento >= @vencimentoinicial';
    }
    
    if (vencimentofinal) {
      request.input('vencimentofinal', vencimentofinal);
      whereClause += ' AND vendashoteis.datavencimento <= @vencimentofinal';
    }

    if (pax) {
      request.input('pax', `%${pax}%`);
      whereClause += ' AND ItensVendaHotel.pax LIKE @pax';
    }

    if (servicoinicial) {
      request.input('servicoinicial', servicoinicial);
      whereClause += ' AND vendashoteis.id >= @servicoinicial';
    }
    
    if (servicofinal) {
      request.input('servicofinal', servicofinal);
      whereClause += ' AND vendashoteis.id <= @servicofinal';
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
      whereClause += ' AND ItensVendaHotel.idoperadora = @idoperadora';
    }

    if(tipo == 'Cliente')
        whereClause += ' ORDER BY Entidades_3.nome, vendashoteis.datavenda, vendashoteis.id '
    else
    if(tipo == 'Emissao')
      whereClause += ' ORDER BY vendashoteis.datavenda, Entidades_3.nome, vendashoteis.id '
    else
    if(tipo == 'Vencimento')
      whereClause += ' ORDER BY vendashoteis.datavencimento, Entidades_3.nome, vendashoteis.id '
    else
    if(tipo == 'Emissor')
      whereClause += ' ORDER BY Entidades_2.nome, vendashoteis.datavenda, vendashoteis.id '
    else
    if(tipo == 'Vendedor')
      whereClause += ' ORDER BY Entidades_1.nome, vendashoteis.datavenda, vendashoteis.id '
    else
    if(tipo == 'Operadora')
      whereClause += ' ORDER BY Entidades_4.nome, vendashoteis.datavenda, vendashoteis.id ';

    const query =
     `SELECT        ItensVendaHotel.id, 
                    vendashoteis.Id AS idvenda, 
                    entidades_3.Nome AS entidade, 
                    FormaPagamento.Nome AS pagamento, 
                    vendashoteis.datavenda AS dataemissao, 
                    vendashoteis.datavencimento, 
                    isnull(RecibosReceber.Id,0) AS idrecibo, 
                    isnull(Faturas.Id,0) AS idfatura, 
                    Entidades_4.Nome AS operadora, 
                    Entidades.Nome AS fornecedor, 
                    Entidades_1.Nome AS vendedor, 
                    Entidades_2.Nome AS emissor, 
                    ItensVendaHotel.pax, 
                    (isnull(ItensVendaHotel.pax,'')+ ' ' + isnull(ItensVendaHotel.descricao,'')+ ' ') AS descricao, 
                    isnull(ItensVendaHotel.valorhotel,0) AS valor, 
                    isnull(ItensVendaHotel.valortaxa,0) AS valortaxa,
                    isnull(ItensVendaHotel.valorcomissao,0) AS valorservico, 
                    isnull(ItensVendaHotel.valoroutros,0) AS valoroutros
            FROM            Entidades AS entidades_2 RIGHT OUTER JOIN
                      Entidades AS entidades_1 RIGHT OUTER JOIN
                      Entidades INNER JOIN
                      ItensVendaHotel ON Entidades.IdEntidade = ItensVendaHotel.IdFornecedor INNER JOIN
                      Entidades AS Entidades_4 ON ItensVendaHotel.IdOperadora = Entidades_4.IdEntidade RIGHT OUTER JOIN
                      Faturas RIGHT OUTER JOIN
                      vendashoteis INNER JOIN
                      Entidades AS Entidades_3 ON vendashoteis.IdEntidade = Entidades_3.IdEntidade ON 
                      Faturas.IdFatura = vendashoteis.IdFatura ON ItensVendaHotel.IdVenda = vendashoteis.IdVenda ON 
                      entidades_1.IdEntidade = vendashoteis.IdVendedor ON entidades_2.IdEntidade = vendashoteis.IdEmissor LEFT OUTER JOIN
                      RecibosReceber ON vendashoteis.IdReciboReceber = RecibosReceber.IdRecibo LEFT OUTER JOIN
                      TitulosReceber ON vendashoteis.IdVenda = TitulosReceber.IdVendaHotel LEFT OUTER JOIN
                      FormaPagamento ON vendashoteis.IdFormaPagamento = FormaPagamento.IdFormaPagamento LEFT OUTER JOIN
                      Moeda ON vendashoteis.IdMoeda = Moeda.IdMoeda LEFT OUTER JOIN
                      Filiais ON vendashoteis.IdFilial = Filiais.IdFilial LEFT OUTER JOIN
                      Grupos ON vendashoteis.IdGrupo = Grupos.Id                         
                              
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

// Obter relatorios sintetico de vendas hoteis
const getRelatoriosSintetico = async (req, res) => {
  try {
    const { empresa, idfilial, identidade, idmoeda, datainicial, datafinal,
      vencimentoinicial, vencimentofinal, idformapagamento, idvendedor, idemissor,  idgrupo,
      servicoinicial, servicofinal, faturainicial, faturafinal, pax, tipo, idoperadora
     } = req.query;
    const sql = require('mssql');
    // Verifica se o parâmetro 'empresa' foi fornecido
    if (!empresa) {
      return res.status(400).json({ success: false, message: 'O parâmetro "empresa" é obrigatório.' });
    }
    
    //console.log('REQUISIÇÃO::', req.query);
    //console.log('EMPRESA::', empresa);

    // Parâmetros obrigatórios
    const pool = await poolPromise;
    const request = pool.request();

    request.input('empresa', empresa);

    // Parâmetros opcionais
    let whereClause = 'WHERE vendashoteis.empresa = @empresa AND vendashoteis.id > 0 ';

    // Filtros opcionais
    if (idfilial) {
      request.input('idfilial', idfilial);
      whereClause += ' AND vendashoteis.idfilial = @idfilial';
    }

    if (identidade) {
      request.input('identidade', identidade);
      whereClause += ' AND vendashoteis.identidade = @identidade';
    }

    if (idmoeda) {
      request.input('idmoeda', idmoeda);
      whereClause += ' AND vendashoteis.idmoeda = @idmoeda';
    }
    
    if (idgrupo) {
      request.input('idgrupo', idgrupo);
      whereClause += ' AND vendashoteis.idgrupo = @idgrupo';
    }

    if (idformapagamento) {
      request.input('idformapagamento', idformapagamento);
      whereClause += ' AND vendashoteis.idformapagamento = @idformapagamento';
    }

    if ((idvendedor) && (idvendedor != '0')) {
      request.input('idvendedor', idvendedor);
      whereClause += ' AND vendashoteis.idvendedor = @idvendedor';
    }

    if (idemissor) {
      request.input('idemissor', idemissor);
      whereClause += ' AND vendashoteis.idemissor = @idemissor';
    }

    if (datainicial) {
      request.input('datainicial', datainicial);
      whereClause += ' AND vendashoteis.datavenda >= @datainicial';
    }
    
    if (datafinal) {
      request.input('datafinal', datafinal);
      whereClause += ' AND vendashoteis.datavenda <= @datafinal';
    }

    if (vencimentoinicial) {
      request.input('vencimentoinicial', vencimentoinicial);
      whereClause += ' AND vendashoteis.datavencimento >= @vencimentoinicial';
    }
    
    if (vencimentofinal) {
      request.input('vencimentofinal', vencimentofinal);
      whereClause += ' AND vendashoteis.datavencimento <= @vencimentofinal';
    }

    if (pax) {
      request.input('pax', `%${pax}%`);
      whereClause += ' AND ItensVendaHotel.pax LIKE @pax';
    }

    if (servicoinicial) {
      request.input('servicoinicial', servicoinicial);
      whereClause += ' AND vendashoteis.id >= @servicoinicial';
    }
    
    if (servicofinal) {
      request.input('servicofinal', servicofinal);
      whereClause += ' AND vendashoteis.id <= @servicofinal';
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
      whereClause += ' AND ItensVendaHotel.idoperadora = @idoperadora';
    }

    if(tipo == 'Operadora'){
    whereClause +=  ' GROUP BY vendashoteis.id, ' +
                    '   vendashoteis.observacao,  ' +
                    '		vendashoteis.solicitante, ' +
                    '   vendashoteis.datavenda,  ' +
                    '		Entidades_3.nome,  ' +
                    '		Entidades_4.nome,  ' +
                    '		formapagamento.nome, ' + 
                    '		filiais.nome, ' +
                    '   vendashoteis.datavencimento,  ' +
                    '   entidades_1.nome,  ' +
                    '		entidades_2.nome,  ' +
                    '		recibosreceber.id,  ' +
                    '		faturas.id,  ' +
                    '		titulosreceber.valorpago ';
    }else{
    whereClause +=  ' GROUP BY vendashoteis.id, ' +
                    '   vendashoteis.observacao,  ' +
                    '		vendashoteis.solicitante, ' +
                    '   vendashoteis.datavenda,  ' +
                    '		Entidades_3.nome,  ' +
                    '		formapagamento.nome, ' + 
                    '		filiais.nome, ' +
                    '   vendashoteis.datavencimento,  ' +
                    '   entidades_1.nome,  ' +
                    '		entidades_2.nome,  ' +
                    '		recibosreceber.id,  ' +
                    '		faturas.id,  ' +
                    '		titulosreceber.valorpago ';
    }

    if(tipo == 'Cliente')
        whereClause += ' ORDER BY Entidades_3.nome, vendashoteis.datavenda, vendashoteis.id '
    else
    if(tipo == 'Emissao')
      whereClause += ' ORDER BY vendashoteis.datavenda, Entidades_3.nome, vendashoteis.id '
    else
    if(tipo == 'Vencimento')
      whereClause += ' ORDER BY vendashoteis.datavencimento, Entidades_3.nome, vendashoteis.id '
    else
    if(tipo == 'Emissor')
      whereClause += ' ORDER BY Entidades_2.nome, vendashoteis.datavenda, vendashoteis.id '
    else
    if(tipo == 'Vendedor')
      whereClause += ' ORDER BY Entidades_1.nome, vendashoteis.datavenda, vendashoteis.id '
    else
    if(tipo == 'Operadora')
      whereClause += ' ORDER BY Entidades_4.nome, vendashoteis.datavenda, vendashoteis.id ';

    let query = '';
    if(tipo == 'Operadora'){
     query =
     `SELECT      vendashoteis.id AS idvenda, 
                  vendashoteis.observacao, 
                  ISNULL(vendashoteis.solicitante,'') AS solicitante, 
                  Entidades_3.nome AS entidade, 
                  formapagamento.nome AS pagamento,
                  vendashoteis.datavenda AS dataemissao, 
                  vendashoteis.datavencimento,  
                  entidades_1.nome AS vendedor, 
                  entidades_2.nome AS emissor, 
                  entidades_4.nome AS operadora,
                  filiais.nome AS filial,
                  isnull(recibosreceber.id,0) AS idrecibo, 
                  isnull(faturas.id,0) AS idfatura, 
                  ISNULL(titulosreceber.valorpago,0) AS valorpago,
                  SUM(ISNULL(ItensVendaHotel.ValorHotel,0)) as valor,
                  SUM(ISNULL(ItensVendaHotel.ValorTaxa,0)) as valortaxa,
                  SUM(ISNULL(ItensVendaHotel.ValorComissao,0)) as valorservico,
                  SUM(ISNULL(ItensVendaHotel.Valoroutros,0)) as valorassento		
            FROM            Entidades AS entidades_2 RIGHT OUTER JOIN
                      Entidades AS entidades_1 RIGHT OUTER JOIN
                      Entidades INNER JOIN
                      ItensVendaHotel ON Entidades.IdEntidade = ItensVendaHotel.IdFornecedor INNER JOIN
                      Entidades AS Entidades_4 ON ItensVendaHotel.IdOperadora = Entidades_4.IdEntidade RIGHT OUTER JOIN
                      Faturas RIGHT OUTER JOIN
                      vendashoteis INNER JOIN
                      Entidades AS Entidades_3 ON vendashoteis.IdEntidade = Entidades_3.IdEntidade ON 
                      Faturas.IdFatura = vendashoteis.IdFatura ON ItensVendaHotel.IdVenda = vendashoteis.IdVenda ON 
                      entidades_1.IdEntidade = vendashoteis.IdVendedor ON entidades_2.IdEntidade = vendashoteis.IdEmissor LEFT OUTER JOIN
                      RecibosReceber ON vendashoteis.IdReciboReceber = RecibosReceber.IdRecibo LEFT OUTER JOIN
                      TitulosReceber ON vendashoteis.IdVenda = TitulosReceber.IdVendaHotel LEFT OUTER JOIN
                      FormaPagamento ON vendashoteis.IdFormaPagamento = FormaPagamento.IdFormaPagamento LEFT OUTER JOIN
                      Moeda ON vendashoteis.IdMoeda = Moeda.IdMoeda LEFT OUTER JOIN
                      Filiais ON vendashoteis.IdFilial = Filiais.IdFilial LEFT OUTER JOIN
                      Grupos ON vendashoteis.IdGrupo = Grupos.Id                         
        ${whereClause}  `
    }else{
     query =
     `SELECT      vendashoteis.id AS idvenda, 
                  vendashoteis.observacao, 
                  ISNULL(vendashoteis.solicitante,'') AS solicitante, 
                  Entidades_3.nome AS entidade, 
                  formapagamento.nome AS pagamento,
                  vendashoteis.datavenda AS dataemissao, 
                  vendashoteis.datavencimento,  
                  entidades_1.nome AS vendedor, 
                  entidades_2.nome AS emissor, 
                  filiais.nome AS filial,
                  isnull(recibosreceber.id,0) AS idrecibo, 
                  isnull(faturas.id,0) AS idfatura, 
                  ISNULL(titulosreceber.valorpago,0) AS valorpago,
                  SUM(ISNULL(ItensVendaHotel.ValorHotel,0)) as valor,
                  SUM(ISNULL(ItensVendaHotel.ValorTaxa,0)) as valortaxa,
                  SUM(ISNULL(ItensVendaHotel.ValorComissao,0)) as valorservico,
                  SUM(ISNULL(ItensVendaHotel.Valoroutros,0)) as valorassento		
            FROM            Entidades AS entidades_2 RIGHT OUTER JOIN
                      Entidades AS entidades_1 RIGHT OUTER JOIN
                      Entidades INNER JOIN
                      ItensVendaHotel ON Entidades.IdEntidade = ItensVendaHotel.IdFornecedor INNER JOIN
                      Entidades AS Entidades_4 ON ItensVendaHotel.IdOperadora = Entidades_4.IdEntidade RIGHT OUTER JOIN
                      Faturas RIGHT OUTER JOIN
                      vendashoteis INNER JOIN
                      Entidades AS Entidades_3 ON vendashoteis.IdEntidade = Entidades_3.IdEntidade ON 
                      Faturas.IdFatura = vendashoteis.IdFatura ON ItensVendaHotel.IdVenda = vendashoteis.IdVenda ON 
                      entidades_1.IdEntidade = vendashoteis.IdVendedor ON entidades_2.IdEntidade = vendashoteis.IdEmissor LEFT OUTER JOIN
                      RecibosReceber ON vendashoteis.IdReciboReceber = RecibosReceber.IdRecibo LEFT OUTER JOIN
                      TitulosReceber ON vendashoteis.IdVenda = TitulosReceber.IdVendaHotel LEFT OUTER JOIN
                      FormaPagamento ON vendashoteis.IdFormaPagamento = FormaPagamento.IdFormaPagamento LEFT OUTER JOIN
                      Moeda ON vendashoteis.IdMoeda = Moeda.IdMoeda LEFT OUTER JOIN
                      Filiais ON vendashoteis.IdFilial = Filiais.IdFilial LEFT OUTER JOIN
                      Grupos ON vendashoteis.IdGrupo = Grupos.Id                         
        ${whereClause}  `
    }
   const result = await request.query(query);
   //console.log('DATA::', datainicial, datafinal);  
   //console.log('result::', result.recordset);
   //console.log('QUERY::', query);
   res.json(result.recordset);    
  } catch (error) {
    res.status(500).send(error.message);
  }
};

module.exports = {
  getVendasHotel,
  getVendasHotelById,
  createVendasHotel,
  updateVendasHotel,
  deleteVendasHotel,
  getTemBaixa,
  getRelatoriosAnalitico,
  getRelatoriosSintetico
};
