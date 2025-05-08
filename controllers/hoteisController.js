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
    request.input('EntidadeID', entidade);

    const query = `
      SELECT IdHotel, PerComis, PrazoFaturamento, EntidadeID, PerComisInt
      FROM Hoteis
      WHERE EntidadeID = @EntidadeID
      ORDER BY IdHotel DESC
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
      .input('id', req.params.id)
      .query(`
        SELECT IdHotel, PerComis, PrazoFaturamento, EntidadeID, PerComisInt
        FROM Hoteis
        WHERE IdHotel = @id
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
    const { PerComis, PrazoFaturamento, EntidadeID, PerComisInt } = req.body;

    const pool = await poolPromise;
    await pool
      .request()
      .input('PerComis', PerComis)
      .input('PrazoFaturamento', PrazoFaturamento)
      .input('EntidadeID', EntidadeID)
      .input('PerComisInt', PerComisInt)
      .query(`
        INSERT INTO Hoteis (PerComis, PrazoFaturamento, EntidadeID, PerComisInt)
        VALUES (@PerComis, @PrazoFaturamento, @EntidadeID, @PerComisInt)
      `);

    res.status(201).json({ success: true, message: 'Hotel criado com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Atualizar um hotel existente
const updateHotel = async (req, res) => {
  try {
    const { PerComis, PrazoFaturamento, EntidadeID, PerComisInt } = req.body;

    const pool = await poolPromise;
    await pool
      .request()
      .input('id', req.params.id)
      .input('PerComis', PerComis)
      .input('PrazoFaturamento', PrazoFaturamento)
      .input('EntidadeID', EntidadeID)
      .input('PerComisInt', PerComisInt)
      .query(`
        UPDATE Hoteis
        SET PerComis = @PerComis,
            PrazoFaturamento = @PrazoFaturamento,
            EntidadeID = @EntidadeID,
            PerComisInt = @PerComisInt
        WHERE IdHotel = @id
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
      .input('id', req.params.id)
      .query('DELETE FROM Hoteis WHERE IdHotel = @id');

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
