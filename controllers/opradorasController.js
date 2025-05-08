const { poolPromise } = require('../db');

// Obter todas as operadoras
const getOpradoras = async (req, res) => {
  try {
    const { entidadeid } = req.query;

    if (!entidadeid) {
      return res.status(400).json({ success: false, message: 'O parâmetro "entidadeid" é obrigatório.' });
    }

    const pool = await poolPromise;
    const request = pool.request();
    request.input('entidadeid', entidadeid);

    const result = await request.query(`
      SELECT 
        idoperadora AS idoperadora,
        prazofaturamento AS prazofaturamento,
        percomisnac AS percomisnac,
        percomisint AS percomisint,
        overnac AS overnac,
        overint AS overint,
        liqaddtarifanaciv AS liqaddtarifanaciv,
        liqaddtaxanaciv AS liqaddtaxanaciv,
        liqadddunaciv AS liqadddunaciv,
        liqaddcomissaonaciv AS liqaddcomissaonaciv,
        liqaddovernaciv AS liqaddovernaciv,
        liqaddtarifanaccc AS liqaddtarifanaccc,
        liqaddtaxanaccc AS liqaddtaxanaccc,
        liqadddunaccc AS liqadddunaccc,
        liqaddcomissaonaccc AS liqaddcomissaonaccc,
        liqaddovernaccc AS liqaddovernaccc,
        liqaddtarifaintiv AS liqaddtarifaintiv,
        liqaddtaxaintiv AS liqaddtaxaintiv,
        liqaddduintiv AS liqaddduintiv,
        liqaddcomissaointiv AS liqaddcomissaointiv,
        liqaddoverintiv AS liqaddoverintiv,
        liqaddtarifaintcc AS liqaddtarifaintcc,
        liqaddtaxaintcc AS liqaddtaxaintcc,
        liqaddduintcc AS liqaddduintcc,
        liqaddcomissaointcc AS liqaddcomissaointcc,
        liqaddoverintcc AS liqaddoverintcc,
        liqdedtarifanaciv AS liqdedtarifanaciv,
        liqdedtaxanaciv AS liqdedtaxanaciv,
        liqdeddunaciv AS liqdeddunaciv,
        liqdedcomissaonaciv AS liqdedcomissaonaciv,
        liqdedovernaciv AS liqdedovernaciv,
        liqdedtarifanaccc AS liqdedtarifanaccc,
        liqdedtaxanaccc AS liqdedtaxanaccc,
        liqdeddunaccc AS liqdeddunaccc,
        liqdedcomissaonaccc AS liqdedcomissaonaccc,
        liqdedovernaccc AS liqdedovernaccc,
        liqdedtarifaintiv AS liqdedtarifaintiv,
        liqdedtaxaintiv AS liqdedtaxaintiv,
        liqdedduintiv AS liqdedduintiv,
        liqdedcomissaointiv AS liqdedcomissaointiv,
        liqdedoverintiv AS liqdedoverintiv,
        liqdedtarifaintcc AS liqdedtarifaintcc,
        liqdedtaxaintcc AS liqdedtaxaintcc,
        liqdedduintcc AS liqdedduintcc,
        liqdedcomissaointcc AS liqdedcomissaointcc,
        liqdedoverintcc AS liqdedoverintcc,
        valorininac1 AS valorininac1,
        valorfinnac1 AS valorfinnac1,
        valornac1 AS valornac1,
        percnac1 AS percnac1,
        valorininac2 AS valorininac2,
        valorfinnac2 AS valorfinnac2,
        valornac2 AS valornac2,
        percnac2 AS percnac2,
        valoriniint1 AS valoriniint1,
        valorfinint1 AS valorfinint1,
        valorint1 AS valorint1,
        percint1 AS percint1,
        valoriniint2 AS valoriniint2,
        valorfinint2 AS valorfinint2,
        valorint2 AS valorint2,
        percint2 AS percint2,
        entidadeid AS entidadeid,
        percomisservico AS percomisservico,
        percomisservicoint AS percomisservicoint,
        percomisvendnaereo AS percomisvendnaereo,
        percomisvendiaereo AS percomisvendiaereo,
        percomisemisnaereo AS percomisemisnaereo,
        percomisemisiaereo AS percomisemisiaereo,
        percomisvendnservico AS percomisvendnservico,
        percomisvendiservico AS percomisvendiservico,
        percomisemisnservico AS percomisemisnservico,
        percomisemisiservico AS percomisemisiservico
      FROM opradoras
      WHERE entidadeid = @entidadeid
      ORDER BY idoperadora
    `);

    res.json(result.recordset);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Obter uma operadora pelo ID
const getOpradoraById = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', req.params.id)
      .query('SELECT * FROM opradoras WHERE idoperadora = @id');

    if (result.recordset.length > 0) {
      res.json(result.recordset[0]);
    } else {
      res.status(404).send('Operadora não encontrada');
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Criar uma nova operadora
const createOpradora = async (req, res) => {
  try {
    const body = req.body;

    const pool = await poolPromise;
    const request = pool.request();

    // Inserir todos os campos dinamicamente
    const columns = Object.keys(body);
    const values = columns.map(col => `@${col}`).join(', ');
    const inputs = columns.map(col => {
      request.input(col, body[col]);
      return col;
    }).join(', ');

    const query = `
      INSERT INTO opradoras (${inputs})
      VALUES (${values})
    `;

    await request.query(query);
    res.status(201).json({ success: true, message: 'Operadora criada com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Atualizar operadora
const updateOpradora = async (req, res) => {
  try {
    const body = req.body;
    const id = req.params.id;

    const pool = await poolPromise;
    const request = pool.request().input('id', id);

    const setClauses = Object.keys(body).map(key => {
      request.input(key, body[key]);
      return `${key} = @${key}`;
    }).join(', ');

    const query = `
      UPDATE opradoras SET ${setClauses}
      WHERE idoperadora = @id
    `;

    await request.query(query);
    res.json({ success: true, message: 'Operadora atualizada com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Deletar operadora
const deleteOpradora = async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('id', req.params.id)
      .query('DELETE FROM opradoras WHERE idoperadora = @id');

    res.json({ success: true, message: 'Operadora deletada com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getOpradoras,
  getOpradoraById,
  createOpradora,
  updateOpradora,
  deleteOpradora
};
