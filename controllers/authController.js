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

module.exports = {
  login,
  logout,
};
