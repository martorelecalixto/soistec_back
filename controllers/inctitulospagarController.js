const { sql, poolPromise } = require('../db');

const incTituloPag = async (req, res) => {
  const idempresa = req.params.idempresa;
  const pool = await poolPromise; // ✅ usa o pool compartilhado
  let atualizado = false;
  let valorAtualizado = 0;
 
  while (!atualizado) {
    const transaction = new sql.Transaction(pool);
    try {
      await transaction.begin();

      const request = new sql.Request(transaction);

      // Verifica se a coluna já existe
      const checkColumnSql = `
        SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'IncTituloPag' AND COLUMN_NAME = @coluna
      `;
      request.input('coluna', sql.NVarChar, `id_${idempresa}`);
      const checkResult = await request.query(checkColumnSql);

      if (checkResult.recordset.length === 0) {
        const addColumnSql = `ALTER TABLE IncTituloPag ADD id_${idempresa} INT`;
        await request.batch(addColumnSql);
        const updateSql = `UPDATE IncTituloPag SET id_${idempresa} = 1`;
        await request.batch(updateSql);
      } else {
        const updateSql = `UPDATE IncTituloPag SET id_${idempresa} = id_${idempresa} + 1`;
        await request.batch(updateSql);
      }

      await transaction.commit();
      atualizado = true;

      const result = await pool.request().query(`SELECT id_${idempresa} AS valor FROM IncTituloPag`);
      valorAtualizado = result.recordset[0].valor;
 
    } catch (err) {
      await transaction.rollback();
      console.error('Erro durante transação, tentando novamente...', err);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return res.status(200).json({ novoId: valorAtualizado });
};

module.exports = {
  incTituloPag,
};
