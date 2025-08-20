import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Session } from "@supabase/supabase-js";

type AuthCtx = {
  session: Session | null;
  profile: { id: string; role: "admin" | "user" } | null;
  loading: boolean;
};
const AuthContext = createContext<AuthCtx>({ session: null, profile: null, loading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<AuthCtx["profile"]>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(data.session ?? null);
      if (data.session) await loadProfile(data.session.user.id);
      setLoading(false);
    }
    bootstrap();

    // Listener de auth (login/logout/refresh)
    const { data: sub } = supabase.auth.onAuthStateChange(async (event, sess) => {
      setSession(sess ?? null);
      setProfile(null); // zera perfil para evitar “fantasma” de outra conta
      if (sess?.user) {
        await loadProfile(sess.user.id);
        // se acabou de logar, empurra para painel adequado
        // (admin → /admin, user → /painel)
        if (event === "SIGNED_IN") {
          if ((await isAdmin(sess.user.id))) navigate("/admin", { replace: true });
          else navigate("/painel", { replace: true });
        }
      } else {
        // saiu → manda para /auth
        navigate("/auth", { replace: true });
      }
    });

    // Multi-aba: se sair numa aba, as outras sentem
    const onStorage = (e: StorageEvent) => {
      if (e.key?.includes("sb-") && e.key?.includes("-auth-token")) {
        supabase.auth.getSession().then(({ data }) => {
          setSession(data.session ?? null);
          if (!data.session) navigate("/auth", { replace: true });
        });
      }
    };
    window.addEventListener("storage", onStorage);

    async function loadProfile(userId: string) {
      // NÃO cachear entre usuários; query “fria”
      const { data, error } = await supabase
        .from("profiles")
        .select("id, role")
        .eq("id", userId)
        .single();
      if (!error) setProfile(data as { id: string; role: "admin" | "user" });
    }

    async function isAdmin(userId: string) {
      const { data } = await supabase.rpc("is_admin", { uid: userId });
      return Boolean(data);
    }

    return () => {
      mounted = false;
      sub?.subscription.unsubscribe();
      window.removeEventListener("storage", onStorage);
    };
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ session, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
