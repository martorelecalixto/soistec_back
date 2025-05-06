const { poolPromise } = require('../db');

// Obter todas as atividades
const getAtividades = async (req, res) => {
  try {
    const { empresa, nome } = req.query;

    // Verifica se o parâmetro 'empresa' foi fornecido
    if (!empresa) {
      return res.status(400).json({ success: false, message: 'O parâmetro "empresa" é obrigatório.' });
    }

    // Parâmetros obrigatórios
    const pool = await poolPromise;
    const request = pool.request();

    request.input('empresa', empresa);

    // Parâmetros opcionais
    let whereClause = 'WHERE empresa = @empresa';

    if (nome) {
      whereClause += ' AND nome LIKE @nome';
      request.input('nome', `%${nome}%`);
    }

   const query =
    `SELECT id, nome, 
      empresa FROM Atividades ${whereClause}`

   const result = await request.query(query);

    res.json(result.recordset);    
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Obter uma atividade pelo ID
const getAtividadeById = async (req, res) => {
  try {
    const { empresa, nome } = req.query;

    // Verifica se o parâmetro 'empresa' foi fornecido
    if (!empresa) {
      return res.status(400).json({ success: false, message: 'O parâmetro "empresa" é obrigatório.' });
    }
    
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('id', req.params.id)
      .query(
        `SELECT id, nome, 
          empresa FROM atividades  WHERE id = @id`
      );

    //  .query('SELECT * FROM atividades  WHERE id = @id');
    if (result.recordset.length > 0) {
      res.json(result.recordset[0]);
    } else {
      res.status(404).send('Atividade não encontrada');
    }

  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Criar uma nova atividade
const createAtividade = async (req, res) => {
  try {
    const {
      nome, empresa
    } = req.body;

    const pool = await poolPromise;
    await pool
      .request()
      .input('nome', nome)
      .input('empresa', empresa)
      .query(
        `INSERT INTO atividades (
          nome, empresa
        ) VALUES (
          @nome, @empresa
        )`
      );

    res.status(201).json({ success: true, message: 'Atividade criada com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// Atualizar uma atividade existente
const updateAtividade = async (req, res) => {
  try {
    const {
      nome, 
    } = req.body;

    const pool = await poolPromise;
    await pool
      .request()
      .input('id', req.params.id)
      .input('nome', nome)
      .query(
        `UPDATE atividades SET
          nome = @nome
        WHERE id = @id`
      );

    res.json({ success: true, message: 'Atividade atualizada com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// Deletar uma atividade
const deleteAtividade = async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input('id', req.params.id)
      .query('DELETE FROM atividades WHERE id = @id');
    res.json({ success: true, message: 'Atividade deletada com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAtividades,
  getAtividadeById,
  createAtividade,
  updateAtividade,
  deleteAtividade,
};
