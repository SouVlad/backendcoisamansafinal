import prisma from "../prisma.js";
import bcrypt from "bcryptjs";
import { signToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt.js";
import { isValidEmail, isStrongPassword } from "../utils/validation.js";

export async function registerUser(username, email, password) {
  const existingEmail = await prisma.user.findUnique({ where: { email } });
  if (existingEmail) {
    throw new Error("Email já existe.");
  }

  const existingUsername = await prisma.user.findUnique({ where: { username } });
  if (existingUsername) {
    throw new Error("Username já existe.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
    },
  });

  return {
    user: { id: user.id, username: user.username, email: user.email, role: user.role },
    token: signToken(user),
    refreshToken: signRefreshToken(user),
  };
}

export async function loginUser(email, password) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error("Credenciais inválidas.");
  }

  const passwordOK = await bcrypt.compare(password, user.password);
  if (!passwordOK) {
    throw new Error("Credenciais inválidas.");
  }

  return {
    user: { id: user.id, username: user.username, email: user.email, role: user.role },
    token: signToken(user),
    refreshToken: signRefreshToken(user),
  };
}

export async function refreshAccessToken(refreshToken) {
  const result = verifyRefreshToken(refreshToken);
  if (!result.valid) {
    throw new Error(result.error);
  }

  const user = await prisma.user.findUnique({ where: { id: result.decoded.userId } });
  if (!user) {
    throw new Error("Utilizador não encontrado.");
  }

  return {
    token: signToken(user),
  };
}

export async function updateUserProfile(userId, { username, email, currentPassword, newPassword }) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error("Utilizador não encontrado.");
  }

  const updateData = {};

  if (username) {
    if (username.length < 3) {
      throw new Error("Username deve ter no mínimo 3 caracteres.");
    }
    const existingUsername = await prisma.user.findUnique({ where: { username } });
    if (existingUsername && existingUsername.id !== userId) {
      throw new Error("Username já existe.");
    }
    updateData.username = username;
  }

  if (email) {
    if (!isValidEmail(email)) {
      throw new Error("Email inválido.");
    }
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail && existingEmail.id !== userId) {
      throw new Error("Email já existe.");
    }
    updateData.email = email;
  }

  if (newPassword) {
    if (!currentPassword) {
      throw new Error("Password atual é obrigatória para mudar password.");
    }

    const passwordOK = await bcrypt.compare(currentPassword, user.password);
    if (!passwordOK) {
      throw new Error("Password atual inválida.");
    }

    if (!isStrongPassword(newPassword)) {
      throw new Error("Nova password deve ter no mínimo 8 caracteres.");
    }

    updateData.password = await bcrypt.hash(newPassword, 10);
  }

  if (Object.keys(updateData).length === 0) {
    throw new Error("Nenhum campo para atualizar.");
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
  });

  return {
    user: { id: updatedUser.id, username: updatedUser.username, email: updatedUser.email, role: updatedUser.role },
  };
}

export async function getUserProfile(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, username: true, email: true, role: true, superAdmin: true, createdAt: true },
  });

  if (!user) {
    throw new Error("Utilizador não encontrado.");
  }

  return { user };
}
