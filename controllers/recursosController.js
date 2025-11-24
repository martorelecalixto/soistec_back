const { poolPromise } = require('../db');

// Obter todos os recursos
const getRecursos = async (req, res) => {
  try {
    const { empresa, nome  } = req.query;

    // Verifica se o parâmetro 'empresa' foi fornecido
    if (!empresa) {
      return res.status(400).json({ success: false, message: 'O parâmetro "empresa" é obrigatório.' });
    }

    // Parâmetros obrigatórios
    const pool = await poolPromise;
    const request = pool.request();

    //request.input('empresa', empresa);

    // Parâmetros opcionais
    let whereClause = '';//'WHERE recursos.empresa = @empresa';

    if (nome) {
      whereClause += ' WHERE recursos.nome LIKE @nome';
      request.input('nome', `%${nome}%`);
    }

    whereClause += ' ORDER BY recursos.nome ';

   const query =
    `SELECT recursos.idrecurso, recursos.tipo, recursos.nome, isnull(recursos.rota,'') as rota,
      isnull(recursos.descricao,'') as descricao, recursos.empresa
    FROM            recursos 
    ${whereClause}`

   const result = await request.query(query);

    res.json(result.recordset);    
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Obter um recurso pelo ID
const getRecursoById = async (req, res) => {
  try {
    
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('idrecurso', req.params.id)
      .query(
        `SELECT idrecurso, tipo, nome, descricao, rota,
          empresa FROM recursos  WHERE idrecurso = @idrecurso ORDER BY nome`
      );

    if (result.recordset.length > 0) {
      res.json(result.recordset[0]);
    } else {
      res.status(404).send('Recurso não encontrado');
    }

  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Criar um novo recurso
const createRecurso = async (req, res) => {
  try {
    const {
      tipo, nome, rota, descricao, empresa
    } = req.body;
    const pool = await poolPromise;
    await pool
      .request()
      .input('tipo', tipo)
      .input('nome', nome)
      .input('rota', rota)
      .input('descricao', descricao)
      .input('empresa', empresa)
      .query(
        `INSERT INTO recursos (
          tipo, nome, rota, descricao, empresa
        ) VALUES (
           @tipo, @nome,  @rota, @descricao, @empresa
        )`
      );
    //console.log('Conta bancaria criada com sucesso');
    res.status(201).json({ success: true, message: 'recursos criado com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Atualizar um recurso existente
const updateRecurso = async (req, res) => {
  try {
    const {
      tipo, nome, rota, descricao
    } = req.body;
    console.log('ID do recurso a ser atualizado:', req.params.idrecurso);

    const pool = await poolPromise;
    await pool
      .request()
      .input('idrecurso', req.params.idrecurso)
      .input('tipo', tipo)
      .input('nome', nome)
      .input('rota', rota)
      .input('descricao', descricao)
      .query(
        `UPDATE recursos SET
          tipo = @tipo,
          nome = @nome,
          rota = @rota,
          descricao = @descricao
        WHERE idrecurso = @idrecurso`
      );
console.log('Recurso atualizado com sucesso');
    res.json({ success: true, message: 'recurso atualizado com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Deletar um recurso
const deleteRecurso = async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input('idrecurso', req.params.id)
      .query('DELETE FROM recursos WHERE idrecurso = @idrecurso');
    res.json({ success: true, message: 'recurso deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getRecursos,
  getRecursoById,
  createRecurso,
  updateRecurso,
  deleteRecurso,
};
