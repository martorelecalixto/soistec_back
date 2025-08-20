const { poolPromise } = require('../db');

// Obter todas as bancos
const getBancosDropDown = async (req, res) => {
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
          `SELECT idbanco, nome
            FROM bancos ${whereClause}`

      const result = await request.query(query);

      res.json(result.recordset);         

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Obter todas as bancos + contas bancárias para o dropdown
const getBancosContasDropDown = async (req, res) => {
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
      whereClause += ' ORDER BY bancoconta ';

      const query =
          `SELECT        bancos.idbanco, 
                        (Isnull(Bancos.nome,'') + '  ' + Isnull(ContasBancarias.NumeroConta,'') + ' - ' + Isnull(ContasBancarias.DigitoConta,'')) AS nome
            FROM         Bancos INNER JOIN
                        ContasBancarias ON Bancos.IdBanco = ContasBancarias.IdBanco            
            ${whereClause}`

      const result = await request.query(query);

      res.json(result.recordset);         

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Obter todas as bancos
const getBancos = async (req, res) => {
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
    `SELECT idbanco, nome, 
      empresa FROM bancos ${whereClause}`

   const result = await request.query(query);

    res.json(result.recordset);    
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Obter uma banco pelo ID
const getBancoById = async (req, res) => {
  try {
    const { empresa, nome } = req.query;

    // Verifica se o parâmetro 'empresa' foi fornecido
    if (!empresa) {
      return res.status(400).json({ success: false, message: 'O parâmetro "empresa" é obrigatório.' });
    }
    
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('idbanco', req.params.id)
      .query(
        `SELECT idbanco, nome, 
          empresa FROM bancos  WHERE idbanco = @idbanco ORDER BY nome`
      );

    //  .query('SELECT * FROM atividades  WHERE id = @id');
    if (result.recordset.length > 0) {
      res.json(result.recordset[0]);
    } else {
      res.status(404).send('Banco não encontrado');
    }

  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Criar uma nova banco
const createBanco = async (req, res) => {
  try {
    const {
      nome, numero, empresa
    } = req.body;

    const pool = await poolPromise;
    await pool
      .request()
      .input('nome', nome)
      .input('numero', numero)
      .input('empresa', empresa)
      .query(
        `INSERT INTO bancos (
          nome, numero, empresa
        ) VALUES (
          @nome, @numero, @empresa
        )`
      );

    res.status(201).json({ success: true, message: 'Banco criado com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// Atualizar um banco existente
const updateBanco = async (req, res) => {
  try {
    const {
      nome, numero
    } = req.body;

    const pool = await poolPromise;
    await pool
      .request()
      .input('idbanco', req.params.id)
      .input('nome', nome)
      .input('numero', numero)
      .query(
        `UPDATE bancos SET
          nome = @nome,
          numero = @numero
        WHERE idbanco = @idbanco`
      );

    res.json({ success: true, message: 'Banco atualizado com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// Deletar uma banco
const deleteBanco = async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input('idbanco', req.params.id)
      .query('DELETE FROM bancos WHERE idbanco = @idbanco');
    res.json({ success: true, message: 'Banco deletada com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getBancos,
  getBancoById,
  createBanco,
  updateBanco,
  deleteBanco,
  getBancosDropDown,
  getBancosContasDropDown,
};
