const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { poolPromise } = require('../db');
const { sendEmail } = require('../utils/email');
const { Console } = require('console');

// Substitua por uma chave segura no seu ambiente
const SECRET_KEY = process.env.JWT_SECRET || 'minhaChaveSecreta';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "minhaChaveRefreshSecreta";

// Aqui vamos armazenar refresh tokens em memória (ideal é banco)
let refreshTokens = [];


//LOGIN
const login = async (req, res) => {
  const { email, senha } = req.body;

  try {
    const pool = await poolPromise;

    // 1️⃣ Busca o usuário ativo
    const userResult = await pool
      .request()
      .input("email", email)
      .query(`
        SELECT idusuario, nome, email, senha, empresa, idempresa, idvendedor
        FROM usuarios
        WHERE email = @email AND ativo = 1
      `);

    if (userResult.recordset.length === 0) {
      return res
        .status(401)
        .json({ success: false, message: "E-mail não encontrado ou usuário inativo." });
    }

    const usuario = userResult.recordset[0];

    // 2️⃣ Verifica senha
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
    if (!senhaCorreta) {
      return res.status(401).json({ success: false, message: "Senha incorreta" });
    }

    // 3️⃣ Busca grupos
    const gruposResult = await pool
      .request()
      .input("idusuario", usuario.idusuario)
      .query(`
        SELECT gp.idgrupopermissao AS idgrupo, gp.nome AS nome_grupo
        FROM usuariosgrupos ug
        INNER JOIN GruposPermissoes gp ON gp.idgrupopermissao = ug.idgrupopermissao
        WHERE ug.idusuario = @idusuario
      `);

    const grupos = gruposResult.recordset.map((g) => ({
      id: g.idgrupo,
      nome: g.nome_grupo,
    }));

    // 4️⃣ Busca permissões
    const permissoesResult = await pool
      .request()
      .input("idusuario", usuario.idusuario)
      .query(`
        SELECT DISTINCT r.nome AS recurso, p.permitido
        FROM usuariosgrupos ug
        INNER JOIN permissoes p ON p.idgrupopermissao = ug.idgrupopermissao
        INNER JOIN recursos r ON r.idrecurso = p.idrecurso
        WHERE ug.idusuario = @idusuario 
      `);
//console.log(usuario.idusuario);
//console.log('PERMISSOES RESULT::', permissoesResult.recordset);
    const permissoes = permissoesResult.recordset.map((p) => p.recurso);
//console.log('PERMISSOES::', permissoes);
    // 5️⃣ Payload do token
    const tokenPayload = {
      idusuario: usuario.idusuario,
      nome: usuario.nome,
      email: usuario.email,
      empresa: usuario.empresa,
      idempresa: usuario.idempresa,
      idvendedor: usuario.idvendedor,
      grupos,
      permissoes,
    };
    //console.log('TOKEN PAYLOAD::', tokenPayload);
    // 🔑 Access Token expira em 30 minutos
    const accessToken = jwt.sign(tokenPayload, SECRET_KEY, { expiresIn: "5m" });

    // 🔑 Refresh Token expira em 7 dias
    const refreshToken = jwt.sign(
      { idusuario: usuario.idusuario },
      REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    // Armazena o refresh token (ideal seria salvar no banco)
    refreshTokens.push(refreshToken);

    // 6️⃣ Retorno
    return res.json({
      success: true,
      message: "Login realizado com sucesso",
      nome: usuario.nome,
      email: usuario.email,
      empresa: usuario.empresa,
      idempresa: usuario.idempresa,
      idvendedor: usuario.idvendedor,
      grupos,
      permissoes,
      accessToken,
      refreshToken,
    });

  } catch (error) {
    console.error("Erro no login:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

//REFRESH TOKEN
const refresh = (req, res) => {
  const { token } = req.body;

  if (!token || !refreshTokens.includes(token)) {
    return res
      .status(403)
      .json({ success: false, message: "Refresh token inválido" });
  }

  try {
    const decoded = jwt.verify(token, REFRESH_SECRET);

    // cria novo access token com 30 minutos
    const newAccessToken = jwt.sign(
      { idusuario: decoded.idusuario },
      SECRET_KEY,
      { expiresIn: "5m" }
    );

    return res.json({
      success: true,
      accessToken: newAccessToken,
    });
  } catch (err) {
    return res
      .status(403)
      .json({ success: false, message: "Refresh token expirado" });
  }
};

//LOGOUT
const logout = (req, res) => {
  const { token } = req.body;
  refreshTokens = refreshTokens.filter((t) => t !== token);
  res.json({ success: true, message: "Logout realizado com sucesso" });
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
      case isnull(ativo,0) when 0 then 'Inativo' else 'ativo' end as situacao, empresa, idempresa, idvendedor FROM usuarios ${whereClause}`

    //  console.log(empresa);
   //   console.log(nome);
   const result = await request.query(query);
   //console.log(result.recordset);

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
        case isnull(ativo,0) when 0 then 'Inativo' else 'ativo' end as situacao, empresa, idempresa, idvendedor FROM usuarios  WHERE idusuario = @idusuario ORDER BY nome`
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
      nome, empresa, email, senha, celular, ativo, idvendedor, idempresa
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
      .input('idvendedor', idvendedor)
      .input('idempresa', idempresa)
      .query(
        `INSERT INTO usuarios (
          nome, empresa, email, senha, celular, ativo, idvendedor, idempresa
        ) VALUES (
          @nome, @empresa, @email, @senha, @celular, @ativo, @idvendedor, @idempresa
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
      nome, celular, ativo, idvendedor
    } = req.body;
    // ✅ Criptografar a senha antes de salvar
    //const hashedSenha = await bcrypt.hash(senha, 10);
    //console.log('ENTROU UPDATE:');

    const pool = await poolPromise;
    if (req.body.senha) {
      const hashedSenha = await bcrypt.hash(req.body.senha, 10);
      await pool
        .request()
        .input('idusuario', req.params.idusuario)
        .input('senha', hashedSenha)
        .input('nome', nome)
        .input('celular', celular)
        .input('ativo', ativo)
        .input('idvendedor', idvendedor)
        .query(
          `UPDATE usuarios SET
            senha = @senha,
            nome = @nome,
            celular = @celular,
            ativo = @ativo,
            idvendedor = @idvendedor
          WHERE idusuario = @idusuario`
        );
      } else {
        await pool
        .request()
        .input('idusuario', req.params.idusuario)
        .input('nome', nome)
        .input('celular', celular)
        .input('ativo', ativo)
        .input('idvendedor', idvendedor)
        .query(
          `UPDATE usuarios SET
            nome = @nome,
            celular = @celular,
            ativo = @ativo,
            idvendedor = @idvendedor
          WHERE idusuario = @idusuario`
        );
      }

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
  getEmail,
  refresh
};
