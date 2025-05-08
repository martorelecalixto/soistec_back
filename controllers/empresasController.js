const { poolPromise } = require('../db');

// Obter todas as empresas
const getEmpresas = async (req, res) => {
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
    `SELECT idempresa, nome, cnpjcpf, razaosocial, celular1, celular2, telefone1, telefone2,
      redessociais, home, email, linkimagem, logradouro, complemento, numero,
      estado, cidade, bairro, cep, referencia, codigoempresa, licenca, emissivo,
      receptivo, financeiro, advocaticio, bloqueado FROM empresa ${whereClause}`

   const result = await request.query(query);

    res.json(result.recordset);    
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Obter uma empresa pelo ID
const getEmpresaById = async (req, res) => {
  try {
    const { empresa, nome, cnpjcpf, email } = req.query;

    // Verifica se o parâmetro 'empresa' foi fornecido
    if (!empresa) {
      return res.status(400).json({ success: false, message: 'O parâmetro "empresa" é obrigatório.' });
    }
    
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('idempresa', req.params.id)
      .query(
        `SELECT idempresa, nome, cnpjcpf, razaosocial, celular1, celular2, telefone1, telefone2,
          redessociais, home, email, linkimagem, logradouro, complemento, numero,
          estado, cidade, bairro, cep, referencia, codigoempresa, licenca, emissivo,
          receptivo, financeiro, advocaticio, bloqueado FROM empresa  WHERE idempresa = @idempresa ORDER BY nome`
      );

    //  .query('SELECT * FROM empresas  WHERE idempresa = @idempresa');
    if (result.recordset.length > 0) {
      res.json(result.recordset[0]);
    } else {
      res.status(404).send('Empresa não encontrada');
    }

  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Criar uma nova empresa
const createEmpresa = async (req, res) => {
  try {
    const {
      nome, cnpjcpf, razaosocial, celular1, celular2, telefone1, telefone2,
      redessociais, home, email, linkimagem, logradouro, complemento, numero,
      estado, cidade, bairro, cep, referencia, codigoempresa, licenca, emissivo,
      receptivo, financeiro, advocaticio, bloqueado
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
      .input('codigoempresa', codigoempresa)
      .input('licenca', licenca)
      .input('emissivo', emissivo)
      .input('receptivo', receptivo)
      .input('financeiro', financeiro)
      .input('advocaticio', advocaticio)
      .input('bloqueado', bloqueado)
      .query(
        `INSERT INTO empresa (
          nome, cnpjcpf, razaosocial, celular1, celular2, telefone1, telefone2,
          redessociais, home, email, linkimagem, logradouro, complemento, numero,
          estado, cidade, bairro, cep, referencia, codigoempresa, licenca, emissivo,
          receptivo, financeiro, advocaticio, bloqueado
        ) VALUES (
          @nome, @cnpjcpf, @razaosocial, @celular1, @celular2, @telefone1, @telefone2,
          @redessociais, @home, @email, @linkimagem, @logradouro, @complemento, @numero,
          @estado, @cidade, @bairro, @cep, @referencia, @codigoempresa, @licenca, @emissivo,
          @receptivo, @financeiro, @advocaticio, @bloqueado
        )`
      );

    res.status(201).json({ success: true, message: 'Empresa criada com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// Atualizar uma empresa existente
const updateEmpresa = async (req, res) => {
  try {
    const {
      nome, cnpjcpf, razaosocial, celular1, celular2, telefone1, telefone2,
      redessociais, home, email, linkimagem, logradouro, complemento, numero,
      estado, cidade, bairro, cep, referencia, codigoempresa, licenca, emissivo,
      receptivo, financeiro, advocaticio, bloqueado
    } = req.body;

    const pool = await poolPromise;
    await pool
      .request()
      .input('idempresa', req.params.idempresa)
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
      .input('codigoempresa', codigoempresa)
      .input('licenca', licenca)
      .input('emissivo', emissivo)
      .input('receptivo', receptivo)
      .input('financeiro', financeiro)
      .input('advocaticio', advocaticio)
      .input('bloqueado', bloqueado)
      .query(
        `UPDATE empresa SET
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
          codigoempresa = @codigoempresa,
          licenca = @licenca,
          emissivo = @emissivo,
          receptivo = @receptivo,
          financeiro = @financeiro,
          advocaticio = @advocaticio,
          bloqueado = @bloqueado
        WHERE idempresa = @idempresa`
      );

    res.json({ success: true, message: 'Empresa atualizada com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Deletar uma empresa
const deleteEmpresa = async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input('idempresa', req.params.idempresa)
      .query('DELETE FROM empresa WHERE idempresa = @idempresa');
    res.json({ success: true, message: 'Empresa deletada com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getEmpresas,
  getEmpresaById,
  createEmpresa,
  updateEmpresa,
  deleteEmpresa,
};
