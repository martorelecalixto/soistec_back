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
    await pool.request()
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
        ) VALUES (
          @quantidade, @pax, @observacao, @bilhete, @trecho, @tipovoo, @valorbilhete, @valortaxabilhete,
          @valortaxaservico, @valordesconto, @valortotal, @idvenda, @idciaaerea, @idoperadora, @voo,
          @tipobilhete, @cancelado, @valorcomisagente, @valorcomisvendedor, @valorassento,
          @valorcomisemissor, @valorfornecedor, @valornet, @localembarque, @dataembarque,
          @horaembarque, @localdesembarque, @datadesembarque, @horadesembarque, @chave
        )
      `);

    res.status(201).json({ success: true, message: 'Item criado com sucesso' });
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
  deleteItemVendaBilhete
};
