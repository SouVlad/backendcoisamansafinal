import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../services/user.service.js";

export async function list(req, res) {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao listar utilizadores." });
  }
}

export async function getById(req, res) {
  try {
    const userId = parseInt(req.params.id);
    const user = await getUserById(userId);
    
    const isOwnAccount = req.user.userId === userId;
    const isAdmin = req.user.role === "ADMIN" || req.user.superAdmin;
    
    if (!isOwnAccount && !isAdmin) {
      return res.status(403).json({ error: "Sem permissão." });
    }
    
    if (user.superAdmin && req.user.userId !== userId) {
      return res.status(403).json({ error: "Não consegues ver informações de um SuperAdmin." });
    }
    
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(404).json({ error: err.message });
  }
}

export async function update(req, res) {
  try {
    const userId = parseInt(req.params.id);
    const { username, email, role, superAdmin } = req.body;
    
    const targetUser = await getUserById(userId);
    const isOwnAccount = req.user.userId === userId;
    const isAdmin = req.user.role === "ADMIN" || req.user.superAdmin;
    
    if (!isOwnAccount && !isAdmin) {
      return res.status(403).json({ error: "Sem permissão." });
    }
    
    if (targetUser.superAdmin) {
      return res.status(403).json({ error: "Não consegues modificar um SuperAdmin." });
    }
    
    if (!isOwnAccount && req.user.role === "ADMIN" && !req.user.superAdmin && targetUser.role === "ADMIN") {
      return res.status(403).json({ error: "Admins não conseguem modificar outros Admins." });
    }
    
    if (isOwnAccount && (role !== undefined || superAdmin !== undefined)) {
      return res.status(403).json({ error: "Não consegues alterar teu role ou superAdmin." });
    }
    
    const user = await updateUser(userId, { username, email, role, superAdmin });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao atualizar utilizador." });
  }
}

export async function delete_(req, res) {
  try {
    const userId = parseInt(req.params.id);
    const targetUser = await getUserById(userId);
    
    if (targetUser.superAdmin) {
      return res.status(403).json({ error: "Não consegues deletar um SuperAdmin." });
    }
    
    const isOwnAccount = req.user.userId === userId;
    const isSuperAdmin = req.user.superAdmin;
    const isAdmin = req.user.role === "ADMIN";
    
    if (isOwnAccount) {
      await deleteUser(userId);
      return res.json({ message: "Conta apagada com sucesso." });
    }
    
    if (isSuperAdmin) {
      await deleteUser(userId);
      return res.json({ message: "Utilizador apagado com sucesso." });
    }
    
    if (isAdmin && targetUser.role === "USER") {
      await deleteUser(userId);
      return res.json({ message: "Utilizador apagado com sucesso." });
    }
    
    return res.status(403).json({ error: "Sem permissão para deletar este utilizador." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao apagar utilizador." });
  }
}
