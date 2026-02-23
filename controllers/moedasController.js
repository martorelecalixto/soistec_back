const { poolPromise } = require('../db');

// Obter todas as moedas
const getMoedasDropDown = async (req, res) => {
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
          `SELECT idmoeda,  nome
            FROM moeda ${whereClause}`

      const result = await request.query(query);

      res.json(result.recordset);         

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Obter todas as moedas
const getMoedas = async (req, res) => {
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
    `SELECT idmoeda, nome, sigla, codiso, intsingular, intplural, decsingular, decplural,
      empresa FROM moeda ${whereClause}`

   const result = await request.query(query);

    res.json(result.recordset);    
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Obter uma moeda pelo ID
const getMoedaById = async (req, res) => {
  try {
    const { empresa, nome } = req.query;

    // Verifica se o parâmetro 'empresa' foi fornecido
    if (!empresa) {
      return res.status(400).json({ success: false, message: 'O parâmetro "empresa" é obrigatório.' });
    }
    
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('id', req.params.idmoeda)
      .query(
        `SELECT idmoeda, nome, sigla, codiso, intsingular, intplural, decsingular, decplural,
          empresa FROM moeda  WHERE idmoeda = @id ORDER BY nome`
      );

    //  .query('SELECT * FROM atividades  WHERE id = @id');
    if (result.recordset.length > 0) {
      res.json(result.recordset[0]);
    } else {
      res.status(404).send('Moeda não encontrada');
    }

  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Criar uma nova moeda
const createMoeda = async (req, res) => {
  try {
    const {
      nome, empresa, sigla, codiso, intsingular, intplural, decsingular, decplural
    } = req.body;

    const pool = await poolPromise;
    result = await pool
      .request()
      .input('nome', nome)
      .input('sigla', sigla)
      .input('codiso', codiso)
      .input('intsingular', intsingular)
      .input('intplural', intplural)
      .input('decsingular', decsingular)
      .input('decplural', decplural)
      .input('empresa', empresa)
      .query(
        `INSERT INTO moeda (
          nome, empresa, sigla, codiso, intsingular, intplural, decsingular, decplural
        ) VALUES (
          @nome, @empresa, @sigla, @codiso, @intsingular, @intplural, @decsingular, @decplural
        )`
      );

    res.status(201).json({ success: true, message: 'Moeda criada com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Atualizar uma moeda existente
const updateMoeda = async (req, res) => {
  try {
    const {
      nome, sigla, codiso, intsingular, intplural, decsingular, decplural
    } = req.body;

    const pool = await poolPromise;
    await pool
      .request()
      .input('idmoeda', req.params.idmoeda)
      .input('nome', nome)
      .input('sigla', sigla)
      .input('codiso', codiso)
      .input('intsingular', intsingular)
      .input('intplural', intplural)
      .input('decsingular', decsingular)
      .input('decplural', decplural)
      .query(
        `UPDATE moeda SET
          nome = @nome,
          sigla = @sigla,
          codiso = @codiso,
          intsingular = @intsingular,
          intplural = @intplural,
          decsingular = @decsingular,
          decplural = @decplural
        WHERE idmoeda = @idmoeda`
      );
      //console.log(req.params.idmoeda);
      //console.log(req.body);
      //console.log(res.status(500).json({ success: false, message: error.message }));

      res.json({ success: true, message: 'Moeda atualizada com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar moeda:', error); // mostra stack completo
    res.status(500).json({ success: false, message: error.message });
  }
};

// Deletar uma moeda
const deleteMoeda = async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input('idmoeda', req.params.idmoeda)
      .query('DELETE FROM moeda WHERE idmoeda = @idmoeda');
    res.json({ success: true, message: 'Moeda deletada com sucesso' });
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
  getMoedas,
  getMoedaById,
  createMoeda,
  updateMoeda,
  deleteMoeda,
  getMoedasDropDown,

};
