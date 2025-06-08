const { poolPromise } = require('../db');

// Obter todas as vendashotel
const getVendasHotel = async (req, res) => {
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
                '    entidades_2.nome ';

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
          entidades_2.nome AS emissor
        FROM vendashoteis INNER JOIN
            entidades ON vendashoteis.identidade = entidades.identidade LEFT OUTER JOIN
            filiais ON vendashoteis.idfilial = filiais.idfilial LEFT OUTER JOIN
            moeda ON vendashoteis.idmoeda = moeda.idmoeda LEFT OUTER JOIN
            formapagamento ON vendashoteis.idformapagamento = formapagamento.idformapagamento LEFT OUTER JOIN
            entidades entidades_2 ON vendashoteis.idemissor = entidades_2.identidade LEFT OUTER JOIN
            entidades entidades_1 ON vendashoteis.idvendedor = entidades_1.identidade LEFT OUTER JOIN
            grupos ON vendashoteis.idgrupo = grupos.id LEFT OUTER JOIN
            itensvendabilhete ON vendashoteis.idvenda = itensvendabilhete.idvenda
            ${whereClause}  `
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
              itensvendabilhete ON vendashoteis.idvenda = itensvendabilhete.idvenda

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


module.exports = {
  getVendasHotel,
  getVendasHotelById,
  createVendasHotel,
  updateVendasHotel,
  deleteVendasHotel,
};
