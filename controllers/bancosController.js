const { poolPromise } = require('../db');

// Obter todas as bancos
const getBancosDropDown = async (req, res) => {
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
          `SELECT idbanco, nome
            FROM bancos ${whereClause}`

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
      let whereClause = 'WHERE empresa = @empresa ';
      whereClause += ' ORDER BY bancoconta ';

      const query =
          `SELECT        bancos.idbanco, 
                        (Isnull(Bancos.nome,'') + '  ' + Isnull(ContasBancarias.NumeroConta,'') + ' - ' + Isnull(ContasBancarias.DigitoConta,'')) AS nome
            FROM         Bancos INNER JOIN
                        ContasBancarias ON Bancos.IdBanco = ContasBancarias.IdBanco            
            ${whereClause}`

      const result = await request.query(query);

      res.json(result.recordset);         

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Obter todas as bancos
const getBancos = async (req, res) => {
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

    whereClause += ' ORDER BY nome ';

   const query =
    `SELECT idbanco, nome, 
      empresa FROM bancos ${whereClause}`

   const result = await request.query(query);

    res.json(result.recordset);    
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Obter uma banco pelo ID
const getBancoById = async (req, res) => {
  try {
    const { empresa, nome } = req.query;

    // Verifica se o parâmetro 'empresa' foi fornecido
    if (!empresa) {
      return res.status(400).json({ success: false, message: 'O parâmetro "empresa" é obrigatório.' });
    }
    
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('idbanco', req.params.id)
      .query(
        `SELECT idbanco, nome, 
          empresa FROM bancos  WHERE idbanco = @idbanco ORDER BY nome`
      );

    //  .query('SELECT * FROM atividades  WHERE id = @id');
    if (result.recordset.length > 0) {
      res.json(result.recordset[0]);
    } else {
      res.status(404).send('Banco não encontrado');
    }

  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Criar uma nova banco
const createBanco = async (req, res) => {
  try {
    const {
      nome, numero, empresa
    } = req.body;

    const pool = await poolPromise;
    await pool
      .request()
      .input('nome', nome)
      .input('numero', numero)
      .input('empresa', empresa)
      .query(
        `INSERT INTO bancos (
          nome, numero, empresa
        ) VALUES (
          @nome, @numero, @empresa
        )`
      );

    res.status(201).json({ success: true, message: 'Banco criado com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Atualizar um banco existente
const updateBanco = async (req, res) => {
  try {
    const {
      nome, numero
    } = req.body;

    const pool = await poolPromise;
    await pool
      .request()
      .input('idbanco', req.params.id)
      .input('nome', nome)
      .input('numero', numero)
      .query(
        `UPDATE bancos SET
          nome = @nome,
          numero = @numero
        WHERE idbanco = @idbanco`
      );

    res.json({ success: true, message: 'Banco atualizado com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Deletar uma banco
const deleteBanco = async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input('idbanco', req.params.id)
      .query('DELETE FROM bancos WHERE idbanco = @idbanco');
    res.json({ success: true, message: 'Banco deletada com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Obter todos os lancamentos
const getLancamento = async (req, res) => {
  try {
    const { empresa, idfilial,  idmoeda, idcontabancaria, datainicial, datafinal  } = req.query;
    const sql = require('mssql');
    // Verifica se o parâmetro 'empresa' foi fornecido
    if (!empresa) {
      return res.status(400).json({ success: false, message: 'O parâmetro "empresa" é obrigatório.' });
    }

    // Parâmetros obrigatórios
    const pool = await poolPromise;
    const request = pool.request();

    request.input('empresa', empresa);

    // Parâmetros opcionais
    let whereClause = 'WHERE lancamentos.empresa = @empresa ';

    // Filtros opcionais
    if (idfilial) {
      request.input('idfilial', idfilial);
      whereClause += ' AND lancamentos.idfilial = @idfilial';
    }

    if (idmoeda) {
      request.input('idmoeda', idmoeda);
      whereClause += ' AND lancamentos.idmoeda = @idmoeda';
    }
    
    if (idcontabancaria) {
      request.input('idcontabancaria', idcontabancaria);
      whereClause += ' AND lancamentos.idcontabancaria = @idcontabancaria';
    }else{
      whereClause += ' AND lancamentos.idcontabancaria IS NULL ';}

    if (datainicial) {
      request.input('datainicial', datainicial); // Formata a data para incluir hora
      whereClause += ' AND lancamentos.datapagamento >= @datainicial';
    }else{
      whereClause += ' AND lancamentos.idcontabancaria IS NULL ';}
    
    if (datafinal) {
      request.input('datafinal', datafinal);
      whereClause += ' AND lancamentos.datapagamento <= @datafinal';
    }else{
      whereClause += ' AND lancamentos.idcontabancaria IS NULL ';}
    
    whereClause += ' ORDER BY lancamentos.datapagamento desc ';

    const query =
     `
      SELECT        Lancamentos.idlancamento, 
                    Lancamentos.observacao, 
                    Lancamentos.valorpago, 
                    Lancamentos.datapagamento, 
                    FormaPagamento.nome AS pagamento, 
                    (Isnull(Bancos.nome,'') + '  ' + Isnull(ContasBancarias.NumeroConta,'') + ' - ' + Isnull(ContasBancarias.DigitoConta,'')) AS banco, 
                    ContasBancarias.numeroconta, 
                    ContasBancarias.digitoconta,
                    case when lancamentos.valorpago >= 0 then 'C' else 'D' end AS tipo
      FROM    Lancamentos INNER JOIN
                  Bancos ON Lancamentos.IdBanco = Bancos.IdBanco INNER JOIN
                  ContasBancarias ON Lancamentos.IdContaBancaria = ContasBancarias.IdContaBancaria INNER JOIN
                  FormaPagamento ON Lancamentos.IdOperacaoBancaria = FormaPagamento.IdFormaPagamento
            ${whereClause}  `
   const result = await request.query(query);
   res.json(result.recordset);    
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Obter saldo anterior
const getLancamentoSaldoAnterior = async (req, res) => {
  try {
    const { empresa, idfilial,  idmoeda, idcontabancaria, data  } = req.query;
    const sql = require('mssql');
    // Verifica se o parâmetro 'empresa' foi fornecido
    if (!empresa) {
      return res.status(400).json({ success: false, message: 'O parâmetro "empresa" é obrigatório.' });
    }

    // Parâmetros obrigatórios
    const pool = await poolPromise;
    const request = pool.request();

    request.input('empresa', empresa);

    // Parâmetros opcionais
    let whereClause = 'WHERE lancamentos.empresa = @empresa ';

    // Filtros opcionais
    if (idfilial) {
      request.input('idfilial', idfilial);
      whereClause += ' AND lancamentos.idfilial = @idfilial';
    }

    if (idmoeda) {
      request.input('idmoeda', idmoeda);
      whereClause += ' AND lancamentos.idmoeda = @idmoeda';
    }
    
    if (idcontabancaria) {
      request.input('idcontabancaria', idcontabancaria);
      whereClause += ' AND lancamentos.idcontabancaria = @idcontabancaria';
    }else{
      whereClause += ' AND lancamentos.idcontabancaria IS NULL ';}

    if (data) {
      request.input('data', data); // Formata a data para incluir hora
      whereClause += ' AND lancamentos.datapagamento < @data';
    }else{
      whereClause += ' AND lancamentos.idcontabancaria IS NULL ';}
    
    const query =
     `
      SELECT        Sum(Isnull(Lancamentos.valorpago,0)) AS valorpago 
      FROM    Lancamentos INNER JOIN
                  Bancos ON Lancamentos.IdBanco = Bancos.IdBanco INNER JOIN
                  ContasBancarias ON Lancamentos.IdContaBancaria = ContasBancarias.IdContaBancaria INNER JOIN
                  FormaPagamento ON Lancamentos.IdOperacaoBancaria = FormaPagamento.IdFormaPagamento
            ${whereClause}  `

    const result = await request.query(query);

    // Retorna apenas o valor (número)
    const valor = result.recordset.length > 0 ? result.recordset[0].valorpago : 0;
    res.json(valor);

  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Obter saldo atual
const getLancamentoSaldoAtual = async (req, res) => {
  try {
    const { empresa, idfilial,  idmoeda, idcontabancaria, data  } = req.query;
    const sql = require('mssql');
    // Verifica se o parâmetro 'empresa' foi fornecido
    if (!empresa) {
      return res.status(400).json({ success: false, message: 'O parâmetro "empresa" é obrigatório.' });
    }

    // Parâmetros obrigatórios
    const pool = await poolPromise;
    const request = pool.request();

    request.input('empresa', empresa);

    // Parâmetros opcionais
    let whereClause = 'WHERE lancamentos.empresa = @empresa ';

    // Filtros opcionais
    if (idfilial) {
      request.input('idfilial', idfilial);
      whereClause += ' AND lancamentos.idfilial = @idfilial';
    }

    if (idmoeda) {
      request.input('idmoeda', idmoeda);
      whereClause += ' AND lancamentos.idmoeda = @idmoeda';
    }
    
    if (idcontabancaria) {
      request.input('idcontabancaria', idcontabancaria);
      whereClause += ' AND lancamentos.idcontabancaria = @idcontabancaria';
    }else{
      whereClause += ' AND lancamentos.idcontabancaria IS NULL ';}

    if (data) {
      request.input('data', data); // Formata a data para incluir hora
      whereClause += ' AND lancamentos.datapagamento >= @data';
    }else{
      whereClause += ' AND lancamentos.idcontabancaria IS NULL ';}
    
    
    const query =
     `
      SELECT        Sum(Isnull(Lancamentos.valorpago,0)) AS valorpago 
      FROM    Lancamentos INNER JOIN
                  Bancos ON Lancamentos.IdBanco = Bancos.IdBanco INNER JOIN
                  ContasBancarias ON Lancamentos.IdContaBancaria = ContasBancarias.IdContaBancaria INNER JOIN
                  FormaPagamento ON Lancamentos.IdOperacaoBancaria = FormaPagamento.IdFormaPagamento
            ${whereClause}  `

    const result = await request.query(query);

    // Retorna apenas o valor (número)
    const valor = result.recordset.length > 0 ? result.recordset[0].valorpago : 0;
    res.json(valor);

  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Deletar lançamento genérico
const deleteLancamentoGenerico = async (req, res) => {
  try {
    const { empresa, idlancamento } = req.query;
    const sql = require('mssql');

    if (!empresa) {
      return res.status(400).json({ success: false, message: 'O parâmetro "empresa" é obrigatório.' });
    }
    if (!idlancamento) {
      return res.status(400).json({ success: false, message: 'O parâmetro "idlancamento" é obrigatório.' });
    }

    const pool = await poolPromise;
    const request = pool.request();
    request.input('empresa', empresa);
    request.input('idlancamento', idlancamento);

    let whereClause = ' WHERE BaixasReceber.empresa = @empresa AND BaixasReceber.idlancamento = @idlancamento';

    // 🔹 Buscar as baixas de receber
    const queryRec = `
      SELECT id, idtituloreceber, valorpago, descontopago, juropago 
      FROM BaixasReceber
      ${whereClause}
    `;
    const resultRec = await request.query(queryRec);

    for (const baixa of resultRec.recordset) {
      // Deleta baixa receber
      await pool
        .request()
        .input('id', baixa.id)
        .query('DELETE FROM BaixasReceber WHERE id = @id');

      // Atualiza título receber (subtrai valores)
      await pool
        .request()
        .input('valorpago', baixa.valorpago)
        .input('descontopago', baixa.descontopago)
        .input('juropago', baixa.juropago)
        .input('idtituloreceber', baixa.idtituloreceber)
        .query(`
          UPDATE TitulosReceber SET
              valorpago   = valorpago   - @valorpago,
              descontopago = descontopago - @descontopago,
              juropago     = juropago     - @juropago
          WHERE idtitulo = @idtituloreceber
        `);
    }

    // 🔹 Buscar as baixas de pagar
    await pool
    .request()
    .input('empresa', empresa)
    .input('idlancamento', idlancamento)
    whereClause = ' WHERE BaixasPagar.empresa = @empresa AND BaixasPagar.idlancamento = @idlancamento';
    const queryPag = `
      SELECT id, idtitulopagar, valorpago, descontopago, juropago 
      FROM BaixasPagar
      ${whereClause}
    `;
    const resultPag = await request.query(queryPag);

    for (const baixa of resultPag.recordset) {
      // Deleta baixa pagar
      await pool
        .request()
        .input('id', baixa.id)
        .query('DELETE FROM BaixasPagar WHERE id = @id');

      // Atualiza título pagar (subtrai valores)
      await pool
        .request()
        .input('valorpago', baixa.valorpago)
        .input('descontopago', baixa.descontopago)
        .input('juropago', baixa.juropago)
        .input('idtitulopagar', baixa.idtitulopagar)
        .query(`
          UPDATE TitulosPagar SET
              valorpago   = valorpago   - @valorpago,
              descontopago = descontopago - @descontopago,
              juropago     = juropago     - @juropago
          WHERE idtitulo = @idtitulopagar
        `);
    }

    // 🔹 Finalmente deleta o lançamento
    await pool
      .request()
      .input('idlancamento', idlancamento)
      .query('DELETE FROM Lancamentos WHERE idlancamento = @idlancamento');

      res.json({ success: true, message: 'Lançamento deletado com sucesso' });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

module.exports = {
  getBancos,
  getBancoById,
  createBanco,
  updateBanco,
  deleteBanco,
  getBancosDropDown,
  getBancosContasDropDown,
  getLancamento,
  getLancamentoSaldoAnterior,
  getLancamentoSaldoAtual,
  deleteLancamentoGenerico
};
