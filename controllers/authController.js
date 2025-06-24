const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { poolPromise } = require('../db');

// Substitua por uma chave segura no seu ambiente
const SECRET_KEY = process.env.JWT_SECRET || 'minhaChaveSecreta';

const login = async (req, res) => {
  const { email, senha } = req.body;

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('email', email)
      .query('SELECT * FROM usuarios WHERE email = @email');

    if (result.recordset.length === 0) {
      return res.status(401).json({ success: false, message: 'E-mail não encontrado' });
    }

    const usuario = result.recordset[0];
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

    if (!senhaCorreta) {
      return res.status(401).json({ success: false, message: 'Senha incorreta' });
    }

    // Gera token JWT com nome, email e id
    const token = jwt.sign(
      { idusuario: usuario.idusuario, nome: usuario.nome, email: usuario.email, empresa: usuario.empresa, idempresa: usuario.idempresa },
      SECRET_KEY,
      { expiresIn: '8h' }
    );

    return res.json({
      success: true,
      message: 'Login realizado com sucesso',
      nome: usuario.nome,
      email: usuario.email,
      fctoken: token,
      empresa: usuario.empresa,
      idempresa: usuario.idempresa,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const logout = async (req, res) => {
  // Logout simples (sem blacklist de token)
  res.json({ success: true, message: 'Logout realizado com sucesso' });
};

// Obter todos os usuarios
const getUsuarios = async (req, res) => {
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
    `SELECT idusuario, nome, email, celular,
      empresa FROM usuarios ${whereClause}`

   const result = await request.query(query);

    res.json(result.recordset);    
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Obter um usuario pelo ID
const getUsuarioById = async (req, res) => {
  try {
    const { empresa, nome } = req.query;

    // Verifica se o parâmetro 'empresa' foi fornecido
    if (!empresa) {
      return res.status(400).json({ success: false, message: 'O parâmetro "empresa" é obrigatório.' });
    }
    
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('idsuario', req.params.idusuario)
      .query(
        `SELECT idusuario, nome, email, celular, 
          empresa FROM usuarios  WHERE idusuario = @idusuario ORDER BY nome`
      );

    //  .query('SELECT * FROM atividades  WHERE id = @id');
    if (result.recordset.length > 0) {
      res.json(result.recordset[0]);
    } else {
      res.status(404).send('Usuario não encontrado');
    }

  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Criar um novo usuario
const createUsuario = async (req, res) => {
  try {
    const {
      nome, empresa, email, senha, celular
    } = req.body;

    // ✅ Criptografar a senha antes de salvar
    const hashedSenha = await bcrypt.hash(senha, 10);

    const pool = await poolPromise;
    await pool
      .request()
      .input('nome', nome)
      .input('empresa', empresa)
      .input('email', email)
      .input('senha', hashedSenha)
      .input('celular', celular)
      .query(
        `INSERT INTO usuarios (
          nome, empresa, email, senha, celular
        ) VALUES (
          @nome, @empresa, @email, @senha, @celular
        )`
      );

    res.status(201).json({ success: true, message: 'Usuario criado com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Atualizar um usuario existente
const updateUsuario = async (req, res) => {
  try {
    const {
      nome, celular, senha
    } = req.body;
    // ✅ Criptografar a senha antes de salvar
    const hashedSenha = await bcrypt.hash(senha, 10);

    const pool = await poolPromise;
    if (!senha) {
      await pool
        .request()
        .input('idusuario', req.params.idusuario)
        .input('nome', nome)
        .input('celular', celular)
        .query(
          `UPDATE usuarios SET
            nome = @nome,
            celular = @celular
          WHERE idusuario = @idusuario`
        );
    }else{
      await pool
        .request()
        .input('idusuario', req.params.idusuario)
        .input('nome', nome)
        .input('senha', hashedSenha)
        .input('celular', celular)
        .query(
          `UPDATE usuarios SET
            nome = @nome,
            celular = @celular,
            senha = @senha
          WHERE idusuario = @idusuario`
        );
    }

    res.json({ success: true, message: 'Usuario atualizado com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Deletar um usuario
const deleteUsuario = async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input('idusuario', req.params.id)
      .query('DELETE FROM usuarios WHERE idusuario = @idusuario');
    res.json({ success: true, message: 'Usuario deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  login,
  logout,
  getUsuarios,
  getUsuarioById,
  createUsuario,
  updateUsuario,
  deleteUsuario,

};
