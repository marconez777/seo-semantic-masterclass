// Erro que o Supabase Auth devolve na URL quando o link do e-mail (confirmação
// de cadastro ou recuperação de senha) venceu ou já foi usado. Vem no hash
// (`#error=access_denied&error_code=otp_expired&error_description=...`) e, em
// alguns fluxos, na query. O auth-js não limpa a URL nesse caso.

export type AuthLinkKind = "confirmacao" | "recuperacao";

export interface AuthLinkError {
  code: string;
  kind: AuthLinkKind;
}

export function readAuthLinkError(href: string): AuthLinkError | null {
  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return null;
  }
  const hash = new URLSearchParams(url.hash.replace(/^#/, ""));
  const params = hash.has("error_code") || hash.has("error_description") ? hash : url.searchParams;
  if (!params.has("error_code") && !params.has("error_description")) return null;

  const code = params.get("error_code") || params.get("error") || "unknown";
  const kind: AuthLinkKind = url.searchParams.get("mode") === "reset-password" ? "recuperacao" : "confirmacao";
  return { code, kind };
}

export function authLinkErrorMessage({ code, kind }: AuthLinkError): string {
  if (kind === "recuperacao") {
    return code === "otp_expired"
      ? "Este link de recuperação de senha venceu ou já foi usado. Peça um novo abaixo."
      : "Não conseguimos validar o link de recuperação de senha. Peça um novo abaixo.";
  }
  return code === "otp_expired"
    ? "Este link de confirmação venceu ou já foi usado. Alguns antivírus e o Outlook abrem o link antes de você: se foi isso, sua conta pode já estar confirmada e basta entrar com sua senha. Se não conseguir entrar, reenvie a confirmação abaixo."
    : "Não conseguimos confirmar seu cadastro por este link. Tente entrar com sua senha ou reenvie a confirmação abaixo.";
}
