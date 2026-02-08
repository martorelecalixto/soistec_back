const { poolPromise } = require('../db');

// Obter todas os ingressos
const getIngressosDropDown = async (req, res) => {
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
          `SELECT idingresso, nome
            FROM ingressos ${whereClause}`

      const result = await request.query(query);

      res.json(result.recordset);         

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Obter todas os ingressos
const getIngressos = async (req, res) => {
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
    `SELECT idingresso, nome, 
      empresa FROM ingressos ${whereClause}`

   const result = await request.query(query);

    res.json(result.recordset);    
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Obter um ingresso pelo ID
const getIngressoById = async (req, res) => {
  try {
    const { empresa, nome } = req.query;

    // Verifica se o parâmetro 'empresa' foi fornecido
    if (!empresa) {
      return res.status(400).json({ success: false, message: 'O parâmetro "empresa" é obrigatório.' });
    }
    
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('id', req.params.idingresso)
      .query(
        `SELECT idingresso, nome, 
          empresa FROM ingressos  WHERE idingresso = @id ORDER BY nome`
      );

    if (result.recordset.length > 0) {
      res.json(result.recordset[0]);
    } else {
      res.status(404).send('lote não encontrado');
    }

  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Criar um novo ingresso
const createIngresso = async (req, res) => {
 // console.log('Chegou no createIngresso');
  try {
    const {
      nome, empresa, datacadastro, idlote
    } = req.body;

    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('idlote', idlote)
      .input('nome', nome)
      .input('datacadastro', datacadastro)
      .input('empresa', empresa)
      .query(
        `INSERT INTO ingressos (
          idlote, nome, datacadastro, empresa
        ) 
        OUTPUT INSERTED.idingresso  
        VALUES (
          @idlote, @nome, @datacadastro, @empresa
        )`
      );

    const idingresso = result.recordset[0].idingresso;

    res.status(201).json({ success: true, idingresso, message: 'Ingresso criado com sucesso' });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Atualizar um ingresso existente
const updateIngresso = async (req, res) => {
  try {
    const {
      idingresso,
      nome, 
      datacadastro,
      idlote
    } = req.body;

    const pool = await poolPromise;
    await pool
      .request()
      .input('idingresso', idingresso)
      .input('nome', nome)
      .input('datacadastro', datacadastro)
      .input('idlote', idlote)
      .query(
        `UPDATE ingressos SET
          nome = @nome
        WHERE idingresso = @idingresso`
      );

    res.json({ success: true, message: 'Ingresso atualizado com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Deletar um ingresso
const deleteIngresso = async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input('idingresso', req.params.idingresso)
      .query('DELETE FROM ingressos WHERE idingresso = @idingresso');
    res.json({ success: true, message: 'Ingresso deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Obter ingressos  pelo ID LOTE
const getIngressosByIdLote = async (req, res) => {
  try {
   
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('idlote', req.params.idlote)
      .query(
        `SELECT        idlote, idingresso, datacadastro, empresa, nome
          FROM   ingressos
          WHERE ingressos.idlote = @idlote ORDER BY ingressos.nome
          `
      );
//console.log('idvenda: ' + req.params.idvenda);

    if (result.recordset.length > 0) {
      res.json(result.recordset);
    } else {
      res.status(404).send('ingressos do lote não encontrado');
    }
    

  } catch (error) {
    res.status(500).send(error.message);
  }
};

module.exports = {
  getIngressos,
  getIngressoById,
  createIngresso,
  updateIngresso,
  deleteIngresso,
  getIngressosDropDown,
  getIngressosByIdLote
};
