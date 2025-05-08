const { poolPromise } = require('../db');

// Obter todas as acomodações
const getAcomodacoes = async (req, res) => {
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
      whereClause += ' AND Nome LIKE @nome';
      request.input('nome', `%${nome}%`);
    }

    whereClause += ' ORDER BY Nome';

    const query = `SELECT Id, Nome, Empresa FROM Acomodacoes ${whereClause}`;

    const result = await request.query(query);
    res.json(result.recordset);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Obter uma acomodação pelo ID
const getAcomodacaoById = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('id', req.params.id)
      .query('SELECT Id, Nome, Empresa FROM Acomodacoes WHERE Id = @id');

    if (result.recordset.length > 0) {
      res.json(result.recordset[0]);
    } else {
      res.status(404).send('Acomodação não encontrada');
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Criar uma nova acomodação
const createAcomodacao = async (req, res) => {
  try {
    const { nome, empresa } = req.body;

    const pool = await poolPromise;
    await pool
      .request()
      .input('nome', nome)
      .input('empresa', empresa)
      .query('INSERT INTO Acomodacoes (Nome, Empresa) VALUES (@nome, @empresa)');

    res.status(201).json({ success: true, message: 'Acomodação criada com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Atualizar uma acomodação existente
const updateAcomodacao = async (req, res) => {
  try {
    const { nome } = req.body;

    const pool = await poolPromise;
    await pool
      .request()
      .input('id', req.params.id)
      .input('nome', nome)
      .query('UPDATE Acomodacoes SET Nome = @nome WHERE Id = @id');

    res.json({ success: true, message: 'Acomodação atualizada com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Deletar uma acomodação
const deleteAcomodacao = async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input('id', req.params.id)
      .query('DELETE FROM Acomodacoes WHERE Id = @id');

    res.json({ success: true, message: 'Acomodação deletada com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAcomodacoes,
  getAcomodacaoById,
  createAcomodacao,
  updateAcomodacao,
  deleteAcomodacao,
};
