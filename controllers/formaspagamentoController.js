const { poolPromise } = require('../db');


// Obter todas as forma pagamento
const getFormasPagamentoDropDown = async (req, res) => {
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
          `SELECT idformapagamento, nome
            FROM formapagamento ${whereClause}`

      const result = await request.query(query);

      res.json(result.recordset);         

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Obter todas as formas pagamento
const getFormasPagamento = async (req, res) => {
  try {
    const { empresa, nome } = req.query;

    if (!empresa) {
      return res.status(400).json({ success: false, message: 'O parâmetro "empresa" é obrigatório.' });
    }

    const pool = await poolPromise;
    const request = pool.request();

    request.input('empresa', empresa);
    let whereClause = 'WHERE empresa = @empresa';

    if (nome) {
      whereClause += ' AND nome LIKE @nome';
      request.input('nome', `%${nome}%`);
    }

    whereClause += ' ORDER BY Nome';

    const query = `SELECT idformapagamento, nome, empresa, tipo, debito, credito,  
      gerartitulofatura, gerartitulovenda, baixaautomatica, vendaparcelada, gerarfatura,
      addtaxanovalor, addassentonovalor, addravnovalor, addcomissaonovalor, gerartituloservicofor,
      gerartituloservicocomis, idplanocontaaereo, idplanocontaforaereo, idplanocontaservico,
      idplanocontaforservico, idplanocontacomisservico, idplanocontapacote  
      FROM formapagamento ${whereClause}`;

    const result = await request.query(query);
    res.json(result.recordset);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Obter uma formas pagamento pelo ID
const getFormaPagamentoById = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('idformapagamento', req.params.idformapagamento)
      .query('SELECT idformapagamento, nome, gerartitulovenda, debito, credito, empresa FROM formapagamento WHERE idformapagamento = @idformapagamento');

    if (result.recordset.length > 0) {
      res.json(result.recordset[0]);
    } else {
      res.status(404).send('Forma Pagamento não encontrado');
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Criar uma nova forma pagamento
const createFormaPagamento = async (req, res) => {
  try {
    const { nome, empresa, tipo, debito, credito, 
            gerartitulofatura, gerartitulovenda, baixaautomatica, vendaparcelada, gerarfatura,
            addtaxanovalor, addassentonovalor, addravnovalor, addcomissaonovalor, gerartituloservicofor,
            gerartituloservicocomis, idplanocontaaereo, idplanocontaforaereo, idplanocontaservico,
            idplanocontaforservico, idplanocontacomisservico, idplanocontapacote } = req.body;

    const pool = await poolPromise;
    await pool
      .request()
      .input('nome', nome)
      .input('empresa', empresa)
      .input('tipo', tipo)
      .input('debito', debito)
      .input('credito', credito)
      .input('gerartitulofatura', gerartitulofatura)
      .input('gerartitulovenda', gerartitulovenda)
      .input('baixaautomatica', baixaautomatica)
      .input('vendaparcelada', vendaparcelada)
      .input('gerarfatura', gerarfatura)
      .input('addtaxanovalor', addtaxanovalor)
      .input('addassentonovalor', addassentonovalor)
      .input('addravnovalor', addravnovalor)
      .input('addcomissaonovalor', addcomissaonovalor)
      .input('gerartituloservicofor', gerartituloservicofor)
      .input('gerartituloservicocomis', gerartituloservicocomis)
      .input('idplanocontaaereo', idplanocontaaereo)
      .input('idplanocontaforaereo', idplanocontaforaereo)
      .input('idplanocontaservico', idplanocontaservico)
      .input('idplanocontaforservico', idplanocontaforservico)
      .input('idplanocontacomisservico', idplanocontacomisservico)
      .input('idplanocontapacote', idplanocontapacote)
      .query('INSERT INTO formapagamento (nome, empresa, tipo, debito, credito, ' +
        'gerartitulofatura, gerartitulovenda, baixaautomatica, vendaparcelada, gerarfatura,' +
        'addtaxanovalor, addassentonovalor, addravnovalor, addcomissaonovalor, gerartituloservicofor,' +
        'gerartituloservicocomis, idplanocontaaereo, idplanocontaforaereo, idplanocontaservico,' +
        'idplanocontaforservico, idplanocontacomisservico, idplanocontapacote) ' +
        'VALUES (@nome, @empresa, @tipo, @debito, @credito, ' +
        '@gerartitulofatura, @gerartitulovenda, @baixaautomatica, @vendaparcelada, @gerarfatura,' +
        '@addtaxanovalor, @addassentonovalor, @addravnovalor, @addcomissaonovalor, @gerartituloservicofor,' +
        '@gerartituloservicocomis, @idplanocontaaereo, @idplanocontaforaereo, @idplanocontaservico,' +
        '@idplanocontaforservico, @idplanocontacomisservico, @idplanocontapacote)'
      );

    res.status(201).json({ success: true, message: 'Forma Pagamento criado com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Atualizar uma forma pagamento existente
const updateFormaPagamento = async (req, res) => {
  try {
    const {  nome, empresa, tipo, debito, credito, 
            gerartitulofatura, gerartitulovenda, baixaautomatica, vendaparcelada, gerarfatura,
            addtaxanovalor, addassentonovalor, addravnovalor, addcomissaonovalor, gerartituloservicofor,
            gerartituloservicocomis, idplanocontaaereo, idplanocontaforaereo, idplanocontaservico,
            idplanocontaforservico, idplanocontacomisservico, idplanocontapacote  } = req.body;

    const pool = await poolPromise;
    await pool
      .request()
      .input('idformapagamento', req.params.idformapagamento)
      .input('nome', nome)
      .input('empresa', empresa)
      .input('tipo', tipo)
      .input('debito', debito)
      .input('credito', credito)
      .input('gerartitulofatura', gerartitulofatura)
      .input('gerartitulovenda', gerartitulovenda)
      .input('baixaautomatica', baixaautomatica)
      .input('vendaparcelada', vendaparcelada)
      .input('gerarfatura', gerarfatura)
      .input('addtaxanovalor', addtaxanovalor)
      .input('addassentonovalor', addassentonovalor)
      .input('addravnovalor', addravnovalor)
      .input('addcomissaonovalor', addcomissaonovalor)
      .input('gerartituloservicofor', gerartituloservicofor)
      .input('gerartituloservicocomis', gerartituloservicocomis)
      .input('idplanocontaaereo', idplanocontaaereo)
      .input('idplanocontaforaereo', idplanocontaforaereo)
      .input('idplanocontaservico', idplanocontaservico)
      .input('idplanocontaforservico', idplanocontaforservico)
      .input('idplanocontacomisservico', idplanocontacomisservico)
      .input('idplanocontapacote', idplanocontapacote)
      .query('UPDATE formapagamento SET ' +
        'nome = @nome, tipo = @tipo, debito = @debito, credito = @credito, ' +
        'gerartitulofatura = @gerartitulofatura, gerartitulovenda = @gerartitulovenda, baixaautomatica = @baixaautomatica, vendaparcelada = @vendaparcelada, gerarfatura = @gerarfatura,' +
        'addtaxanovalor = @addtaxanovalor, addassentonovalor = @addassentonovalor, addravnovalor = @addravnovalor, addcomissaonovalor = @addcomissaonovalor, gerartituloservicofor = @gerartituloservicofor,' +
        'gerartituloservicocomis = @gerartituloservicocomis, idplanocontaaereo = @idplanocontaaereo, idplanocontaforaereo = @idplanocontaforaereo, idplanocontaservico = @idplanocontaservico,' +
        'idplanocontaforservico = @idplanocontaforservico, idplanocontacomisservico = @idplanocontacomisservico, idplanocontapacote = @idplanocontapacote ' +     
        ' WHERE idformapagamento = @idformapagamento');

    res.json({ success: true, message: 'Forma Pagamento atualizada com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Deletar uma forma pagamento
const deleteFormaPagamento = async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input('idformapagamento', req.params.idformapagamento)
      .query('DELETE FROM formapagamento WHERE idformapagamento = @idformapagamento');

    res.json({ success: true, message: 'Forma Pagamento deletada com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getFormasPagamento,
  getFormaPagamentoById,
  createFormaPagamento,
  updateFormaPagamento,
  deleteFormaPagamento,
  getFormasPagamentoDropDown,
};
