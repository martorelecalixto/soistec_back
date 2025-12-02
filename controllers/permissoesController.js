const { poolPromise } = require('../db');

// Obter todas as permissoes
const getPermissoes = async (req, res) => {
  try {
    const { empresa  } = req.query;

    // Verifica se o parâmetro 'empresa' foi fornecido
    if (!empresa) {
      return res.status(400).json({ success: false, message: 'O parâmetro "empresa" é obrigatório.' });
    }

    // Parâmetros obrigatórios
    const pool = await poolPromise;
    const request = pool.request();

    request.input('empresa', empresa);

    // Parâmetros opcionais
    let whereClause = 'WHERE GruposPermissoes.empresa = @empresa';

    whereClause += ' GROUP BY  GruposPermissoes.idgrupopermissao, GruposPermissoes.nome, GruposPermissoes.descricao ORDER BY GruposPermissoes.nome ';

   const query =
    `
        SELECT        GruposPermissoes.idgrupopermissao, GruposPermissoes.nome AS grupo, GruposPermissoes.descricao
        FROM            Permissoes INNER JOIN
                                Recursos ON Permissoes.idrecurso = Recursos.idrecurso RIGHT OUTER JOIN
                                GruposPermissoes ON Permissoes.idgrupopermissao = GruposPermissoes.idgrupopermissao        
    ${whereClause}`

   const result = await request.query(query);
  // console.log(query);
  // console.log(result);

    res.json(result.recordset);    
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Obter todas as permissoes que não pertencem a um grupo
const getPermissoesFora = async (req, res) => {
  try {
    const { empresa, idgrupopermissao  } = req.query;

    // Verifica se o parâmetro 'empresa' foi fornecido
    if (!empresa) {
      return res.status(400).json({ success: false, message: 'O parâmetro "empresa" é obrigatório.' });
    }

    // Parâmetros obrigatórios
    const pool = await poolPromise;
    const request = pool.request();

    request.input('empresa', empresa);
    request.input('idgrupopermissao', idgrupopermissao);

    // Parâmetros opcionais
    let whereClause = 'AND Recursos.idrecurso > 0';

    whereClause += ' ORDER BY Recursos.nome ';

   const query =
    `
      SELECT        Cast(0 AS BIT) AS selecionado, Recursos.nome AS recurso, Recursos.descricao, Recursos.idrecurso, Recursos.empresa, Recursos.tipo
      FROM            Recursos 
      WHERE Recursos.idrecurso NOT IN 
      (Select Permissoes.idrecurso from permissoes where permissoes.idgrupopermissao = @idgrupopermissao)
      ${whereClause}`

   const result = await request.query(query);
   //console.log(query);
   //console.log(result);

    res.json(result.recordset);    
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Obter todas as permissoes que pertencem a um grupo
const getPermissoesDentro = async (req, res) => {
  try {
    const { empresa, idgrupopermissao  } = req.query;

    // Verifica se o parâmetro 'empresa' foi fornecido
    if (!empresa) {
      return res.status(400).json({ success: false, message: 'O parâmetro "empresa" é obrigatório.' });
    }

    // Parâmetros obrigatórios
    const pool = await poolPromise;
    const request = pool.request();

    request.input('empresa', empresa);
    request.input('idgrupopermissao', idgrupopermissao);
    //console.log(empresa);
    //console.log(idgrupopermissao);

    // Parâmetros opcionais
    let whereClause = 'WHERE GruposPermissoes.empresa = @empresa';
    whereClause += ' AND GruposPermissoes.idgrupopermissao = @idgrupopermissao';

    whereClause += ' ORDER BY GruposPermissoes.nome, Recursos.nome ';

   const query =
    `
      SELECT        GruposPermissoes.nome AS grupo, Recursos.nome AS recurso, Recursos.descricao, Permissoes.idgrupopermissao, Permissoes.idrecurso, Permissoes.permitido, Permissoes.empresa
      FROM            Permissoes INNER JOIN
                              GruposPermissoes ON Permissoes.idgrupopermissao = GruposPermissoes.idgrupopermissao INNER JOIN
                              Recursos ON Permissoes.idrecurso = Recursos.idrecurso
    ${whereClause}`

    //console.log(query);

   const result = await request.query(query);
   //console.log(result);

    res.json(result.recordset);    
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Obter uma permissão pelo ID
const getPermissaoById = async (req, res) => {
  try {
    
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('idgrupopermissao', req.params.idgrupopermissao)
      .input('idrecurso', req.params.idrecurso)
      .query(
        `SELECT idgrupopermissao, idrecurso, permitido,
          empresa FROM permissoes  WHERE idgrupopermissao = @idgrupopermissao AND idrecurso = @idrecurso`
      );

    if (result.recordset.length > 0) {
      res.json(result.recordset[0]);
    } else {
      res.status(404).send('permissão não encontrada');
    }

  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Criar uma permissão
const createPermissao = async (req, res) => {
  try {
    //console.log('ENTROU NA API');
    const permissoes = req.body; // espera receber um array de objetos

    if (!Array.isArray(permissoes)) {
      return res.status(400).json({ success: false, message: 'O body deve ser uma lista de permissões' });
    }

    const listaIdRecurso = [];

    for (const permissao of permissoes) {
      const {
        idgrupopermissao,
        idrecurso,
        empresa,
      } = permissao;

      //************** INSERE PERMISSÃO ***************** */
      const poolPer = await poolPromise;
      const resultPer = await poolPer
        .request()
        .input('idgrupopermissao', idgrupopermissao)
        .input('idrecurso', idrecurso)
        .input('empresa', empresa)
        .query(`
          INSERT INTO permissoes (
              idgrupopermissao,
              idrecurso,
              empresa
          )
          OUTPUT INSERTED.idrecurso
          VALUES (
              @idgrupopermissao,
              @idrecurso,
              @empresa
          )
        `);

      const id = resultPer.recordset[0].idrecurso;

      // Adiciona na lista de retorno
      listaIdRecurso.push(id);

    }      

    // Retorna a lista de idrecurso
    res.status(201).json({
      success: true,
      message: 'Recursos adicionados com sucesso',
      idrecursos: listaIdRecurso
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
  






  /*
  try {
    const {
      idgrupopermissao, idrecurso, permitido, empresa
    } = req.body;
    const pool = await poolPromise;
    await pool
      .request()
      .input('idgrupopermissao', idgrupopermissao)
      .input('idrecurso', idrecurso)
      .input('permitido', permitido)
      .input('empresa', empresa)
      .query(
        `INSERT INTO permissoes (
          idgrupopermissao, idrecurso, permitido, empresa
        ) VALUES (
          @idgrupopermissao, @idrecurso, @permitido, @empresa
        )`
      );
    //console.log('permissão criada com sucesso');
    res.status(201).json({ success: true, message: 'permissão criada com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
  */
};

// Atualizar uma permissão existente
const updatePermissao = async (req, res) => {
  try {
    const {
      idgrupopermissao, idrecurso, permitido
    } = req.body;

    const pool = await poolPromise;
    await pool
      .request()
      .input('idgrupopermissao', req.params.idgrupopermissao)
      .input('idrecurso', req.params.idrecurso)
      .input('idgrupopermissao', idgrupopermissao)
      .input('idrecurso', idrecurso)
      .input('permitido', permitido)
      .query(
        `UPDATE permissoes SET
          idgrupopermissao = @idgrupopermissao,
          idrecurso = @idrecurso
          permitido = @permitido
        WHERE idgrupopermissao = @idgrupopermissao AND idrecurso = @idrecurso`
      );

    res.json({ success: true, message: 'permissão atualizada com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Deletar uma permissão
const deletePermissao = async (req, res) => {
  try {
    //console.log(req.params);
    const pool = await poolPromise;
    await pool
      .request()
      .input('idgrupopermissao', req.params.idgrupopermissao)
      .input('idrecurso', req.params.idrecurso)
      .query('DELETE FROM permissoes WHERE idgrupopermissao = @idgrupopermissao AND idrecurso = @idrecurso');
    res.json({ success: true, message: 'permissao deletada com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getPermissoes,
  getPermissoesDentro,
  getPermissoesFora,
  getPermissaoById,
  createPermissao,
  updatePermissao,
  deletePermissao,
};
