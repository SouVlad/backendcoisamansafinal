import { verifyToken, extractTokenFromHeader } from "../utils/jwt.js";

export function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = extractTokenFromHeader(authHeader);
  
  if (token) {
    const result = verifyToken(token);
    if (result.valid) {
      req.user = result.decoded;
    }
  }
  next();
}

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Token não fornecido." });
  }

  const token = extractTokenFromHeader(authHeader);
  if (!token) {
    return res.status(401).json({ error: "Formato de token inválido." });
  }

  const result = verifyToken(token);
  if (!result.valid) {
    return res.status(401).json({ error: result.error });
  }

  req.user = result.decoded;
  next();
}

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

    if (req.user.superAdmin) {
      return next();
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Sem permissão." });
    }

    next();
  };
}
