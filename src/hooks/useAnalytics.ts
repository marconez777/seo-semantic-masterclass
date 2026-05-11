import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { analytics } from "@/lib/analytics";
import { supabase } from "@/integrations/supabase/client";

/**
 * Inicializa o tracker e dispara pageview a cada mudança de rota.
 * Também identifica o usuário logado para amarrar à sessão.
 */
export function useAnalytics() {
  const location = useLocation();

  useEffect(() => {
    analytics.start();

    // Identifica usuário atual (se logado)
    supabase.auth.getSession().then(({ data }) => {
      analytics.identify(data.session?.user?.id ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      analytics.identify(session?.user?.id ?? null);
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    // Não rastrear rotas administrativas
    if (location.pathname.startsWith("/admin")) return;
    analytics.trackPageview(location.pathname + location.search);
  }, [location.pathname, location.search]);
}
