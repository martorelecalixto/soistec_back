const { poolPromise } = require('../db');


// Obter todos os cia
const getCAerea = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT 
        idciaaerea,
        percomisnac,
        percomisint,
        overnac,
        overint,
        liqaddtarifanaciv,
        liqaddtaxanaciv,
        liqadddunaciv,
        liqaddcomissaonaciv,
        liqaddovernaciv,
        liqaddtarifanaccc,
        liqaddtaxanaccc,
        liqadddunaccc,
        liqaddcomissaonaccc,
        liqaddovernaccc,
        liqaddtarifaintiv,
        liqaddtaxaintiv,
        liqaddduintiv,
        liqaddcomissaointiv,
        liqaddoverintiv,
        liqaddtarifaintcc,
        liqaddtaxaintcc,
        liqaddduintcc,
        liqaddcomissaointcc,
        liqaddoverintcc,
        liqdedtarifanaciv,
        liqdedtaxanaciv,
        liqdeddunaciv,
        liqdedcomissaonaciv,
        liqdedovernaciv,
        liqdedtarifanaccc,
        liqdedtaxanaccc,
        liqdeddunaccc,
        liqdedcomissaonaccc,
        liqdedovernaccc,
        liqdedtarifaintiv,
        liqdedtaxaintiv,
        liqdedduintiv,
        liqdedcomissaointiv,
        liqdedoverintiv,
        liqdedtarifaintcc,
        liqdedtaxaintcc,
        liqdedduintcc,
        liqdedcomissaointcc,
        liqdedoverintcc,
        valorininac1,
        valorfinnac1,
        valornac1,
        percnac1,
        valorininac2,
        valorfinnac2,
        valornac2,
        percnac2,
        valoriniint1,
        valorfinint1,
        valorint1,
        percint1,
        valoriniint2,
        valorfinint2,
        valorint2,
        percint2,
        entidadeid
      FROM caereas 
      ORDER BY idciaaerea
    `);
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Obter caerea por ID
const getCAereaById = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('idciaaerea', req.params.idciaaerea)
      .query(`
        SELECT 
            idciaaerea,
            percomisnac,
            percomisint,
            overnac,
            overint,
            liqaddtarifanaciv,
            liqaddtaxanaciv,
            liqadddunaciv,
            liqaddcomissaonaciv,
            liqaddovernaciv,
            liqaddtarifanaccc,
            liqaddtaxanaccc,
            liqadddunaccc,
            liqaddcomissaonaccc,
            liqaddovernaccc,
            liqaddtarifaintiv,
            liqaddtaxaintiv,
            liqaddduintiv,
            liqaddcomissaointiv,
            liqaddoverintiv,
            liqaddtarifaintcc,
            liqaddtaxaintcc,
            liqaddduintcc,
            liqaddcomissaointcc,
            liqaddoverintcc,
            liqdedtarifanaciv,
            liqdedtaxanaciv,
            liqdeddunaciv,
            liqdedcomissaonaciv,
            liqdedovernaciv,
            liqdedtarifanaccc,
            liqdedtaxanaccc,
            liqdeddunaccc,
            liqdedcomissaonaccc,
            liqdedovernaccc,
            liqdedtarifaintiv,
            liqdedtaxaintiv,
            liqdedduintiv,
            liqdedcomissaointiv,
            liqdedoverintiv,
            liqdedtarifaintcc,
            liqdedtaxaintcc,
            liqdedduintcc,
            liqdedcomissaointcc,
            liqdedoverintcc,
            valorininac1,
            valorfinnac1,
            valornac1,
            percnac1,
            valorininac2,
            valorfinnac2,
            valornac2,
            percnac2,
            valoriniint1,
            valorfinint1,
            valorint1,
            percint1,
            valoriniint2,
            valorfinint2,
            valorint2,
            percint2,
            entidadeid
          FROM caereas 
        WHERE idciaaerea = @idciaaerea
      `);
    
    if (result.recordset.length > 0) {
      res.json(result.recordset[0]);
    } else {
      res.status(404).json({ success: false, message: 'Cia não encontrado' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Criar caerea
const createCAerea = async (req, res) => {
  try {
    const { 
            percomisnac,
            percomisint,
            overnac,
            overint,
            liqaddtarifanaciv,
            liqaddtaxanaciv,
            liqadddunaciv,
            liqaddcomissaonaciv,
            liqaddovernaciv,
            liqaddtarifanaccc,
            liqaddtaxanaccc,
            liqadddunaccc,
            liqaddcomissaonaccc,
            liqaddovernaccc,
            liqaddtarifaintiv,
            liqaddtaxaintiv,
            liqaddduintiv,
            liqaddcomissaointiv,
            liqaddoverintiv,
            liqaddtarifaintcc,
            liqaddtaxaintcc,
            liqaddduintcc,
            liqaddcomissaointcc,
            liqaddoverintcc,
            liqdedtarifanaciv,
            liqdedtaxanaciv,
            liqdeddunaciv,
            liqdedcomissaonaciv,
            liqdedovernaciv,
            liqdedtarifanaccc,
            liqdedtaxanaccc,
            liqdeddunaccc,
            liqdedcomissaonaccc,
            liqdedovernaccc,
            liqdedtarifaintiv,
            liqdedtaxaintiv,
            liqdedduintiv,
            liqdedcomissaointiv,
            liqdedoverintiv,
            liqdedtarifaintcc,
            liqdedtaxaintcc,
            liqdedduintcc,
            liqdedcomissaointcc,
            liqdedoverintcc,
            valorininac1,
            valorfinnac1,
            valornac1,
            percnac1,
            valorininac2,
            valorfinnac2,
            valornac2,
            percnac2,
            valoriniint1,
            valorfinint1,
            valorint1,
            percint1,
            valoriniint2,
            valorfinint2,
            valorint2,
            percint2,
            entidadeid

     } = req.body;

    const pool = await poolPromise;
    await pool
      .request()
      .input('percomisnac', percomisnac)
      .input('percomisint', percomisint)
      .input('overnac', overnac)
      .input('overint', overint)
      .input('liqaddtarifanaciv', liqaddtarifanaciv)
      .input('liqaddtaxanaciv', liqaddtaxanaciv)
      .input('liqadddunaciv', liqadddunaciv)
      .input('liqaddcomissaonaciv', liqaddcomissaonaciv)
      .input('liqaddovernaciv', liqaddovernaciv)
      .input('liqaddtarifanaccc', liqaddtarifanaccc)
      .input('liqaddtaxanaccc', liqaddtaxanaccc)
      .input('liqadddunaccc', liqadddunaccc)
      .input('liqaddcomissaonaccc', liqaddcomissaonaccc)
      .input('liqaddovernaccc', liqaddovernaccc)
      .input('liqaddtarifaintiv', liqaddtarifaintiv)
      .input('liqaddtaxaintiv', liqaddtaxaintiv)
      .input('liqaddduintiv', liqaddduintiv)
      .input('liqaddcomissaointiv', liqaddcomissaointiv)
      .input('liqaddoverintiv', liqaddoverintiv)
      .input('liqaddtarifaintcc', liqaddtarifaintcc)
      .input('liqaddtaxaintcc', liqaddtaxaintcc)
      .input('liqaddduintcc', liqaddduintcc)
      .input('liqaddcomissaointcc', liqaddcomissaointcc)
      .input('liqaddoverintcc', liqaddoverintcc)
      .input('liqdedtarifanaciv', liqdedtarifanaciv)
      .input('liqdedtaxanaciv', liqdedtaxanaciv)
      .input('liqdeddunaciv', liqdeddunaciv)
      .input('liqdedcomissaonaciv', liqdedcomissaonaciv)
      .input('liqdedovernaciv', liqdedovernaciv)
      .input('liqdedtarifanaccc', liqdedtarifanaccc)
      .input('liqdedtaxanaccc', liqdedtaxanaccc)
      .input('liqdeddunaccc', liqdeddunaccc)
      .input('liqdedcomissaonaccc', liqdedcomissaonaccc)
      .input('liqdedovernaccc', liqdedovernaccc)
      .input('liqdedtarifaintiv', liqdedtarifaintiv)
      .input('liqdedtaxaintiv', liqdedtaxaintiv)
      .input('liqdedduintiv', liqdedduintiv)
      .input('liqdedcomissaointiv', liqdedcomissaointiv)
      .input('liqdedoverintiv', liqdedoverintiv)
      .input('liqdedtarifaintcc', liqdedtarifaintcc)
      .input('liqdedtaxaintcc', liqdedtaxaintcc)
      .input('liqdedduintcc', liqdedduintcc)
      .input('liqdedcomissaointcc', liqdedcomissaointcc)
      .input('liqdedoverintcc', liqdedoverintcc)
      .input('valorininac1', valorininac1)
      .input('valorfinnac1', valorfinnac1)
      .input('valornac1', valornac1)
      .input('percnac1', percnac1)
      .input('valorininac2', valorininac2)
      .input('valorfinnac2', valorfinnac2)
      .input('valornac2', valornac2)
      .input('percnac2', percnac2)
      .input('valoriniint1', valoriniint1)
      .input('valorfinint1', valorfinint1)
      .input('valorint1', valorint1)
      .input('percint1', percint1)
      .input('valoriniint2', valoriniint2)
      .input('valorfinint2', valorfinint2)
      .input('valorint2', valorint2)
      .input('percint2', percint2)
      .input('entidadeid', entidadeid)
      .query(`
        INSERT INTO caereas (
                  percomisnac,
                  percomisint,
                  overnac,
                  overint,
                  liqaddtarifanaciv,
                  liqaddtaxanaciv,
                  liqadddunaciv,
                  liqaddcomissaonaciv,
                  liqaddovernaciv,
                  liqaddtarifanaccc,
                  liqaddtaxanaccc,
                  liqadddunaccc,
                  liqaddcomissaonaccc,
                  liqaddovernaccc,
                  liqaddtarifaintiv,
                  liqaddtaxaintiv,
                  liqaddduintiv,
                  liqaddcomissaointiv,
                  liqaddoverintiv,
                  liqaddtarifaintcc,
                  liqaddtaxaintcc,
                  liqaddduintcc,
                  liqaddcomissaointcc,
                  liqaddoverintcc,
                  liqdedtarifanaciv,
                  liqdedtaxanaciv,
                  liqdeddunaciv,
                  liqdedcomissaonaciv,
                  liqdedovernaciv,
                  liqdedtarifanaccc,
                  liqdedtaxanaccc,
                  liqdeddunaccc,
                  liqdedcomissaonaccc,
                  liqdedovernaccc,
                  liqdedtarifaintiv,
                  liqdedtaxaintiv,
                  liqdedduintiv,
                  liqdedcomissaointiv,
                  liqdedoverintiv,
                  liqdedtarifaintcc,
                  liqdedtaxaintcc,
                  liqdedduintcc,
                  liqdedcomissaointcc,
                  liqdedoverintcc,
                  valorininac1,
                  valorfinnac1,
                  valornac1,
                  percnac1,
                  valorininac2,
                  valorfinnac2,
                  valornac2,
                  percnac2,
                  valoriniint1,
                  valorfinint1,
                  valorint1,
                  percint1,
                  valoriniint2,
                  valorfinint2,
                  valorint2,
                  percint2,
                  entidadeid      

        ) VALUES (
                @percomisnac,
                @percomisint,
                @overnac,
                @overint,
                @liqaddtarifanaciv,
                @liqaddtaxanaciv,
                @liqadddunaciv,
                @liqaddcomissaonaciv,
                @liqaddovernaciv,
                @liqaddtarifanaccc,
                @liqaddtaxanaccc,
                @liqadddunaccc,
                @liqaddcomissaonaccc,
                @liqaddovernaccc,
                @liqaddtarifaintiv,
                @liqaddtaxaintiv,
                @liqaddduintiv,
                @liqaddcomissaointiv,
                @liqaddoverintiv,
                @liqaddtarifaintcc,
                @liqaddtaxaintcc,
                @liqaddduintcc,
                @liqaddcomissaointcc,
                @liqaddoverintcc,
                @liqdedtarifanaciv,
                @liqdedtaxanaciv,
                @liqdeddunaciv,
                @liqdedcomissaonaciv,
                @liqdedovernaciv,
                @liqdedtarifanaccc,
                @liqdedtaxanaccc,
                @liqdeddunaccc,
                @liqdedcomissaonaccc,
                @liqdedovernaccc,
                @liqdedtarifaintiv,
                @liqdedtaxaintiv,
                @liqdedduintiv,
                @liqdedcomissaointiv,
                @liqdedoverintiv,
                @liqdedtarifaintcc,
                @liqdedtaxaintcc,
                @liqdedduintcc,
                @liqdedcomissaointcc,
                @liqdedoverintcc,
                @valorininac1,
                @valorfinnac1,
                @valornac1,
                @percnac1,
                @valorininac2,
                @valorfinnac2,
                @valornac2,
                @percnac2,
                @valoriniint1,
                @valorfinint1,
                @valorint1,
                @percint1,
                @valoriniint2,
                @valorfinint2,
                @valorint2,
                @percint2,
                @entidadeid         

        )
      `);

    res.status(201).json({ success: true, message: 'Cia criado com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Atualizar caerea
const updateCAerea = async (req, res) => {
  try {
    const { 
            percomisnac,
            percomisint,
            overnac,
            overint,
            liqaddtarifanaciv,
            liqaddtaxanaciv,
            liqadddunaciv,
            liqaddcomissaonaciv,
            liqaddovernaciv,
            liqaddtarifanaccc,
            liqaddtaxanaccc,
            liqadddunaccc,
            liqaddcomissaonaccc,
            liqaddovernaccc,
            liqaddtarifaintiv,
            liqaddtaxaintiv,
            liqaddduintiv,
            liqaddcomissaointiv,
            liqaddoverintiv,
            liqaddtarifaintcc,
            liqaddtaxaintcc,
            liqaddduintcc,
            liqaddcomissaointcc,
            liqaddoverintcc,
            liqdedtarifanaciv,
            liqdedtaxanaciv,
            liqdeddunaciv,
            liqdedcomissaonaciv,
            liqdedovernaciv,
            liqdedtarifanaccc,
            liqdedtaxanaccc,
            liqdeddunaccc,
            liqdedcomissaonaccc,
            liqdedovernaccc,
            liqdedtarifaintiv,
            liqdedtaxaintiv,
            liqdedduintiv,
            liqdedcomissaointiv,
            liqdedoverintiv,
            liqdedtarifaintcc,
            liqdedtaxaintcc,
            liqdedduintcc,
            liqdedcomissaointcc,
            liqdedoverintcc,
            valorininac1,
            valorfinnac1,
            valornac1,
            percnac1,
            valorininac2,
            valorfinnac2,
            valornac2,
            percnac2,
            valoriniint1,
            valorfinint1,
            valorint1,
            percint1,
            valoriniint2,
            valorfinint2,
            valorint2,
            percint2,
            entidadeid
    } = req.body;

    const pool = await poolPromise;
    await pool
      .request()
      .input('idciaaerea', req.params.idciaaerea)
      .input('percomisnac', percomisnac)
      .input('percomisint', percomisint)
      .input('overnac', overnac)
      .input('overint', overint)
      .input('liqaddtarifanaciv', liqaddtarifanaciv)
      .input('liqaddtaxanaciv', liqaddtaxanaciv)
      .input('liqadddunaciv', liqadddunaciv)
      .input('liqaddcomissaonaciv', liqaddcomissaonaciv)
      .input('liqaddovernaciv', liqaddovernaciv)
      .input('liqaddtarifanaccc', liqaddtarifanaccc)
      .input('liqaddtaxanaccc', liqaddtaxanaccc)
      .input('liqadddunaccc', liqadddunaccc)
      .input('liqaddcomissaonaccc', liqaddcomissaonaccc)
      .input('liqaddovernaccc', liqaddovernaccc)
      .input('liqaddtarifaintiv', liqaddtarifaintiv)
      .input('liqaddtaxaintiv', liqaddtaxaintiv)
      .input('liqaddduintiv', liqaddduintiv)
      .input('liqaddcomissaointiv', liqaddcomissaointiv)
      .input('liqaddoverintiv', liqaddoverintiv)
      .input('liqaddtarifaintcc', liqaddtarifaintcc)
      .input('liqaddtaxaintcc', liqaddtaxaintcc)
      .input('liqaddduintcc', liqaddduintcc)
      .input('liqaddcomissaointcc', liqaddcomissaointcc)
      .input('liqaddoverintcc', liqaddoverintcc)
      .input('liqdedtarifanaciv', liqdedtarifanaciv)
      .input('liqdedtaxanaciv', liqdedtaxanaciv)
      .input('liqdeddunaciv', liqdeddunaciv)
      .input('liqdedcomissaonaciv', liqdedcomissaonaciv)
      .input('liqdedovernaciv', liqdedovernaciv)
      .input('liqdedtarifanaccc', liqdedtarifanaccc)
      .input('liqdedtaxanaccc', liqdedtaxanaccc)
      .input('liqdeddunaccc', liqdeddunaccc)
      .input('liqdedcomissaonaccc', liqdedcomissaonaccc)
      .input('liqdedovernaccc', liqdedovernaccc)
      .input('liqdedtarifaintiv', liqdedtarifaintiv)
      .input('liqdedtaxaintiv', liqdedtaxaintiv)
      .input('liqdedduintiv', liqdedduintiv)
      .input('liqdedcomissaointiv', liqdedcomissaointiv)
      .input('liqdedoverintiv', liqdedoverintiv)
      .input('liqdedtarifaintcc', liqdedtarifaintcc)
      .input('liqdedtaxaintcc', liqdedtaxaintcc)
      .input('liqdedduintcc', liqdedduintcc)
      .input('liqdedcomissaointcc', liqdedcomissaointcc)
      .input('liqdedoverintcc', liqdedoverintcc)
      .input('valorininac1', valorininac1)
      .input('valorfinnac1', valorfinnac1)
      .input('valornac1', valornac1)
      .input('percnac1', percnac1)
      .input('valorininac2', valorininac2)
      .input('valorfinnac2', valorfinnac2)
      .input('valornac2', valornac2)
      .input('percnac2', percnac2)
      .input('valoriniint1', valoriniint1)
      .input('valorfinint1', valorfinint1)
      .input('valorint1', valorint1)
      .input('percint1', percint1)
      .input('valoriniint2', valoriniint2)
      .input('valorfinint2', valorfinint2)
      .input('valorint2', valorint2)
      .input('percint2', percint2)
      .input('entidadeid', entidadeid)
      .query(`
        UPDATE caereas SET
            percomisnac = @percomisnac,
            percomisint = @percomisint,
            overnac = @overnac,
            overint = @overint,
            liqaddtarifanaciv = @liqaddtarifanaciv,
            liqaddtaxanaciv = @liqaddtaxanaciv,
            liqadddunaciv = @liqadddunaciv,
            liqaddcomissaonaciv = @liqaddcomissaonaciv,
            liqaddovernaciv = @liqaddovernaciv,
            liqaddtarifanaccc = @liqaddtarifanaccc,
            liqaddtaxanaccc = @liqaddtaxanaccc,
            liqadddunaccc = @liqadddunaccc,
            liqaddcomissaonaccc = @liqaddcomissaonaccc,
            liqaddovernaccc = @liqaddovernaccc,
            liqaddtarifaintiv = @liqaddtarifaintiv,
            liqaddtaxaintiv = @liqaddtaxaintiv,
            liqaddduintiv = @liqaddduintiv,
            liqaddcomissaointiv = @liqaddcomissaointiv,
            liqaddoverintiv = @liqaddoverintiv,
            liqaddtarifaintcc = @liqaddtarifaintcc,
            liqaddtaxaintcc = @liqaddtaxaintcc,
            liqaddduintcc = @liqaddduintcc,
            liqaddcomissaointcc = @liqaddcomissaointcc,
            liqaddoverintcc = @liqaddoverintcc,
            liqdedtarifanaciv = @liqdedtarifanaciv,
            liqdedtaxanaciv = @liqdedtaxanaciv,
            liqdeddunaciv = @liqdeddunaciv,
            liqdedcomissaonaciv = @liqdedcomissaonaciv,
            liqdedovernaciv = @liqdedovernaciv,
            liqdedtarifanaccc = @liqdedtarifanaccc,
            liqdedtaxanaccc = @liqdedtaxanaccc,
            liqdeddunaccc = @liqdeddunaccc,
            liqdedcomissaonaccc = @liqdedcomissaonaccc,
            liqdedovernaccc = @liqdedovernaccc,
            liqdedtarifaintiv = @liqdedtarifaintiv,
            liqdedtaxaintiv = @liqdedtaxaintiv,
            liqdedduintiv = @liqdedduintiv,
            liqdedcomissaointiv = @liqdedcomissaointiv,
            liqdedoverintiv = @liqdedoverintiv,
            liqdedtarifaintcc = @liqdedtarifaintcc,
            liqdedtaxaintcc = @liqdedtaxaintcc,
            liqdedduintcc = @liqdedduintcc,
            liqdedcomissaointcc = @liqdedcomissaointcc,
            liqdedoverintcc = @liqdedoverintcc,
            valorininac1 = @valorininac1,
            valorfinnac1 = @valorfinnac1,
            valornac1 = @valornac1,
            percnac1 = @percnac1,
            valorininac2 = @valorininac2,
            valorfinnac2 = @valorfinnac2,
            valornac2 = @valornac2,
            percnac2 = @percnac2,
            valoriniint1 = @valoriniint1,
            valorfinint1 = @valorfinint1,
            valorint1 = @valorint1,
            percint1 = @percint1,
            valoriniint2 = @valoriniint2,
            valorfinint2 = @valorfinint2,
            valorint2 = @valorint2,
            percint2 = @percint2,
            entidadeid = @entidadeid
        WHERE idciaaerea = @idciaaerea
      `);

    res.json({ success: true, message: 'Cia atualizado com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Deletar caerea
const deleteCAerea = async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input('idciaaerea', req.params.id)
      .query('DELETE FROM caereas WHERE idciaaerea = @idciaaerea');

    res.json({ success: true, message: 'Cia deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getCAerea,
  getCAereaById,
  createCAerea,
  updateCAerea,
  deleteCAerea,
};
