const { poolPromise } = require('../db');

// Obter todas as companhias aéreas
const getCAereas = async (req, res) => {
  try {
    const { entidadeId } = req.query;

    if (!entidadeId) {
      return res.status(400).json({ success: false, message: 'O parâmetro "entidadeId" é obrigatório.' });
    }

    const pool = await poolPromise;
    const request = pool.request();
    request.input('EntidadeID', entidadeId);

    const result = await request.query(
      `SELECT * FROM CAereas WHERE EntidadeID = @EntidadeID ORDER BY IdCiaAerea`
    );

    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Obter uma companhia aérea pelo ID
const getCAereaById = async (req, res) => {
  try {
    const pool = await poolPromise;
    const request = pool.request();
    request.input('IdCiaAerea', req.params.id);

    const result = await request.query(`SELECT * FROM CAereas WHERE IdCiaAerea = @IdCiaAerea`);

    if (result.recordset.length > 0) {
      res.json(result.recordset[0]);
    } else {
      res.status(404).json({ success: false, message: 'Companhia aérea não encontrada.' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Criar uma nova companhia aérea
const createCAerea = async (req, res) => {
  try {
    const data = req.body;

    const pool = await poolPromise;
    const request = pool.request();

    Object.entries(data).forEach(([key, value]) => {
      request.input(key, value);
    });

    const columns = Object.keys(data).join(', ');
    const values = Object.keys(data).map(col => `@${col}`).join(', ');

    await request.query(`INSERT INTO CAereas (${columns}) VALUES (${values})`);

    res.status(201).json({ success: true, message: 'Companhia aérea criada com sucesso.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Atualizar uma companhia aérea existente
const updateCAerea = async (req, res) => {
  try {
    const data = req.body;
    const { id } = req.params;

    const pool = await poolPromise;
    const request = pool.request();
    request.input('IdCiaAerea', id);

    Object.entries(data).forEach(([key, value]) => {
      request.input(key, value);
    });

    const setClause = Object.keys(data).map(col => `${col} = @${col}`).join(', ');

    await request.query(`UPDATE CAereas SET ${setClause} WHERE IdCiaAerea = @IdCiaAerea`);

    res.json({ success: true, message: 'Companhia aérea atualizada com sucesso.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Deletar uma companhia aérea
const deleteCAerea = async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input('IdCiaAerea', req.params.id)
      .query('DELETE FROM CAereas WHERE IdCiaAerea = @IdCiaAerea');

    res.json({ success: true, message: 'Companhia aérea deletada com sucesso.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getCAereas,
  getCAereaById,
  createCAerea,
  updateCAerea,
  deleteCAerea,
};
