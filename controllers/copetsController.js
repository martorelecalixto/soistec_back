const { poolPromise } = require('../db');

// Obter todas os copets
const getCopet = async (req, res) => {
  try {
    const { empresa, idciaaerea, idoperadora, datainicial, datafinal } = req.query;
    //console.log(req.query);
    const sql = require('mssql');
    // Verifica se o parâmetro 'empresa' foi fornecido
    if (!empresa) {
      return res.status(400).json({ success: false, message: 'O parâmetro "empresa" é obrigatório.' });
    }
    
    // Parâmetros obrigatórios
    const pool = await poolPromise;
    const request = pool.request();

    request.input('empresa', empresa);

    // Parâmetros opcionais
    let whereClause = 'WHERE copets.empresa = @empresa AND copets.id > 0 ';

    // Filtros opcionais
    if (idciaaerea) {
      request.input('idciaaerea', idciaaerea);
      whereClause += ' AND copets.idciaaerea = @idciaaerea';
    }

    if (idoperadora) {
      request.input('idoperadora', idoperadora);
      whereClause += ' AND copets.idoperadora = @idoperadora';
    }

    if (datainicial) {
      request.input('datainicial', datainicial);
      whereClause += ' AND copets.datainicial >= @datainicial';
    }
    
    if (datafinal) {
      request.input('datafinal', datafinal);
      whereClause += ' AND copets.datafinal <= @datafinal';
    }


    whereClause += ' ORDER BY copets.datainicial desc ';

    const query =
     `SELECT copets.id, copets.empresa, copets.datainicial, copets.datafinal, copets.idciaaerea, copets.idoperadora,
             copets.venctocopet, copets.venctocopetog, copets.venctocliente, copets.venctoclienteog,
              Entidades.Nome AS ciaaerea, Entidades_1.Nome AS operadora
      FROM   Entidades AS Entidades_1 RIGHT OUTER JOIN
             Copets ON Entidades_1.IdEntidade = Copets.IdOperadora LEFT OUTER JOIN
             Entidades ON Copets.IdCiaAerea = Entidades.IdEntidade
             ${whereClause}  `
   const result = await request.query(query);
   //console.log(query);
   //console.log(result);
   res.json(result.recordset);    
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Obter todas os copets
// Obter todos os copets
const getBuscarCopet = async (req, res) => {
  try {
    //console.log('getBuscarCopet chamado com query:', req.query);
    const { empresa, idciaaerea, idoperadora, datainicial, datafinal } = req.query;
    const sql = require('mssql');

    // Verifica se o parâmetro 'empresa' foi fornecido
    if (!empresa) {
      return res.status(400).json({
        success: false,
        message: 'O parâmetro "empresa" é obrigatório.'
      });
    }

    // Verifica se datas foram enviadas
    if (!datainicial || !datafinal) {
      return res.status(400).json({
        success: false,
        message: 'Os parâmetros "datainicial" e "datafinal" são obrigatórios.'
      });
    }

    const pool = await poolPromise;
    const request = pool.request();

    // Parâmetros obrigatórios
    request.input('empresa', empresa);
    request.input('datainicial', datainicial);
    request.input('datafinal', datafinal);

    // WHERE inicial
    let whereClause = `
      WHERE copets.empresa = @empresa 
        AND copets.id > 0 
    `;

    // Filtros opcionais
    if (idciaaerea != null && idciaaerea.isNotEmpty) {
      request.input('idciaaerea', idciaaerea);
      whereClause += ' AND copets.idciaaerea = @idciaaerea';
    }

    if (idoperadora != null && idoperadora.isNotEmptyradora) {
      request.input('idoperadora', idoperadora);
      whereClause += ' AND copets.idoperadora = @idoperadora';
    }

    // Query final
    const query = `
      SELECT 
        copets.id, copets.empresa, copets.datainicial, copets.datafinal, 
        copets.idciaaerea, copets.idoperadora,
        copets.venctocopet, copets.venctocopetog, 
        copets.venctocliente, copets.venctoclienteog,
        Entidades.Nome AS ciaaerea,
        Entidades_1.Nome AS operadora
      FROM Entidades AS Entidades_1 
      RIGHT OUTER JOIN Copets 
        ON Entidades_1.IdEntidade = Copets.IdOperadora 
      LEFT OUTER JOIN Entidades 
        ON Copets.IdCiaAerea = Entidades.IdEntidade

      ${whereClause}
      AND (
            ((copets.datainicial > @datainicial) AND (copets.datainicial <= @datafinal AND copets.datafinal >= @datafinal))
        OR  ((copets.datafinal < @datafinal) AND (copets.datainicial <= @datainicial AND copets.datafinal >= @datainicial))
        OR  ((copets.datainicial <= @datainicial AND copets.datafinal >= @datainicial) 
            AND (copets.datainicial <= @datafinal AND copets.datafinal >= @datafinal))
        OR  ((copets.datainicial > @datainicial AND copets.datafinal < @datafinal))
      )
      ORDER BY copets.datainicial DESC
    `;
//console.log('Executando query:', query);
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

// Obter uma copet pelo ID
const getCopetById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ success: false, message: 'O parâmetro "id" é obrigatório.' });
    }

    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('id', id)
      .query(`
            SELECT copets.id, copets.empresa, copets.datainicial, copets.datafinal, copets.idciaaerea, copets.idoperadora,
                        copets.venctocopet, copets.venctocopetog, copets.venctocliente, copets.venctoclienteog,
                          Entidades.Nome AS ciaaerea, Entidades_1.Nome AS operadora
                  FROM   Entidades AS Entidades_1 RIGHT OUTER JOIN
                        Copets ON Entidades_1.IdEntidade = Copets.IdOperadora LEFT OUTER JOIN
                        Entidades ON Copets.IdCiaAerea = Entidades.IdEntidade
            WHERE copets.id = @id           

      `);

    if (result.recordset.length > 0) {
      res.json(result.recordset[0]);
    } else {
      res.status(404).json({ success: false, message: 'Copet não encontrado.' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Criar um novo copet
const createCopet = async (req, res) => {
  try {
    const {
      datainicial,
      datafinal,
      venctocopet,
      venctocopetog,
      venctocliente,
      venctoclienteog,
      idciaaerea,
      idoperadora,
      empresa
    } = req.body;

    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('datainicial', datainicial)
      .input('datafinal', datafinal)
      .input('venctocopet', venctocopet)
      .input('venctocopetog', venctocopetog)
      .input('venctocliente', venctocliente)
      .input('venctoclienteog', venctoclienteog)
      .input('idciaaerea', idciaaerea)
      .input('idoperadora', idoperadora)
      .input('empresa', empresa)
      .query(`
        INSERT INTO copets (
          datainicial, datafinal, venctocopet, venctocopetog, venctocliente, venctoclienteog,
          idciaaerea, idoperadora, empresa
        )
        OUTPUT INSERTED.id
        VALUES (
          @datainicial, @datafinal, @venctocopet, @venctocopetog, @venctocliente,
          @venctoclienteog, @idciaaerea, @idoperadora, @empresa
        )
      `);

    const id = result.recordset[0].id;

    res.status(201).json({ success: true, idvenda, message: 'copet criado com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Atualizar um copet existente
const updateCopet = async (req, res) => {
  try {
    const {
      datainicial,
      datafinal,
      venctocopet,
      venctocopetog,
      venctocliente,
      venctoclienteog,
      idciaaerea,
      idoperadora
    } = req.body;
    const pool = await poolPromise;
    await pool
      .request()
      .input('id', req.params.id)
      .input('datainicial', datainicial)
      .input('datafinal', datafinal)
      .input('venctocopet', venctocopet)
      .input('venctocopetog', venctocopetog)
      .input('venctocliente', venctocliente)
      .input('venctoclienteog', venctoclienteog)
      .input('idciaaerea', idciaaerea)
      .input('idoperadora', idoperadora)
      .query(`
        UPDATE copets SET
          datainicial = @datainicial,
          datafinal = @datafinal,
          venctocopet = @venctocopet,
          venctocopetog = @venctocopetog,
          venctocliente = @venctocliente,
          venctoclienteog = @venctoclienteog,
          idciaaerea = @idciaaerea,
          idoperadora = @idoperadora
        WHERE id = @id
      `);

    res.json({ success: true, message: 'Copet atualizado com sucesso' });
  } catch (error) {
    
    res.status(500).json({ success: false, message: error.message });
  }
};

// Deletar uma copet
const deleteCopet = async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input('id', req.params.id)
      .query('DELETE FROM copets WHERE id = @id');
    res.json({ success: true, message: 'Copet deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Obter relatorios analítico de copet
const getRelatoriosAnalitico = async (req, res) => {
  try {
    const { empresa, idciaaerea, idoperadora, datainicial, datafinal } = req.query;
    const sql = require('mssql');
    // Verifica se o parâmetro 'empresa' foi fornecido
    if (!empresa) {
      return res.status(400).json({ success: false, message: 'O parâmetro "empresa" é obrigatório.' });
    }
    
    // Parâmetros obrigatórios
    const pool = await poolPromise;
    const request = pool.request();

    request.input('empresa', empresa);

    // Parâmetros opcionais
    let whereClause = 'WHERE copets.empresa = @empresa AND copets.id > 0 ';

    // Filtros opcionais
    if (idciaaerea) {
      request.input('idciaaerea', idciaaerea);
      whereClause += ' AND copets.idciaaerea = @idciaaerea';
    }

    if (idoperadora) {
      request.input('idoperadora', idoperadora);
      whereClause += ' AND copets.idoperadora = @idoperadora';
    }

    if (datainicial) {
      request.input('datainicial', datainicial);
      whereClause += ' AND copets.datainicial >= @datainicial';
    }
    
    if (datafinal) {
      request.input('datafinal', datafinal);
      whereClause += ' AND copets.datafinal <= @datafinal';
    }

    whereClause += ' ORDER BY copets.datainicial desc ';

    const query =
     `SELECT copets.id, copets.empresa, copets.datainicial, copets.datafinal, copets.idciaaerea, copets.idoperadora,
             copets.venctocopet, copets.venctocopetog, copets.venctocliente, copets.venctoclienteog,
              Entidades.Nome AS ciaaerea, Entidades_1.Nome AS operadora
      FROM   Entidades AS Entidades_1 RIGHT OUTER JOIN
             Copets ON Entidades_1.IdEntidade = Copets.IdOperadora LEFT OUTER JOIN
             Entidades ON Copets.IdCiaAerea = Entidades.IdEntidade
             ${whereClause}  `
    const result = await request.query(query);

    res.json(result.recordset);    
  } catch (error) {
    res.status(500).send(error.message);
  }
};


module.exports = {
  getCopet,
  getCopetById,
  createCopet,
  updateCopet,
  deleteCopet,
  getRelatoriosAnalitico, 
  getBuscarCopet
};
