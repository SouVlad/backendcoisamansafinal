import {
  registerUser,
  loginUser,
  refreshAccessToken,
  updateUserProfile,
  getUserProfile,
} from "../services/auth.service.js";
import { validateRegister, validateLogin } from "../utils/validation.js";
import { verifyToken } from "../utils/jwt.js";

export async function register(req, res) {
  try {
    const { username, email, password } = req.body;

    const validation = validateRegister(username, email, password);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    const result = await registerUser(username, email, password);

    return res.status(201).json({
      message: "Utilizador registado com sucesso!",
      token: result.token,
      refreshToken: result.refreshToken,
      user: result.user,
    });
  } catch (err) {
    console.error("Erro no registro:", err);
    // It's better to check for specific error types, but for now,
    // we'll return a generic message for most errors.
    if (err.message.includes("já existe")) {
      return res.status(409).json({ error: err.message });
    }
    return res.status(500).json({ error: "Ocorreu um erro ao tentar registar o utilizador." });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    const validation = validateLogin(email, password);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    const result = await loginUser(email, password);

    return res.json({
      message: "Login bem sucedido!",
      token: result.token,
      refreshToken: result.refreshToken,
      user: result.user,
    });
  } catch (err) {
    console.error("Erro no login:", err);
    if (err.message === "Credenciais inválidas.") {
      return res.status(401).json({ error: err.message });
    }
    return res.status(500).json({ error: "Ocorreu um erro ao tentar fazer login." });
  }
}

export async function refresh(req, res) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: "Refresh token não fornecido." });
    }

    const result = await refreshAccessToken(refreshToken);
    return res.json({ token: result.token });
  } catch (err) {
    console.error("Erro ao renovar token:", err);
    if (err.message.includes("inválido") || err.message.includes("não encontrado")) {
      return res.status(401).json({ error: err.message });
    }
    return res.status(500).json({ error: "Ocorreu um erro ao renovar o token." });
  }
}

export async function verify(req, res) {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: "Token não fornecido." });
    }

    const verification = verifyToken(token);
    if (!verification.valid) {
      return res.status(401).json({ valid: false, error: verification.error });
    }

    const result = await getUserProfile(verification.decoded.userId);
    return res.json({ valid: true, user: result.user });
  } catch (err) {
    console.error("Erro ao verificar token:", err);
    if (err.message === "Utilizador não encontrado.") {
      return res.status(404).json({ valid: false, error: err.message });
    }
    return res.status(500).json({ valid: false, error: "Ocorreu um erro ao verificar o token." });
  }
}

export async function logout(req, res) {
  return res.json({ message: "Logout bem sucedido!" });
}

export async function getProfile(req, res) {
  try {
    const result = await getUserProfile(req.user.userId);
    return res.json(result);
  } catch (err) {
    console.error("Erro ao obter perfil:", err);
    if (err.message === "Utilizador não encontrado.") {
      return res.status(404).json({ error: err.message });
    }
    return res.status(500).json({ error: "Ocorreu um erro ao obter o perfil." });
  }
}

export async function updateProfile(req, res) {
  try {
    const result = await updateUserProfile(req.user.userId, req.body);
    return res.json({
      message: "Perfil atualizado com sucesso!",
      user: result.user,
    });
  } catch (err) {
    console.error("Erro ao atualizar perfil:", err);
    // Service layer has multiple validation messages that are safe to return
    if (err.message.includes("Password") || err.message.includes("Username") || err.message.includes("Email") || err.message.includes("atualizar")) {
        return res.status(400).json({ error: err.message });
    }
    return res.status(500).json({ error: "Ocorreu um erro ao atualizar o perfil." });
  }
}
