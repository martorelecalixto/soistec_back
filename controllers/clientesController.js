const { poolPromise } = require('../db');

// Obter todos os clientes
const getClientes = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT 
        IdCliente, Desconto, PrazoFaturamento, 
        Dia_Faturamento_1, Dia_Faturamento_2, EntidadeID 
      FROM Clientes 
      ORDER BY IdCliente
    `);
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Obter cliente por ID
const getClienteById = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('id', req.params.id)
      .query(`
        SELECT 
          IdCliente, Desconto, PrazoFaturamento, 
          Dia_Faturamento_1, Dia_Faturamento_2, EntidadeID 
        FROM Clientes 
        WHERE IdCliente = @id
      `);
    
    if (result.recordset.length > 0) {
      res.json(result.recordset[0]);
    } else {
      res.status(404).json({ success: false, message: 'Cliente não encontrado' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Criar cliente
const createCliente = async (req, res) => {
  try {
    const { Desconto, PrazoFaturamento, Dia_Faturamento_1, Dia_Faturamento_2, EntidadeID } = req.body;

    const pool = await poolPromise;
    await pool
      .request()
      .input('Desconto', Desconto)
      .input('PrazoFaturamento', PrazoFaturamento)
      .input('Dia_Faturamento_1', Dia_Faturamento_1)
      .input('Dia_Faturamento_2', Dia_Faturamento_2)
      .input('EntidadeID', EntidadeID)
      .query(`
        INSERT INTO Clientes (
          Desconto, PrazoFaturamento, Dia_Faturamento_1, Dia_Faturamento_2, EntidadeID
        ) VALUES (
          @Desconto, @PrazoFaturamento, @Dia_Faturamento_1, @Dia_Faturamento_2, @EntidadeID
        )
      `);

    res.status(201).json({ success: true, message: 'Cliente criado com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Atualizar cliente
const updateCliente = async (req, res) => {
  try {
    const { Desconto, PrazoFaturamento, Dia_Faturamento_1, Dia_Faturamento_2, EntidadeID } = req.body;

    const pool = await poolPromise;
    await pool
      .request()
      .input('id', req.params.id)
      .input('Desconto', Desconto)
      .input('PrazoFaturamento', PrazoFaturamento)
      .input('Dia_Faturamento_1', Dia_Faturamento_1)
      .input('Dia_Faturamento_2', Dia_Faturamento_2)
      .input('EntidadeID', EntidadeID)
      .query(`
        UPDATE Clientes SET
          Desconto = @Desconto,
          PrazoFaturamento = @PrazoFaturamento,
          Dia_Faturamento_1 = @Dia_Faturamento_1,
          Dia_Faturamento_2 = @Dia_Faturamento_2,
          EntidadeID = @EntidadeID
        WHERE IdCliente = @id
      `);

    res.json({ success: true, message: 'Cliente atualizado com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Deletar cliente
const deleteCliente = async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input('id', req.params.id)
      .query('DELETE FROM Clientes WHERE IdCliente = @id');

    res.json({ success: true, message: 'Cliente deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getClientes,
  getClienteById,
  createCliente,
  updateCliente,
  deleteCliente,
};
