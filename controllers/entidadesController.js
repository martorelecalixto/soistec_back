const { query } = require('mssql');
const { poolPromise } = require('../db');


// Obter todos os CiaAerea
const getCiasDropDown = async (req, res) => {
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
      let whereClause = 'WHERE empresa = @empresa AND cia = 1';
      whereClause += ' ORDER BY nome ';

      const query =
          `SELECT identidade, nome
            FROM entidades ${whereClause}`

      const result = await request.query(query);

      res.json(result.recordset);         

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Obter todos os emissores
const getEmissoresDropDown = async (req, res) => {
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
      let whereClause = 'WHERE empresa = @empresa AND emis = 1';
      whereClause += ' ORDER BY nome ';

      const query =
          `SELECT identidade, nome
            FROM entidades ${whereClause}`

      const result = await request.query(query);

      res.json(result.recordset);         

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Obter todos os vendedores
const getVendedoresDropDown = async (req, res) => {
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
      let whereClause = 'WHERE empresa = @empresa AND vend = 1';
      whereClause += ' ORDER BY nome ';

      const query =
          `SELECT identidade, nome
            FROM entidades ${whereClause}`

      const result = await request.query(query);

      res.json(result.recordset);         

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Obter todos os clientes
const getClientesDropDown = async (req, res) => {
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
      let whereClause = 'WHERE empresa = @empresa AND cli = 1';
      whereClause += ' ORDER BY nome ';

      const query =
          `SELECT identidade, nome
            FROM entidades ${whereClause}`

      const result = await request.query(query);

      res.json(result.recordset);         

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Obter todos os fornecedores
const getFornecedoresDropDown = async (req, res) => {
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
      let whereClause = 'WHERE empresa = @empresa AND [for] = 1';
      whereClause += ' ORDER BY nome ';

      const query =
          `SELECT identidade, nome
            FROM entidades ${whereClause}`

      const result = await request.query(query);

      res.json(result.recordset);         

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Obter todas as entidades
const getEntidades = async (req, res) => {
  try {
    const { empresa, nome, datainicial, datafinal } = req.query;

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

    if (datainicial) {
      request.input('datainicial', datainicial);
      whereClause += ' AND datanascimento >= @datainicial';
    }
    
    if (datafinal) {
      request.input('datafinal', datafinal);
      whereClause += ' AND datanascimento <= @datafinal';
    }

    whereClause += ' ORDER BY nome ';

   const query =
    `SELECT identidade, nome, cnpjcpf, fantasia, celular1, celular2, telefone1, telefone2,
     datacadastro, datanascimento, email, ativo, [for], cli, vend, emis, mot, gui, cia, ope, hot,
     sigla, cartao_sigla_1, cartao_numero_1, cartao_mesvencimento_1, cartao_anovencimento_1,
     cartao_diafechamento_1, cartao_titular_1, cartao_sigla_2, cartao_numero_2, cartao_mesvencimento_2,
     cartao_anovencimento_2, cartao_diafechamento_2, cartao_titular_2, chave, atividadeid, empresa, seg,
     ter, loc, sexo, pes, documento, tipodocumento
       FROM entidades ${whereClause}`

     

   const result = await request.query(query);
//console.log(result.recordset);
    res.json(result.recordset);    
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Obter uma entidade pelo ID
const getEntidadeById = async (req, res) => {
  try {
    const { identidade } = req.params;

    if (!identidade) {
      return res.status(400).json({ success: false, message: 'O parâmetro "identidade" é obrigatório.' });
    }

    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('identidade', identidade)
      .query(`
            SELECT 
                entidades.identidade, 
                entidades.nome, 
                entidades.cnpjcpf, 
                entidades.fantasia, 
                entidades.celular1, 
                entidades.celular2, 
                entidades.telefone1, 
                entidades.telefone2, 
                entidades.datacadastro, 
                entidades.datanascimento, 
                entidades.email, 
                entidades.ativo, 
                entidades.[for], 
                entidades.cli, 
                entidades.vend, 
                entidades.emis, 
                entidades.mot, 
                entidades.gui, 
                entidades.cia, 
                entidades.ope, 
                entidades.hot, 
                entidades.sigla, 
                entidades.cartao_sigla_1, 
                entidades.cartao_numero_1, 
                entidades.cartao_mesvencimento_1, 
                entidades.cartao_anovencimento_1, 
                entidades.cartao_diafechamento_1, 
                entidades.cartao_titular_1, 
                entidades.cartao_sigla_2, 
                entidades.cartao_numero_2, 
                entidades.cartao_mesvencimento_2, 
                entidades.cartao_anovencimento_2, 
                entidades.cartao_diafechamento_2, 
                entidades.cartao_titular_2, 
                entidades.chave, 
                entidades.atividadeid, 
                entidades.empresa, 
                entidades.seg, 
                entidades.ter, 
                entidades.loc, 
                entidades.sexo, 
                entidades.pes, 
                entidades.documento, 
                entidades.tipodocumento,
                isnull(entidades_enderecos.logradouro, '') as logradouro,
                isnull(entidades_enderecos.complemento, '') as complemento,
                isnull(entidades_enderecos.numero, '') as numero,
                isnull(entidades_enderecos.cep, '') as cep,
                isnull(entidades_enderecos.bairro, '') as bairro,
                isnull(entidades_enderecos.cidade, '') as cidade,
                isnull(entidades_enderecos.estado, '') as estado
            FROM 
                entidades
            LEFT JOIN 
                entidades_enderecos 
                ON entidades.identidade = entidades_enderecos.identidade
            WHERE 
                entidades.identidade = @identidade;

      `);

    if (result.recordset.length > 0) {
      res.json(result.recordset[0]);
    } else {
      res.status(404).json({ success: false, message: 'Entidade não encontrada.' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Criar uma nova entidade
const createEntidade = async (req, res) => {
  try {
    const {
      nome, cnpjcpf, fantasia, celular1, celular2, telefone1, telefone2,
      datacadastro, datanascimento, email, ativo, cli, vend, emis, mot, gui, cia, ope, hot,
      sigla, cartao_sigla_1, cartao_numero_1, cartao_mesvencimento_1, cartao_anovencimento_1,
      cartao_diafechamento_1, cartao_titular_1, cartao_sigla_2, cartao_numero_2, cartao_mesvencimento_2,
      cartao_anovencimento_2, cartao_diafechamento_2, cartao_titular_2, chave, atividadeid, empresa, seg,
      ter, loc, sexo, pes, documento, tipodocumento,  for: forValue
  } = req.body;

    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('nome', nome)
      .input('cnpjcpf', cnpjcpf)
      .input('fantasia', fantasia)
      .input('celular1', celular1)
      .input('celular2', celular2)
      .input('telefone1', telefone1)
      .input('telefone2', telefone2)
      .input('datacadastro', datacadastro)
      .input('datanascimento', datanascimento)
      .input('email', email)
      .input('ativo', ativo)
      .input('cli', cli)
      .input('vend', vend)
      .input('emis', emis)
      .input('mot', mot)
      .input('gui', gui)
      .input('cia', cia)
      .input('ope', ope)
      .input('hot', hot)
      .input('sigla', sigla)
      .input('cartao_sigla_1', cartao_sigla_1)
      .input('cartao_numero_1', cartao_numero_1)
      .input('cartao_mesvencimento_1', cartao_mesvencimento_1)
      .input('cartao_anovencimento_1', cartao_anovencimento_1)
      .input('cartao_diafechamento_1', cartao_diafechamento_1)
      .input('cartao_titular_1', cartao_titular_1)
      .input('cartao_sigla_2', cartao_sigla_2)
      .input('cartao_numero_2', cartao_numero_2)
      .input('cartao_mesvencimento_2', cartao_mesvencimento_2)
      .input('cartao_anovencimento_2', cartao_anovencimento_2)
      .input('cartao_diafechamento_2', cartao_diafechamento_2)
      .input('cartao_titular_2', cartao_titular_2)
      .input('chave', chave)
      .input('atividadeid', atividadeid)
      .input('empresa', empresa)
      .input('seg', seg)
      .input('ter', ter)
      .input('loc', loc)
      .input('sexo', sexo)
      .input('pes', pes)
      .input('documento', documento)
      .input('tipodocumento', tipodocumento)
      .input('for', forValue)
      .query(
        `INSERT INTO entidades (
          nome, cnpjcpf, fantasia, celular1, celular2, telefone1, telefone2,
          datacadastro, datanascimento, email, ativo, cli, vend, emis, mot, gui, cia, ope, hot,
          sigla, cartao_sigla_1, cartao_numero_1, cartao_mesvencimento_1, cartao_anovencimento_1,
          cartao_diafechamento_1, cartao_titular_1, cartao_sigla_2, cartao_numero_2, cartao_mesvencimento_2,
          cartao_anovencimento_2, cartao_diafechamento_2, cartao_titular_2, chave, atividadeid, empresa, seg,
          ter, loc, sexo, pes, documento, tipodocumento, [for]
        ) 
        OUTPUT INSERTED.identidade  
        VALUES (
          @nome, @cnpjcpf, @fantasia, @celular1, @celular2, @telefone1, @telefone2,
          @datacadastro, @datanascimento, @email, @ativo, @cli, @vend, @emis, @mot, @gui, @cia, @ope, @hot,
          @sigla, @cartao_sigla_1, @cartao_numero_1, @cartao_mesvencimento_1, @cartao_anovencimento_1,
          @cartao_diafechamento_1, @cartao_titular_1, @cartao_sigla_2, @cartao_numero_2, @cartao_mesvencimento_2,
          @cartao_anovencimento_2, @cartao_diafechamento_2, @cartao_titular_2, @chave, @atividadeid, @empresa, @seg,
          @ter, @loc, @sexo, @pes, @documento, @tipodocumento, @for
        )`
      );

    const identidade = result.recordset[0].identidade;

    res.status(201).json({ success: true, identidade, message: 'entidade criada com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });

  }
};

// Atualizar uma entidade existente
const updateEntidade = async (req, res) => {
  try {
    const {
      nome, cnpjcpf, fantasia, celular1, celular2, telefone1, telefone2,
      datacadastro, datanascimento, email, ativo, cli, vend, emis, mot, gui, cia, ope, hot,
      sigla, cartao_sigla_1, cartao_numero_1, cartao_mesvencimento_1, cartao_anovencimento_1,
      cartao_diafechamento_1, cartao_titular_1, cartao_sigla_2, cartao_numero_2, cartao_mesvencimento_2,
      cartao_anovencimento_2, cartao_diafechamento_2, cartao_titular_2, chave, atividadeid, empresa, seg,
      ter, loc, sexo, pes, documento, tipodocumento, for:forValue
    } = req.body;
    const pool = await poolPromise;
    await pool
      .request()
      .input('identidade', req.params.identidade)
      .input('nome', nome)
      .input('cnpjcpf', cnpjcpf)
      .input('fantasia', fantasia)
      .input('celular1', celular1)
      .input('celular2', celular2)
      .input('telefone1', telefone1)
      .input('telefone2', telefone2)
      .input('datacadastro', datacadastro)
      .input('datanascimento', datanascimento)
      .input('email', email)
      .input('ativo', ativo)
      .input('cli', cli)
      .input('vend', vend)
      .input('emis', emis)
      .input('mot', mot)
      .input('gui', gui)
      .input('cia', cia)
      .input('ope', ope)
      .input('hot', hot)
      .input('sigla', sigla)
      .input('cartao_sigla_1', cartao_sigla_1)
      .input('cartao_numero_1', cartao_numero_1)
      .input('cartao_mesvencimento_1', cartao_mesvencimento_1)
      .input('cartao_anovencimento_1', cartao_anovencimento_1)
      .input('cartao_diafechamento_1', cartao_diafechamento_1)
      .input('cartao_titular_1', cartao_titular_1)
      .input('cartao_sigla_2', cartao_sigla_2)
      .input('cartao_numero_2', cartao_numero_2)
      .input('cartao_mesvencimento_2', cartao_mesvencimento_2)
      .input('cartao_anovencimento_2', cartao_anovencimento_2)
      .input('cartao_diafechamento_2', cartao_diafechamento_2)
      .input('cartao_titular_2', cartao_titular_2)
      .input('chave', chave)
      .input('atividadeid', atividadeid)
      .input('empresa', empresa)
      .input('seg', seg)
      .input('ter', ter)
      .input('loc', loc)
      .input('sexo', sexo)
      .input('pes', pes)
      .input('documento', documento)
      .input('tipodocumento', tipodocumento)
      .input('for', forValue)
      .query(
        `UPDATE entidades SET
          nome = @nome,
          cnpjcpf = @cnpjcpf,
          fantasia = @fantasia,
          celular1 = @celular1,
          celular2 = @celular2,
          telefone1 = @telefone1,
          telefone2 = @telefone2,
          datacadastro = @datacadastro,
          datanascimento = @datanascimento,
          email = @email,
          ativo = @ativo,
          cli = @cli,
          vend = @vend,
          emis = @emis,
          mot = @mot,
          gui = @gui,
          cia = @cia,
          ope = @ope,
          hot = @hot,
          sigla = @sigla,
          cartao_sigla_1 = @cartao_sigla_1,
          cartao_numero_1 = @cartao_numero_1,
          cartao_mesvencimento_1 = @cartao_mesvencimento_1,
          cartao_anovencimento_1 = @cartao_anovencimento_1,
          cartao_diafechamento_1 = @cartao_diafechamento_1,
          cartao_titular_1 = @cartao_titular_1,
          cartao_sigla_2 = @cartao_sigla_2,
          cartao_numero_2 = @cartao_numero_2,
          cartao_mesvencimento_2 = @cartao_mesvencimento_2,
          cartao_anovencimento_2 = @cartao_anovencimento_2,
          cartao_diafechamento_2 = @cartao_diafechamento_2,
          cartao_titular_2 = @cartao_titular_2,
          chave = @chave,
          atividadeid = @atividadeid,
          empresa = @empresa,
          seg = @seg,
          ter = @ter,
          loc = @loc,
          sexo = @sexo,
          pes = @pes,
          documento = @documento,
          tipodocumento = @tipodocumento,
          [for] = @for
          WHERE identidade = @identidade`
      );

    res.json({ success: true, message: 'Entidade atualizada com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Deletar uma entidade
const deleteEntidade = async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input('identidade', req.params.identidade)
      .query('DELETE FROM entidades WHERE identidade = @identidade');
    res.json({ success: true, message: 'Entidade deletada com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }



};

// Criar uma nova cia aerea
const createCiaAerea = async (req, res) => {
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
    const result = await pool
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
      .input('liqdedtaxanaccc',liqdedtaxanaccc )
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
      .query(
        `INSERT INTO caereas (
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
          )
              OUTPUT INSERTED.idciaaerea
          VALUES (
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
          )`
      );

    const idciaaerea = result.recordset[0].idciaaerea;

    res.status(201).json({ success: true, idciaaerea, message: 'cia aerea criada com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Atualizar uma cia aerea existente
const updateCiaAerea = async (req, res) => {
  try {
    const {
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
      percint2
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
      .input('liqdedtaxanaccc',liqdedtaxanaccc )
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
      .query(
        `UPDATE caereas
          SET
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
              percint2 = @percint2
          WHERE idciaaerea = @idciaaerea`
      );

    res.json({ success: true, message: 'Cia Aerea atualizada com sucesso' });
  } catch (error) {
   // console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Obter uma cia aerea pelo ID
const getCiaAereaById = async (req, res) => {
  try {
    const { identidade } = req.params;

    if (!identidade) {
      return res.status(400).json({ success: false, message: 'O parâmetro "identidade" é obrigatório.' });
    }

    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('identidade', identidade)
      .query(`SELECT 
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
              WHERE 
                  entidadeid = @identidade`);

    if (result.recordset.length > 0) {
      res.json(result.recordset[0]);
    } else {
      //console.log(result.recordset);
      //res.status(404).json({ success: false, message: 'cia aerea não encontrada.' });
      // Retornar objeto com todos os campos zerados
      const defaultData = {
        idciaaerea: 0,
        percomisnac: 0,
        percomisint: 0,
        overnac: 0,
        overint: 0,
        liqaddtarifanaciv: false,
        liqaddtaxanaciv: false,
        liqadddunaciv: false,
        liqaddcomissaonaciv: false,
        liqaddovernaciv: false,
        liqaddtarifanaccc: false,
        liqaddtaxanaccc: false,
        liqadddunaccc: false,
        liqaddcomissaonaccc: false,
        liqaddovernaccc: false,
        liqaddtarifaintiv: false,
        liqaddtaxaintiv: false,
        liqaddduintiv: false,
        liqaddcomissaointiv: false,
        liqaddoverintiv: false,
        liqaddtarifaintcc: false,
        liqaddtaxaintcc: false,
        liqaddduintcc: false,
        liqaddcomissaointcc: false,
        liqaddoverintcc: false,
        liqdedtarifanaciv: false,
        liqdedtaxanaciv: false,
        liqdeddunaciv: false,
        liqdedcomissaonaciv: false,
        liqdedovernaciv: false,
        liqdedtarifanaccc: false,
        liqdedtaxanaccc: false,
        liqdeddunaccc: false,
        liqdedcomissaonaccc: false,
        liqdedovernaccc: false,
        liqdedtarifaintiv: false,
        liqdedtaxaintiv: false,
        liqdedduintiv: false,
        liqdedcomissaointiv: false,
        liqdedoverintiv: false,
        liqdedtarifaintcc: false,
        liqdedtaxaintcc: false,
        liqdedduintcc: false,
        liqdedcomissaointcc: false,
        liqdedoverintcc: false,
        valorininac1: 0,
        valorfinnac1: 0,
        valornac1: 0,
        percnac1: 0,
        valorininac2: 0,
        valorfinnac2: 0,
        valornac2: 0,
        percnac2: 0,
        valoriniint1: 0,
        valorfinint1: 0,
        valorint1: 0,
        percint1: 0,
        valoriniint2: 0,
        valorfinint2: 0,
        valorint2: 0,
        percint2: 0,
        entidadeid: parseInt(identidade),      
    };
     res.json(defaultData);
  }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Deletar uma cia aerea
const deleteCiaAerea = async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input('idciaaerea', req.params.idciaaerea)
      .query('DELETE FROM caereas WHERE idciaaerea = @idciaaerea');
    res.json({ success: true, message: 'Cia Aerea deletada com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }

};

// Criar uma nova operadora
const createOperadora = async (req, res) => {
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
    const result = await pool
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
      .input('liqdedtaxanaccc',liqdedtaxanaccc )
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
      .query(
        `INSERT INTO opradoras (
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
          )
              OUTPUT INSERTED.idoperadora
          VALUES (
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
          )`
      );

    const idoperadora = result.recordset[0].idoperadora;

    res.status(201).json({ success: true, idoperadora, message: 'Operadora criada com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Atualizar uma Operadora existente
const updateOperadora = async (req, res) => {
  try {
    const {
      idoperadora,
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
      percint2
    } = req.body;
    const pool = await poolPromise;
    await pool
      .request()
      .input('idoperadora', req.params.idoperadora)
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
      .input('liqdedtaxanaccc',liqdedtaxanaccc )
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
      .query(
        `UPDATE opradoras
          SET
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
              percint2 = @percint2
          WHERE idoperadora = @idoperadora`
      );

    res.json({ success: true, message: 'Operadora atualizada com sucesso' });
  } catch (error) {
   // console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Obter uma operadora pelo ID
const getOperadoraById = async (req, res) => {
  try {
    const { identidade } = req.params;

    if (!identidade) {
      return res.status(400).json({ success: false, message: 'O parâmetro "identidade" é obrigatório.' });
    }

    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('identidade', identidade)
      .query(`
            SELECT 
                  idoperadora,
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
                  FROM opradoras
              WHERE 
                  entidadeid = @identidade`);

    if (result.recordset.length > 0) {
      res.json(result.recordset[0]);
    } else {

      const defaultData = {
        idoperadora: 0,
        percomisnac: 0,
        percomisint: 0,
        overnac: 0,
        overint: 0,
        liqaddtarifanaciv: false,
        liqaddtaxanaciv: false,
        liqadddunaciv: false,
        liqaddcomissaonaciv: false,
        liqaddovernaciv: false,
        liqaddtarifanaccc: false,
        liqaddtaxanaccc: false,
        liqadddunaccc: false,
        liqaddcomissaonaccc: false,
        liqaddovernaccc: false,
        liqaddtarifaintiv: false,
        liqaddtaxaintiv: false,
        liqaddduintiv: false,
        liqaddcomissaointiv: false,
        liqaddoverintiv: false,
        liqaddtarifaintcc: false,
        liqaddtaxaintcc: false,
        liqaddduintcc: false,
        liqaddcomissaointcc: false,
        liqaddoverintcc: false,
        liqdedtarifanaciv: false,
        liqdedtaxanaciv: false,
        liqdeddunaciv: false,
        liqdedcomissaonaciv: false,
        liqdedovernaciv: false,
        liqdedtarifanaccc: false,
        liqdedtaxanaccc: false,
        liqdeddunaccc: false,
        liqdedcomissaonaccc: false,
        liqdedovernaccc: false,
        liqdedtarifaintiv: false,
        liqdedtaxaintiv: false,
        liqdedduintiv: false,
        liqdedcomissaointiv: false,
        liqdedoverintiv: false,
        liqdedtarifaintcc: false,
        liqdedtaxaintcc: false,
        liqdedduintcc: false,
        liqdedcomissaointcc: false,
        liqdedoverintcc: false,
        valorininac1: 0,
        valorfinnac1: 0,
        valornac1: 0,
        percnac1: 0,
        valorininac2: 0,
        valorfinnac2: 0,
        valornac2: 0,
        percnac2: 0,
        valoriniint1: 0,
        valorfinint1: 0,
        valorint1: 0,
        percint1: 0,
        valoriniint2: 0,
        valorfinint2: 0,
        valorint2: 0,
        percint2: 0,
        entidadeid: parseInt(identidade),      
    };
     res.json(defaultData);

     // res.status(404).json({ success: false, message: 'Operadora não encontrada.' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Deletar uma operadora
const deleteOperadora = async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input('idoperadora', req.params.idoperadora)
      .query('DELETE FROM opradoras WHERE idoperadora = @idoperadora');
    res.json({ success: true, message: 'Operadora deletada com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }



};

// Criar uma novo vendedor
const createVendedor = async (req, res) => {
  try {
    const {
      percomisnac,
      percomisint,
      percomissernac,
      percomisserint,
      entidadeid
    } = req.body;
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('percomisnac', percomisnac)
      .input('percomisint', percomisint)
      .input('percomissernac', percomissernac)
      .input('percomisserint', percomisserint)
      .input('entidadeid', entidadeid)
      .query(
        `INSERT INTO vendedores (
            percomisnac,
            percomisint,
            percomissernac,
            percomisserint,
            entidadeid
          )
              OUTPUT INSERTED.id
          VALUES (
            @percomisnac,
            @percomisint,
            @percomissernac,
            @percomisserint,
            @entidadeid
          )`
      );

    const id = result.recordset[0].id;

    res.status(201).json({ success: true, id, message: 'vendedor criada com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Atualizar uma vendedores existente
const updateVendedor = async (req, res) => {
  try {
    const {
      id,
      percomisnac,
      percomisint,
      percomissernac,
      percomisserint,
    } = req.body;
    const pool = await poolPromise;
    await pool
      .request()
      .input('id', req.params.id)
      .input('percomisnac', percomisnac)
      .input('percomisint', percomisint)
      .input('percomissernac', percomissernac)
      .input('percomisserint', percomisserint)
      .query(
        `UPDATE vendedores
          SET
              percomisnac = @percomisnac,
              percomisint = @percomisint,
              percomissernac = @percomissernac,
              percomisserint = @percomisserint
          WHERE id = @id`
      );

    res.json({ success: true, message: 'Vendedor atualizado com sucesso' });
  } catch (error) {
   // console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Obter uma vendedor pelo ID
const getVendedorById = async (req, res) => {
  try {
    const { identidade } = req.params;

    if (!identidade) {
      return res.status(400).json({ success: false, message: 'O parâmetro "identidade" é obrigatório.' });
    }

    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('identidade', identidade)
      .query(`
            SELECT 
                  id,
                  percomisnac,
                  percomisint,
                  percomissernac,
                  percomisserint,
                  entidadeid
                  FROM vendedores
              WHERE 
                  entidadeid = @identidade`);

    if (result.recordset.length > 0) {
      res.json(result.recordset[0]);
    } else {
        const defaultData = {
          id: 0,
          percomisnac: 0,
          percomisint: 0,
          percomissernac: 0,
          percomisserint: 0,
          entidadeid: parseInt(identidade),      
      };
      res.json(defaultData);
      //res.status(404).json({ success: false, message: 'vendedor não encontrado.' });
    }
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

// Criar uma novo emissor
const createEmissor = async (req, res) => {
  try {
    const {
      percomisnac,
      percomisint,
      percomissernac,
      percomisserint,
      entidadeid
    } = req.body;
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('percomisnac', percomisnac)
      .input('percomisint', percomisint)
      .input('percomissernac', percomissernac)
      .input('percomisserint', percomisserint)
      .input('entidadeid', entidadeid)
      .query(
        `INSERT INTO emissores (
            percomisnac,
            percomisint,
            percomissernac,
            percomisserint,
            entidadeid
          )
              OUTPUT INSERTED.idemissor
          VALUES (
            @percomisnac,
            @percomisint,
            @percomissernac,
            @percomisserint,
            @entidadeid
          )`
      );

    const idemissor = result.recordset[0].idemissor;

    res.status(201).json({ success: true, idemissor, message: 'emissor criada com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Atualizar uma emissores existente
const updateEmissor = async (req, res) => {
  try {
    const {
      idemissor,
      percomisnac,
      percomisint,
      percomissernac,
      percomisserint,
    } = req.body;
    const pool = await poolPromise;
    await pool
      .request()
      .input('idemissor', req.params.idemissor)
      .input('percomisnac', percomisnac)
      .input('percomisint', percomisint)
      .input('percomissernac', percomissernac)
      .input('percomisserint', percomisserint)
      .query(
        `UPDATE emissores
          SET
              percomisnac = @percomisnac,
              percomisint = @percomisint,
              percomissernac = @percomissernac,
              percomisserint = @percomisserint
          WHERE idemissor = @idemissor`
      );

    res.json({ success: true, message: 'Emissor atualizado com sucesso' });
  } catch (error) {
    //console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Obter uma Emissor pelo ID
const getEmissorById = async (req, res) => {
  try {
    const { identidade } = req.params;

    if (!identidade) {
      return res.status(400).json({ success: false, message: 'O parâmetro "identidade" é obrigatório.' });
    }

    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('identidade', identidade)
      .query(`
            SELECT 
                  idemissor,
                  percomisnac,
                  percomisint,
                  percomissernac,
                  percomisserint,
                  entidadeid
                  FROM emissores
              WHERE 
                  entidadeid = @identidade`);

    if (result.recordset.length > 0) {
      res.json(result.recordset[0]);
    } else {
        const defaultData = {
          idemissor: 0,
          percomisnac: 0,
          percomisint: 0,
          percomissernac: 0,
          percomisserint: 0,
          entidadeid: parseInt(identidade),      
      };
      res.json(defaultData);
      //res.status(404).json({ success: false, message: 'emissor não encontrado.' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Deletar um emissor
const deleteEmissor = async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input('idemissor', req.params.idemissor)
      .query('DELETE FROM emissores WHERE idemissor = @idemissor');
    res.json({ success: true, message: 'Emissor deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }



};

// Criar uma novo hotel
const createHotel = async (req, res) => {
  try {
    const {
      percomis,
      percomisint,
      prazofaturamento,
      entidadeid
    } = req.body;
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('percomis', percomis)
      .input('percomisint', percomisint)
      .input('prazofaturamento', prazofaturamento)
      .input('entidadeid', entidadeid)
      .query(
        `INSERT INTO hoteis (
            percomis,
            percomisint,
            prazofaturamento,
            entidadeid
          )
              OUTPUT INSERTED.idhotel
          VALUES (
            @percomis,
            @percomisint,
            @prazofaturamento,
            @entidadeid
          )`
      );

    const idhotel = result.recordset[0].idhotel;

    res.status(201).json({ success: true, idhotel, message: 'emissor criada com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Atualizar uma hoteis existente
const updateHotel = async (req, res) => {
  try {
    const {
      idhotel,
      percomis,
      percomisint,
      prazofaturamento
    } = req.body;
    const pool = await poolPromise;
    await pool
      .request()
      .input('idhotel', req.params.idhotel)
      .input('percomis', percomis)
      .input('percomisint', percomisint)
      .input('prazofaturamento', prazofaturamento)
      .query(
        `UPDATE hoteis
          SET
              percomis = @percomis,
              percomisint = @percomisint,
              prazofaturamento = @prazofaturamento
          WHERE idhotel = @idhotel`
      );

    res.json({ success: true, message: 'Hotel atualizado com sucesso' });
  } catch (error) {
    //console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Obter uma Hotel pelo ID
const getHotelById = async (req, res) => {
  try {
    const { identidade } = req.params;

    if (!identidade) {
      return res.status(400).json({ success: false, message: 'O parâmetro "identidade" é obrigatório.' });
    }

    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('identidade', identidade)
      .query(`
            SELECT 
                  idhotel,
                  percomis,
                  percomisint,
                  prazofaturamento,
                  entidadeid
                  FROM hoteis
              WHERE 
                  entidadeid = @identidade`);

    if (result.recordset.length > 0) {
      res.json(result.recordset[0]);
    } else {
        const defaultData = {
          idhotel: 0,
          percomis: 0,
          percomisint: 0,
          prazofaturamento: 0,
          entidadeid: parseInt(identidade),      
      };
      res.json(defaultData);
      //res.status(404).json({ success: false, message: 'hotel não encontrado.' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Deletar um hotel
const deleteHotel = async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input('idhotel', req.params.idhotel)
      .query('DELETE FROM hoteis WHERE idhotel = @idhotel');
    res.json({ success: true, message: 'Hotel deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }



};

// Obter os endereços da entidade pelo ID
const getEnderecoById = async (req, res) => {
  try {
    const { identidade } = req.params;

    if (!identidade) {
      return res.status(400).json({ success: false, message: 'O parâmetro "identidade" é obrigatório.' });
    }

    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('identidade', identidade)
      .query(`
            SELECT 
                entidades_enderecos.idendereco, entidades_enderecos.identidade, 
                isnull(entidades_enderecos.logradouro, '') as logradouro,
                isnull(entidades_enderecos.complemento, '') as complemento,
                isnull(entidades_enderecos.numero, '') as numero,
                isnull(entidades_enderecos.cep, '') as cep,
                isnull(entidades_enderecos.bairro, '') as bairro,
                isnull(entidades_enderecos.cidade, '') as cidade,
                isnull(entidades_enderecos.estado, '') as estado,
                ativo, referencia, selecionado
            FROM 
                entidades_enderecos 
            WHERE 
                entidades_enderecos.identidade = @identidade;

      `);

    if (result.recordset.length > 0) {
      res.json(result.recordset);
    } else {
      res.status(404).json({ success: false, message: 'Endereço da Entidade não encontrado.' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Criar um novo endereço para a entidade
const createEndereco = async (req, res) => {
  try {
    const {
      identidade, logradouro, complemento, numero, cep, bairro, cidade, estado,
      ativo, referencia, selecionado
  } = req.body;

    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('identidade', identidade)
      .input('logradouro', logradouro)
      .input('complemento', complemento)
      .input('numero', numero)
      .input('cep', cep)
      .input('bairro', bairro)
      .input('cidade', cidade)
      .input('estado', estado)
      .input('ativo', ativo)
      .input('referencia', referencia)
      .input('selecionado', selecionado)
      .query(
        `INSERT INTO entidades_enderecos (
          identidade, logradouro, complemento, numero, cep, bairro, cidade,
          estado, ativo, referencia, selecionado
        ) 
        OUTPUT INSERTED.idendereco  
        VALUES (
          @identidade, @logradouro, @complemento, @numero, @cep, @bairro, @cidade,
          @estado, @ativo, @referencia, @selecionado
        )`
      );

    const id = result.recordset[0].identidade;

    res.status(201).json({ success: true, id, message: 'endereço criado com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });

  }
};

// Atualizar um endereço da entidade existente
const updateEndereco = async (req, res) => {
  try {
    const {
      identidade, logradouro, complemento, numero, cep, bairro, cidade, estado,
      ativo, referencia, selecionado
    } = req.body;
    const pool = await poolPromise;
    await pool
      .request()
      .input('idendereco', req.params.idendereco)
      .input('identidade', identidade)
      .input('logradouro', logradouro)
      .input('complemento', complemento)
      .input('numero', numero)
      .input('cep', cep)
      .input('bairro', bairro)
      .input('cidade', cidade)
      .input('estado', estado)
      .input('ativo', ativo)
      .input('referencia', referencia)
      .input('selecionado', selecionado)
      .query(
        `UPDATE entidades_enderecos SET
          identidade = @identidade,
          logradouro = @logradouro,
          complemento = @complemento,
          numero = @numero,
          cep = @cep,
          bairro = @bairro,
          cidade = @cidade,
          estado = @estado,
          ativo = @ativo,
          referencia = @referencia,
          selecionado = @selecionado
        WHERE idendereco = @idendereco`
      );

    res.json({ success: true, message: 'Endereço atualizado com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Deletar um endereço da entidade
const deleteEndereco = async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input('idendereco', req.params.idendereco)
      .query('DELETE FROM entidades_enderecos WHERE idendereco = @idendereco');
    res.json({ success: true, message: 'Endereço deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }



};

// Obter uma endereço pelo ID ENTIDADE
const getEnderecoByIdEntidade = async (req, res) => {
  try {
   
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('identidade', req.params.identidade)
      .query(
        `SELECT 
                entidades_enderecos.idendereco, entidades_enderecos.identidade, 
                isnull(entidades_enderecos.logradouro, '') as logradouro,
                isnull(entidades_enderecos.complemento, '') as complemento,
                isnull(entidades_enderecos.numero, '') as numero,
                isnull(entidades_enderecos.cep, '') as cep,
                isnull(entidades_enderecos.bairro, '') as bairro,
                isnull(entidades_enderecos.cidade, '') as cidade,
                isnull(entidades_enderecos.estado, '') as estado,
                ativo, referencia, selecionado
            FROM 
                entidades_enderecos 
            WHERE 
                entidades_enderecos.identidade = @identidade          

          `
      );

    if (result.recordset.length > 0) {
      res.json(result.recordset);
    } else {
      res.status(404).send('endereço não encontrada');
    }

  } catch (error) {
    res.status(500).send(error.message);
  }
};



module.exports = {
  getEntidades,
  getEntidadeById,
  createEntidade,
  updateEntidade,
  deleteEntidade,
  getClientesDropDown,
  getVendedoresDropDown,
  getEmissoresDropDown,
  getCiasDropDown,
  getFornecedoresDropDown,
  createCiaAerea,
  updateCiaAerea,
  getCiaAereaById,
  deleteCiaAerea,
  createOperadora,
  updateOperadora,
  getOperadoraById,
  deleteOperadora,
  createVendedor,
  updateVendedor,
  getVendedorById,
  deleteVendedor,
  createEmissor,
  updateEmissor,
  getEmissorById,
  deleteEmissor,
  createHotel,
  updateHotel,
  getHotelById,
  deleteHotel,
  getEnderecoById,
  createEndereco,
  updateEndereco,
  deleteEndereco,
  getEnderecoByIdEntidade
};
