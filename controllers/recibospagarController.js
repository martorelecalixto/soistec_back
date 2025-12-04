const { poolPromise } = require('../db');

function normalizeDate(dateString) {
  if (!dateString) return null;
  const d = new Date(dateString);
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString(); // sempre "YYYY-MM-DDT00:00:00.000Z"
}

// Obter todos os recibos
const getReciboPagar = async (req, res) => {
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

    const query = `SELECT idrecibo, dataemissao, descricao, valor, identidade, idmoeda, idfilial, chave, tipo, id, vendabilheteidvenda FROM recibospagar ${whereClause}`;
    const result = await request.query(query);

    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Obter um recibo pelo ID
const getReciboPagarById = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('idrecibo', req.params.idrecibo)
      .query('SELECT idrecibo, dataemissao, descricao, valor, identidade, idmoeda, idfilial, chave, tipo, id, vendabilheteidvenda FROM recibospagar WHERE idrecibo = @idrecibo');

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
const createReciboPagar = async (req, res) => {
  try {
    const { dataemissao, descricao, valor, identidade, idmoeda, idfilial, chave, empresa, tipo, id, vendabilheteidvenda } = req.body;

    const dataEmissaoNorm = normalizeDate(dataemissao);

    const pool = await poolPromise;
    await pool
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
      .input('vendabilheteidvenda', vendabilheteidvenda)
      .query(`INSERT INTO recibospagar 
        (dataemissao, descricao, valor, identidade, idmoeda, idfilial, chave, empresa, tipo, Id, vendabilheteidvenda)
        VALUES (@dataemissao, @descricao, @valor, @identidade, @idmoeda, @idfilial, @chave, @empresa, @tipo, @id, @vendabilheteidvenda)`);

    res.status(201).json({ success: true, message: 'Recibo criado com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Atualizar um recibo existente
const updateReciboPagar = async (req, res) => {
  try {
    const { dataemissao, descricao, valor, identidade, idmoeda, idfilial, chave, tipo, id, vendabilheteidvenda } = req.body;

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
      .input('vendabilheteidvenda', vendabilheteidvenda)
      .query(`UPDATE recibospagar SET 
        dataemissao = @dataemissao,
        descricao = @descricao,
        valor = @valor,
        identidade = @identidade,
        idmoeda = @idmoeda,
        idfilial = @idfilial,
        chave = @chave,
        empresa = @empresa,
        tipo = @tipo,
        id = @id,
        vendabilheteidvenda = @vendabilheteidvenda
        WHERE idrecibo = @idrecibo`);

    res.json({ success: true, message: 'Recibo atualizado com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Deletar um recibo
const deleteReciboPagar = async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input('idrecibo', req.params.idrecibo)
      .query('DELETE FROM recibospagar WHERE idrecibo = @idrecibo');

    res.json({ success: true, message: 'Recibo deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Obter recibos para dropdown (ex: apenas ID e descrição)
const getReciboPagarDropDown = async (req, res) => {
  try {
    const { empresa } = req.query;

    if (!empresa) {
      return res.status(400).json({ success: false, message: 'O parâmetro "empresa" é obrigatório.' });
    }

    const pool = await poolPromise;
    const request = pool.request();
    request.input('empresa', empresa);

    const query = `SELECT idrecibo, Descricao FROM recibospagar WHERE empresa = @empresa ORDER BY dataemissao DESC`;

    const result = await request.query(query);

    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getReciboPagar,
  getReciboPagarById,
  createReciboPagar,
  updateReciboPagar,
  deleteReciboPagar,
  getReciboPagarDropDown,
};
