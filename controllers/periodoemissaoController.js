const { poolPromise } = require('../db');


// Obter todos os periodo emissão
const getPeriodoEmissaoDropDown = async (req, res) => {
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
          `SELECT id, idusuario, datainicial, datafinal, ativo
            FROM periodoemissao ${whereClause}`

      const result = await request.query(query);

      res.json(result.recordset);         

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Obter todos os periodo emissão
const getPeriodoEmissao = async (req, res) => {
  try {
    const { empresa, datainicial, datafinal } = req.query;

    if (!empresa) {
      return res.status(400).json({ success: false, message: 'O parâmetro "empresa" é obrigatório.' });
    }

    const pool = await poolPromise;
    const request = pool.request();

    request.input('empresa', empresa);
    request.input('datainicial', datainicial);
    request.input('datafinal', datafinal);

    let whereClause = 'WHERE PeriodoEmissao.empresa = @empresa';

    whereClause += ' ORDER BY datainicial';

    const query = `SELECT   Usuarios.email AS usuario, PeriodoEmissao.id, PeriodoEmissao.idusuario, 
                            PeriodoEmissao.datainicial, PeriodoEmissao.datafinal, PeriodoEmissao.empresa, PeriodoEmissao.ativo
                    FROM            Usuarios INNER JOIN
                         PeriodoEmissao ON Usuarios.idusuario = PeriodoEmissao.IdUsuario      
      ${whereClause}`;

    const result = await request.query(query);
    res.json(result.recordset);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Obter um periodo emissão pelo ID
const getPeriodoEmissaoById = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('id', req.params.id)
      .query('SELECT id, idusuario, empresa, ativo, datainicial, datafinal FROM periodoemissao WHERE id = @id');

    if (result.recordset.length > 0) {
      res.json(result.recordset[0]);
    } else {
      res.status(404).send('Periodo Emissão não encontrado');
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Criar um novo periodo emissao
const createPeriodoEmissao = async (req, res) => {
  try {

    const { idusuario, empresa, ativo, datainicial, datafinal } = req.body;
    //console.log(req.body);

    const pool = await poolPromise;

    // 1 - CASO TENHA IDUSUARIO
    if (idusuario && idusuario !== '') {

      const check = await pool.request()
        .input('idusuario', idusuario)
        .input('empresa', empresa)
        .query(`
          SELECT idusuario 
          FROM periodoemissao 
          WHERE idusuario = @idusuario
        `);

      if (check.recordset.length > 0) {

        // UPDATE
        await pool.request()
          .input('idusuario', idusuario)
          .input('empresa', empresa)
          .input('ativo', ativo)
          .input('datainicial', datainicial)
          .input('datafinal', datafinal)
          .query(`
            UPDATE periodoemissao
            SET ativo = @ativo,
                datainicial = @datainicial,
                datafinal = @datafinal
            WHERE idusuario = @idusuario
          `);

      } else {

        // INSERT
        await pool.request()
          .input('idusuario', idusuario)
          .input('empresa', empresa)
          .input('ativo', ativo)
          .input('datainicial', datainicial)
          .input('datafinal', datafinal)
          .query(`
            INSERT INTO periodoemissao
            (idusuario, empresa, ativo, datainicial, datafinal)
            VALUES
            (@idusuario, @empresa, @ativo, @datainicial, @datafinal)
          `);
      }

    } 
    // 2 - CASO IDUSUARIO VAZIO
    else {

      const usuarios = await pool.request()
        .input('empresa', empresa)
        .query(`
          SELECT idusuario 
          FROM usuarios 
          WHERE empresa = @empresa
          AND Isnull(ativo,0) = 1
        `);

      for (const user of usuarios.recordset) {

        const check = await pool.request()
          .input('idusuario', user.idusuario)
          .query(`
            SELECT idusuario 
            FROM periodoemissao 
            WHERE idusuario = @idusuario
          `);

        if (check.recordset.length > 0) {

          // UPDATE
          await pool.request()
            .input('idusuario', user.idusuario)
            .input('empresa', empresa)
            .input('ativo', ativo)
            .input('datainicial', datainicial)
            .input('datafinal', datafinal)
            .query(`
              UPDATE periodoemissao
              SET ativo = @ativo,
                  datainicial = @datainicial,
                  datafinal = @datafinal
              WHERE idusuario = @idusuario
            `);

        } else {

          // INSERT
          await pool.request()
            .input('idusuario', user.idusuario)
            .input('empresa', empresa)
            .input('ativo', ativo)
            .input('datainicial', datainicial)
            .input('datafinal', datafinal)
            .query(`
              INSERT INTO periodoemissao
              (idusuario, empresa, ativo, datainicial, datafinal)
              VALUES
              (@idusuario, @empresa, @ativo, @datainicial, @datafinal)
            `);

        }

      }

    }

    res.status(201).json({
      success: true,
      message: 'Periodo de emissão processado com sucesso'
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

/*
const createPeriodoEmissao = async (req, res) => {
  try {
   // console.log(req.body);
    const { idusuario, empresa, ativo, datainicial, datafinal  } = req.body;

    const pool = await poolPromise;
    await pool
      .request()
      .input('idusuario', idusuario)
      .input('empresa', empresa)
      .input('ativo', ativo)
      .input('datainicial', datainicial)
      .input('datafinal', datafinal)
      .query('INSERT INTO periodoemissao (idusuario, empresa, ativo, datainicial, datafinal ' +
        'VALUES (@idusuario, @empresa, @ativo, @datainicial, @datafinal ' +
        ')'
      );
//console.log('Forma Pagamento criado com sucesso');
    res.status(201).json({ success: true, message: 'Periodo Emissão criado com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
*/

// Atualizar uma forma pagamento existente
const updatePeriodoEmissao = async (req, res) => {
  try {
    const {  idusuario, empresa, ativo, datainicial, datafinal } = req.body;

    const pool = await poolPromise;
    await pool
      .request()
      .input('id', req.params.id)
      .input('idusuario', idusuario)
      .input('empresa', empresa)
      .input('ativo', ativo)
      .input('datainicial', datainicial)
      .input('datafinal', datafinal)
      .query('UPDATE periodoemissao SET ' +
        'idusuario = @idusuario, ativo = @ativo, datainicial = @datainicial, datafinal = @datafinal ' +
        ' WHERE id = @id');

    res.json({ success: true, message: 'Periodo Emissão atualizada com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Deletar um Periodo Emissão
const deletePeriodoEmissao = async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input('id', req.params.id)
      .query('DELETE FROM periodoemissao WHERE id = @id');

    res.json({ success: true, message: 'Periodo emissão deletado com sucesso' });
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

const getBuscarPeriodoEmissao = async (req, res) => {
  try {
    const { empresa, idusuario, data } = req.query;
    const sql = require('mssql');

    // Validação empresa
    if (!empresa) {
      return res.status(400).json({
        success: false,
        message: 'O parâmetro "empresa" é obrigatório.'
      });
    }

    // Validação data
    if (!data) {
      return res.status(400).json({
        success: false,
        message: 'O parâmetro "data" é obrigatório.'
      });
    }

    const pool = await poolPromise;

    // =============================
    // 1️⃣ Verifica se existe registro para o idusuario
    // =============================
    if (idusuario) {
      const checkRequest = pool.request();
      checkRequest.input('empresa', empresa);
      checkRequest.input('idusuario', idusuario);

      const checkQuery = `
        SELECT TOP 1 id
        FROM periodoemissao
        WHERE empresa = @empresa
        AND idusuario = @idusuario
      `;

      const checkResult = await checkRequest.query(checkQuery);

      // Se NÃO existir registro → retorna 1
      if (checkResult.recordset.length === 0) {
        return res.json({
          success: true,
          total: 1,
          data: [{ id: 1 }]
        });
      }
    }

    // =============================
    // 2️⃣ Executa consulta atual
    // =============================
    const request = pool.request();

    request.input('empresa', empresa);
    request.input('data', sql.Date, data);

    let whereClause = `
      WHERE periodoemissao.empresa = @empresa
    `;

    if (idusuario) {
      request.input('idusuario', idusuario);
      whereClause += ' AND periodoemissao.idusuario = @idusuario';
    }

    const query = `
      SELECT 
        periodoemissao.id
      FROM periodoemissao
      ${whereClause}
      AND (
          (
            (periodoemissao.datainicial <= @data AND periodoemissao.datafinal >= @data)
            AND (ISNULL(periodoemissao.ativo,0) = 1)
          )
          OR (ISNULL(periodoemissao.ativo,0) = 0)
      )
    `;

    const result = await request.query(query);

    res.json({
      success: true,
      total: result.recordset.length,
      data: result.recordset
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erro interno no servidor",
      error: error.message
    });
  }
};

/*
const getBuscarPeriodoEmissao = async (req, res) => {
  try {
    //console.log('getBuscarCopet chamado com query:', req.query);
    const { empresa, idusuario,  data } = req.query;
    const sql = require('mssql');

    // Verifica se o parâmetro 'empresa' foi fornecido
    if (!empresa) {
      return res.status(400).json({
        success: false,
        message: 'O parâmetro "empresa" é obrigatório.'
      });
    }

    // Verifica se datas foram enviadas
    if (!data) {
      return res.status(400).json({
        success: false,
        message: 'Os parâmetros "data" é obrigatório.'
      });
    }

    const pool = await poolPromise;
    const request = pool.request();

    // Parâmetros obrigatórios
    request.input('empresa', empresa);
    request.input('data', data);

    // WHERE inicial
    let whereClause = `
      WHERE periodoemissao.empresa = @empresa          
    `;

    // Filtros opcionais
    if (idusuario) {
      request.input('idusuario', idusuario);
      whereClause += ' AND periodoemissao.idusuario = @idusuario';
    }

    // Query final
    const query = `
      SELECT 
        periodoemissao.id
      FROM periodoemissao

      ${whereClause}
      AND (
           ( ((periodoemissao.datainicial <= @data) AND (periodoemissao.datafinal >= @data)) 
              AND  (isnull(periodoemissao.ativo,0) = 1)
            ) OR
            (isnull(periodoemissao.ativo,0) = 0)
      )
    `;
    //console.log('Executando query:', query);

    //Script  com condição para trazer período emissão OK
    //  AND (
    //       ( ((periodoemissao.datainicial <= @data) AND (periodoemissao.datafinal >= @data)) 
    //          AND  (isnull(periodoemissao.ativo,0) = 1)
    //        ) OR
    //        (isnull(periodoemissao.ativo,0) = 0)
    //  )


    const result = await request.query(query);
    //console.log('Resultado da query:', result);
    // Resposta formatada

    res.json({
      success: true,
      total: result.recordset.length, // quantidade total
      data: result.recordset          // registros retornados
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erro interno no servidor",
      error: error.message
    });
  }
};
*/

module.exports = {
  getPeriodoEmissao,
  getPeriodoEmissaoById,
  createPeriodoEmissao,
  updatePeriodoEmissao,
  deletePeriodoEmissao,
  getPeriodoEmissaoDropDown,
  getBuscarPeriodoEmissao,
};
