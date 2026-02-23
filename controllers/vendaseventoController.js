const { poolPromise } = require('../db');

function normalizeDate(dateString) {
  if (!dateString) return null;
  const d = new Date(dateString);
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString(); // sempre "YYYY-MM-DDT00:00:00.000Z"
}

// Obter todas os vendas eventos
const getVendasEventoDropDown = async (req, res) => {
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
      whereClause += ' ORDER BY descricao ';

      const query =
          `SELECT idvenda, descricao
            FROM vendaseventos ${whereClause}`
      const result = await request.query(query);

      res.json(result.recordset);         

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Obter todas os venddas eventos
const getVendasEvento = async (req, res) => {
  try {
    const { empresa, idfilial, identidade, datainicial, datafinal, idinicial, idfinal } = req.query;
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
    let whereClause = 'WHERE VendasEventos.empresa = @empresa';

    // Filtros opcionais
    if (idfilial) {
      request.input('idfilial', idfilial);
      whereClause += ' AND vendaseventos.idfilial = @idfilial';
    }

    if (identidade) {
      request.input('identidade', identidade);
      whereClause += ' AND vendaseventos.identidade = @identidade';
    }

  
    if (datainicial) {
      request.input('datainicial', datainicial);
      whereClause += ' AND vendaseventos.datacadastro >= @datainicial';
    }
    
    if (datafinal) {
      request.input('datafinal', datafinal);
      whereClause += ' AND vendaseventos.datacadastro <= @datafinal';
    }

    if (idinicial) {
      request.input('idinicial', idinicial);
      whereClause += ' AND vendaseventos.id >= @idinicial';
    }
    
    if (idfinal) {
      request.input('idfinal', idfinal);
      whereClause += ' AND vendaseventos.id <= @idfinal';
    }

    whereClause += ' ORDER BY vendaseventos.datacadastro ';

   const query =
    `
      SELECT  entidades.nome as entidade, formapagamento.nome as pagamento,
      VendasEventos.idvenda, VendasEventos.id, VendasEventos.idevento, VendasEventos.identidade, 
      VendasEventos.idvendedor, VendasEventos.idformapagamento, VendasEventos.descricao, VendasEventos.datacadastro, 
      VendasEventos.quantidade, VendasEventos.idfilial, VendasEventos.valortotal, VendasEventos.empresa
      FROM            VendasEventos LEFT OUTER JOIN
                              Eventos ON VendasEventos.IdEvento = Eventos.IdEvento LEFT OUTER JOIN
                              FormaPagamento ON VendasEventos.IdFormaPagamento = FormaPagamento.IdFormaPagamento LEFT OUTER JOIN
                              Entidades ON VendasEventos.IdEntidade = Entidades.IdEntidade
      ${whereClause}`

   const result = await request.query(query);
//console.log('Eventos encontrados:', result.recordset.length);
    res.json(result.recordset);    
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Obter uma itens venda evento pelo ID
const getVendasEventoById = async (req, res) => {
  try {
     const { idvenda } = req.params;

     if (!idvenda) {
         return res.status(400).json({ success: false, message: 'O parâmetro "idvenda" é obrigatório.' });
     }

     const pool = await poolPromise;
     const result = await pool
      .request()
      .input('idvenda', idvenda)
      .query(
        `
        SELECT idvenda, id, idevento, identidade, idvendedor, idformapagamento, descricao, datacadastro, 
        quantidade, idfilial, valortotal,  empresa FROM vendaseventos 
        WHERE vendaseventos.idvenda = @idvenda  
        `
      );

    if (result.recordset.length > 0) {
      res.json(result.recordset[0]);
    } else {
      res.status(404).send('venda evento não encontrada');
    }

  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Criar um nova venda evento
const createVendasEventos = async (req, res) => {
  try {
    const {
      id,
      identidade,
      idfilial,
      idevento,
      idvendedor,
      idformapagamento,
      descricao,
      datacadastro,
      quantidade,
      valortotal,
      empresa
    } = req.body;
    //console.log('REQ.BODY::', req.body);

    const dataCadastroNorm = normalizeDate(datacadastro);

    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('id', id)
      .input('identidade', identidade)
      .input('idfilial', idfilial)
      .input('idevento', idevento)
      .input('idvendedor', idvendedor)
      .input('idformapagamento', idformapagamento)
      .input('datacadastro', dataCadastroNorm)
      .input('descricao', descricao)
      .input('quantidade', quantidade)
      .input('valortotal', valortotal)
      .input('empresa', empresa)
      .query(`
        INSERT INTO vendaseventos (
          id, identidade, idfilial, idevento, idvendedor, idformapagamento, descricao, datacadastro, quantidade, valortotal, empresa
        )
        OUTPUT INSERTED.idvenda
        VALUES (
          @id, @identidade, @idfilial, @idevento, @idvendedor, @idformapagamento, @descricao, @datacadastro, @quantidade, @valortotal, @empresa
        )
      `);
      //console.log('Resultado do INSERT:', result);
    const idvenda = result.recordset[0].idvenda;

    res.status(201).json({ success: true, idvenda, message: 'Venda Evento criada com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Atualizar uma venda evento existente
const updateVendasEventos = async (req, res) => {
 // console.log('--- updateEventos START ---');
  try {
    const {
      idvenda,
      id,
      identidade,
      idfilial,
      idevento,
      idvendedor,
      idformapagamento,
      descricao,
      datacadastro,
      quantidade,
      valortotal,
      empresa
    } = req.body;
//console.log('REQ.BODY::', req.body);
    const dataCadastroNorm = normalizeDate(datacadastro);
   //console.log('Datas normalizadas:', { dataEventoNorm, dataCadastroNorm });

    const pool = await poolPromise;

    // ====== UPDATE eventos ======
    //console.log('Executando UPDATE em eventos...');
    //
     const updateResult =await pool
      .request()
      .input('idvenda', idvenda)
      .input('id', id)
      .input('idvendedor', idvendedor)
      .input('idformapagamento', idformapagamento)
      .input('idevento', idevento)//req.params.idvento
      .input('datacadastro', dataCadastroNorm)
      .input('identidade', identidade)
      .input('idfilial', idfilial)
      .input('descricao', descricao)
      .input('quantidade', quantidade)
      .input('valortotal', valortotal)
      .input('empresa', empresa)
      .query(`
        UPDATE vendaseventos SET
          id = @id,
          idvendedor = @idvendedor,
          idformapagamento = @idformapagamento,
          idevento = @idevento,
          datacadastro = @datacadastro,
          identidade = @identidade,
          idfilial = @idfilial,
          descricao = @descricao,
          quantidade = @quantidade,
          valortotal = @valortotal
        WHERE idvenda = @idvenda     
      `);
//console.log('Resultado do UPDATE:', updateResult);

    //.log('--- updateVendasBilhete END (sucesso) ---');
    res.json({ success: true, message: 'Venda Evento atualizado com sucesso' });

  } catch (error) {
    console.error('Erro geral em updateVendasEventos:', error.message || error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Deletar uma venda evento
const deleteVendasEventos = async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input('idvenda', req.params.idvenda)
      .query('DELETE FROM vendaseventos WHERE idvenda = @idvenda');
    res.json({ success: true, message: 'Venda Evento deletada com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getVendasEventoDropDown,
  getVendasEvento,
  createVendasEventos,
  updateVendasEventos,
  deleteVendasEventos,
  getVendasEventoById,
};
