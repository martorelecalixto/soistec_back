const { poolPromise } = require('../db');

// Criar um novo item de venda de bilhete
const createItemVendaBilhete = async (req, res) => {

  try {
    const {
      quantidade, pax, observacao, bilhete, trecho, tipovoo, valorbilhete, valortaxabilhete,
      valortaxaservico, valordesconto, valortotal, idvenda, idciaaerea, idoperadora, voo,
      tipobilhete, cancelado, valorcomisagente, valorcomisvendedor, valorassento,
      valorcomisemissor, valorfornecedor, valornet, localembarque, dataembarque,
      horaembarque, localdesembarque, datadesembarque, horadesembarque, chave
    } = req.body;

    const pool = await poolPromise;
    const result = await pool
    //await pool.request()
      .request()
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
        INSERT INTO itensvendabilhete (
          quantidade, pax, observacao, bilhete, trecho, tipovoo, valorbilhete, valortaxabilhete,
          valortaxaservico, valordesconto, valortotal, idvenda, idciaaerea, idoperadora, voo,
          tipobilhete, cancelado, valorcomisagente, valorcomisvendedor, valorassento,
          valorcomisemissor, valorfornecedor, valornet, localembarque, dataembarque,
          horaembarque, localdesembarque, datadesembarque, horadesembarque, chave
        ) 
        OUTPUT INSERTED.id  
        VALUES (
          @quantidade, @pax, @observacao, @bilhete, @trecho, @tipovoo, @valorbilhete, @valortaxabilhete,
          @valortaxaservico, @valordesconto, @valortotal, @idvenda, @idciaaerea, @idoperadora, @voo,
          @tipobilhete, @cancelado, @valorcomisagente, @valorcomisvendedor, @valorassento,
          @valorcomisemissor, @valorfornecedor, @valornet, @localembarque, @dataembarque,
          @horaembarque, @localdesembarque, @datadesembarque, @horadesembarque, @chave
        )
      `);

       const id = result.recordset[0].id;

    res.status(201).json({ success: true, id, message: 'Item criado com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Atualizar um item existente
const updateItemVendaBilhete = async (req, res) => {
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
const getItensVendaBilhete = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM itensvendabilhete');
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Obter uma itens venda bilhete pelo ID
const getItensVendaBilheteById = async (req, res) => {
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
                itensvendabilhete.id, itensvendabilhete.quantidade, itensvendabilhete.pax, itensvendabilhete.observacao, itensvendabilhete.bilhete, itensvendabilhete.trecho, itensvendabilhete.tipovoo, itensvendabilhete.valorbilhete, itensvendabilhete.valortaxabilhete,
                itensvendabilhete.valortaxaservico, itensvendabilhete.valordesconto, itensvendabilhete.valortotal, itensvendabilhete.idvenda, itensvendabilhete.idciaaerea, itensvendabilhete.idoperadora, itensvendabilhete.voo,
                itensvendabilhete.tipobilhete, itensvendabilhete.cancelado, itensvendabilhete.valorcomisagente, itensvendabilhete.valorcomisvendedor, itensvendabilhete.valorassento,
                itensvendabilhete.valorcomisemissor, itensvendabilhete.valorfornecedor, itensvendabilhete.valornet, itensvendabilhete.localembarque, itensvendabilhete.dataembarque,
                itensvendabilhete.horaembarque, itensvendabilhete.localdesembarque, itensvendabilhete.datadesembarque, itensvendabilhete.horadesembarque, itensvendabilhete.chave,
                entidades.nome AS cia, entidades_1.nome AS operadora
        FROM            itensvendabilhete LEFT OUTER JOIN
                                entidades ON itensvendabilhete.idciaaerea = entidades.identidade LEFT OUTER JOIN
                                entidades entidades_1 ON itensvendabilhete.idoperadora = entidades_1.identidade
        WHERE itensvendabilhete.id = @id ORDER BY itensvendabilhete.id   

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

// Obter uma itens venda bilhete pelo ID VENDA
const getItensVendaBilheteByIdVenda = async (req, res) => {
  try {
   
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('idvenda', req.params.idvenda)
      .query(
        `SELECT 
                itensvendabilhete.id, itensvendabilhete.quantidade, itensvendabilhete.pax, itensvendabilhete.observacao, itensvendabilhete.bilhete, itensvendabilhete.trecho, isnull(itensvendabilhete.tipovoo,'') AS tipovoo, 
                isnull(itensvendabilhete.valorbilhete,0) as valorbilhete, isnull(itensvendabilhete.valortaxabilhete,0) AS valortaxabilhete,
                isnull(itensvendabilhete.valortaxaservico,0) AS valortaxaservico, itensvendabilhete.valordesconto, itensvendabilhete.valortotal, itensvendabilhete.idvenda, itensvendabilhete.idciaaerea, itensvendabilhete.idoperadora, itensvendabilhete.voo,
                itensvendabilhete.tipobilhete, itensvendabilhete.cancelado, itensvendabilhete.valorcomisagente, itensvendabilhete.valorcomisvendedor, isnull(itensvendabilhete.valorassento,0) AS valorassento,
                itensvendabilhete.valorcomisemissor, itensvendabilhete.valorfornecedor, itensvendabilhete.valornet, itensvendabilhete.localembarque, itensvendabilhete.dataembarque,
                itensvendabilhete.horaembarque, itensvendabilhete.localdesembarque, itensvendabilhete.datadesembarque, itensvendabilhete.horadesembarque, itensvendabilhete.chave,
                isnull(entidades.sigla,'') AS cia, entidades_1.nome AS operadora
        FROM            itensvendabilhete LEFT OUTER JOIN
                                entidades ON itensvendabilhete.idciaaerea = entidades.identidade LEFT OUTER JOIN
                                entidades entidades_1 ON itensvendabilhete.idoperadora = entidades_1.identidade
        WHERE itensvendabilhete.idvenda = @idvenda ORDER BY itensvendabilhete.id   

          `
      );
//console.log('idvenda: ' + req.params.idvenda);

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
const deleteItemVendaBilhete = async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('id', req.params.id)
      .query('DELETE FROM itensvendabilhete WHERE id = @id');

    res.json({ success: true, message: 'Item excluído com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createItemVendaBilhete,
  updateItemVendaBilhete,
  getItensVendaBilhete,
  deleteItemVendaBilhete,
  getItensVendaBilheteByIdVenda,
  getItensVendaBilheteById,
};
