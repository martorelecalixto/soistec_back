const { poolPromise } = require('../db');


// Obter todas as filiais
const getFiliaisDropDown = async (req, res) => {
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
          `SELECT idfilial, nome
            FROM filiais ${whereClause}`

      const result = await request.query(query);

      res.json(result.recordset);         

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// Obter todas as filiais
const getFiliais = async (req, res) => {
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
    `SELECT idfilial, nome, cnpjcpf, razaosocial, celular1, celular2, telefone1, telefone2,
      redessociais, home, email, linkimagem, logradouro, complemento, numero,
      estado, cidade, bairro, cep, referencia, valoricms, valoriss, valorcofins,
      valorpis, valoripi, valorir, valorcsll, valorinss, empresa FROM filiais ${whereClause}`

   const result = await request.query(query);

    res.json(result.recordset);    
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Obter uma filial pelo ID
const getFilialById = async (req, res) => {
  try {
    const { idfilial } = req.params;

    if (!idfilial) {
      return res.status(400).json({ success: false, message: 'O parâmetro "idfilial" é obrigatório.' });
    }

    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('idfilial', idfilial)//logradouro, complemento, numero,
          //estado, cidade, bairro, cep,
      .query(`
        SELECT idfilial, nome, cnpjcpf, razaosocial, celular1, celular2, telefone1, telefone2,
          redessociais, home, email, linkimagem,  referencia, valoricms, valoriss, valorcofins,
          valorpis, valoripi, valorir, valorcsll, valorinss, empresa,
          isnull(logradouro, '') AS logradouro, isnull(complemento, '') AS complemento, isnull(numero, '') AS numero, 
          isnull(cep, '') AS cep, isnull(bairro, '') AS bairro, isnull(cidade, '') AS cidade, isnull(estado, '') AS estado
          FROM filiais  WHERE idfilial = @idfilial 
      `);

    if (result.recordset.length > 0) {
      res.json(result.recordset[0]);
    } else {
      res.status(404).json({ success: false, message: 'Filial não encontrada.' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Criar uma nova filial
const createFilial = async (req, res) => {
  try {
    const {
      nome, cnpjcpf, razaosocial, celular1, celular2, telefone1, telefone2,
      redessociais, home, email, linkimagem, logradouro, complemento, numero,
      estado, cidade, bairro, cep, referencia, valoricms, valoriss, valorcofins,
      valorpis, valoripi, valorir, valorcsll, valorinss, empresa
    } = req.body;

    const pool = await poolPromise;
    await pool
      .request()
      .input('nome', nome)
      .input('cnpjcpf', cnpjcpf)
      .input('razaosocial', razaosocial)
      .input('celular1', celular1)
      .input('celular2', celular2)
      .input('telefone1', telefone1)
      .input('telefone2', telefone2)
      .input('redessociais', redessociais)
      .input('home', home)
      .input('email', email)
      .input('linkimagem', linkimagem)
      .input('logradouro', logradouro)
      .input('complemento', complemento)
      .input('numero', numero)
      .input('estado', estado)
      .input('cidade', cidade)
      .input('bairro', bairro)
      .input('cep', cep)
      .input('referencia', referencia)
      .input('valoricms', valoricms)
      .input('valoriss', valoriss)
      .input('valorcofins', valorcofins)
      .input('valorpis', valorpis)
      .input('valoripi', valoripi)
      .input('valorir', valorir)
      .input('valorcsll', valorcsll)
      .input('valorinss', valorinss)
      .input('empresa', empresa)
      .query(
        `INSERT INTO filiais (
          nome, cnpjcpf, razaosocial, celular1, celular2, telefone1, telefone2,
          redessociais, home, email, linkimagem, logradouro, complemento, numero,
          estado, cidade, bairro, cep, referencia, valoricms, valoriss, valorcofins,
          valorpis, valoripi, valorir, valorcsll, valorinss, empresa
        ) VALUES (
          @nome, @cnpjcpf, @razaosocial, @celular1, @celular2, @telefone1, @telefone2,
          @redessociais, @home, @email, @linkimagem, @logradouro, @complemento, @numero,
          @estado, @cidade, @bairro, @cep, @referencia, @valoricms, @valoriss, @valorcofins,
          @valorpis, @valoripi, @valorir, @valorcsll, @valorinss, @empresa
        )`
      );

    res.status(201).json({ success: true, message: 'Filial criada com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// Atualizar uma filial existente
const updateFilial = async (req, res) => {
  try {
    const {
      nome, cnpjcpf, razaosocial, celular1, celular2, telefone1, telefone2,
      redessociais, home, email, linkimagem, logradouro, complemento, numero,
      estado, cidade, bairro, cep, referencia, valoricms, valoriss, valorcofins,
      valorpis, valoripi, valorir, valorcsll, valorinss
    } = req.body;

    const pool = await poolPromise;
    await pool
      .request()
      .input('idfilial', req.params.idfilial)
      .input('nome', nome)
      .input('cnpjcpf', cnpjcpf)
      .input('razaosocial', razaosocial)
      .input('celular1', celular1)
      .input('celular2', celular2)
      .input('telefone1', telefone1)
      .input('telefone2', telefone2)
      .input('redessociais', redessociais)
      .input('home', home)
      .input('email', email)
      .input('linkimagem', linkimagem)
      .input('logradouro', logradouro)
      .input('complemento', complemento)
      .input('numero', numero)
      .input('estado', estado)
      .input('cidade', cidade)
      .input('bairro', bairro)
      .input('cep', cep)
      .input('referencia', referencia)
      .input('valoricms', valoricms)
      .input('valoriss', valoriss)
      .input('valorcofins', valorcofins)
      .input('valorpis', valorpis)
      .input('valoripi', valoripi)
      .input('valorir', valorir)
      .input('valorcsll', valorcsll)
      .input('valorinss', valorinss)
      .query(
        `UPDATE filiais SET
          nome = @nome,
          cnpjcpf = @cnpjcpf,
          razaosocial = @razaosocial,
          celular1 = @celular1,
          celular2 = @celular2,
          telefone1 = @telefone1,
          telefone2 = @telefone2,
          redessociais = @redessociais,
          home = @home,
          email = @email,
          linkimagem = @linkimagem,
          logradouro = @logradouro,
          complemento = @complemento,
          numero = @numero,
          estado = @estado,
          cidade = @cidade,
          bairro = @bairro,
          cep = @cep,
          referencia = @referencia,
          valoricms = @valoricms,
          valoriss = @valoriss,
          valorcofins = @valorcofins,
          valorpis = @valorpis,
          valoripi = @valoripi,
          valorir = @valorir,
          valorcsll = @valorcsll,
          valorinss = @valorinss
        WHERE idfilial = @idfilial`
      );

    res.json({ success: true, message: 'Filial atualizada com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Deletar uma filial
const deleteFilial = async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input('idfilial', req.params.idfilial)
      .query('DELETE FROM filiais WHERE idfilial = @idfilial');
    res.json({ success: true, message: 'Filial deletada com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getFiliais,
  getFilialById,
  createFilial,
  updateFilial,
  deleteFilial,
  getFiliaisDropDown,
};
