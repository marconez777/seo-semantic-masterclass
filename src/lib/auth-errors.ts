export const getFriendlyAuthError = (message: string): string => {
  if (message.includes("Invalid login credentials")) {
    return "E-mail ou senha inválidos.";
  }
  if (message.includes("User already registered")) {
    return "Este e-mail já está cadastrado.";
  }
  if (message.includes("Password should be at least 6 characters")) {
    return "A senha deve ter pelo menos 6 caracteres.";
  }
  if (message.includes("Unable to validate email address: invalid format")) {
    return "O formato do e-mail é inválido.";
  }
  return "Ocorreu um erro. Tente novamente mais tarde.";
};
