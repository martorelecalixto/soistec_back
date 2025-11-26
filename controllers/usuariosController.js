const { poolPromise } = require('../db');
const bcrypt = require('bcryptjs'); // ✅ Importar bcrypt

const getUsuarios = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM usuarios');
    res.json(result.recordset);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const getUsuarioById = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('idusuario', req.params.id)
      .query('SELECT * FROM usuarios WHERE idusuario = @idusuario');
    if (result.recordset.length > 0) {
      res.json(result.recordset[0]);
    } else {
      res.status(404).send('Usuário não encontrado');
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const createUsuario = async (req, res) => {
  console.log('Request Body:', req.body); // Log do corpo da requisição
  try {
    const { nome, email, senha, idvendedor } = req.body;

    // ✅ Criptografar a senha antes de salvar
    const hashedSenha = await bcrypt.hash(senha, 10);

    const pool = await poolPromise;
    await pool
      .request()
      .input('nome', nome)
      .input('email', email)
      .input('senha', hashedSenha)
      .input('idvendedor', idvendedor)
      .query('INSERT INTO usuarios (nome, email, senha, idvendedor) VALUES (@nome, @email, @senha, @idvendedor)');

      console.log('Usuário criado com sucesso'); // Log de sucesso
    res.status(201).json({ success: true, message: 'Usuário criado com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateUsuario = async (req, res) => {
  try {
    console.log('Request Body:', req.body); // Log do corpo da requisição
    const { nome, email, senha, idvendedor } = req.body;

    // ✅ Criptografar nova senha se fornecida
    const hashedSenha = await bcrypt.hash(senha, 10);

    const pool = await poolPromise;
    await pool
      .request()
      .input('idusuario', req.params.idusuario)
      .input('nome', nome)
      .input('email', email)
      .input('senha', hashedSenha)
      .input('idvendedor', idvendedor)
      .query('UPDATE usuarios SET nome = @nome, email = @email, senha = @senha, idvendedor = @idvendedor WHERE idusuario = @idusuario');
console.log('Usuário atualizado com sucesso'); // Log de sucesso
    res.json({ success: true, message: 'Usuário atualizado com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteUsuario = async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input('idusuario', req.params.idusuario)
      .query('DELETE FROM usuarios WHERE idusuario = @idusuario');
    res.json({ success: true, message: 'Usuário deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


module.exports = {
  getUsuarios,
  getUsuarioById,
  createUsuario,
  updateUsuario,
  deleteUsuario,
};
