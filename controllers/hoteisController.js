const { poolPromise } = require('../db');

// Obter todos os hotéis
const getHoteis = async (req, res) => {
  try {
    const { entidade } = req.query;

    if (!entidade) {
      return res.status(400).json({ success: false, message: 'O parâmetro "entidade" é obrigatório.' });
    }

    const pool = await poolPromise;
    const request = pool.request();
    request.input('entidadeid', entidade);

    const query = `
      SELECT idhotel, percomis, prazofaturamento, entidadeid, percomisint
      FROM hoteis
      WHERE entidadeid = @entidadeid
      ORDER BY idhotel DESC
    `;

    const result = await request.query(query);
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Obter um hotel pelo ID
const getHotelById = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('idhotel', req.params.idhotel)
      .query(`
        SELECT idhotel, percomis, prazofaturamento, entidadeid, percomisint
        FROM hoteis
        WHERE idhotel = @idhotel
      `);

    if (result.recordset.length > 0) {
      res.json(result.recordset[0]);
    } else {
      res.status(404).send('Hotel não encontrado');
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Criar um novo hotel
const createHotel = async (req, res) => {
  try {
    const { percomis, prazofaturamento, entidadeid, percomisint } = req.body;

    const pool = await poolPromise;
    await pool
      .request()
      .input('percomis', percomis)
      .input('prazofaturamento', prazofaturamento)
      .input('entidadeid', entidadeid)
      .input('percomisint', percomisint)
      .query(`
        INSERT INTO hoteis (percomis, prazofaturamento, entidadeid, percomisint)
        VALUES (@percomis, @prazofaturamento, @entidadeid, @percomisint)
      `);

    res.status(201).json({ success: true, message: 'Hotel criado com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Atualizar um hotel existente
const updateHotel = async (req, res) => {
  try {
    const { percomis, prazofaturamento, entidadeid, percomisint } = req.body;

    const pool = await poolPromise;
    await pool
      .request()
      .input('idhotel', req.params.idhotel)
      .input('percomis', percomis)
      .input('prazofaturamento', prazofaturamento)
      .input('entidadeid', entidadeid)
      .input('percomisint', percomisint)
      .query(`
        UPDATE Hoteis
        SET percomis = @opercomis,
            prazofaturamento = @prazofaturamento,
            entidadeid = @entidadeid,
            percomisint = @percomisint
        WHERE IdHotel = @idhotel
      `);

    res.json({ success: true, message: 'Hotel atualizado com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Deletar um hotel
const deleteHotel = async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input('idhotel', req.params.idhotel)
      .query('DELETE FROM hoteis WHERE idhotel = @idhotel');

    res.json({ success: true, message: 'Hotel deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getHoteis,
  getHotelById,
  createHotel,
  updateHotel,
  deleteHotel,
};
