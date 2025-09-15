const { poolPromise } = require('../db');

// Criar um novo item de venda de bilhete
const createItemVendaHotel = async (req, res) => {

  try {
    const {
        quantidade,
        quantidadediarias,
        pax,
        observacao,
        descricao,
        periodoini,
        periodofin,
        datavencimento,
        datavencimentofor,
        valorhotel,
        valortaxa,
        valordu,
        valordesconto,
        valoroutros,
        valorcomissao,
        valorfornecedor,
        idvenda,
        idfornecedor,
        idoperadora,
        tiposervicohotelid,
        valorcomisvendedor,
        idacomodacao,
        chave,
        valorcomisemissor,
        valorextras,
        tiposervico
    } = req.body;

    const pool = await poolPromise;
    const result = await pool
    //await pool.request()
      .request()
      .input('quantidade', quantidade)
      .input('quantidadediarias', quantidadediarias)
      .input('pax', pax)
      .input('observacao', observacao)
      .input('descricao', descricao)
      .input('periodoini', periodoini)
      .input('periodofin', periodofin)
      .input('datavencimento', datavencimento)
      .input('datavencimentofor', datavencimentofor)
      .input('valorhotel', valorhotel)
      .input('valortaxa', valortaxa)
      .input('valordu', valordu)
      .input('valordesconto', valordesconto)
      .input('valoroutros', valoroutros)
      .input('valorcomissao', valorcomissao)
      .input('valorfornecedor', valorfornecedor)
      .input('idvenda', idvenda)
      .input('idfornecedor', idfornecedor)
      .input('idoperadora', idoperadora)
      .input('tiposervicohotelid', tiposervicohotelid)
      .input('valorcomisvendedor', valorcomisvendedor)
      .input('idacomodacao', idacomodacao)
      .input('chave', chave)
      .input('valorcomisemissor', valorcomisemissor)
      .input('valorextras', valorextras)
      .input('tiposervico', tiposervico)
      .query(`
        INSERT INTO itensvendahotel (
                    quantidade,
                    quantidadediarias,
                    pax,
                    observacao,
                    descricao,
                    periodoini,
                    periodofin,
                    datavencimento,
                    datavencimentofor,
                    valorhotel,
                    valortaxa,
                    valordu,
                    valordesconto,
                    valoroutros,
                    valorcomissao,
                    valorfornecedor,
                    idvenda,
                    idfornecedor,
                    idoperadora,
                    tiposervicohotelid,
                    valorcomisvendedor,
                    idacomodacao,
                    chave,
                    valorcomisemissor,
                    valorextras,
                    tiposervico
        ) 
        OUTPUT INSERTED.id  
        VALUES (
                    @quantidade,
                    @quantidadediarias,
                    @pax,
                    @observacao,
                    @descricao,
                    @periodoini,
                    @periodofin,
                    @datavencimento,
                    @datavencimentofor,
                    @valorhotel,
                    @valortaxa,
                    @valordu,
                    @valordesconto,
                    @valoroutros,
                    @valorcomissao,
                    @valorfornecedor,
                    @idvenda,
                    @idfornecedor,
                    @idoperadora,
                    @tiposervicohotelid,
                    @valorcomisvendedor,
                    @idacomodacao,
                    @chave,
                    @valorcomisemissor,
                    @valorextras,
                    @tiposervico
        )
      `);

       const id = result.recordset[0].id;

    res.status(201).json({ success: true, id, message: 'Item criado com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Atualizar um item existente
const updateItemVendaHotel = async (req, res) => {
  try {
    const {
      quantidade, quantidadediarias, pax, observacao, descricao, periodoini, periodofin,
      datavencimento, datavencimentofor, valorhotel, valortaxa, valordu, valordesconto,
      valoroutros, valorcomissao, valorfornecedor, idvenda, idfornecedor, idoperadora,
      tiposervicohotelid, valorcomisvendedor, idacomodacao, chave, valorcomisemissor,
      valorextras, tiposervico
    } = req.body;

    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'ID inválido' });
    }

   // console.log('updateItemVendaHotel id: -> ' + id);

    const pool = await poolPromise;
    await pool.request()
      .input('id', id)
      .input('quantidade', quantidade ?? null)
      .input('quantidadediarias', quantidadediarias ?? null)
      .input('pax', pax ?? null)
      .input('observacao', observacao ?? null)
      .input('descricao', descricao ?? null)
      .input('periodoini', periodoini ?? null)
      .input('periodofin', periodofin ?? null)
      .input('datavencimento', datavencimento ?? null)
      .input('datavencimentofor', datavencimentofor ?? null)
      .input('valorhotel', valorhotel ?? null)
      .input('valortaxa', valortaxa ?? null)
      .input('valordu', valordu ?? null)
      .input('valordesconto', valordesconto ?? null)
      .input('valoroutros', valoroutros ?? null)
      .input('valorcomissao', valorcomissao ?? null)
      .input('valorfornecedor', valorfornecedor ?? null)
      .input('idvenda', idvenda ?? null)
      .input('idfornecedor', idfornecedor ?? null)
      .input('idoperadora', idoperadora ?? null)
      .input('tiposervicohotelid', tiposervicohotelid ?? null)
      .input('valorcomisvendedor', valorcomisvendedor ?? null)
      .input('idacomodacao', idacomodacao ?? null)
      .input('chave', chave ?? null)
      .input('valorcomisemissor', valorcomisemissor ?? null)
      .input('valorextras', valorextras ?? null)
      .input('tiposervico', tiposervico ?? null)
      .query(`
        UPDATE itensvendahotel SET
          quantidade = @quantidade,
          quantidadediarias = @quantidadediarias,
          pax = @pax,
          observacao = @observacao, 
          descricao = @descricao,
          periodoini = @periodoini,
          periodofin = @periodofin,
          datavencimento = @datavencimento,
          datavencimentofor = @datavencimentofor,
          valorhotel = @valorhotel,
          valortaxa = @valortaxa,
          valordu = @valordu,
          valordesconto = @valordesconto,
          valoroutros = @valoroutros,
          valorcomissao = @valorcomissao,
          valorfornecedor = @valorfornecedor,
          idvenda = @idvenda,
          idfornecedor = @idfornecedor,
          idoperadora = @idoperadora,
          tiposervicohotelid = @tiposervicohotelid,
          valorcomisvendedor = @valorcomisvendedor,
          idacomodacao = @idacomodacao,
          chave = @chave,
          valorcomisemissor = @valorcomisemissor,
          valorextras = @valorextras,
          tiposervico = @tiposervico
        WHERE id = @id
      `);

   // console.log('Item atualizado com sucesso id: -> ' + id);
    res.json({ success: true, message: 'Item atualizado com sucesso' });

  } catch (error) {
    console.error('Erro no updateItemVendaHotel:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Listar todos os itens
const getItensVendaHotel = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM itensvendahotel');
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Obter uma itens venda hotel pelo ID
const getItensVendaHotelById = async (req, res) => {
  try {
     const { id } = req.params;

     if (!id) {
         return res.status(400).json({ success: false, message: 'O parâmetro "id" é obrigatório.' });
     }

     const pool = await poolPromise;
     const result = await pool
      .request()
      .input('id', id)
      .query(
        `SELECT 
                itensvendahotel.id,
                itensvendahotel.quantidade,
                itensvendahotel.quantidadediarias,
                itensvendahotel.pax,
                itensvendahotel.observacao,
                itensvendahotel.descricao,
                itensvendahotel.periodoini,
                itensvendahotel.periodofin,
                itensvendahotel.datavencimento,
                itensvendahotel.datavencimentofor,
                itensvendahotel.valorhotel,
                itensvendahotel.valortaxa,
                itensvendahotel.valordu,
                itensvendahotel.valordesconto,
                itensvendahotel.valoroutros,
                itensvendahotel.valorcomissao,
                itensvendahotel.valorfornecedor,
                itensvendahotel.idvenda,
                itensvendahotel.idfornecedor,
                itensvendahotel.idoperadora,
                itensvendahotel.tiposervicohotelid,
                itensvendahotel.valorcomisvendedor,
                itensvendahotel.idacomodacao,
                itensvendahotel.chave,
                itensvendahotel.valorcomisemissor,
                itensvendahotel.valorextras,
                itensvendahotel.tiposervico,                
                entidades.nome AS fornecedor, 
                entidades_1.nome AS operadora,
                acomodacoes.nome AS acomodacao,
                tiposervicohoteis.nome AS tiposervicohotel
        FROM            itensvendahotel LEFT OUTER JOIN
                         Acomodacoes ON itensvendahotel.IdAcomodacao = Acomodacoes.Id LEFT OUTER JOIN
                         TipoServicosHoteis ON itensvendahotel.TipoServicoHotelID = TipoServicosHoteis.Id LEFT OUTER JOIN
                         Entidades AS Entidades_1 ON itensvendahotel.IdOperadora = Entidades_1.IdEntidade LEFT OUTER JOIN
                         Entidades ON ItensVendaHotel.IdFornecedor = Entidades.IdEntidade
        WHERE itensvendahotel.id = @id ORDER BY itensvendahotel.id   

          `
      );

    if (result.recordset.length > 0) {
      res.json(result.recordset[0]);
    } else {
      res.status(404).send('itens venda não encontrada');
    }

  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Obter uma itens venda hotel pelo ID VENDA
const getItensVendaHotelByIdVenda = async (req, res) => {
  try {
   
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('idvenda', req.params.idvenda)
      .query(
        `SELECT 
                itensvendahotel.id,
                itensvendahotel.quantidade,
                itensvendahotel.quantidadediarias,
                itensvendahotel.pax,
                itensvendahotel.observacao,
                itensvendahotel.descricao,
                itensvendahotel.periodoini,
                itensvendahotel.periodofin,
                itensvendahotel.datavencimento,
                itensvendahotel.datavencimentofor,
                itensvendahotel.valorhotel,
                itensvendahotel.valortaxa,
                itensvendahotel.valordu,
                itensvendahotel.valordesconto,
                itensvendahotel.valoroutros,
                itensvendahotel.valorcomissao,
                itensvendahotel.valorfornecedor,
                itensvendahotel.idvenda,
                itensvendahotel.idfornecedor,
                itensvendahotel.idoperadora,
                itensvendahotel.tiposervicohotelid,
                itensvendahotel.valorcomisvendedor,
                itensvendahotel.idacomodacao,
                itensvendahotel.chave,
                itensvendahotel.valorcomisemissor,
                itensvendahotel.valorextras,
                itensvendahotel.tiposervico,                
                entidades.nome AS fornecedor, 
                entidades_1.nome AS operadora,
                acomodacoes.nome AS acomodacao,
                tiposervicoshoteis.nome AS tiposervicohotel
        FROM            itensvendahotel LEFT OUTER JOIN
                         Acomodacoes ON itensvendahotel.IdAcomodacao = Acomodacoes.Id LEFT OUTER JOIN
                         TipoServicosHoteis ON itensvendahotel.TipoServicoHotelID = TipoServicosHoteis.Id LEFT OUTER JOIN
                         Entidades AS Entidades_1 ON itensvendahotel.IdOperadora = Entidades_1.IdEntidade LEFT OUTER JOIN
                         Entidades ON ItensVendaHotel.IdFornecedor = Entidades.IdEntidade
                                
        WHERE itensvendahotel.idvenda = @idvenda ORDER BY itensvendahotel.id   

          `
      );
//console.log('getItensVendaHotelByIdVenda idvenda: ->' + req.params.idvenda);

    if (result.recordset.length > 0) {
      res.json(result.recordset);
    } else {
      res.status(404).send('itens venda não encontrada');
    }

  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Excluir um item
const deleteItemVendaHotel = async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('id', req.params.id)
      .query('DELETE FROM itensvendahotel WHERE id = @id');

    res.json({ success: true, message: 'Item excluído com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createItemVendaHotel,
  updateItemVendaHotel,
  getItensVendaHotel,
  deleteItemVendaHotel,
  getItensVendaHotelByIdVenda,
  getItensVendaHotelById,
};
