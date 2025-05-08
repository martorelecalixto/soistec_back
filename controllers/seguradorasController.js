const { poolPromise } = require('../db');

// Obter todas as seguradoras
const getSeguradoras = async (req, res) => {
  try {
    const { entidadeid } = req.query;

    if (!entidadeid) {
      return res.status(400).json({ success: false, message: 'O parâmetro "entidadeid" é obrigatório.' });
    }

    const pool = await poolPromise;
    const request = pool.request();
    request.input('entidadeid', entidadeid);

    const query = `
      SELECT 
        idseguradora, 
        percomis, 
        prazofaturamento, 
        entidadeid 
      FROM seguradoras 
      WHERE entidadeid = @entidadeid
      ORDER BY idseguradora
    `;

    const result = await request.query(query);
    res.json(result.recordset);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Obter uma seguradora pelo ID
const getSeguradoraById = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('idseguradora', req.params.id)
      .query(`
        SELECT 
          idseguradora, 
          percomis, 
          prazofaturamento, 
          entidadeid 
        FROM seguradoras 
        WHERE idseguradora = @idseguradora
      `);

    if (result.recordset.length > 0) {
      res.json(result.recordset[0]);
    } else {
      res.status(404).send('Seguradora não encontrada');
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Criar nova seguradora
const createSeguradora = async (req, res) => {
  try {
    const { idseguradora, percomis, prazofaturamento, entidadeid } = req.body;

    const pool = await poolPromise;
    await pool.request()
      .input('idseguradora', idseguradora)
      .input('percomis', percomis)
      .input('prazofaturamento', prazofaturamento)
      .input('entidadeid', entidadeid)
      .query(`
        INSERT INTO seguradoras (
          idseguradora, percomis, prazofaturamento, entidadeid
        ) VALUES (
          @idseguradora, @percomis, @prazofaturamento, @entidadeid
        )
      `);

    res.status(201).json({ success: true, message: 'Seguradora criada com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Atualizar seguradora
const updateSeguradora = async (req, res) => {
  try {
    const { percomis, prazofaturamento, entidadeid } = req.body;

    const pool = await poolPromise;
    await pool.request()
      .input('idseguradora', req.params.id)
      .input('percomis', percomis)
      .input('prazofaturamento', prazofaturamento)
      .input('entidadeid', entidadeid)
      .query(`
        UPDATE seguradoras SET
          percomis = @percomis,
          prazofaturamento = @prazofaturamento,
          entidadeid = @entidadeid
        WHERE idseguradora = @idseguradora
      `);

    res.json({ success: true, message: 'Seguradora atualizada com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Deletar seguradora
const deleteSeguradora = async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('idseguradora', req.params.id)
      .query('DELETE FROM seguradoras WHERE idseguradora = @idseguradora');

    res.json({ success: true, message: 'Seguradora deletada com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getSeguradoras,
  getSeguradoraById,
  createSeguradora,
  updateSeguradora,
  deleteSeguradora,
};
