import prisma from "../prisma.js";

export async function getAllUsers() {
  return await prisma.user.findMany({
    where: {
      superAdmin: false,
    },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      superAdmin: true,
      createdAt: true,
    },
  });
}

export async function getUserById(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      superAdmin: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new Error("Utilizador não encontrado.");
  }

  return user;
}

export async function updateUser(userId, { username, email, role, superAdmin }) {
  const updateData = {};

  if (username !== undefined) updateData.username = username;
  if (email !== undefined) updateData.email = email;
  if (role !== undefined) updateData.role = role;
  if (superAdmin !== undefined) updateData.superAdmin = superAdmin;

  const user = await prisma.user.update({
    where: { id: userId },
    data: updateData,
  });

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    superAdmin: user.superAdmin,
    createdAt: user.createdAt,
  };
}

export async function deleteUser(userId) {
  await prisma.user.delete({ where: { id: userId } });
}
