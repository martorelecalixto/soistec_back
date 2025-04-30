const { poolPromise } = require('../db');

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
  try {
    const { nome, email, senha } = req.body;
    const pool = await poolPromise;
    await pool
      .request()
      .input('nome', nome)
      .input('email', email)
      .input('senha', senha)
      .query('INSERT INTO usuarios (nome, email, senha) VALUES (@nome, @email, @senha)');
    res.status(201).send('Usuário criado');
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const updateUsuario = async (req, res) => {
  try {
    const { nome, email, senha } = req.body;
    const pool = await poolPromise;
    await pool
      .request()
      .input('idusuario', req.params.idusuario)
      .input('nome', nome)
      .input('email', email)
      .input('senha', senha)
      .query('UPDATE usuarios SET nome = @nome, email = @email, senha = @senha WHERE idusuario = @idusuario');
    res.send('Usuário atualizado');
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const deleteUsuario = async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input('idusuario', req.params.idusuario)
      .query('DELETE FROM usuarios WHERE idusuario = @idusuario');
    res.send('Usuário deletado');
  } catch (error) {
    res.status(500).send(error.message);
  }
};

module.exports = {
  getUsuarios,
  getUsuarioById,
  createUsuario,
  updateUsuario,
  deleteUsuario,
};
