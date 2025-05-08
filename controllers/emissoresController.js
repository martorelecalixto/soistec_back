const { poolPromise } = require('../db');

// Obter todos os emissores
const getEmissores = async (req, res) => {
  try {
    const { entidade } = req.query;

    if (!entidade) {
      return res.status(400).json({ success: false, message: 'O parâmetro "entidade" é obrigatório.' });
    }

    const pool = await poolPromise;
    const request = pool.request();
    request.input('EntidadeID', entidade);

    const result = await request.query(`
      SELECT IdEmissor, PerComisNac, PerComisInt, EntidadeID, PerComisSerNac, PerComisSerInt
      FROM Emissores
      WHERE EntidadeID = @EntidadeID
      ORDER BY IdEmissor
    `);

    res.json(result.recordset);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Obter um emissor pelo ID
const getEmissorById = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('id', req.params.id)
      .query(`
        SELECT IdEmissor, PerComisNac, PerComisInt, EntidadeID, PerComisSerNac, PerComisSerInt
        FROM Emissores
        WHERE IdEmissor = @id
      `);

    if (result.recordset.length > 0) {
      res.json(result.recordset[0]);
    } else {
      res.status(404).send('Emissor não encontrado');
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Criar um novo emissor
const createEmissor = async (req, res) => {
  try {
    const {
      PerComisNac,
      PerComisInt,
      EntidadeID,
      PerComisSerNac,
      PerComisSerInt,
    } = req.body;

    const pool = await poolPromise;
    await pool
      .request()
      .input('PerComisNac', PerComisNac)
      .input('PerComisInt', PerComisInt)
      .input('EntidadeID', EntidadeID)
      .input('PerComisSerNac', PerComisSerNac)
      .input('PerComisSerInt', PerComisSerInt)
      .query(`
        INSERT INTO Emissores (
          PerComisNac, PerComisInt, EntidadeID, PerComisSerNac, PerComisSerInt
        ) VALUES (
          @PerComisNac, @PerComisInt, @EntidadeID, @PerComisSerNac, @PerComisSerInt
        )
      `);

    res.status(201).json({ success: true, message: 'Emissor criado com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Atualizar um emissor existente
const updateEmissor = async (req, res) => {
  try {
    const {
      PerComisNac,
      PerComisInt,
      EntidadeID,
      PerComisSerNac,
      PerComisSerInt,
    } = req.body;

    const pool = await poolPromise;
    await pool
      .request()
      .input('id', req.params.id)
      .input('PerComisNac', PerComisNac)
      .input('PerComisInt', PerComisInt)
      .input('EntidadeID', EntidadeID)
      .input('PerComisSerNac', PerComisSerNac)
      .input('PerComisSerInt', PerComisSerInt)
      .query(`
        UPDATE Emissores SET
          PerComisNac = @PerComisNac,
          PerComisInt = @PerComisInt,
          EntidadeID = @EntidadeID,
          PerComisSerNac = @PerComisSerNac,
          PerComisSerInt = @PerComisSerInt
        WHERE IdEmissor = @id
      `);

    res.json({ success: true, message: 'Emissor atualizado com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Deletar um emissor
const deleteEmissor = async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input('id', req.params.id)
      .query('DELETE FROM Emissores WHERE IdEmissor = @id');

    res.json({ success: true, message: 'Emissor deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getEmissores,
  getEmissorById,
  createEmissor,
  updateEmissor,
  deleteEmissor,
};
