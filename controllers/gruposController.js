const { poolPromise } = require('../db');

// Obter todas as grupos
const getGruposDropDown = async (req, res) => {
  try {
    const { empresa, nome } = req.query;

    if (!empresa) {
      return res.status(400).json({ success: false, message: 'O parâmetro "empresa" é obrigatório.' });
    }

    const pool = await poolPromise;
    const request = pool.request();

    request.input('empresa', empresa);
    let whereClause = 'WHERE empresa = @empresa';

    whereClause += ' ORDER BY nome';

    const query = `SELECT id, nome FROM grupos ${whereClause}`;

    const result = await request.query(query);
    res.json(result.recordset);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Obter todas as grupos
const getGrupos = async (req, res) => {
  try {
    const { empresa, nome } = req.query;

    if (!empresa) {
      return res.status(400).json({ success: false, message: 'O parâmetro "empresa" é obrigatório.' });
    }

    const pool = await poolPromise;
    const request = pool.request();

    request.input('empresa', empresa);
    let whereClause = 'WHERE Empresa = @empresa';

    if (nome) {
      whereClause += ' AND nome LIKE @nome';
      request.input('nome', `%${nome}%`);
    }

    whereClause += ' ORDER BY nome';

    const query = `SELECT id, nome, empresa FROM grupos ${whereClause}`;

    const result = await request.query(query);
    res.json(result.recordset);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Obter uma grupos pelo ID
const getGrupoById = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('id', req.params.id)
      .query('SELECT id, nome, empresa FROM grupos WHERE id = @id');

    if (result.recordset.length > 0) {
      res.json(result.recordset[0]);
    } else {
      res.status(404).send('Grupo não encontrado');
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Criar uma nova grupo
const createGrupo = async (req, res) => {
  try {
    const { nome, empresa } = req.body;

    const pool = await poolPromise;
    await pool
      .request()
      .input('nome', nome)
      .input('empresa', empresa)
      .query('INSERT INTO Grupos (nome, empresa) VALUES (@nome, @empresa)');

    res.status(201).json({ success: true, message: 'Grupo criado com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Atualizar uma grupos existente
const updateGrupo = async (req, res) => {
  try {
    const { nome } = req.body;

    const pool = await poolPromise;
    await pool
      .request()
      .input('id', req.params.id)
      .input('nome', nome)
      .query('UPDATE Grupos SET nome = @nome WHERE Id = @id');

    res.json({ success: true, message: 'Grupo atualizado com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Deletar uma grupo
const deleteGrupo = async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input('id', req.params.id)
      .query('DELETE FROM Grupos WHERE id = @id');

    res.json({ success: true, message: 'Grupo deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getGrupos,
  getGrupoById,
  createGrupo,
  updateGrupo,
  deleteGrupo,
  getGruposDropDown,
};
