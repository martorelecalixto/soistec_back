const { poolPromise } = require('../db');
const { get } = require('../routes/permissoesRoutes');

// Obter todas as usuarios grupos
/*
const getUsuariosGrupos = async (req, res) => {
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
    let whereClause = 'WHERE usuariosgrupos.empresa = @empresa';

    whereClause += ' ORDER BY usuariosgrupos.idgrupopermissao ';

   const query =
    `SELECT usuariosgrupos.idgrupopermissao, usuariosgrupos.idusuario, usuariosgrupos.empresa
    FROM            usuariosgrupos 
    ${whereClause}`

   const result = await request.query(query);

    res.json(result.recordset);    
  } catch (error) {
    res.status(500).send(error.message);
  }
};
*/

// Obter todas as usuario grupos
const getUsuariosGrupos = async (req, res) => {
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

// Obter todas os UsuariosGrupos que não pertencem a um grupo
const getUsuariosGruposFora = async (req, res) => {
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
    let whereClause = 'AND Usuarios.empresa = @empresa';

    whereClause += ' ORDER BY Usuarios.nome ';

   const query =
    `
      SELECT        Cast(0 AS BIT) AS selecionado, Usuarios.nome AS usuario, Usuarios.email, isnull(GruposPermissoes.nome,'') AS grupo, Usuarios.idusuario, Usuarios.empresa,
                    UsuariosGrupos.idgrupopermissao
      FROM            GruposPermissoes INNER JOIN
                              UsuariosGrupos ON GruposPermissoes.idgrupopermissao = UsuariosGrupos.idgrupopermissao RIGHT OUTER JOIN
                              Usuarios ON UsuariosGrupos.idusuario = Usuarios.idusuario
      WHERE Usuarios.idusuario NOT IN 
      (Select UsuariosGrupos.idusuario from UsuariosGrupos where UsuariosGrupos.idgrupopermissao =  @idgrupopermissao)
      ${whereClause}`

   const result = await request.query(query);
   //console.log(query);
   //console.log(result);

    res.json(result.recordset);    
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Obter todas os UsuariosGrupos que pertencem a um grupo
const getUsuariosGruposDentro = async (req, res) => {
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
    let whereClause = 'WHERE Usuarios.empresa = @empresa';
    whereClause += ' AND UsuariosGrupos.idgrupopermissao = @idgrupopermissao';

    whereClause += ' ORDER BY Usuarios.nome, Usuarios.email ';

   const query =
    `
      SELECT        Usuarios.idusuario, Usuarios.nome as usuario, Usuarios.email, UsuariosGrupos.idgrupopermissao
      FROM            Usuarios INNER JOIN
                              UsuariosGrupos ON Usuarios.idusuario = UsuariosGrupos.idusuario
    ${whereClause}`

    //console.log(query);

   const result = await request.query(query);
   //console.log(result);

    res.json(result.recordset);    
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Obter um usuario grupo pelo ID
const getUsuarioGrupoById = async (req, res) => {
  try {
    
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('idgrupopermissao', req.params.idgrupopermissao)
      .input('idusuario', req.params.idusuario)
      .query(
        `SELECT idgrupopermissao, idusuaio, 
          empresa FROM usuariosgrupos  WHERE idgrupopermissao = @idgrupopermissao AND idusuario = @idusuario`
      );

    if (result.recordset.length > 0) {
      res.json(result.recordset[0]);
    } else {
      res.status(404).send('usuarios grupos não encontrado');
    }

  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Criar uma novo usuario grupo
const createUsuarioGrupo = async (req, res) => {
  try {
    //console.log('ENTROU NA API');
    const grupos = req.body; // espera receber um array de objetos

    if (!Array.isArray(grupos)) {
      return res.status(400).json({ success: false, message: 'O body deve ser uma lista de permissões' });
    }
  //console.log(grupos);
    const listaIdUsuario = [];

    for (const grupo of grupos) {
      const {
        idgrupopermissao,
        idgrupopermissaoold,
        idusuario,
        empresa,
      } = grupo;


      //************** DELETA GRUPO CASO USUARIO PERTENÇA A OUTRO *************** */ 
      if(idgrupopermissaoold){
      const poolDel = await poolPromise;
      await poolDel
        .request()
        .input('idgrupopermissaoold', idgrupopermissaoold)
        .input('idusuario', idusuario)
        .query(`
          DELETE FROM usuariosgrupos WHERE idgrupopermissao = @idgrupopermissaoold AND idusuario = @idusuario
        `);
      }

      //console.log(grupo);
      //************** INSERE GRUPO DE USUARIOS ***************** */
      const poolGur = await poolPromise;
      const resultGur = await poolGur
        .request()
        .input('idgrupopermissao', idgrupopermissao)
        .input('idusuario', idusuario)
        .input('empresa', empresa)
        .query(`
          INSERT INTO usuariosgrupos (
              idgrupopermissao,
              idusuario,
              empresa
          )
          OUTPUT INSERTED.idusuario
          VALUES (
              @idgrupopermissao,
              @idusuario,
              @empresa
          )
        `);
    //    console.log(resultGur);

      const id = resultGur.recordset[0].idusuario;

      // Adiciona na lista de retorno
      listaIdUsuario.push(id);

    }  
    
    //console.log(listaIdUsuario);

    // Retorna a lista de idrecurso
    res.status(201).json({
      success: true,
      message: 'Usuarios adicionados com sucesso',
      idusuarios: listaIdUsuario
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }

};


// Atualizar um usuarios grupos existente
const updateUsuarioGrupo = async (req, res) => {
  try {
    const {
      idgrupopermissao, idusuario
    } = req.body;

    const pool = await poolPromise;
    await pool
      .request()
      .input('idgrupopermissao', req.params.idgrupopermissao)
      .input('idusuario', req.params.idusuario)
      .input('idgrupopermissao', idgrupopermissao)
      .input('idusuario', idusuario)
      .query(
        `UPDATE usuariosgrupos SET
          idgrupopermissao = @idgrupopermissao,
          idusuario = @idusuario
        WHERE idgrupopermissao = @idgrupopermissao AND idusuario = @idusuario`
      );

    res.json({ success: true, message: 'usuarios grupos atualizado com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Deletar um usuario grupo
const deleteUsuarioGrupo = async (req, res) => {
  try {
    const pool = await poolPromise;
    //console.log(req.params.idgrupopermissao);
    await pool
      .request()
      .input('idgrupopermissao', req.params.idgrupopermissao)
      .input('idusuario', req.params.idusuario)
      .query('DELETE FROM usuariosgrupos WHERE idgrupopermissao = @idgrupopermissao AND idusuario = @idusuario');
    res.json({ success: true, message: 'usuario grupo deletado com sucesso' });
    //console.log('usuario grupo deletado com sucesso');
    //console.log(req.params.idgrupopermissao);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getUsuariosGrupos,
  getUsuarioGrupoById,
  createUsuarioGrupo,
  updateUsuarioGrupo,
  deleteUsuarioGrupo,
  getUsuariosGruposDentro,
  getUsuariosGruposFora
};
