const { poolPromise } = require('../db');

function normalizeDate(dateString) {
  if (!dateString) return null;
  const d = new Date(dateString);
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString(); // sempre "YYYY-MM-DDT00:00:00.000Z"
}

// Obter todas os eventos
const getEventosDropDown = async (req, res) => {
  try {
      const { empresa } = req.query;
     // console.log('Query Params DropDow:', req.query);

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
          `SELECT idevento, nome
            FROM eventos ${whereClause}`
      const result = await request.query(query);

      res.json(result.recordset);         

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Obter todas os eventos
const getEventos = async (req, res) => {
  try {
    const { empresa, nome } = req.query;
  //  console.log('Query Params:', req.query);

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
    `SELECT idevento, id, nome, descricao, local, dataeventoini, dataeventofin, datacadastro, quantidade, idtipo, idfilial, identidade, valor,
      empresa FROM eventos ${whereClause}`

   const result = await request.query(query);
//console.log('Eventos encontrados:', result.recordset.length);
    res.json(result.recordset);    
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Criar um novo evento
const createEventos = async (req, res) => {
  try {
    const {
      id,
      identidade,
      idfilial,
      nome,
      descricao,
      local,
      dataeventoini,
      dataeventofin,
      datacadastro,
      quantidade,
      idtipo,
      empresa
    } = req.body;
    //console.log('REQ.BODY::', req.body);

    const dataEventoIniNorm = normalizeDate(dataeventoini);
    const dataEventoFinNorm = normalizeDate(dataeventofin);
    const dataCadastroNorm = normalizeDate(datacadastro);

    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('id', id)
      .input('dataeventoini', dataEventoIniNorm)
      .input('dataeventofin', dataEventoFinNorm)
      .input('datacadastro', dataCadastroNorm)
      .input('identidade', identidade)
      .input('nome', nome)
      .input('descricao', descricao)
      .input('local', local)
      .input('quantidade', quantidade)
      .input('idtipo', idtipo)
      .input('idfilial', idfilial)
      .input('empresa', empresa)
      .query(`
        INSERT INTO eventos (
          id, dataeventoini, dataeventofin, idfilial, datacadastro, identidade, nome, descricao,
          local, quantidade, idtipo, empresa
        )
        OUTPUT INSERTED.idevento
        VALUES (
          @id, @dataeventoini, @dataeventofin, @idfilial, @datacadastro, @identidade, @nome, @descricao,
          @local, @quantidade, @idtipo, @empresa
        )
      `);
      //console.log('Resultado do INSERT:', result);
    const idevento = result.recordset[0].idevento;

    res.status(201).json({ success: true, idevento, message: 'Evento criado com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Atualizar um evento existente
const updateEventos = async (req, res) => {
 // console.log('--- updateEventos START ---');
  try {
    const {
      idevento,
      identidade,
      idfilial,
      nome,
      descricao,
      local,
      dataeventoini,
      dataeventofin,
      datacadastro,
      quantidade,
      idtipo,
      valor,
      empresa
    } = req.body;
//console.log('REQ.BODY::', req.body);
    const dataEventoIniNorm = normalizeDate(dataeventoini);
    const dataEventoFinNorm = normalizeDate(dataeventofin);
    const dataCadastroNorm = normalizeDate(datacadastro);
   //console.log('Datas normalizadas:', { dataEventoNorm, dataCadastroNorm });

    const pool = await poolPromise;

    // ====== UPDATE eventos ======
    //console.log('Executando UPDATE em eventos...');
    //
     const updateResult =await pool
      .request()
      .input('idevento', idevento)//req.params.idvento
      .input('dataeventoini', dataEventoIniNorm)
      .input('dataeventofin', dataEventoFinNorm)
      .input('datacadastro', dataCadastroNorm)
      .input('identidade', identidade)
      .input('idfilial', idfilial)
      .input('nome', nome)
      .input('descricao', descricao)
      .input('local', local)
      .input('quantidade', quantidade)
      .input('idtipo', idtipo)
      .input('valor', valor)
      .input('empresa', empresa)
      .query(`
        UPDATE eventos SET
          dataeventoini = @dataeventoini,
          dataeventofin = @dataeventofin,
          idfilial = @idfilial,
          datacadastro = @datacadastro,
          identidade = @identidade,
          nome = @nome,
          descricao = @descricao,
          local = @local,
          quantidade = @quantidade,
          idtipo = @idtipo,
          valor = @valor
        WHERE idevento = @idevento      `);
//console.log('Resultado do UPDATE:', updateResult);

    //.log('--- updateVendasBilhete END (sucesso) ---');
    res.json({ success: true, message: 'Evento atualizado com sucesso' });

  } catch (error) {
    console.error('Erro geral em updateEventos:', error.message || error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Deletar um evento
const deleteEventos = async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input('idevento', req.params.idevento)
      .query('DELETE FROM eventos WHERE idevento = @idevento');
    res.json({ success: true, message: 'Evento deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getEventosDropDown,
  getEventos,
  createEventos,
  updateEventos,
  deleteEventos,
};
