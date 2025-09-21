const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { poolPromise } = require('../db');
const { sendEmail } = require('../utils/email');
const { Console } = require('console');

// Substitua por uma chave segura no seu ambiente
const SECRET_KEY = process.env.JWT_SECRET || 'minhaChaveSecreta';

const login = async (req, res) => {
  const { email, senha } = req.body;

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('email', email)
      .query('SELECT * FROM usuarios WHERE email = @email AND ativo = 1');

    if (result.recordset.length === 0) {
      return res.status(401).json({ success: false, message: 'E-mail não encontrado ou usuario não ativo.' });
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
    `SELECT idusuario, nome, email, celular, isnull(ativo,0) as ativo,
      case isnull(ativo,0) when 0 then 'Inativo' else 'ativo' end as situacao, empresa FROM usuarios ${whereClause}`

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
        `SELECT idusuario, nome, email, celular, isnull(ativo,0) as ativo,
        case isnull(ativo,0) when 0 then 'Inativo' else 'ativo' end as situacao, empresa FROM usuarios  WHERE idusuario = @idusuario ORDER BY nome`
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
      nome, empresa, email, senha, celular, ativo
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
      .input('ativo', ativo)
      .query(
        `INSERT INTO usuarios (
          nome, empresa, email, senha, celular, ativo
        ) VALUES (
          @nome, @empresa, @email, @senha, @celular, @ativo
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
      nome, celular, ativo
    } = req.body;
    // ✅ Criptografar a senha antes de salvar
    //const hashedSenha = await bcrypt.hash(senha, 10);
    //console.log('ENTROU UPDATE:');

    const pool = await poolPromise;
      await pool
        .request()
        .input('idusuario', req.params.idusuario)
        .input('nome', nome)
        .input('celular', celular)
        .input('ativo', ativo)
        .query(
          `UPDATE usuarios SET
            nome = @nome,
            celular = @celular,
            ativo = @ativo
          WHERE idusuario = @idusuario`
        );

    res.json({ success: true, message: 'Usuario atualizado com sucesso' });
     //   Console.log('SAIU UPDATE:');

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

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ success: false, message: 'E-mail é obrigatório' });
    }

    const pool = await poolPromise;

    const result = await pool
      .request()
      .input('email', email)
      .query('SELECT idusuario, nome, email FROM usuarios WHERE email = @email');

    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
    }

    const usuario = result.recordset[0];
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 15); // 15 min

    await pool
      .request()
      .input('UserId', usuario.idusuario)
      .input('Token', token)
      .input('ExpiresAt', expiresAt)
      .query(`
        INSERT INTO PasswordResetTokens (UserId, Token, ExpiresAt)
        VALUES (@UserId, @Token, @ExpiresAt)
      `);

    // 🔗 Link real para o front-end resetar a senha
    //const resetLink = `http://localhost:5000/reset-password?token=${token}`;
    ///UTILIZADO ATÉ 15/09/2025 const resetLink = `http://localhost:5000/auth/reset-password?token=${token}`;

    //Pega a URL base do .env
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5000";
    const resetLink = `${frontendUrl}/auth/reset-password?token=${token}`;
    

    // Envia o e-mail
    await sendEmail(
      usuario.email,
      "Redefinição de Senha - Sistrade",
      `
        <h2>Olá, ${usuario.nome}</h2>
        <p>Você solicitou a redefinição da sua senha.</p>
        <p>Clique no link abaixo para definir uma nova senha. Este link expira em 15 minutos:</p>
        <a href="${resetLink}" target="_blank">${resetLink}</a>
        <br><br>
        <p>Se você não fez esta solicitação, ignore este e-mail.</p>
      `
    );

    return res.json({
      success: true,
      message: 'Se este e-mail estiver cadastrado, enviamos um link para redefinir sua senha.',
    });
  } catch (error) {
    console.error('Erro em forgotPassword:', error);
    return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
};

// POST /auth/reset-password
// body: { token: string, newPassword: string }
const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    if (!token || !newPassword) {
      return res.status(400).json({ success: false, message: 'Token e nova senha são obrigatórios.' });
    }

    // validação básica da senha (ajuste como quiser)
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'A senha deve ter pelo menos 6 caracteres.' });
    }

    const pool = await poolPromise;

    // Busca token na tabela auxiliar
    const tokenResult = await pool
      .request()
      .input('Token', token)
      .query(`
        SELECT TOP 1 Id, UserId, Token, ExpiresAt
        FROM PasswordResetTokens
        WHERE Token = @Token
        ORDER BY Id DESC
      `);

    if (tokenResult.recordset.length === 0) {
      return res.status(400).json({ success: false, message: 'Token inválido.' });
    }

    const record = tokenResult.recordset[0];

    // Verifica expiração
    const now = new Date();
    if (new Date(record.ExpiresAt) < now) {
      // opcional: já apagar token expirado
      await pool.request().input('Id', record.Id).query(`DELETE FROM PasswordResetTokens WHERE Id = @Id`);
      return res.status(400).json({ success: false, message: 'Token expirado. Solicite novamente.' });
    }

    // Hash da nova senha
    const hash = await bcrypt.hash(newPassword, 10);

    // Atualiza senha do usuário
    await pool
      .request()
      .input('IdUsuario', record.UserId)
      .input('Senha', hash)
      .query(`
        UPDATE usuarios
        SET senha = @Senha
        WHERE idusuario = @IdUsuario
      `);

    // Invalida o token (apaga o usado)
    await pool
      .request()
      .input('Id', record.Id)
      .query(`DELETE FROM PasswordResetTokens WHERE Id = @Id`);

    return res.json({
      success: true,
      message: 'Senha redefinida com sucesso. Faça login novamente.'
    });
  } catch (error) {
    console.error('Erro em resetPassword:', error);
    return res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
  }
};

// Obter email existente
const getEmail = async (req, res) => {
  try {
    const { empresa, email } = req.query;

    // Verifica parâmetros obrigatórios
    if (!empresa || !empresa.trim()) {
      return res.status(400).json({ success: false, message: 'O parâmetro "empresa" é obrigatório.' });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'O parâmetro "email" é obrigatório.' });
    }

    const pool = await poolPromise;
    const request = pool.request();

    request.input('empresa', empresa.trim());
    request.input('email', email.trim());

    const query = `
      SELECT email 
      FROM usuarios 
      WHERE empresa = @empresa 
        AND email = @email
    `;

    const result = await request.query(query);

    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Email não encontrado.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Email encontrado.',
      email: result.recordset[0].email
    });

  } catch (error) {
    console.error('Erro no getEmail:', error);
    return res.status(500).json({ success: false, message: 'Erro interno no servidor.', error: error.message });
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
  forgotPassword,
  resetPassword,
  getEmail
};
