const { poolPromise } = require('../db');

// Obter todos os vendedores
const getVendedores = async (req, res) => {
  try {
    const { entidade } = req.query;

    if (!entidade) {
      return res.status(400).json({ success: false, message: 'O parâmetro "entidade" é obrigatório.' });
    }

    const pool = await poolPromise;
    const request = pool.request();
    request.input('entidadeid', entidade);

    const result = await request.query(`
      SELECT id, percomisnac, percomisint, entidadeid, percomissernac, percomisserint
      FROM vendedores
      WHERE entidadeid = @entidadeid
      ORDER BY id
    `);

    res.json(result.recordset);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Obter um vendedor pelo ID
const getVendedorById = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('id', req.params.id)
      .query(`
        SELECT id, percomisnac, percomisint, entidadeid, percomissernac, percomisserint
        FROM vendedores
        WHERE id = @id
      `);

    if (result.recordset.length > 0) {
      res.json(result.recordset[0]);
    } else {
      res.status(404).send('Vendedor não encontrado');
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Criar um novo vendedor
const createVendedor = async (req, res) => {
  try {
    const { percomisnac, percomisint, entidadeid, percomissernac, percomisserint  } = req.body;

    const pool = await poolPromise;
    await pool
      .request()
      .input('percomisnac', percomisnac)
      .input('percomisint', percomisint)
      .input('entidadeid', entidadeid)
      .input('percomissernac', percomissernac)
      .input('percomisserint', percomisserint)
      .query(`
        INSERT INTO vendedores (
          percomisnac, percomisint, entidadeid, percomissernac, percomisserint 
        ) VALUES (
          @percomisnac, @percomisint, @entidadeid, @percomissernac, @percomisserint
        )
      `);

    res.status(201).json({ success: true, message: 'Vendedor criado com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Atualizar um vendedor existente
const updateVendedor = async (req, res) => {
  try {
    const { percomisnac, percomisint, entidadeid, percomissernac, percomisserint  } = req.body;

    const pool = await poolPromise;
    await pool
      .request()
      .input('id', req.params.id)
      .input('percomisnac', percomisnac)
      .input('percomisint', percomisint)
      .input('entidadeid', entidadeid)
      .input('percomissernac', percomissernac)
      .input('percomisserint', percomisserint)
      .query(`
        UPDATE vendedores SET
          percomisnac = @percomisnac,
          percomisnac = @percomisnac,
          entidadeid = @entidadeid,
          percomissernac = @percomissernac,
          percomisserint = @percomisserint
        WHERE id = @id
      `);

    res.json({ success: true, message: 'Vendedor atualizado com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Deletar um vendedor
const deleteVendedor = async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input('id', req.params.id)
      .query('DELETE FROM vendedores WHERE id = @id');

    res.json({ success: true, message: 'Vendedor deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getVendedores,
  getVendedorById,
  createVendedor,
  updateVendedor,
  deleteVendedor,
};
