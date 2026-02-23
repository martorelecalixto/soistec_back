const { poolPromise } = require('../db');


// Obter todas as acomodacoes
const getAcomodacoesDropDown = async (req, res) => {
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
            FROM Acomodacoes ${whereClause}`
        
      console.log(query);
      console.log(await request.query(query));
      

      const result = await request.query(query);

      res.json(result.recordset);         

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Obter todas as acomodações
const getAcomodacoes = async (req, res) => {
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

    const query = `SELECT id, nome, empresa FROM acomodacoes ${whereClause}`;

    const result = await request.query(query);
    res.json(result.recordset);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Obter uma acomodação pelo ID
const getAcomodacaoById = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('id', req.params.id)
      .query('SELECT id, nome, empresa FROM acomodacoes WHERE id = @id');

    if (result.recordset.length > 0) {
      res.json(result.recordset[0]);
    } else {
      res.status(404).send('Acomodação não encontrada');
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Criar uma nova acomodação
const createAcomodacao = async (req, res) => {
  try {
    const { nome, empresa } = req.body;

    const pool = await poolPromise;
    await pool
      .request()
      .input('nome', nome)
      .input('empresa', empresa)
      .query('INSERT INTO acomodacoes (nome, empresa) VALUES (@nome, @empresa)');

    res.status(201).json({ success: true, message: 'Acomodação criada com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Atualizar uma acomodação existente
const updateAcomodacao = async (req, res) => {
  try {
    const { nome } = req.body;

    const pool = await poolPromise;
    await pool
      .request()
      .input('id', req.params.id)
      .input('nome', nome)
      .query('UPDATE acomodacoes SET nome = @nome WHERE Id = @id');

    res.json({ success: true, message: 'Acomodação atualizada com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Deletar uma acomodação
const deleteAcomodacao = async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input('id', req.params.id)
      .query('DELETE FROM acomodacoes WHERE id = @id');

    res.json({ success: true, message: 'Acomodação deletada com sucesso' });
  } catch (error) {
      if (error.number === 547) {
          return res.status(409).json({
              success: false,
              type: "FK_CONSTRAINT",
              message: "Não é possível excluir este registro pois ele está sendo utilizado em outro cadastro."
          });
      }

      return res.status(500).json({
          success: false,
          message: "Erro interno ao deletar registro."
      });    

    //res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAcomodacoes,
  getAcomodacaoById,
  createAcomodacao,
  updateAcomodacao,
  deleteAcomodacao,
  getAcomodacoesDropDown,
};
