const { poolPromise } = require('../db');

function normalizeDate(dateString) {
  if (!dateString) return null;
  const d = new Date(dateString);
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString(); // sempre "YYYY-MM-DDT00:00:00.000Z"
}

// Obter todos os recibos
const getReciboReceber = async (req, res) => {
  try {
    const { empresa, descricao } = req.query;

    if (!empresa) {
      return res.status(400).json({ success: false, message: 'O parâmetro "empresa" é obrigatório.' });
    }

    const pool = await poolPromise;
    const request = pool.request();
    request.input('empresa', empresa);

    let whereClause = 'WHERE empresa = @empresa';

    if (descricao) {
      whereClause += ' AND descricao LIKE @descricao';
      request.input('descricao', `%${descricao}%`);
    }

    whereClause += ' ORDER BY dataemissao DESC';

    const query = `SELECT idrecibo, dataemissao, descricao, valor, identidade, idmoeda, idfilial, chave, tipo, id FROM recibosreceber ${whereClause}`;
    const result = await request.query(query);

    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Obter um recibo pelo ID
const getReciboReceberById = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('idrecibo', req.params.idrecibo)
      .query('SELECT idrecibo, dataemissao, descricao, valor, identidade, idmoeda, idfilial, chave, tipo, id FROM recibosreceber WHERE idrecibo = @idrecibo');

    if (result.recordset.length > 0) {
      res.json(result.recordset[0]);
    } else {
      res.status(404).send('Recibo não encontrado');
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Criar um novo recibo
const createReciboReceber = async (req, res) => {
  try {
    const { dataemissao, descricao, valor, identidade, idmoeda, idfilial, chave, empresa, tipo, id } = req.body;

    const dataEmissaoNorm = normalizeDate(dataemissao);

    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('dataemissao', dataEmissaoNorm)
      .input('descricao', descricao)
      .input('valor', valor)
      .input('identidade', identidade)
      .input('idmoeda', idmoeda)
      .input('idfilial', idfilial)
      .input('chave', chave)
      .input('empresa', empresa)
      .input('tipo', tipo)
      .input('id', id)
      .query(`INSERT INTO recibosreceber 
        (dataemissao, descricao, valor, identidade, idmoeda, idfilial, chave, empresa, tipo, Id) 
        OUTPUT INSERTED.idrecibo
        VALUES (@dataemissao, @descricao, @valor, @identidade, @idmoeda, @idfilial, @chave, @empresa, @tipo, @id)`);

    const idrecibo = result.recordset[0].idrecibo;

    res.status(201).json({ success: true, idrecibo, message: 'Recibo criado com sucesso' });

  } catch (error) {
    console.error('Erro ao criar recibo:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Atualizar um recibo existente
const updateReciboReceber = async (req, res) => {
  try {
    const { dataemissao, descricao, valor, identidade, idmoeda, idfilial, chave, tipo, id } = req.body;

    const dataEmissaoNorm = normalizeDate(dataemissao);

    const pool = await poolPromise;
    await pool
      .request()
      .input('idrecibo', req.params.idrecibo)
      .input('dataemissao', dataEmissaoNorm)
      .input('descricao', descricao)
      .input('valor', valor)
      .input('identidade', identidade)
      .input('idmoeda', idmoeda)
      .input('idfilial', idfilial)
      .input('chave', chave)
      .input('tipo', tipo)
      .input('id', id)
      .query(`UPDATE recibosreceber SET 
        dataemissao = @dataemissao,
        descricao = @descricao,
        valor = @valor,
        identidade = @identidade,
        idmoeda = @idmoeda,
        idfilial = @idfilial,
        chave = @chave,
        empresa = @empresa,
        tipo = @tipo,
        id = @id
        WHERE idrecibo = @idrecibo`);

    res.json({ success: true, message: 'Recibo atualizado com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Deletar um recibo
const deleteReciboReceber = async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input('idrecibo', req.params.idrecibo)
      .query('DELETE FROM recibosreceber WHERE idrecibo = @idrecibo');

    res.json({ success: true, message: 'Recibo deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Obter recibos para dropdown (ex: apenas ID e descrição)
const getReciboReceberDropDown = async (req, res) => {
  try {
    const { empresa } = req.query;

    if (!empresa) {
      return res.status(400).json({ success: false, message: 'O parâmetro "empresa" é obrigatório.' });
    }

    const pool = await poolPromise;
    const request = pool.request();
    request.input('empresa', empresa);

    const query = `SELECT idrecibo, Descricao FROM recibosreceber WHERE empresa = @empresa ORDER BY dataemissao DESC`;

    const result = await request.query(query);

    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getReciboReceber,
  getReciboReceberById,
  createReciboReceber,
  updateReciboReceber,
  deleteReciboReceber,
  getReciboReceberDropDown,
};
