const { poolPromise } = require('../db');

// Obter todas as grupos permissões
const getGruposPermissoes = async (req, res) => {
  try {
    const { empresa, nome  } = req.query;

    // Verifica se o parâmetro 'empresa' foi fornecido
    if (!empresa) {
      return res.status(400).json({ success: false, message: 'O parâmetro "empresa" é obrigatório.' });
    }

    // Parâmetros obrigatórios
    const pool = await poolPromise;
    const request = pool.request();

    request.input('empresa', empresa);
    //console.log('Empresa:', empresa);

    // Parâmetros opcionais
    let whereClause = 'WHERE grupospermissoes.empresa = @empresa';

    if (nome) {
      whereClause += ' AND grupospermissoes.nome LIKE @nome';
      request.input('nome', `%${nome}%`);
    }

    whereClause += ' ORDER BY grupospermissoes.nome ';

   const query =
    `SELECT grupospermissoes.idgrupopermissao, grupospermissoes.nome, 
      grupospermissoes.descricao, grupospermissoes.empresa
    FROM            grupospermissoes 
    ${whereClause}`

    //console.log('SQL Query:', query);
   const result = await request.query(query);
   //console.log('Query Result:', result);

    res.json(result.recordset);    
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Obter uma grupo permissão pelo ID
const getGrupoPermissaoById = async (req, res) => {
  try {
    
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('idgrupopermissao', req.params.id)
      .query(
        `SELECT idgrupopermissao, nome, descricao, 
          empresa FROM grupospermissoes  WHERE idgrupopermissao = @idgrupopermissao ORDER BY nome`
      );

    if (result.recordset.length > 0) {
      res.json(result.recordset[0]);
    } else {
      res.status(404).send('Grupo permissão não encontrado');
    }

  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Criar uma novo grupo permissão
const createGrupoPermissao = async (req, res) => {
  try {
    const {
      nome, descricao, empresa
    } = req.body;
    const pool = await poolPromise;
    await pool
      .request()
      .input('nome', nome)
      .input('descricao', descricao)
      .input('empresa', empresa)
      .query(
        `INSERT INTO grupospermissoes (
          nome, descricao, empresa
        ) VALUES (
          @nome, @descricao, @empresa
        )`
      );
    //console.log('Conta bancaria criada com sucesso');
    res.status(201).json({ success: true, message: 'grupos permissoes criado com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Atualizar um grupo permissão existente
const updateGrupoPermissao = async (req, res) => {
  try {
    const {
      nome, descricao
    } = req.body;
   // console.log('ID do grupo permissão a ser atualizado:', req.params.idgrupopermissao);

    const pool = await poolPromise;
    await pool
      .request()
      .input('idgrupopermissao', req.params.idgrupopermissao)
      .input('nome', nome)
      .input('descricao', descricao)
      .query(
        `UPDATE grupospermissoes SET
          nome = @nome,
          descricao = @descricao
        WHERE idgrupopermissao = @idgrupopermissao`
      );

    res.json({ success: true, message: 'grupo permissão atualizado com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Deletar uma grupo permissão
const deleteGrupoPermissao = async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input('idgrupopermissao', req.params.id)
      .query('DELETE FROM grupospermissoes WHERE idgrupopermissao = @idgrupopermissao');
    res.json({ success: true, message: 'Grupo permissão deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getGruposPermissoes,
  getGrupoPermissaoById,
  createGrupoPermissao,
  updateGrupoPermissao,
  deleteGrupoPermissao,
};
