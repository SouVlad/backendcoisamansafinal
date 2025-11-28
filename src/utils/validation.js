export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isStrongPassword(password) {
  return password.length >= 8;
}

export function validateRegister(username, email, password) {
  if (!username || !email || !password) {
    return { valid: false, error: "Todos os campos são obrigatórios." };
  }

  if (username.length < 3) {
    return { valid: false, error: "Username deve ter no mínimo 3 caracteres." };
  }

  if (!isValidEmail(email)) {
    return { valid: false, error: "Email inválido." };
  }

  if (!isStrongPassword(password)) {
    return { valid: false, error: "Password deve ter no mínimo 8 caracteres." };
  }

  return { valid: true };
}

export function validateLogin(email, password) {
  if (!email || !password) {
    return { valid: false, error: "Preenche o email e password." };
  }
  return { valid: true };
}
