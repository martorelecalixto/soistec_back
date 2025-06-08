const { poolPromise } = require('../db');


// Obter todos os clientes
const getClientes = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT 
        idcliente, desconto, prazofaturamento, 
        dia_faturamento_1, dia_faturamento_2, entidadeid 
      FROM clientes 
      ORDER BY idcliente
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
      .input('idcliente', req.params.idcliente)
      .query(`
        SELECT 
          idcliente, desconto, prazofaturamento, 
          dia_faturamento_1, dia_faturamento_2, entidadeid 
        FROM Clientes 
        WHERE idcliente = @idcliente
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
    const { desconto, prazofaturamento, dia_faturamento_1, dia_faturamento_2, entidadeid } = req.body;

    const pool = await poolPromise;
    await pool
      .request()
      .input('desconto', desconto)
      .input('prazofaturamento', prazofaturamento)
      .input('dia_faturamento_1', dia_faturamento_1)
      .input('dia_faturamento_2', dia_faturamento_2)
      .input('entidadeid', entidadeid)
      .query(`
        INSERT INTO clientes (
          desconto, prazofaturamento, dia_faturamento_1, dia_faturamento_2, entidadeid
        ) VALUES (
          @desconto, @prazofaturamento, @dia_faturamento_1, @dia_faturamento_2, @entidadeid
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
    const { desconto, prazofaturamento, dia_faturamento_1, dia_faturamento_2, entidadeid } = req.body;

    const pool = await poolPromise;
    await pool
      .request()
      .input('idcliente', req.params.idcliente)
      .input('desconto', desconto)
      .input('prazofaturamento', prazofaturamento)
      .input('dia_faturamento_1', dia_faturamento_1)
      .input('dia_faturamento_2', dia_faturamento_2)
      .input('entidadeid', entidadeid)
      .query(`
        UPDATE clientes SET
          desconto = @desconto,
          prazofaturamento = @prazofaturamento,
          dia_faturamento_1 = @dia_faturamento_1,
          dia_faturamento_2 = @dia_faturamento_2,
          entidadeid = @entidadeid
        WHERE idcliente = @idcliente
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
      .query('DELETE FROM clientes WHERE idcliente = @id');

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
