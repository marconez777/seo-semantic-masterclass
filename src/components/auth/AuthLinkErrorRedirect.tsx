import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { readAuthLinkError } from "@/lib/authLinkError";

// Ponto único de detecção do link de e-mail com erro (vencido ou já usado).
// O Supabase redireciona para o `emailRedirectTo` com o erro no hash, e a página
// de destino (a vitrine) não sabe ler isso. Aqui o erro vira um aviso em /auth.
export const AuthLinkErrorRedirect = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const linkError = readAuthLinkError(window.location.href);
    if (!linkError) return;
    const params = new URLSearchParams({ link: linkError.code, tipo: linkError.kind });
    navigate(`/auth?${params.toString()}`, { replace: true });
  }, [location.key, navigate]);

  return null;
};
