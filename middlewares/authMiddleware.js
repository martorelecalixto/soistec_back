// =========================
// middlewares/authMiddleware.js
// =========================

const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET || 'minhaChaveSecreta';

//const bcrypt = require('bcryptjs');
//const crypto = require('crypto');
//const jwt = require('jsonwebtoken');
const { poolPromise } = require('../db');
//const { sendEmail } = require('../utils/email');
//const { Console } = require('console');

// Middleware genérico para validar token e permissões
const authMiddleware = (recursoRequerido = null) => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        return res.status(401).json({ success: false, message: 'Token não fornecido.' });
      }

      const token = authHeader.replace('Bearer ', '');

      // 🔍 Valida o token
      const decoded = jwt.verify(token, SECRET_KEY);
      req.user = decoded; // agora req.user tem idusuario, grupos, permissoes etc.

      // 🔒 Se a rota exigir permissão específica, verifica
      if (recursoRequerido) {
        const permissoes = decoded.permissoes || [];
        const temPermissao = permissoes.includes(recursoRequerido);

        if (!temPermissao) {
          return res.status(403).json({
            success: false,
            message: `Acesso negado. Permissão '${recursoRequerido}' requerida.`,
          });
        }
      }

      // ✅ Tudo certo, segue pra rota
      next();
    } catch (error) {
      console.error('Erro no middleware de auth:', error);
      return res.status(401).json({ success: false, message: 'Token inválido ou expirado.' });
    }
  };
};

module.exports = authMiddleware;
