const sql = require("mssql");
const { poolPromise } = require('../db');

function normalizeDate(dateString) {
  if (!dateString) return null;
  const d = new Date(dateString);
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString(); // sempre "YYYY-MM-DDT00:00:00.000Z"
}

// Obter todas as vendashotel
const getVendasHotel = async (req, res) => {
  try {
    const { empresa, idfilial, identidade, idmoeda, datainicial, datafinal, idvendedor, vencimentoinicial, vencimentofinal,
      servicoinicial, servicofinal, faturainicial, faturafinal, pax,  tituloinicial, titulofinal
     } = req.query;
    // console.log('query::', req.query);
   
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
    let whereClauseAux = ' AND IsNull(Faturas.IdFatura,0) = 0 ';
    let orderClause = '';
    let groupClause = '';

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

    if (tituloinicial) {
      request.input('tituloinicial', tituloinicial);
      whereClause += ' AND titulosreceber.id >= @tituloinicial';
    }
    
    if (titulofinal) {
      request.input('titulofinal', titulofinal);
      whereClause += ' AND titulosreceber.id <= @titulofinal';
    }

    groupClause += 
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
                '    entidades_3.nome, ' +
                '    formapagamento.nome, ' +
                '    entidades_1.nome, ' +
                '    entidades_2.nome, '+
                '    recibosreceber.id, '+
                '    faturas.id,'+
                '    titulosreceber.valorpago';

    orderClause += ' ORDER BY vendashoteis.datavenda desc, vendashoteis.id ';

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
            entidades_3.nome AS entidade,
            formapagamento.nome AS pagamento,
            entidades_1.nome AS vendedor,
            entidades_2.nome AS emissor,
            recibosreceber.id AS recibo, 
            faturas.id AS fatura, 
            ISNULL(titulosreceber.valorpago,0) AS valorpago
              FROM            Entidades AS entidades_1 RIGHT OUTER JOIN
                                      Moeda RIGHT OUTER JOIN
                                      Entidades AS entidades_2 RIGHT OUTER JOIN
                                      VendasHoteis INNER JOIN
                                      Entidades AS Entidades_3 ON VendasHoteis.IdEntidade = Entidades_3.IdEntidade LEFT OUTER JOIN
                                      Faturas LEFT OUTER JOIN
                                      TitulosReceber ON Faturas.IdFatura = TitulosReceber.IdFatura ON VendasHoteis.IdFatura = Faturas.IdFatura ON entidades_2.IdEntidade = VendasHoteis.IdEmissor ON Moeda.IdMoeda = VendasHoteis.IdMoeda ON 
                                      entidades_1.IdEntidade = VendasHoteis.IdVendedor LEFT OUTER JOIN
                                      Filiais ON VendasHoteis.IdFilial = Filiais.IdFilial LEFT OUTER JOIN
                                      Entidades INNER JOIN
                                      ItensVendaHotel ON Entidades.IdEntidade = ItensVendaHotel.IdFornecedor INNER JOIN
                                      Entidades AS Entidades_4 ON ItensVendaHotel.IdOperadora = Entidades_4.IdEntidade ON VendasHoteis.IdVenda = ItensVendaHotel.IdVenda LEFT OUTER JOIN
                                      FormaPagamento ON VendasHoteis.IdFormaPagamento = FormaPagamento.IdFormaPagamento LEFT OUTER JOIN
                                      RecibosReceber ON VendasHoteis.IdReciboReceber = RecibosReceber.IdRecibo LEFT OUTER JOIN
                                      TitulosReceber AS TitulosReceber_1 ON VendasHoteis.IdVenda = TitulosReceber_1.IdVendaHotel LEFT OUTER JOIN
                                      Grupos ON VendasHoteis.IdGrupo = Grupos.Id
              ${whereClause}  ${whereClauseAux} ${groupClause} 
              
              UNION

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
            entidades_3.nome AS entidade,
            formapagamento.nome AS pagamento,
            entidades_1.nome AS vendedor,
            entidades_2.nome AS emissor,
            recibosreceber.id AS recibo, 
            faturas.id AS fatura, 
            ISNULL(titulosreceber.valorpago,0) AS valorpago
              FROM            Entidades AS entidades_1 RIGHT OUTER JOIN
                                      Entidades AS entidades_2 RIGHT OUTER JOIN
                                      Moeda RIGHT OUTER JOIN
                                      TitulosReceber RIGHT OUTER JOIN
                                      Faturas INNER JOIN
                                      VendasHoteis INNER JOIN
                                      Entidades AS Entidades_3 ON VendasHoteis.IdEntidade = Entidades_3.IdEntidade ON Faturas.IdFatura = VendasHoteis.IdFatura ON TitulosReceber.IdFatura = Faturas.IdFatura ON Moeda.IdMoeda = VendasHoteis.IdMoeda ON 
                                      entidades_2.IdEntidade = VendasHoteis.IdEmissor ON entidades_1.IdEntidade = VendasHoteis.IdVendedor LEFT OUTER JOIN
                                      Filiais ON VendasHoteis.IdFilial = Filiais.IdFilial LEFT OUTER JOIN
                                      Entidades INNER JOIN
                                      ItensVendaHotel ON Entidades.IdEntidade = ItensVendaHotel.IdFornecedor INNER JOIN
                                      Entidades AS Entidades_4 ON ItensVendaHotel.IdOperadora = Entidades_4.IdEntidade ON VendasHoteis.IdVenda = ItensVendaHotel.IdVenda LEFT OUTER JOIN
                                      FormaPagamento ON VendasHoteis.IdFormaPagamento = FormaPagamento.IdFormaPagamento LEFT OUTER JOIN
                                      RecibosReceber ON VendasHoteis.IdReciboReceber = RecibosReceber.IdRecibo LEFT OUTER JOIN
                                      Grupos ON VendasHoteis.IdGrupo = Grupos.Id
                  ${whereClause}  ${groupClause} ${orderClause}

    `
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

const updateVendasHotel = async (req, res) => {
  try {
   // console.log("=== INICIANDO updateVendasHotel ===");

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
      valorentrada,
      idplanoconta,
      idtitulo,
      idplanocontafor,
      idformapagamentofor,
      idempresa
    } = req.body;

    const dataVendaNorm = normalizeDate(datavenda);
    const dataVencimentoNorm = normalizeDate(datavencimento);

    const pool = await poolPromise;

    // ==========================================================
    // UPDATE PRINCIPAL
    // ==========================================================
    const updateResult = await pool
      .request()
      .input("idvenda", req.params.idvenda)
      .input("datavenda", dataVendaNorm)
      .input("datavencimento", dataVencimentoNorm)
      .input("documento", documento)
      .input("valortotal", valortotal)
      .input("descontototal", descontototal)
      .input("valortaxatotal", valortaxatotal)
      .input("valoroutrostotal", valoroutrostotal)
      .input("valordutotal", valordutotal)
      .input("valorcomissaototal", valorcomissaototal)
      .input("valorfornecedortotal", valorfornecedortotal)
      .input("cartao_sigla", cartao_sigla)
      .input("cartao_numero", cartao_numero)
      .input("cartao_mesvencimento", cartao_mesvencimento)
      .input("cartao_anovencimento", cartao_anovencimento)
      .input("observacao", observacao)
      .input("solicitante", solicitante)
      .input("identidade", identidade)
      .input("idvendedor", idvendedor)
      .input("idemissor", idemissor)
      .input("idmoeda", idmoeda)
      .input("idformapagamento", idformapagamento)
      .input("idfilial", idfilial)
      .input("idfatura", idfatura)
      .input("idreciboreceber", idreciboreceber)
      .input("chave", chave)
      .input("excluido", excluido)
      .input("empresa", empresa)
      .input("idcentrocusto", idcentrocusto)
      .input("idgrupo", idgrupo)
      .input("id", id)
      .input("valorentrada", valorentrada)
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

    //console.log("UPDATE OK:", updateResult.rowsAffected);

    // ==========================================================
    // DELETE DOS TÍTULOS RECEBER
    // ==========================================================
    await pool
      .request()
      .input("idvenda", req.params.idvenda)
      .query("DELETE FROM titulosreceber WHERE idvendahotel = @idvenda");

    // ==========================================================
    // INSERT TITULOS RECEBER
    // ==========================================================
    if (Number(idtitulo) > 0) {
      const insertResult = await pool
        .request()
        .input("dataemissao", dataVendaNorm)
        .input("datavencimento", dataVencimentoNorm)
        .input("datacompetencia", dataVendaNorm)
        .input("descricao", "Venda Serviço " + id)
        .input("documento", id)
        .input("valor", valortotal)
        .input("valorpago", 0)
        .input("descontopago", 0)
        .input("juropago", 0)
        .input("parcela", 1)
        .input("identidade", identidade)
        .input("idmoeda", idmoeda)
        .input("idformapagamento", idformapagamento)
        .input("idplanoconta", idplanoconta)
        .input("idfilial", idfilial)
        .input("chave", chave)
        .input("empresa", empresa)
        .input("id", idtitulo)
        .input("idvendahotel", req.params.idvenda)
        .query(`
          INSERT INTO titulosreceber (
            dataemissao, datavencimento, datacompetencia, descricao,
            documento, valor, valorpago, descontopago, juropago, parcela,
            identidade, idmoeda, idformapagamento, idplanoconta,
            idfilial, chave, empresa, id, idvendahotel
          )
          OUTPUT INSERTED.idtitulo
          VALUES (
            @dataemissao, @datavencimento, @datacompetencia, @descricao,
            @documento, @valor, @valorpago, @descontopago, @juropago, @parcela,
            @identidade, @idmoeda, @idformapagamento, @idplanoconta,
            @idfilial, @chave, @empresa, @id, @idvendahotel
          )
        `);

      //console.log("INSERT TITULO RECEBER:", insertResult.recordset);
    }

    // ==========================================================
    // DELETE DOS TÍTULOS PAGAR
    // ==========================================================
    await pool
      .request()
      .input("idvenda", req.params.idvenda)
      .query("DELETE FROM titulospagar WHERE idvendahotel = @idvenda");

    // ================================================================
    // TITULOS PAGAR - POR FORNECEDOR
    // ================================================================
    if (Number(idplanocontafor) > 0 && Number(idformapagamentofor) > 0) {
      const consresultPag = await pool
        .request()
        .input("idvenda", req.params.idvenda)
        .query(`
          SELECT idfornecedor, SUM(ISNULL(ValorFornecedor,0)) AS valor
          FROM ItensVendaHotel
          WHERE ISNULL(ValorFornecedor,0) > 0
            AND idvenda = @idvenda
          GROUP BY idfornecedor
        `);

      for (const fornecedor of consresultPag.recordset) {
        //console.log(idempresa);
        const novoTitulo = await incTituloPag(idempresa); // <-- AGORA FUNCIONA
        //console.log(novoTitulo);

        await pool
          .request()
          .input("dataemissao", dataVendaNorm)
          .input("datavencimento", dataVencimentoNorm)
          .input("datacompetencia", dataVendaNorm)
          .input("descricao", "Venda Serviço " + id)
          .input("documento", id)
          .input("valor", fornecedor.valor)
          .input("valorpago", 0)
          .input("descontopago", 0)
          .input("juropago", 0)
          .input("parcela", 1)
          .input("identidade", fornecedor.idfornecedor)
          .input("idmoeda", idmoeda)
          .input("idformapagamento", idformapagamentofor)
          .input("idplanoconta", idplanocontafor)
          .input("idfilial", idfilial)
          .input("chave", chave)
          .input("empresa", empresa)
          .input("id", novoTitulo)
          .input("idvendahotel", req.params.idvenda)
          .query(`
            INSERT INTO titulospagar (
              dataemissao, datavencimento, datacompetencia,
              descricao, documento, valor, valorpago, descontopago,
              juropago, parcela, identidade, idmoeda,
              idformapagamento, idplanoconta, idfilial,
              chave, empresa, id, idvendahotel
            )
            VALUES (
              @dataemissao, @datavencimento, @datacompetencia,
              @descricao, @documento, @valor, @valorpago, @descontopago,
              @juropago, @parcela, @identidade, @idmoeda,
              @idformapagamento, @idplanoconta, @idfilial,
              @chave, @empresa, @id, @idvendahotel
            )
          `);
      }
    }
    //console.log("UPDATE OK:", updateResult.rowsAffected);

    res.json({ success: true, message: "Venda atualizada com sucesso" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ====================================================================
// FUNÇÃO incTituloPag (NÃO É API!)
// ====================================================================
async function incTituloPag(idempresa) {
  const pool = await poolPromise;
  let atualizado = false;
  let valorAtualizado = 0;

  while (!atualizado) {
    const transaction = new sql.Transaction(pool);
    try {
      await transaction.begin();
      const request = new sql.Request(transaction);

      const coluna = `id_${idempresa}`;

      const check = await request
        .input("coluna", sql.NVarChar, coluna)
        .query(`
          SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
          WHERE TABLE_NAME = 'IncTituloPag' AND COLUMN_NAME = @coluna
        `);

      if (check.recordset.length === 0) {
        await request.batch(`ALTER TABLE IncTituloPag ADD ${coluna} INT DEFAULT 1`);
      } else {
       // await request.batch(`UPDATE IncTituloPag SET ${coluna} = ${coluna} + 1`);
        await request.batch(`UPDATE IncTituloPag SET ${coluna} = ISNULL(${coluna}, 0) + 1`);
      }

      await transaction.commit();
      atualizado = true;

      const res2 = await pool.request().query(`SELECT ${coluna} AS valor FROM IncTituloPag`);
      valorAtualizado = res2.recordset[0].valor;

    } catch (err) {
      await transaction.rollback();
      console.error("Erro incTituloPag, tentando novamente...", err);
      //console.log("Erro incTituloPag, tentando novamente...", err);
      await new Promise(r => setTimeout(r, 300));
    }
  }

  return valorAtualizado;
}

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
      servicoinicial, servicofinal, faturainicial, faturafinal, pax, tipo, idoperadora,
      tituloinicial, titulofinal
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
    let whereClauseAux = ' AND IsNull(Faturas.IdFatura,0) = 0 ';
    let orderClause = '';


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

    if (tituloinicial) {
      request.input('tituloinicial', tituloinicial);
      whereClause += ' AND titulosreceber.id >= @tituloinicial';
    }
    
    if (titulofinal) {
      request.input('titulofinal', titulofinal);
      whereClause += ' AND titulosreceber.id <= @titulofinal';
    }

    if (idoperadora) {
      request.input('idoperadora', idoperadora);
      whereClause += ' AND ItensVendaHotel.idoperadora = @idoperadora';
    }

    if(tipo == 'Cliente')
        orderClause += ' ORDER BY 3, 5, 2 '
    else
    if(tipo == 'Emissao')
      orderClause += ' ORDER BY 5, 3, 2 '
    else
    if(tipo == 'Vencimento')
      orderClause += ' ORDER BY 6, 3, 2 '
    else
    if(tipo == 'Emissor')
      orderClause += ' ORDER BY 12, 5, 2 '
    else
    if(tipo == 'Vendedor')
      orderClause += ' ORDER BY 11, 5, 2 '
    else
    if(tipo == 'Operadora')
      orderClause += ' ORDER BY 9, 5, 2 ';

    const query =
     `
          SELECT        ItensVendaHotel.id, 
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
                        isnull(ItensVendaHotel.valoroutros,0) AS valoroutros,
                        isnull(TitulosReceber.id,0) AS idtitulo
          FROM            Entidades AS entidades_1 RIGHT OUTER JOIN
                                  Moeda RIGHT OUTER JOIN
                                  Entidades AS entidades_2 RIGHT OUTER JOIN
                                  VendasHoteis INNER JOIN
                                  Entidades AS Entidades_3 ON VendasHoteis.IdEntidade = Entidades_3.IdEntidade LEFT OUTER JOIN
                                  Faturas LEFT OUTER JOIN
                                  TitulosReceber ON Faturas.IdFatura = TitulosReceber.IdFatura ON VendasHoteis.IdFatura = Faturas.IdFatura ON entidades_2.IdEntidade = VendasHoteis.IdEmissor ON Moeda.IdMoeda = VendasHoteis.IdMoeda ON 
                                  entidades_1.IdEntidade = VendasHoteis.IdVendedor LEFT OUTER JOIN
                                  Filiais ON VendasHoteis.IdFilial = Filiais.IdFilial LEFT OUTER JOIN
                                  Entidades INNER JOIN
                                  ItensVendaHotel ON Entidades.IdEntidade = ItensVendaHotel.IdFornecedor INNER JOIN
                                  Entidades AS Entidades_4 ON ItensVendaHotel.IdOperadora = Entidades_4.IdEntidade ON VendasHoteis.IdVenda = ItensVendaHotel.IdVenda LEFT OUTER JOIN
                                  FormaPagamento ON VendasHoteis.IdFormaPagamento = FormaPagamento.IdFormaPagamento LEFT OUTER JOIN
                                  RecibosReceber ON VendasHoteis.IdReciboReceber = RecibosReceber.IdRecibo LEFT OUTER JOIN
                                  TitulosReceber AS TitulosReceber_1 ON VendasHoteis.IdVenda = TitulosReceber_1.IdVendaHotel LEFT OUTER JOIN
                                  Grupos ON VendasHoteis.IdGrupo = Grupos.Id
          ${whereClause}  ${whereClauseAux} 
          
          UNION

          SELECT        ItensVendaHotel.Id, 
                        VendasHoteis.Id AS idvenda, 
                        Entidades_3.Nome AS entidade, 
                        FormaPagamento.Nome AS pagamento, 
                        VendasHoteis.DataVenda AS dataemissao, 
                        VendasHoteis.DataVencimento, 
                        ISNULL(RecibosReceber.Id, 0) AS idrecibo, 
                        ISNULL(Faturas.Id, 0) AS idfatura, 
                        Entidades_4.Nome AS operadora, 
                        Entidades.Nome AS fornecedor, 
                        entidades_1.Nome AS vendedor, 
                        entidades_2.Nome AS emissor, 
                        ItensVendaHotel.Pax, 
                        ISNULL(ItensVendaHotel.Pax, '') + ' ' + ISNULL(ItensVendaHotel.Descricao, '') + ' ' AS descricao, 
                        ISNULL(ItensVendaHotel.ValorHotel, 0) AS valor, 
                        ISNULL(ItensVendaHotel.ValorTaxa, 0) AS valortaxa, 
                        ISNULL(ItensVendaHotel.ValorComissao, 0) AS valorservico, 
                        ISNULL(ItensVendaHotel.ValorOutros, 0) AS valoroutros,
                        isnull(TitulosReceber.id,0) AS idtitulo
          FROM            Entidades AS entidades_1 RIGHT OUTER JOIN
                                  Entidades AS entidades_2 RIGHT OUTER JOIN
                                  Moeda RIGHT OUTER JOIN
                                  TitulosReceber RIGHT OUTER JOIN
                                  Faturas INNER JOIN
                                  VendasHoteis INNER JOIN
                                  Entidades AS Entidades_3 ON VendasHoteis.IdEntidade = Entidades_3.IdEntidade ON Faturas.IdFatura = VendasHoteis.IdFatura ON TitulosReceber.IdFatura = Faturas.IdFatura ON Moeda.IdMoeda = VendasHoteis.IdMoeda ON 
                                  entidades_2.IdEntidade = VendasHoteis.IdEmissor ON entidades_1.IdEntidade = VendasHoteis.IdVendedor LEFT OUTER JOIN
                                  Filiais ON VendasHoteis.IdFilial = Filiais.IdFilial LEFT OUTER JOIN
                                  Entidades INNER JOIN
                                  ItensVendaHotel ON Entidades.IdEntidade = ItensVendaHotel.IdFornecedor INNER JOIN
                                  Entidades AS Entidades_4 ON ItensVendaHotel.IdOperadora = Entidades_4.IdEntidade ON VendasHoteis.IdVenda = ItensVendaHotel.IdVenda LEFT OUTER JOIN
                                  FormaPagamento ON VendasHoteis.IdFormaPagamento = FormaPagamento.IdFormaPagamento LEFT OUTER JOIN
                                  RecibosReceber ON VendasHoteis.IdReciboReceber = RecibosReceber.IdRecibo LEFT OUTER JOIN
                                  Grupos ON VendasHoteis.IdGrupo = Grupos.Id
              ${whereClause} ${orderClause}

      `
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
      servicoinicial, servicofinal, faturainicial, faturafinal, pax, tipo, idoperadora,
      tituloinicial, titulofinal
     } = req.query;
     //console.log('REQUISIÇÃO::', req.query);
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
    let whereClauseAux = ' AND IsNull(Faturas.IdFatura,0) = 0 ';
    let orderClause = '';
    let groupClause = '';

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

    if (tituloinicial) {
      request.input('tituloinicial', tituloinicial);
      whereClause += ' AND titulosreceber.id >= @tituloinicial';
    }
    
    if (titulofinal) {
      request.input('titulofinal', titulofinal);
      whereClause += ' AND titulosreceber.id <= @titulofinal';
    }

    if (idoperadora) {
      request.input('idoperadora', idoperadora);
      whereClause += ' AND ItensVendaHotel.idoperadora = @idoperadora';
    }
//console.log('01::');
    if(tipo == 'Cliente'){
    groupClause +=  ' GROUP BY  ' +
                    '		Entidades_3.nome  ';
    }else    
    if(tipo == 'Emissao'){
    groupClause +=  ' GROUP BY  ' +
                    '		vendashoteis.datavenda  ';
    }else    
    if(tipo == 'Vencimento'){
    groupClause +=  ' GROUP BY  ' +
                    '		vendashoteis.datavencimento  ';
    }else    
    if(tipo == 'Vendedor'){
    groupClause +=  ' GROUP BY  ' +
                    '		Entidades_1.nome  ';
    }else    
    if(tipo == 'Emissor'){
    groupClause +=  ' GROUP BY  ' +
                    '		Entidades_2.nome  ';
    }else    
    if(tipo == 'Operadora'){
    groupClause +=  ' GROUP BY  ' +
                    '		Entidades_4.nome  ';
    }else{
    groupClause +=  ' GROUP BY vendashoteis.id, ' +
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
//console.log('02::');
    if(tipo == 'Cliente')
        orderClause += ' ORDER BY 1 '
    else
    if(tipo == 'Emissao')
      orderClause += ' ORDER BY 1 '
    else
    if(tipo == 'Vencimento')
      orderClause += ' ORDER BY 1 '
    else
    if(tipo == 'Emissor')
      orderClause += ' ORDER BY 1 '
    else
    if(tipo == 'Vendedor')
      orderClause += ' ORDER BY 1 '
    else
    if(tipo == 'Operadora')
      orderClause += ' ORDER BY 1 ';
//console.log('03::');
    let query = '';

    if(tipo == 'Cliente'){
  //    console.log('04::');
     query =
     `
        SELECT      
                      Entidades_3.nome AS entidade, 
                      SUM(ISNULL(titulosreceber.valorpago,0)) AS valorpago,
                      SUM(ISNULL(ItensVendaHotel.ValorHotel,0)) as valor,
                      SUM(ISNULL(ItensVendaHotel.ValorTaxa,0)) as valortaxa,
                      SUM(ISNULL(ItensVendaHotel.ValorComissao,0)) as valorservico,
                      SUM(ISNULL(ItensVendaHotel.Valoroutros,0)) as valoroutros		
              FROM            Entidades AS entidades_1 RIGHT OUTER JOIN
                                      Moeda RIGHT OUTER JOIN
                                      Entidades AS entidades_2 RIGHT OUTER JOIN
                                      VendasHoteis INNER JOIN
                                      Entidades AS Entidades_3 ON VendasHoteis.IdEntidade = Entidades_3.IdEntidade LEFT OUTER JOIN
                                      Faturas LEFT OUTER JOIN
                                      TitulosReceber ON Faturas.IdFatura = TitulosReceber.IdFatura ON VendasHoteis.IdFatura = Faturas.IdFatura ON entidades_2.IdEntidade = VendasHoteis.IdEmissor ON Moeda.IdMoeda = VendasHoteis.IdMoeda ON 
                                      entidades_1.IdEntidade = VendasHoteis.IdVendedor LEFT OUTER JOIN
                                      Filiais ON VendasHoteis.IdFilial = Filiais.IdFilial LEFT OUTER JOIN
                                      Entidades INNER JOIN
                                      ItensVendaHotel ON Entidades.IdEntidade = ItensVendaHotel.IdFornecedor INNER JOIN
                                      Entidades AS Entidades_4 ON ItensVendaHotel.IdOperadora = Entidades_4.IdEntidade ON VendasHoteis.IdVenda = ItensVendaHotel.IdVenda LEFT OUTER JOIN
                                      FormaPagamento ON VendasHoteis.IdFormaPagamento = FormaPagamento.IdFormaPagamento LEFT OUTER JOIN
                                      RecibosReceber ON VendasHoteis.IdReciboReceber = RecibosReceber.IdRecibo LEFT OUTER JOIN
                                      TitulosReceber AS TitulosReceber_1 ON VendasHoteis.IdVenda = TitulosReceber_1.IdVendaHotel LEFT OUTER JOIN
                                      Grupos ON VendasHoteis.IdGrupo = Grupos.Id
              ${whereClause}  ${whereClauseAux} ${groupClause} 
              
              UNION

        SELECT      
                      Entidades_3.nome AS entidade, 
                      SUM(ISNULL(titulosreceber.valorpago,0)) AS valorpago,
                      SUM(ISNULL(ItensVendaHotel.ValorHotel,0)) as valor,
                      SUM(ISNULL(ItensVendaHotel.ValorTaxa,0)) as valortaxa,
                      SUM(ISNULL(ItensVendaHotel.ValorComissao,0)) as valorservico,
                      SUM(ISNULL(ItensVendaHotel.Valoroutros,0)) as valoroutros		
              FROM            Entidades AS entidades_1 RIGHT OUTER JOIN
                                      Entidades AS entidades_2 RIGHT OUTER JOIN
                                      Moeda RIGHT OUTER JOIN
                                      TitulosReceber RIGHT OUTER JOIN
                                      Faturas INNER JOIN
                                      VendasHoteis INNER JOIN
                                      Entidades AS Entidades_3 ON VendasHoteis.IdEntidade = Entidades_3.IdEntidade ON Faturas.IdFatura = VendasHoteis.IdFatura ON TitulosReceber.IdFatura = Faturas.IdFatura ON Moeda.IdMoeda = VendasHoteis.IdMoeda ON 
                                      entidades_2.IdEntidade = VendasHoteis.IdEmissor ON entidades_1.IdEntidade = VendasHoteis.IdVendedor LEFT OUTER JOIN
                                      Filiais ON VendasHoteis.IdFilial = Filiais.IdFilial LEFT OUTER JOIN
                                      Entidades INNER JOIN
                                      ItensVendaHotel ON Entidades.IdEntidade = ItensVendaHotel.IdFornecedor INNER JOIN
                                      Entidades AS Entidades_4 ON ItensVendaHotel.IdOperadora = Entidades_4.IdEntidade ON VendasHoteis.IdVenda = ItensVendaHotel.IdVenda LEFT OUTER JOIN
                                      FormaPagamento ON VendasHoteis.IdFormaPagamento = FormaPagamento.IdFormaPagamento LEFT OUTER JOIN
                                      RecibosReceber ON VendasHoteis.IdReciboReceber = RecibosReceber.IdRecibo LEFT OUTER JOIN
                                      Grupos ON VendasHoteis.IdGrupo = Grupos.Id
                  ${whereClause}  ${groupClause} ${orderClause} 

        `
    }else    
    if(tipo == 'Emissao'){
     query =
     `
        SELECT      
                  vendashoteis.datavenda AS dataemissao, 
                      SUM(ISNULL(titulosreceber.valorpago,0)) AS valorpago,
                      SUM(ISNULL(ItensVendaHotel.ValorHotel,0)) as valor,
                      SUM(ISNULL(ItensVendaHotel.ValorTaxa,0)) as valortaxa,
                      SUM(ISNULL(ItensVendaHotel.ValorComissao,0)) as valorservico,
                      SUM(ISNULL(ItensVendaHotel.Valoroutros,0)) as valoroutros		
              FROM            Entidades AS entidades_1 RIGHT OUTER JOIN
                                      Moeda RIGHT OUTER JOIN
                                      Entidades AS entidades_2 RIGHT OUTER JOIN
                                      VendasHoteis INNER JOIN
                                      Entidades AS Entidades_3 ON VendasHoteis.IdEntidade = Entidades_3.IdEntidade LEFT OUTER JOIN
                                      Faturas LEFT OUTER JOIN
                                      TitulosReceber ON Faturas.IdFatura = TitulosReceber.IdFatura ON VendasHoteis.IdFatura = Faturas.IdFatura ON entidades_2.IdEntidade = VendasHoteis.IdEmissor ON Moeda.IdMoeda = VendasHoteis.IdMoeda ON 
                                      entidades_1.IdEntidade = VendasHoteis.IdVendedor LEFT OUTER JOIN
                                      Filiais ON VendasHoteis.IdFilial = Filiais.IdFilial LEFT OUTER JOIN
                                      Entidades INNER JOIN
                                      ItensVendaHotel ON Entidades.IdEntidade = ItensVendaHotel.IdFornecedor INNER JOIN
                                      Entidades AS Entidades_4 ON ItensVendaHotel.IdOperadora = Entidades_4.IdEntidade ON VendasHoteis.IdVenda = ItensVendaHotel.IdVenda LEFT OUTER JOIN
                                      FormaPagamento ON VendasHoteis.IdFormaPagamento = FormaPagamento.IdFormaPagamento LEFT OUTER JOIN
                                      RecibosReceber ON VendasHoteis.IdReciboReceber = RecibosReceber.IdRecibo LEFT OUTER JOIN
                                      TitulosReceber AS TitulosReceber_1 ON VendasHoteis.IdVenda = TitulosReceber_1.IdVendaHotel LEFT OUTER JOIN
                                      Grupos ON VendasHoteis.IdGrupo = Grupos.Id
              ${whereClause}  ${whereClauseAux} ${groupClause} 
              
              UNION

        SELECT      
                  vendashoteis.datavenda AS dataemissao, 
                      SUM(ISNULL(titulosreceber.valorpago,0)) AS valorpago,
                      SUM(ISNULL(ItensVendaHotel.ValorHotel,0)) as valor,
                      SUM(ISNULL(ItensVendaHotel.ValorTaxa,0)) as valortaxa,
                      SUM(ISNULL(ItensVendaHotel.ValorComissao,0)) as valorservico,
                      SUM(ISNULL(ItensVendaHotel.Valoroutros,0)) as valoroutros		
              FROM            Entidades AS entidades_1 RIGHT OUTER JOIN
                                      Entidades AS entidades_2 RIGHT OUTER JOIN
                                      Moeda RIGHT OUTER JOIN
                                      TitulosReceber RIGHT OUTER JOIN
                                      Faturas INNER JOIN
                                      VendasHoteis INNER JOIN
                                      Entidades AS Entidades_3 ON VendasHoteis.IdEntidade = Entidades_3.IdEntidade ON Faturas.IdFatura = VendasHoteis.IdFatura ON TitulosReceber.IdFatura = Faturas.IdFatura ON Moeda.IdMoeda = VendasHoteis.IdMoeda ON 
                                      entidades_2.IdEntidade = VendasHoteis.IdEmissor ON entidades_1.IdEntidade = VendasHoteis.IdVendedor LEFT OUTER JOIN
                                      Filiais ON VendasHoteis.IdFilial = Filiais.IdFilial LEFT OUTER JOIN
                                      Entidades INNER JOIN
                                      ItensVendaHotel ON Entidades.IdEntidade = ItensVendaHotel.IdFornecedor INNER JOIN
                                      Entidades AS Entidades_4 ON ItensVendaHotel.IdOperadora = Entidades_4.IdEntidade ON VendasHoteis.IdVenda = ItensVendaHotel.IdVenda LEFT OUTER JOIN
                                      FormaPagamento ON VendasHoteis.IdFormaPagamento = FormaPagamento.IdFormaPagamento LEFT OUTER JOIN
                                      RecibosReceber ON VendasHoteis.IdReciboReceber = RecibosReceber.IdRecibo LEFT OUTER JOIN
                                      Grupos ON VendasHoteis.IdGrupo = Grupos.Id
                  ${whereClause}  ${groupClause} ${orderClause}

        
        `
    }else    
    if(tipo == 'Vencimento'){
     query =
     `
      
        SELECT      
                  vendashoteis.datavencimento, 
                      SUM(ISNULL(titulosreceber.valorpago,0)) AS valorpago,
                      SUM(ISNULL(ItensVendaHotel.ValorHotel,0)) as valor,
                      SUM(ISNULL(ItensVendaHotel.ValorTaxa,0)) as valortaxa,
                      SUM(ISNULL(ItensVendaHotel.ValorComissao,0)) as valorservico,
                      SUM(ISNULL(ItensVendaHotel.Valoroutros,0)) as valoroutros		
              FROM            Entidades AS entidades_1 RIGHT OUTER JOIN
                                      Moeda RIGHT OUTER JOIN
                                      Entidades AS entidades_2 RIGHT OUTER JOIN
                                      VendasHoteis INNER JOIN
                                      Entidades AS Entidades_3 ON VendasHoteis.IdEntidade = Entidades_3.IdEntidade LEFT OUTER JOIN
                                      Faturas LEFT OUTER JOIN
                                      TitulosReceber ON Faturas.IdFatura = TitulosReceber.IdFatura ON VendasHoteis.IdFatura = Faturas.IdFatura ON entidades_2.IdEntidade = VendasHoteis.IdEmissor ON Moeda.IdMoeda = VendasHoteis.IdMoeda ON 
                                      entidades_1.IdEntidade = VendasHoteis.IdVendedor LEFT OUTER JOIN
                                      Filiais ON VendasHoteis.IdFilial = Filiais.IdFilial LEFT OUTER JOIN
                                      Entidades INNER JOIN
                                      ItensVendaHotel ON Entidades.IdEntidade = ItensVendaHotel.IdFornecedor INNER JOIN
                                      Entidades AS Entidades_4 ON ItensVendaHotel.IdOperadora = Entidades_4.IdEntidade ON VendasHoteis.IdVenda = ItensVendaHotel.IdVenda LEFT OUTER JOIN
                                      FormaPagamento ON VendasHoteis.IdFormaPagamento = FormaPagamento.IdFormaPagamento LEFT OUTER JOIN
                                      RecibosReceber ON VendasHoteis.IdReciboReceber = RecibosReceber.IdRecibo LEFT OUTER JOIN
                                      TitulosReceber AS TitulosReceber_1 ON VendasHoteis.IdVenda = TitulosReceber_1.IdVendaHotel LEFT OUTER JOIN
                                      Grupos ON VendasHoteis.IdGrupo = Grupos.Id
              ${whereClause}  ${whereClauseAux} ${groupClause} 
              
              UNION

        SELECT      
                  vendashoteis.datavencimento, 
                      SUM(ISNULL(titulosreceber.valorpago,0)) AS valorpago,
                      SUM(ISNULL(ItensVendaHotel.ValorHotel,0)) as valor,
                      SUM(ISNULL(ItensVendaHotel.ValorTaxa,0)) as valortaxa,
                      SUM(ISNULL(ItensVendaHotel.ValorComissao,0)) as valorservico,
                      SUM(ISNULL(ItensVendaHotel.Valoroutros,0)) as valoroutros		
              FROM            Entidades AS entidades_1 RIGHT OUTER JOIN
                                      Entidades AS entidades_2 RIGHT OUTER JOIN
                                      Moeda RIGHT OUTER JOIN
                                      TitulosReceber RIGHT OUTER JOIN
                                      Faturas INNER JOIN
                                      VendasHoteis INNER JOIN
                                      Entidades AS Entidades_3 ON VendasHoteis.IdEntidade = Entidades_3.IdEntidade ON Faturas.IdFatura = VendasHoteis.IdFatura ON TitulosReceber.IdFatura = Faturas.IdFatura ON Moeda.IdMoeda = VendasHoteis.IdMoeda ON 
                                      entidades_2.IdEntidade = VendasHoteis.IdEmissor ON entidades_1.IdEntidade = VendasHoteis.IdVendedor LEFT OUTER JOIN
                                      Filiais ON VendasHoteis.IdFilial = Filiais.IdFilial LEFT OUTER JOIN
                                      Entidades INNER JOIN
                                      ItensVendaHotel ON Entidades.IdEntidade = ItensVendaHotel.IdFornecedor INNER JOIN
                                      Entidades AS Entidades_4 ON ItensVendaHotel.IdOperadora = Entidades_4.IdEntidade ON VendasHoteis.IdVenda = ItensVendaHotel.IdVenda LEFT OUTER JOIN
                                      FormaPagamento ON VendasHoteis.IdFormaPagamento = FormaPagamento.IdFormaPagamento LEFT OUTER JOIN
                                      RecibosReceber ON VendasHoteis.IdReciboReceber = RecibosReceber.IdRecibo LEFT OUTER JOIN
                                      Grupos ON VendasHoteis.IdGrupo = Grupos.Id
                  ${whereClause}  ${groupClause} ${orderClause}

        `
    }else    
    if(tipo == 'Vendedor'){
     query =
     `
        SELECT      
                  entidades_1.nome AS vendedor, 
                      SUM(ISNULL(titulosreceber.valorpago,0)) AS valorpago,
                      SUM(ISNULL(ItensVendaHotel.ValorHotel,0)) as valor,
                      SUM(ISNULL(ItensVendaHotel.ValorTaxa,0)) as valortaxa,
                      SUM(ISNULL(ItensVendaHotel.ValorComissao,0)) as valorservico,
                      SUM(ISNULL(ItensVendaHotel.Valoroutros,0)) as valoroutros		
              FROM            Entidades AS entidades_1 RIGHT OUTER JOIN
                                      Moeda RIGHT OUTER JOIN
                                      Entidades AS entidades_2 RIGHT OUTER JOIN
                                      VendasHoteis INNER JOIN
                                      Entidades AS Entidades_3 ON VendasHoteis.IdEntidade = Entidades_3.IdEntidade LEFT OUTER JOIN
                                      Faturas LEFT OUTER JOIN
                                      TitulosReceber ON Faturas.IdFatura = TitulosReceber.IdFatura ON VendasHoteis.IdFatura = Faturas.IdFatura ON entidades_2.IdEntidade = VendasHoteis.IdEmissor ON Moeda.IdMoeda = VendasHoteis.IdMoeda ON 
                                      entidades_1.IdEntidade = VendasHoteis.IdVendedor LEFT OUTER JOIN
                                      Filiais ON VendasHoteis.IdFilial = Filiais.IdFilial LEFT OUTER JOIN
                                      Entidades INNER JOIN
                                      ItensVendaHotel ON Entidades.IdEntidade = ItensVendaHotel.IdFornecedor INNER JOIN
                                      Entidades AS Entidades_4 ON ItensVendaHotel.IdOperadora = Entidades_4.IdEntidade ON VendasHoteis.IdVenda = ItensVendaHotel.IdVenda LEFT OUTER JOIN
                                      FormaPagamento ON VendasHoteis.IdFormaPagamento = FormaPagamento.IdFormaPagamento LEFT OUTER JOIN
                                      RecibosReceber ON VendasHoteis.IdReciboReceber = RecibosReceber.IdRecibo LEFT OUTER JOIN
                                      TitulosReceber AS TitulosReceber_1 ON VendasHoteis.IdVenda = TitulosReceber_1.IdVendaHotel LEFT OUTER JOIN
                                      Grupos ON VendasHoteis.IdGrupo = Grupos.Id
              ${whereClause}  ${whereClauseAux} ${groupClause} 
              
              UNION

        SELECT      
                  entidades_1.nome AS vendedor, 
                      SUM(ISNULL(titulosreceber.valorpago,0)) AS valorpago,
                      SUM(ISNULL(ItensVendaHotel.ValorHotel,0)) as valor,
                      SUM(ISNULL(ItensVendaHotel.ValorTaxa,0)) as valortaxa,
                      SUM(ISNULL(ItensVendaHotel.ValorComissao,0)) as valorservico,
                      SUM(ISNULL(ItensVendaHotel.Valoroutros,0)) as valoroutros		
              FROM            Entidades AS entidades_1 RIGHT OUTER JOIN
                                      Entidades AS entidades_2 RIGHT OUTER JOIN
                                      Moeda RIGHT OUTER JOIN
                                      TitulosReceber RIGHT OUTER JOIN
                                      Faturas INNER JOIN
                                      VendasHoteis INNER JOIN
                                      Entidades AS Entidades_3 ON VendasHoteis.IdEntidade = Entidades_3.IdEntidade ON Faturas.IdFatura = VendasHoteis.IdFatura ON TitulosReceber.IdFatura = Faturas.IdFatura ON Moeda.IdMoeda = VendasHoteis.IdMoeda ON 
                                      entidades_2.IdEntidade = VendasHoteis.IdEmissor ON entidades_1.IdEntidade = VendasHoteis.IdVendedor LEFT OUTER JOIN
                                      Filiais ON VendasHoteis.IdFilial = Filiais.IdFilial LEFT OUTER JOIN
                                      Entidades INNER JOIN
                                      ItensVendaHotel ON Entidades.IdEntidade = ItensVendaHotel.IdFornecedor INNER JOIN
                                      Entidades AS Entidades_4 ON ItensVendaHotel.IdOperadora = Entidades_4.IdEntidade ON VendasHoteis.IdVenda = ItensVendaHotel.IdVenda LEFT OUTER JOIN
                                      FormaPagamento ON VendasHoteis.IdFormaPagamento = FormaPagamento.IdFormaPagamento LEFT OUTER JOIN
                                      RecibosReceber ON VendasHoteis.IdReciboReceber = RecibosReceber.IdRecibo LEFT OUTER JOIN
                                      Grupos ON VendasHoteis.IdGrupo = Grupos.Id
                  ${whereClause}  ${groupClause} ${orderClause}

        `
    }else    
    if(tipo == 'Emissor'){
     query =
     `
        SELECT      
                  entidades_2.nome AS emissor, 
                      SUM(ISNULL(titulosreceber.valorpago,0)) AS valorpago,
                      SUM(ISNULL(ItensVendaHotel.ValorHotel,0)) as valor,
                      SUM(ISNULL(ItensVendaHotel.ValorTaxa,0)) as valortaxa,
                      SUM(ISNULL(ItensVendaHotel.ValorComissao,0)) as valorservico,
                      SUM(ISNULL(ItensVendaHotel.Valoroutros,0)) as valoroutros		
              FROM            Entidades AS entidades_1 RIGHT OUTER JOIN
                                      Moeda RIGHT OUTER JOIN
                                      Entidades AS entidades_2 RIGHT OUTER JOIN
                                      VendasHoteis INNER JOIN
                                      Entidades AS Entidades_3 ON VendasHoteis.IdEntidade = Entidades_3.IdEntidade LEFT OUTER JOIN
                                      Faturas LEFT OUTER JOIN
                                      TitulosReceber ON Faturas.IdFatura = TitulosReceber.IdFatura ON VendasHoteis.IdFatura = Faturas.IdFatura ON entidades_2.IdEntidade = VendasHoteis.IdEmissor ON Moeda.IdMoeda = VendasHoteis.IdMoeda ON 
                                      entidades_1.IdEntidade = VendasHoteis.IdVendedor LEFT OUTER JOIN
                                      Filiais ON VendasHoteis.IdFilial = Filiais.IdFilial LEFT OUTER JOIN
                                      Entidades INNER JOIN
                                      ItensVendaHotel ON Entidades.IdEntidade = ItensVendaHotel.IdFornecedor INNER JOIN
                                      Entidades AS Entidades_4 ON ItensVendaHotel.IdOperadora = Entidades_4.IdEntidade ON VendasHoteis.IdVenda = ItensVendaHotel.IdVenda LEFT OUTER JOIN
                                      FormaPagamento ON VendasHoteis.IdFormaPagamento = FormaPagamento.IdFormaPagamento LEFT OUTER JOIN
                                      RecibosReceber ON VendasHoteis.IdReciboReceber = RecibosReceber.IdRecibo LEFT OUTER JOIN
                                      TitulosReceber AS TitulosReceber_1 ON VendasHoteis.IdVenda = TitulosReceber_1.IdVendaHotel LEFT OUTER JOIN
                                      Grupos ON VendasHoteis.IdGrupo = Grupos.Id
              ${whereClause}  ${whereClauseAux} ${groupClause} 
              
              UNION

        SELECT      
                  entidades_2.nome AS emissor, 
                      SUM(ISNULL(titulosreceber.valorpago,0)) AS valorpago,
                      SUM(ISNULL(ItensVendaHotel.ValorHotel,0)) as valor,
                      SUM(ISNULL(ItensVendaHotel.ValorTaxa,0)) as valortaxa,
                      SUM(ISNULL(ItensVendaHotel.ValorComissao,0)) as valorservico,
                      SUM(ISNULL(ItensVendaHotel.Valoroutros,0)) as valoroutros		
              FROM            Entidades AS entidades_1 RIGHT OUTER JOIN
                                      Entidades AS entidades_2 RIGHT OUTER JOIN
                                      Moeda RIGHT OUTER JOIN
                                      TitulosReceber RIGHT OUTER JOIN
                                      Faturas INNER JOIN
                                      VendasHoteis INNER JOIN
                                      Entidades AS Entidades_3 ON VendasHoteis.IdEntidade = Entidades_3.IdEntidade ON Faturas.IdFatura = VendasHoteis.IdFatura ON TitulosReceber.IdFatura = Faturas.IdFatura ON Moeda.IdMoeda = VendasHoteis.IdMoeda ON 
                                      entidades_2.IdEntidade = VendasHoteis.IdEmissor ON entidades_1.IdEntidade = VendasHoteis.IdVendedor LEFT OUTER JOIN
                                      Filiais ON VendasHoteis.IdFilial = Filiais.IdFilial LEFT OUTER JOIN
                                      Entidades INNER JOIN
                                      ItensVendaHotel ON Entidades.IdEntidade = ItensVendaHotel.IdFornecedor INNER JOIN
                                      Entidades AS Entidades_4 ON ItensVendaHotel.IdOperadora = Entidades_4.IdEntidade ON VendasHoteis.IdVenda = ItensVendaHotel.IdVenda LEFT OUTER JOIN
                                      FormaPagamento ON VendasHoteis.IdFormaPagamento = FormaPagamento.IdFormaPagamento LEFT OUTER JOIN
                                      RecibosReceber ON VendasHoteis.IdReciboReceber = RecibosReceber.IdRecibo LEFT OUTER JOIN
                                      Grupos ON VendasHoteis.IdGrupo = Grupos.Id
                  ${whereClause}  ${groupClause} ${orderClause}

        `
    }else    
    if(tipo == 'Operadora'){
     query =
     `
        SELECT      
                  entidades_4.nome AS operadora,
                      SUM(ISNULL(titulosreceber.valorpago,0)) AS valorpago,
                      SUM(ISNULL(ItensVendaHotel.ValorHotel,0)) as valor,
                      SUM(ISNULL(ItensVendaHotel.ValorTaxa,0)) as valortaxa,
                      SUM(ISNULL(ItensVendaHotel.ValorComissao,0)) as valorservico,
                      SUM(ISNULL(ItensVendaHotel.Valoroutros,0)) as valoroutros		
              FROM            Entidades AS entidades_1 RIGHT OUTER JOIN
                                      Moeda RIGHT OUTER JOIN
                                      Entidades AS entidades_2 RIGHT OUTER JOIN
                                      VendasHoteis INNER JOIN
                                      Entidades AS Entidades_3 ON VendasHoteis.IdEntidade = Entidades_3.IdEntidade LEFT OUTER JOIN
                                      Faturas LEFT OUTER JOIN
                                      TitulosReceber ON Faturas.IdFatura = TitulosReceber.IdFatura ON VendasHoteis.IdFatura = Faturas.IdFatura ON entidades_2.IdEntidade = VendasHoteis.IdEmissor ON Moeda.IdMoeda = VendasHoteis.IdMoeda ON 
                                      entidades_1.IdEntidade = VendasHoteis.IdVendedor LEFT OUTER JOIN
                                      Filiais ON VendasHoteis.IdFilial = Filiais.IdFilial LEFT OUTER JOIN
                                      Entidades INNER JOIN
                                      ItensVendaHotel ON Entidades.IdEntidade = ItensVendaHotel.IdFornecedor INNER JOIN
                                      Entidades AS Entidades_4 ON ItensVendaHotel.IdOperadora = Entidades_4.IdEntidade ON VendasHoteis.IdVenda = ItensVendaHotel.IdVenda LEFT OUTER JOIN
                                      FormaPagamento ON VendasHoteis.IdFormaPagamento = FormaPagamento.IdFormaPagamento LEFT OUTER JOIN
                                      RecibosReceber ON VendasHoteis.IdReciboReceber = RecibosReceber.IdRecibo LEFT OUTER JOIN
                                      TitulosReceber AS TitulosReceber_1 ON VendasHoteis.IdVenda = TitulosReceber_1.IdVendaHotel LEFT OUTER JOIN
                                      Grupos ON VendasHoteis.IdGrupo = Grupos.Id
              ${whereClause}  ${whereClauseAux} ${groupClause} 
              
              UNION

        SELECT      
                  entidades_4.nome AS operadora,
                      SUM(ISNULL(titulosreceber.valorpago,0)) AS valorpago,
                      SUM(ISNULL(ItensVendaHotel.ValorHotel,0)) as valor,
                      SUM(ISNULL(ItensVendaHotel.ValorTaxa,0)) as valortaxa,
                      SUM(ISNULL(ItensVendaHotel.ValorComissao,0)) as valorservico,
                      SUM(ISNULL(ItensVendaHotel.Valoroutros,0)) as valoroutros		
              FROM            Entidades AS entidades_1 RIGHT OUTER JOIN
                                      Entidades AS entidades_2 RIGHT OUTER JOIN
                                      Moeda RIGHT OUTER JOIN
                                      TitulosReceber RIGHT OUTER JOIN
                                      Faturas INNER JOIN
                                      VendasHoteis INNER JOIN
                                      Entidades AS Entidades_3 ON VendasHoteis.IdEntidade = Entidades_3.IdEntidade ON Faturas.IdFatura = VendasHoteis.IdFatura ON TitulosReceber.IdFatura = Faturas.IdFatura ON Moeda.IdMoeda = VendasHoteis.IdMoeda ON 
                                      entidades_2.IdEntidade = VendasHoteis.IdEmissor ON entidades_1.IdEntidade = VendasHoteis.IdVendedor LEFT OUTER JOIN
                                      Filiais ON VendasHoteis.IdFilial = Filiais.IdFilial LEFT OUTER JOIN
                                      Entidades INNER JOIN
                                      ItensVendaHotel ON Entidades.IdEntidade = ItensVendaHotel.IdFornecedor INNER JOIN
                                      Entidades AS Entidades_4 ON ItensVendaHotel.IdOperadora = Entidades_4.IdEntidade ON VendasHoteis.IdVenda = ItensVendaHotel.IdVenda LEFT OUTER JOIN
                                      FormaPagamento ON VendasHoteis.IdFormaPagamento = FormaPagamento.IdFormaPagamento LEFT OUTER JOIN
                                      RecibosReceber ON VendasHoteis.IdReciboReceber = RecibosReceber.IdRecibo LEFT OUTER JOIN
                                      Grupos ON VendasHoteis.IdGrupo = Grupos.Id
                  ${whereClause}  ${groupClause} ${orderClause}

        `
    }else{
     query =
     `
     SELECT      vendashoteis.id AS idvenda, 
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
                  SUM(ISNULL(ItensVendaHotel.Valoroutros,0)) as valoroutros		
              FROM            Entidades AS entidades_1 RIGHT OUTER JOIN
                                      Moeda RIGHT OUTER JOIN
                                      Entidades AS entidades_2 RIGHT OUTER JOIN
                                      VendasHoteis INNER JOIN
                                      Entidades AS Entidades_3 ON VendasHoteis.IdEntidade = Entidades_3.IdEntidade LEFT OUTER JOIN
                                      Faturas LEFT OUTER JOIN
                                      TitulosReceber ON Faturas.IdFatura = TitulosReceber.IdFatura ON VendasHoteis.IdFatura = Faturas.IdFatura ON entidades_2.IdEntidade = VendasHoteis.IdEmissor ON Moeda.IdMoeda = VendasHoteis.IdMoeda ON 
                                      entidades_1.IdEntidade = VendasHoteis.IdVendedor LEFT OUTER JOIN
                                      Filiais ON VendasHoteis.IdFilial = Filiais.IdFilial LEFT OUTER JOIN
                                      Entidades INNER JOIN
                                      ItensVendaHotel ON Entidades.IdEntidade = ItensVendaHotel.IdFornecedor INNER JOIN
                                      Entidades AS Entidades_4 ON ItensVendaHotel.IdOperadora = Entidades_4.IdEntidade ON VendasHoteis.IdVenda = ItensVendaHotel.IdVenda LEFT OUTER JOIN
                                      FormaPagamento ON VendasHoteis.IdFormaPagamento = FormaPagamento.IdFormaPagamento LEFT OUTER JOIN
                                      RecibosReceber ON VendasHoteis.IdReciboReceber = RecibosReceber.IdRecibo LEFT OUTER JOIN
                                      TitulosReceber AS TitulosReceber_1 ON VendasHoteis.IdVenda = TitulosReceber_1.IdVendaHotel LEFT OUTER JOIN
                                      Grupos ON VendasHoteis.IdGrupo = Grupos.Id
              ${whereClause}  ${whereClauseAux} ${groupClause} 
              
              UNION

     SELECT      vendashoteis.id AS idvenda, 
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
                  SUM(ISNULL(ItensVendaHotel.Valoroutros,0)) as valoroutros		
              FROM            Entidades AS entidades_1 RIGHT OUTER JOIN
                                      Entidades AS entidades_2 RIGHT OUTER JOIN
                                      Moeda RIGHT OUTER JOIN
                                      TitulosReceber RIGHT OUTER JOIN
                                      Faturas INNER JOIN
                                      VendasHoteis INNER JOIN
                                      Entidades AS Entidades_3 ON VendasHoteis.IdEntidade = Entidades_3.IdEntidade ON Faturas.IdFatura = VendasHoteis.IdFatura ON TitulosReceber.IdFatura = Faturas.IdFatura ON Moeda.IdMoeda = VendasHoteis.IdMoeda ON 
                                      entidades_2.IdEntidade = VendasHoteis.IdEmissor ON entidades_1.IdEntidade = VendasHoteis.IdVendedor LEFT OUTER JOIN
                                      Filiais ON VendasHoteis.IdFilial = Filiais.IdFilial LEFT OUTER JOIN
                                      Entidades INNER JOIN
                                      ItensVendaHotel ON Entidades.IdEntidade = ItensVendaHotel.IdFornecedor INNER JOIN
                                      Entidades AS Entidades_4 ON ItensVendaHotel.IdOperadora = Entidades_4.IdEntidade ON VendasHoteis.IdVenda = ItensVendaHotel.IdVenda LEFT OUTER JOIN
                                      FormaPagamento ON VendasHoteis.IdFormaPagamento = FormaPagamento.IdFormaPagamento LEFT OUTER JOIN
                                      RecibosReceber ON VendasHoteis.IdReciboReceber = RecibosReceber.IdRecibo LEFT OUTER JOIN
                                      Grupos ON VendasHoteis.IdGrupo = Grupos.Id
                  ${whereClause}  ${groupClause} ${orderClause}


        `
    }
    //console.log('QUERY FINAL::', query);
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
