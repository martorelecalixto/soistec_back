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
      quantidade, pax, observacao, bilhete, trecho, tipovoo, valorbilhete, valortaxabilhete,
      valortaxaservico, valordesconto, valortotal, idvenda, idciaaerea, idoperadora, voo,
      tipobilhete, cancelado, valorcomisagente, valorcomisvendedor, valorassento,
      valorcomisemissor, valorfornecedor, valornet, localembarque, dataembarque,
      horaembarque, localdesembarque, datadesembarque, horadesembarque, chave
    } = req.body;

    const pool = await poolPromise;
    await pool.request()
      .input('id', req.params.id)
      .input('quantidade', quantidade)
      .input('pax', pax)
      .input('observacao', observacao)
      .input('bilhete', bilhete)
      .input('trecho', trecho)
      .input('tipovoo', tipovoo)
      .input('valorbilhete', valorbilhete)
      .input('valortaxabilhete', valortaxabilhete)
      .input('valortaxaservico', valortaxaservico)
      .input('valordesconto', valordesconto)
      .input('valortotal', valortotal)
      .input('idvenda', idvenda)
      .input('idciaaerea', idciaaerea)
      .input('idoperadora', idoperadora)
      .input('voo', voo)
      .input('tipobilhete', tipobilhete)
      .input('cancelado', cancelado)
      .input('valorcomisagente', valorcomisagente)
      .input('valorcomisvendedor', valorcomisvendedor)
      .input('valorassento', valorassento)
      .input('valorcomisemissor', valorcomisemissor)
      .input('valorfornecedor', valorfornecedor)
      .input('valornet', valornet)
      .input('localembarque', localembarque)
      .input('dataembarque', dataembarque)
      .input('horaembarque', horaembarque)
      .input('localdesembarque', localdesembarque)
      .input('datadesembarque', datadesembarque)
      .input('horadesembarque', horadesembarque)
      .input('chave', chave)
      .query(`
        UPDATE itensvendabilhete SET
          quantidade = @quantidade,
          pax = @pax,
          observacao = @observacao,
          bilhete = @bilhete,
          trecho = @trecho,
          tipovoo = @tipovoo,
          valorbilhete = @valorbilhete,
          valortaxabilhete = @valortaxabilhete,
          valortaxaservico = @valortaxaservico,
          valordesconto = @valordesconto,
          valortotal = @valortotal,
          idvenda = @idvenda,
          idciaaerea = @idciaaerea,
          idoperadora = @idoperadora,
          voo = @voo,
          tipobilhete = @tipobilhete,
          cancelado = @cancelado,
          valorcomisagente = @valorcomisagente,
          valorcomisvendedor = @valorcomisvendedor,
          valorassento = @valorassento,
          valorcomisemissor = @valorcomisemissor,
          valorfornecedor = @valorfornecedor,
          valornet = @valornet,
          localembarque = @localembarque,
          dataembarque = @dataembarque,
          horaembarque = @horaembarque,
          localdesembarque = @localdesembarque,
          datadesembarque = @datadesembarque,
          horadesembarque = @horadesembarque,
          chave = @chave
        WHERE id = @id
      `);

    res.json({ success: true, message: 'Item atualizado com sucesso' });
  } catch (error) {
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
