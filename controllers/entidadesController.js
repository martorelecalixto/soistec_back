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

// Obter todas as entidades
const getEntidades = async (req, res) => {
  try {
    const { empresa, nome, cnpjcpf, email } = req.query;

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

    if (cnpjcpf) {
      whereClause += ' AND cnpjcpf LIKE @cnpjcpf';
      request.input('cnpjcpf', `%${cnpjcpf}%`);
    }

    if (email) {
      whereClause += ' AND email LIKE @email';
      request.input('email', `%${email}%`);
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
      ter, loc, sexo, pes, documento, tipodocumento 
  } = req.body;

    const pool = await poolPromise;
    await pool
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
      .query(
        `INSERT INTO entidades (
          nome, cnpjcpf, fantasia, celular1, celular2, telefone1, telefone2,
          datacadastro, datanascimento, email, ativo, cli, vend, emis, mot, gui, cia, ope, hot,
          sigla, cartao_sigla_1, cartao_numero_1, cartao_mesvencimento_1, cartao_anovencimento_1,
          cartao_diafechamento_1, cartao_titular_1, cartao_sigla_2, cartao_numero_2, cartao_mesvencimento_2,
          cartao_anovencimento_2, cartao_diafechamento_2, cartao_titular_2, chave, atividadeid, empresa, seg,
          ter, loc, sexo, pes, documento, tipodocumento 
        ) VALUES (
          @nome, @cnpjcpf, @fantasia, @celular1, @celular2, @telefone1, @telefone2,
          @datacadastro, @datanascimento, @email, @ativo, @cli, @vend, @emis, @mot, @gui, @cia, @ope, @hot,
          @sigla, @cartao_sigla_1, @cartao_numero_1, @cartao_mesvencimento_1, @cartao_anovencimento_1,
          @cartao_diafechamento_1, @cartao_titular_1, @cartao_sigla_2, @cartao_numero_2, @cartao_mesvencimento_2,
          @cartao_anovencimento_2, @cartao_diafechamento_2, @cartao_titular_2, @chave, @atividadeid, @empresa, @seg,
          @ter, @loc, @sexo, @pes, @documento, @tipodocumento 
        )`
      );

    res.status(201).json({ success: true, message: 'Empresa criada com sucesso' });
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
      ter, loc, sexo, pes, documento, tipodocumento 
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
          cartao_sigla_2 = @cartao_sigla_2
          cartao_numero_2 = @cartao_numero_2
          cartao_mesvencimento_2 = @cartao_mesvencimento_2
          cartao_anovencimento_2 = @cartao_anovencimento_2
          cartao_diafechamento_2 = @cartao_diafechamento_2
          cartao_titular_2 = @cartao_titular_2
          chave = @chave
          atividadeid = @atividadeid
          empresa = @empresa
          seg = @seg
          ter = @ter
          loc = @loc
          sexo = @sexo
          pes = @pes
          documento = @documento
          tipodocumento = @tipodocumento
          WHERE idempresa = @idempresa`
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
};
