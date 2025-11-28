import jwt from "jsonwebtoken";
import { JWT_SECRET, REFRESH_SECRET, JWT_EXPIRES_IN, REFRESH_EXPIRES_IN } from "../config/constants.js";

export function signToken(user) {
  return jwt.sign(
    { userId: user.id, role: user.role, superAdmin: user.superAdmin },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

export function signRefreshToken(user) {
  return jwt.sign(
    { userId: user.id },
    REFRESH_SECRET,
    { expiresIn: REFRESH_EXPIRES_IN }
  );
}

export function verifyToken(token) {
  try {
    return { valid: true, decoded: jwt.verify(token, JWT_SECRET) };
  } catch (err) {
    return { valid: false, error: "Token inválido ou expirado." };
  }
}

export function verifyRefreshToken(token) {
  try {
    return { valid: true, decoded: jwt.verify(token, REFRESH_SECRET) };
  } catch (err) {
    return { valid: false, error: "Refresh token inválido ou expirado." };
  }
}

export function extractTokenFromHeader(authHeader) {
  if (!authHeader) return null;
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") return null;
  return parts[1];
}
