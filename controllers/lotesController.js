const { poolPromise } = require('../db');

function normalizeDate(dateString) {
  if (!dateString) return null;
  const d = new Date(dateString);
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString(); // sempre "YYYY-MM-DDT00:00:00.000Z"
}

// Obter todas os lotes
const getLotesDropDown = async (req, res) => {
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
          `SELECT idlote, nome
            FROM lotes ${whereClause}`

      const result = await request.query(query);

      res.json(result.recordset);         

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Obter todas os lotes
const getLotes = async (req, res) => {
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

    whereClause += ' ORDER BY datainicio ';

   const query =
    `SELECT idlote, idevento, datacadastro, datainicio, datafim, quantidade, valor, nome, 
      empresa FROM lotes ${whereClause}`

   const result = await request.query(query);

    res.json(result.recordset);    
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Obter um lote pelo ID
const getLoteById = async (req, res) => {
  try {
    const { empresa, nome } = req.query;

    // Verifica se o parâmetro 'empresa' foi fornecido
    if (!empresa) {
      return res.status(400).json({ success: false, message: 'O parâmetro "empresa" é obrigatório.' });
    }
    
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('id', req.params.id)
      .query(
        `SELECT idlote, nome, 
          empresa FROM lotes  WHERE idlote = @id ORDER BY nome`
      );

    if (result.recordset.length > 0) {
      res.json(result.recordset[0]);
    } else {
      res.status(404).send('lote não encontrado');
    }

  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Criar um novo lote
const createLote = async (req, res) => {
  //console.log('Criando um novo lote...');
  try {
    const {
      nome,
      datacadastro,
      datainicio,
      datafim,
      quantidade,
      valor,
      idevento,
      empresa
    } = req.body;
//console.log('Dados recebidos:', req.body);

    const dataEventoIniNorm = normalizeDate(datainicio);
    const dataEventoFinNorm = normalizeDate(datafim);
    const dataCadastroNorm = normalizeDate(datacadastro);

    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('idevento', idevento)
      .input('nome', nome)
      .input('datacadastro', dataCadastroNorm)
      .input('datainicio', dataEventoIniNorm)
      .input('datafim', dataEventoFinNorm)
      .input('quantidade', quantidade)
      .input('valor', valor)
      .input('empresa', empresa)
      .query(
        `INSERT INTO lotes (
          idevento, nome, datacadastro, datainicio, datafim, quantidade, valor, empresa
        ) 
        OUTPUT INSERTED.idlote  
        VALUES (
          @idevento, @nome, @datacadastro, @datainicio, @datafim, @quantidade, @valor, @empresa
        )`
      );

    const idlote = result.recordset[0].idlote;

    res.status(201).json({ success: true, idlote, message: 'Lote criado com sucesso' });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Atualizar um lote existente
const updateLote = async (req, res) => {
  try {
    const {
      idlote,
      nome, 
      datacadastro,
      datainicio,
      datafim,
      quantidade,
      valor
    } = req.body;

    const pool = await poolPromise;
    await pool
      .request()
      .input('idlote', idlote)
      .input('nome', nome)
      .input('datacadastro', datacadastro)
      .input('datainicio', datainicio)
      .input('datafim', datafim)
      .input('quantidade', quantidade)
      .input('valor', valor)
      .query(
        `UPDATE lotes SET
          nome = @nome,
          datainicio = @datainicio,
          datafim = @datafim,
          quantidade = @quantidade,
          valor = @valor
        WHERE idlote = @idlote`
      );

    res.json({ success: true, message: 'Lote atualizado com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Deletar um lote
const deleteLote = async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input('idlote', req.params.idlote)
      .query('DELETE FROM lotes WHERE idlote = @idlote');
    res.json({ success: true, message: 'Lote deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Obter lotes  pelo ID EVENTO
const getLotesByIdEvento = async (req, res) => {
  try {
   
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('idevento', req.params.idevento)
      .query(
        `SELECT        idlote, idevento, datacadastro, datainicio, 
            datafim, quantidade, valor, empresa, nome
          FROM   Lotes
          WHERE Lotes.IdEvento = @idevento ORDER BY Lotes.DataInicio
          `
      );
//console.log('idvenda: ' + req.params.idvenda);

    if (result.recordset.length > 0) {
      res.json(result.recordset);
    } else {
      res.status(404).send('lotes do evento não encontrado');
    }
    

  } catch (error) {
    res.status(500).send(error.message);
  }
};


module.exports = {
  getLotes,
  getLoteById,
  createLote,
  updateLote,
  deleteLote,
  getLotesDropDown,
  getLotesByIdEvento
};
