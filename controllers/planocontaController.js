const { poolPromise } = require('../db');


// Obter todas as plano conta
const getPlanoContaDropDown = async (req, res) => {
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
          `SELECT idplanoconta, nome
            FROM planoconta ${whereClause}`

      const result = await request.query(query);

      res.json(result.recordset);         

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Obter todas as plano conta
const getPlanoConta = async (req, res) => {
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

    const query = `SELECT idplanoconta, nome, empresa FROM planoconta ${whereClause}`;

    const result = await request.query(query);
    res.json(result.recordset);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Obter uma plano conta pelo ID
const getPlanoContaById = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('id', req.params.idplanoconta)
      .query('SELECT idplanoconta, nome, empresa FROM planoconta WHERE idplanoconta = @idplanoconta');

    if (result.recordset.length > 0) {
      res.json(result.recordset[0]);
    } else {
      res.status(404).send('Plano Conta não encontrado');
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Criar uma plano conta
const createPlanoConta = async (req, res) => {
  try {
    const { nome, empresa, estrutura, natureza, idplanocontapai, tipo, idpaigeral, chave, naoresultado } = req.body;

    const pool = await poolPromise;
    await pool
      .request()
      .input('nome', nome)
      .input('empresa', empresa)
      .input('estrutura', estrutura)
      .input('natureza', natureza)
      .input('idplanocontapai', idplanocontapai)
      .input('tipo', tipo)
      .input('idpaigeral', idpaigeral)
      .input('chave', chave)
      .input('naoresultado', naoresultado)
      .query('INSERT INTO planoconta (nome, empresa, estrutura, natureza, idplanocontapai, tipo, idpaigeral, chave, naoresultado) VALUES (@nome, @empresa, @estrutura, @natureza, @idplanocontapai, @tipo, @idpaigeral, @chave, @naoresultado)');

    res.status(201).json({ success: true, message: 'Plano Conta criado com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Atualizar uma plano conta existente
const updatePlanoConta = async (req, res) => {
  try {
    const { nome } = req.body;

    const pool = await poolPromise;
    await pool
      .request()
      .input('idplanoconta', req.params.idplanoconta)
      .input('nome', nome)
      .query('UPDATE planoconta SET nome = @nome WHERE Idplanoconta = @idplanoconta');

    res.json({ success: true, message: 'plano conta atualizada com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Deletar uma plano conta
const deletePlanoConta = async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input('idplanoconta', req.params.id)
      .query('DELETE FROM planoconta WHERE idplanoconta = @idplanoconta');

    res.json({ success: true, message: 'Plano Conta deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getPlanoConta,
  getPlanoContaById,
  createPlanoConta,
  updatePlanoConta,
  deletePlanoConta,
  getPlanoContaDropDown,
};
