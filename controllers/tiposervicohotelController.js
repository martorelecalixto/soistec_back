const { poolPromise } = require('../db');


// Obter todas as TipoServicosHoteis
const getTipoServicoHoteisDropDown = async (req, res) => {
  try {
      const { empresa } = req.query;

      // Verifica se o parâmetro 'empresa' foi fornecido
      if (!empresa) {
        return res.status(400).json({ success: false, message: 'O parâmetro "empresa" é obrigatório.' });
      }

      const pool = await poolPromise;
      const request = pool.request();

      request.input('empresa', empresa);

      // Parâmetros opcionais
      let whereClause = 'WHERE empresa = @empresa ';
      whereClause += ' ORDER BY nome ';

      const query =
          `SELECT id, nome
            FROM TipoServicosHoteis ${whereClause}`

      const result = await request.query(query);

      res.json(result.recordset);         

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Obter todas as TipoServicosHoteis
const getTipoServicoHoteis = async (req, res) => {
  try {
    const { empresa, nome } = req.query;

    if (!empresa) {
      return res.status(400).json({ success: false, message: 'O parâmetro "empresa" é obrigatório.' });
    }

    const pool = await poolPromise;
    const request = pool.request();

    request.input('empresa', empresa);
    let whereClause = 'WHERE empresa = @empresa';

    if (nome) {
      whereClause += ' AND nome LIKE @nome';
      request.input('nome', `%${nome}%`);
    }

    whereClause += ' ORDER BY nome';

    const query = `SELECT id, nome, empresa FROM TipoServicosHoteis ${whereClause}`;

    const result = await request.query(query);
    res.json(result.recordset);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Obter uma TipoServicosHoteis pelo ID
const getTipoServicoHoteisById = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('id', req.params.id)
      .query('SELECT id, nome, empresa FROM TipoServicosHoteis WHERE id = @id');

    if (result.recordset.length > 0) {
      res.json(result.recordset[0]);
    } else {
      res.status(404).send('Tipo Serviço não encontrado');
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Criar uma nova TipoServicosHoteis
const createTipoServicoHoteis = async (req, res) => {
  try {
    const { nome, empresa } = req.body;

    const pool = await poolPromise;
    await pool
      .request()
      .input('nome', nome)
      .input('empresa', empresa)
      .query('INSERT INTO TipoServicosHoteis (nome, empresa) VALUES (@nome, @empresa)');

    res.status(201).json({ success: true, message: 'Tipo Serviço criado com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Atualizar uma TipoServicosHoteis existente
const updateTipoServicoHoteis = async (req, res) => {
  try {
    const { nome } = req.body;

    const pool = await poolPromise;
    await pool
      .request()
      .input('id', req.params.id)
      .input('nome', nome)
      .query('UPDATE TipoServicosHoteis SET nome = @nome WHERE Id = @id');

    res.json({ success: true, message: 'Tipo Serviço atualizado com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Deletar uma TipoServicosHoteis
const deleteTipoServicoHoteis = async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input('id', req.params.id)
      .query('DELETE FROM TipoServicosHoteis WHERE id = @id');

    res.json({ success: true, message: 'Tipo Serviço deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getTipoServicoHoteis,
  getTipoServicoHoteisById,
  createTipoServicoHoteis,
  updateTipoServicoHoteis,
  deleteTipoServicoHoteis,
  getTipoServicoHoteisDropDown,
};
