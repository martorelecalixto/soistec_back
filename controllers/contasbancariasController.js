const { poolPromise } = require('../db');

// Obter todas as contas bancárias para o dropdown
const getContasBancariasDropDown = async (req, res) => {
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
      whereClause += ' ORDER BY numeroconta ';

      const query =
          `SELECT idcontabancaria, numeroconta
            FROM contasbancarias ${whereClause}`

      const result = await request.query(query);

      res.json(result.recordset);         

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Obter todas as bancos + contas bancárias para o dropdown
const getBancosContasDropDown = async (req, res) => {
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
      let whereClause = 'WHERE contasbancarias.empresa = @empresa ';
      whereClause += ' ORDER BY numeroconta ';

      const query =
          `SELECT        ContasBancarias.idcontabancaria, 
                        (Isnull(Bancos.nome,'') + '  ' + Isnull(ContasBancarias.NumeroConta,'') + ' - ' + Isnull(ContasBancarias.DigitoConta,'')) AS numeroconta
            FROM         Bancos INNER JOIN
                        ContasBancarias ON Bancos.IdBanco = ContasBancarias.IdBanco            
            ${whereClause}`

      const result = await request.query(query);

      res.json(result.recordset);         

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Obter todas as contas bancárias
const getContasBancarias = async (req, res) => {
  try {
    const { empresa, numeroconta  } = req.query;

    // Verifica se o parâmetro 'empresa' foi fornecido
    if (!empresa) {
      return res.status(400).json({ success: false, message: 'O parâmetro "empresa" é obrigatório.' });
    }

    // Parâmetros obrigatórios
    const pool = await poolPromise;
    const request = pool.request();

    request.input('empresa', empresa);

    // Parâmetros opcionais
    let whereClause = 'WHERE ContasBancarias.empresa = @empresa';

    if (numeroconta) {
      whereClause += ' AND ContasBancarias.numeroconta LIKE @numeroconta';
      request.input('numeroconta', `%${numeroconta}%`);
    }

    whereClause += ' ORDER BY ContasBancarias.numeroconta ';

   const query =
    `SELECT ContasBancarias.idcontabancaria, isnull(ContasBancarias.numeroconta,'')  AS numeroconta, ContasBancarias.digitoconta, 
      ContasBancarias.titularconta, isnull(ContasBancarias.numeroagencia,'')  AS numeroagencia, ContasBancarias.digitoagencia, 
      ContasBancarias.valorinicial, ContasBancarias.saldo, ContasBancarias.idbanco, ContasBancarias.idmoeda,  ContasBancarias.empresa, Bancos.nome AS banco,
      (isnull(ContasBancarias.numeroconta,'') + ' ' + isnull(ContasBancarias.digitoconta,'')) AS conta, (isnull(ContasBancarias.numeroagencia,'') + ' ' + isnull(ContasBancarias.digitoagencia,'')) AS agencia

    FROM            ContasBancarias INNER JOIN   Bancos ON ContasBancarias.IdBanco = Bancos.IdBanco
    ${whereClause}`

   const result = await request.query(query);

    res.json(result.recordset);    
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Obter uma conta bancaria pelo ID
const getContaBancariaById = async (req, res) => {
  try {
    
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('idcontabancaria', req.params.id)
      .query(
        `SELECT idcontabancaria, numeroconta, digitoconta, titularconta, numeroagencia, digitoagencia, valorinicial, saldo, idbanco, idmoeda, 
          empresa FROM contasbancarias  WHERE idcontabancaria = @idcontabancaria ORDER BY numeroconta`
      );

    //  .query('SELECT * FROM atividades  WHERE id = @id');
    if (result.recordset.length > 0) {
      res.json(result.recordset[0]);
    } else {
      res.status(404).send('Conta Bancaria não encontrada');
    }

  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Criar uma nova conta bancaria
const createContaBancaria = async (req, res) => {
  try {
    //console.log('createContaBancaria', req.body);
    const {
      numeroconta, digitoconta, titularconta, numeroagencia, digitoagencia, valorinicial, saldo, idbanco, idmoeda, empresa
    } = req.body;
    //console.log('empresa', empresa);
    const pool = await poolPromise;
    await pool
      .request()
      .input('numeroconta', numeroconta)
      .input('digitoconta', digitoconta)
      .input('titularconta', titularconta)
      .input('numeroagencia', numeroagencia)
      .input('digitoagencia', digitoagencia)
      .input('valorinicial', valorinicial)
      .input('saldo', saldo)
      .input('idmoeda', idmoeda)
      .input('idbanco', idbanco)
      .input('empresa', empresa)
      .query(
        `INSERT INTO contasbancarias (
          numeroconta, digitoconta, titularconta, numeroagencia, digitoagencia, valorinicial, saldo, idbanco, idmoeda, empresa
        ) VALUES (
          @numeroconta, @digitoconta, @titularconta, @numeroagencia, @digitoagencia, @valorinicial, @saldo, @idbanco, @idmoeda, @empresa
        )`
      );
    //console.log('Conta bancaria criada com sucesso');
    res.status(201).json({ success: true, message: 'Conta bancaria criado com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Atualizar um conta bancaria existente
const updateContaBancaria = async (req, res) => {
  try {
    const {
      numeroconta, digitoconta, titularconta, numeroagencia, digitoagencia, valorinicial, saldo, idbanco, idmoeda
    } = req.body;

    const pool = await poolPromise;
    await pool
      .request()
      .input('idcontabancaria', req.params.idcontabancaria)
      .input('numeroconta', numeroconta)
      .input('digitoconta', digitoconta)
      .input('titularconta', titularconta)
      .input('numeroagencia', numeroagencia)
      .input('digitoagencia', digitoagencia)
      .input('valorinicial', valorinicial)
      .input('saldo', saldo)
      .input('idbanco', idbanco)
      .input('idmoeda', idmoeda)
      .query(
        `UPDATE contasbancarias SET
          numeroconta = @numeroconta,
          digitoconta = @digitoconta,
          titularconta = @titularconta,
          numeroagencia = @numeroagencia,
          digitoagencia = @digitoagencia,
          valorinicial = @valorinicial,
          saldo = @saldo,
          idbanco = @idbanco,
          idmoeda = @idmoeda
        WHERE idcontabancaria = @idcontabancaria`
      );

    res.json({ success: true, message: 'Conta bancaria atualizado com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Deletar uma conta bancaria
const deleteContaBancaria = async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input('idcontabancaria', req.params.id)
      .query('DELETE FROM contasbancarias WHERE idcontabancaria = @idcontabancaria');
    res.json({ success: true, message: 'Conta bancaria deletada com sucesso' });
  } catch (error) {
      if (error.number === 547) {
          return res.status(409).json({
              success: false,
              type: "FK_CONSTRAINT",
              message: "Não é possível excluir este registro pois ele está sendo utilizado em outro cadastro."
          });
      }

      return res.status(500).json({
          success: false,
          message: "Erro interno ao deletar registro."
      });    
    
     //res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getContasBancarias,
  getContaBancariaById,
  createContaBancaria,
  updateContaBancaria,
  deleteContaBancaria,
  getContasBancariasDropDown,
  getBancosContasDropDown,
};
