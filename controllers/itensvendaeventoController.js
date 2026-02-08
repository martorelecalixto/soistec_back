const { poolPromise } = require('../db');

function normalizeDate(dateString) {
  if (!dateString) return null;
  const d = new Date(dateString);
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString(); // sempre "YYYY-MM-DDT00:00:00.000Z"
}

// Obter uma itens venda evento pelo ID
const getItensVendaEventoById = async (req, res) => {
  try {
     const { id } = req.params;

     if (!id) {
         return res.status(400).json({ success: false, message: 'O parâmetro "id" é obrigatório.' });
     }

     const pool = await poolPromise;
     const result = await pool
      .request()
      .input('id', id)
      .query(
        `
        SELECT idvenda, id, idingresso, idlote, idformapagamento, datacadastro, 
        quantidade, valor,  nome, cpf, documento, descricao FROM itensvendaevento
        WHERE itensvendaevento.id = @id  
        `
      );

    if (result.recordset.length > 0) {
      res.json(result.recordset[0]);
    } else {
      res.status(404).send('itens da venda evento não encontrada');
    }

  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Obter uma itens venda evento pelo IDVENDA
const getItensVendaEventoByIdVenda = async (req, res) => {
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
        SELECT idvenda, id, idingresso, idlote, idformapagamento, datacadastro, 
        quantidade, valor,  nome, cpf, documento, descricao FROM itensvendaevento
        WHERE itensvendaevento.idvenda = @idvenda  
        `
      );

    if (result.recordset.length > 0) {
      res.json(result.recordset[0]);
    } else {
      res.status(404).send('itens da venda evento não encontrada');
    }

  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Criar um novo item venda evento
const createItensVendaEvento = async (req, res) => {
  try {
    const {
      id,
      idvenda,
      idingresso,
      idlote,
      datacadastro,
      quantidade,
      valor,
      nome,
      cpf,
      documento,
      descricao
    } = req.body;
    //console.log('REQ.BODY::', req.body);

    const dataCadastroNorm = normalizeDate(datacadastro);

    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('id', id)
      .input('idvenda', idvenda)
      .input('idingresso', idingresso)
      .input('idlote', idlote)
      .input('datacadastro', dataCadastroNorm)
      .input('quantidade', quantidade)
      .input('valor', valor)
      .input('nome', nome)
      .input('cpf', cpf)
      .input('documento', documento)
      .input('descricao', descricao)
      .query(`
        INSERT INTO itensvendaevento (
          id, idvenda, idingresso, idlote, datacadastro, quantidade, valor, nome, cpf, documento, descricao
        )
        OUTPUT INSERTED.id
        VALUES (
          @id, @idvenda, @idingresso, @idlote, @datacadastro, @quantidade, @valor, @nome, @cpf, @documento, @descricao
        )
      `);
      //console.log('Resultado do INSERT:', result);
    const iditem = result.recordset[0].id;

    res.status(201).json({ success: true, iditem, message: 'Item da Venda Evento criado com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Atualizar um item da venda evento existente
const updateItensVendaEvento = async (req, res) => {
 // console.log('--- updateEventos START ---');
  try {
    const {
      id,
      idvenda,
      idingresso,
      idlote,
      datacadastro,
      quantidade,
      valor,
      nome,
      cpf,
      documento,
      descricao
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
      .input('id', id)
      .input('idvenda', idvenda)
      .input('idingresso', idingresso)
      .input('idlote', idlote)
      .input('datacadastro', dataCadastroNorm)
      .input('quantidade', quantidade)
      .input('valor', valor)
      .input('nome', nome)
      .input('cpf', cpf)
      .input('documento', documento)
      .input('descricao', descricao)
      .query(`
        UPDATE itensvendaevento SET
          idvenda = @idvenda,
          idingresso = @idingresso,
          idlote = @idlote,
          datacadastro = @datacadastro,
          quantidade = @quantidade,
          valor = @valor,
          nome = @nome,
          cpf = @cpf,
          documento = @documento,
          descricao = @descricao
        WHERE id = @id     
      `);
//console.log('Resultado do UPDATE:', updateResult);

    //.log('--- updateVendasBilhete END (sucesso) ---');
    res.json({ success: true, message: 'Item da Venda Evento atualizado com sucesso' });

  } catch (error) {
    console.error('Erro geral em updateVendasEventos:', error.message || error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Deletar uma venda evento
const deleteItensVendaEvento = async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input('id', req.params.id)
      .query('DELETE FROM itensvendaevento WHERE id = @id');
    res.json({ success: true, message: 'Item da Venda Evento deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getItensVendaEventoById,
  getItensVendaEventoByIdVenda,
  createItensVendaEvento,
  updateItensVendaEvento,
  deleteItensVendaEvento,
};
