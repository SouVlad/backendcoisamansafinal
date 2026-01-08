import jwt from 'jsonwebtoken';
import prisma from '../prisma.js';
import { JWT_SECRET } from '../config/constants.js';

export function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer')) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      // Anexa o ID do usuário para uso posterior, se necessário
      req.user = { userId: decoded.userId, role: decoded.role, superAdmin: decoded.superAdmin };
    } catch (error) {
      // Ignora o erro, a rota é opcional
    }
  }
  next();
}

export const requireAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, email: true, role: true, superAdmin: true } // Não exponha a senha
      });

      if (!user) {
        return res.status(401).json({ message: 'Usuário não encontrado.' });
      }

      // Normalizar para usar userId consistentemente
      req.user = {
        userId: user.id,
        email: user.email,
        role: user.role,
        superAdmin: user.superAdmin
      };

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Token inválido ou expirado.' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Não autorizado, token não fornecido.' });
  }
};

export function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: "Não autenticado." });
  }

  if (req.user.superAdmin || req.user.role === "ADMIN") {
    return next();
  }

  return res.status(403).json({ error: "Sem permissão." });
}

export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Não autenticado." });
    }

    if (!roles.includes(req.user.role) && req.user.role !== 'ADMIN') { // Admin pode tudo
      return res.status(403).json({ error: "Sem permissão." });
    }

    next();
  };
}
