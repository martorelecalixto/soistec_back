const { poolPromise } = require('../db');

// Obter todas os tipos eventos
const getTiposEventosDropDown = async (req, res) => {
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
          `SELECT idtipo, nome
            FROM tipoeventos ${whereClause}`
      const result = await request.query(query);

      res.json(result.recordset);         

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Obter todas os tipos eventos
const getTiposEventos = async (req, res) => {
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

    whereClause += ' ORDER BY nome ';

   const query =
    `SELECT idtipo, nome, 
      empresa FROM tipoeventos ${whereClause}`

   const result = await request.query(query);

    res.json(result.recordset);    
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Obter um tipo evento pelo ID
const getTipoEventoById = async (req, res) => {
  try {
    const { empresa, nome } = req.query;

    // Verifica se o parâmetro 'empresa' foi fornecido
    if (!empresa) {
      return res.status(400).json({ success: false, message: 'O parâmetro "empresa" é obrigatório.' });
    }
    
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('idtipo', req.params.id)
      .query(
        `SELECT idtipo, nome, 
          empresa FROM tipoeventos  WHERE idtipo = @idtipo ORDER BY nome`
      );

    if (result.recordset.length > 0) {
      res.json(result.recordset[0]);
    } else {
      res.status(404).send('tipo evento não encontrado');
    }

  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Criar um novo tipo evento
const createTipoEvento = async (req, res) => {
 // console.log(req.body);
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
        `INSERT INTO tipoeventos (
          nome, empresa
        ) VALUES (
           @nome, @empresa
        )`
      );
//console.log('Tipo evento criado com sucesso');
    res.status(201).json({ success: true, message: 'Tipo evento criado com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Atualizar um tipo evento existente
const updateTipoEvento = async (req, res) => {
  try {
    const {
      nome
    } = req.body;
//console.log(req.body);
//console.log(req.params.idtipo);
    const pool = await poolPromise;
    await pool
      .request()
      .input('idtipo', req.params.idtipo)
      .input('nome', nome)
      .query(
        `UPDATE tipoeventos SET
          nome = @nome
        WHERE idtipo = @idtipo`
      );

    res.json({ success: true, message: 'Tipo evento atualizado com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Deletar um tipo evento
const deleteTipoEvento = async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input('idtipo', req.params.id)
      .query('DELETE FROM tipoeventos WHERE idtipo = @idtipo');
    res.json({ success: true, message: 'Tipo evento deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getTiposEventos,
  getTipoEventoById,
  createTipoEvento,
  updateTipoEvento,
  deleteTipoEvento,
  getTiposEventosDropDown,
};
