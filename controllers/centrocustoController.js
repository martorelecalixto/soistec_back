const { poolPromise } = require('../db');

// Obter todas as centro custo pai
const getCentroCustoPaiDropDown = async (req, res) => {
  try {
      const { empresa } = req.query;

      // Verifica se o parâmetro 'empresa' foi fornecido
      if (!empresa) {
        return res.status(400).json({ success: false, message: 'O parâmetro "empresa" é obrigatório.' });
      }

      const pool = await poolPromise;
      const request = pool.request();
      let tipo  = 'SINTÉTICO';

      request.input('empresa', empresa);

      // Parâmetros opcionais
      let whereClause = 'WHERE empresa = @empresa  ';
      whereClause += ' AND tipo LIKE @tipo';
      request.input('tipo', `%${tipo}%`);

      whereClause += ' ORDER BY nome ';

      const query =
          `SELECT id, nome
            FROM centrocustos ${whereClause}`

      const result = await request.query(query);

      res.json(result.recordset);         

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Obter todas as centrocusto
const getCentroCustoDropDown = async (req, res) => {
  try {
      const { empresa } = req.query;

      // Verifica se o parâmetro 'empresa' foi fornecido
      if (!empresa) {
        return res.status(400).json({ success: false, message: 'O parâmetro "empresa" é obrigatório.' });
      }

      const pool = await poolPromise;
      const request = pool.request();

      request.input('empresa', empresa);

      // Parâmetros opcionais
      let whereClause = 'WHERE empresa = @empresa ';
      whereClause += ' ORDER BY nome ';

      const query =
          `SELECT id, nome
            FROM centrocustos ${whereClause}`

      const result = await request.query(query);

      res.json(result.recordset);         

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Obter todas as centro custos
const getCentroCusto = async (req, res) => {
  try {
    const { empresa, nome } = req.query;

    if (!empresa) {
      return res.status(400).json({ success: false, message: 'O parâmetro "empresa" é obrigatório.' });
    }

    const pool = await poolPromise;
    const request = pool.request();

    request.input('empresa', empresa);
    let whereClause = 'WHERE empresa = @empresa';

    if (nome) {
      whereClause += ' AND nome LIKE @nome';
      request.input('nome', `%${nome}%`);
    }

    whereClause += ' ORDER BY nome';

    const query = `SELECT id, nome, empresa, idpai, tipo, idpaigeral FROM centrocustos ${whereClause}`;

    const result = await request.query(query);
    res.json(result.recordset);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Obter uma centro custo pelo ID
const getCentroCustoById = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('id', req.params.id)
      .query('SELECT id, nome, empresa, idpai, tipo, idpaigeral FROM centrocustos WHERE id = @id');

    if (result.recordset.length > 0) {
      res.json(result.recordset[0]);
    } else {
      res.status(404).send('Centro Centro não encontrado');
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Criar uma centro custo
const createCentroCusto = async (req, res) => {
  try {
    const { nome, empresa, idpai, tipo, idpaigeral, chave } = req.body;

    const pool = await poolPromise;
    await pool
      .request()
      .input('nome', nome)
      .input('empresa', empresa)
      .input('idpai', idpai)
      .input('tipo', tipo)
      .input('idpaigeral', idpaigeral)
      .input('chave', chave)
      .query('INSERT INTO centrocustos (nome, empresa, idpai, tipo, idpaigeral, chave) VALUES (@nome, @empresa, @idpai, @tipo, @idpaigeral, @chave)');

    res.status(201).json({ success: true, message: 'Centro Custo criado com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Atualizar uma centro custo existente
const updateCentroCusto = async (req, res) => {
  try {
    const { nome } = req.body;

    const pool = await poolPromise;
    await pool
      .request()
      .input('id', req.params.id)
      .input('nome', nome)
      .query('UPDATE centrocustos SET nome = @nome WHERE Id = @id');

    res.json({ success: true, message: 'Centro Custo atualizada com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Deletar uma centro custo
const deleteCentroCusto = async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input('id', req.params.id)
      .query('DELETE FROM centrocustos WHERE id = @id');

    res.json({ success: true, message: 'Centro Custo deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getCentroCusto,
  getCentroCustoById,
  createCentroCusto,
  updateCentroCusto,
  deleteCentroCusto,
  getCentroCustoDropDown,
  getCentroCustoPaiDropDown,
};
