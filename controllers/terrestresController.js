const { poolPromise } = require('../db');

// Obter todos os registros de Terrestres
const getTerrestres = async (req, res) => {
  try {
    const { entidadeId } = req.query;

    if (!entidadeId) {
      return res.status(400).json({ success: false, message: 'O parâmetro "entidadeId" é obrigatório.' });
    }

    const pool = await poolPromise;
    const request = pool.request();
    request.input('entidadeId', entidadeId);

    const result = await request.query(
      `SELECT IdTerrestre, PerComis, PrazoFaturamento, EntidadeID 
       FROM Terrestres 
       WHERE EntidadeID = @entidadeId 
       ORDER BY IdTerrestre`
    );

    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Obter um registro de Terrestres pelo ID
const getTerrestreById = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('id', req.params.id)
      .query(
        `SELECT IdTerrestre, PerComis, PrazoFaturamento, EntidadeID 
         FROM Terrestres 
         WHERE IdTerrestre = @id`
      );

    if (result.recordset.length > 0) {
      res.json(result.recordset[0]);
    } else {
      res.status(404).json({ success: false, message: 'Registro não encontrado' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Criar um novo registro de Terrestres
const createTerrestre = async (req, res) => {
  try {
    const { IdTerrestre, PerComis, PrazoFaturamento, EntidadeID } = req.body;

    const pool = await poolPromise;
    await pool
      .request()
      .input('IdTerrestre', IdTerrestre)
      .input('PerComis', PerComis)
      .input('PrazoFaturamento', PrazoFaturamento)
      .input('EntidadeID', EntidadeID)
      .query(
        `INSERT INTO Terrestres (
          IdTerrestre, PerComis, PrazoFaturamento, EntidadeID
        ) VALUES (
          @IdTerrestre, @PerComis, @PrazoFaturamento, @EntidadeID
        )`
      );

    res.status(201).json({ success: true, message: 'Registro criado com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Atualizar um registro existente de Terrestres
const updateTerrestre = async (req, res) => {
  try {
    const { PerComis, PrazoFaturamento } = req.body;

    const pool = await poolPromise;
    await pool
      .request()
      .input('id', req.params.id)
      .input('PerComis', PerComis)
      .input('PrazoFaturamento', PrazoFaturamento)
      .query(
        `UPDATE Terrestres SET
          PerComis = @PerComis,
          PrazoFaturamento = @PrazoFaturamento
        WHERE IdTerrestre = @id`
      );

    res.json({ success: true, message: 'Registro atualizado com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Deletar um registro de Terrestres
const deleteTerrestre = async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input('id', req.params.id)
      .query('DELETE FROM Terrestres WHERE IdTerrestre = @id');
    res.json({ success: true, message: 'Registro deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getTerrestres,
  getTerrestreById,
  createTerrestre,
  updateTerrestre,
  deleteTerrestre,
};
