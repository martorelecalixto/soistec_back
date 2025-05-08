const { poolPromise } = require('../db');

// Obter todas as locadoras
const getLocadoras = async (req, res) => {
  try {
    const { entidade } = req.query;

    const pool = await poolPromise;
    const request = pool.request();

    let whereClause = '';
    if (entidade) {
      whereClause = 'WHERE EntidadeID = @entidade';
      request.input('entidade', entidade);
    }

    const query = `
      SELECT IdLocadora, PerComis, PrazoFaturamento, EntidadeID
      FROM Locadoras
      ${whereClause}
      ORDER BY IdLocadora
    `;

    const result = await request.query(query);
    res.json(result.recordset);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Obter uma locadora por ID
const getLocadoraById = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('id', req.params.id)
      .query(`
        SELECT IdLocadora, PerComis, PrazoFaturamento, EntidadeID
        FROM Locadoras
        WHERE IdLocadora = @id
      `);

    if (result.recordset.length > 0) {
      res.json(result.recordset[0]);
    } else {
      res.status(404).send('Locadora não encontrada');
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Criar uma nova locadora
const createLocadora = async (req, res) => {
  try {
    const { IdLocadora, PerComis, PrazoFaturamento, EntidadeID } = req.body;

    const pool = await poolPromise;
    await pool.request()
      .input('IdLocadora', IdLocadora)
      .input('PerComis', PerComis)
      .input('PrazoFaturamento', PrazoFaturamento)
      .input('EntidadeID', EntidadeID)
      .query(`
        INSERT INTO Locadoras (IdLocadora, PerComis, PrazoFaturamento, EntidadeID)
        VALUES (@IdLocadora, @PerComis, @PrazoFaturamento, @EntidadeID)
      `);

    res.status(201).json({ success: true, message: 'Locadora criada com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Atualizar uma locadora
const updateLocadora = async (req, res) => {
  try {
    const { PerComis, PrazoFaturamento, EntidadeID } = req.body;

    const pool = await poolPromise;
    await pool.request()
      .input('id', req.params.id)
      .input('PerComis', PerComis)
      .input('PrazoFaturamento', PrazoFaturamento)
      .input('EntidadeID', EntidadeID)
      .query(`
        UPDATE Locadoras SET
          PerComis = @PerComis,
          PrazoFaturamento = @PrazoFaturamento,
          EntidadeID = @EntidadeID
        WHERE IdLocadora = @id
      `);

    res.json({ success: true, message: 'Locadora atualizada com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Deletar uma locadora
const deleteLocadora = async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('id', req.params.id)
      .query('DELETE FROM Locadoras WHERE IdLocadora = @id');

    res.json({ success: true, message: 'Locadora deletada com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getLocadoras,
  getLocadoraById,
  createLocadora,
  updateLocadora,
  deleteLocadora,
};
