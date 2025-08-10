import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import SEOHead from "@/components/seo/SEOHead";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const Auth = () => {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  const redirectTo = useMemo(() => {
    const from = (location.state as any)?.from;
    if (typeof from === "string") return from;
    if (from && typeof from === "object" && typeof from.pathname === "string") {
      return from.pathname as string;
    }
    return "/painel";
  }, [location.state]);

  useEffect(() => {
    // Keep session in sync and redirect if already logged in
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (session?.user) {
        navigate(redirectTo, { replace: true });
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) navigate(redirectTo, { replace: true });
    });

    return () => subscription.unsubscribe();
  }, [navigate, redirectTo]);

  const handleSignup = async () => {
    setLoading(true);
    setError(null);
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { name, phone, cpf },
      },
    });
    setLoading(false);
    if (error) setError(error.message);
    // If email confirmation is enabled, user may need to check email
  };

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setError(error.message);
  };

  return (
    <>
      <SEOHead
        title="Entrar ou Cadastrar | MK Art SEO"
        description="Acesse sua conta para comprar backlinks com segurança. Cadastre-se com nome, telefone e CPF."
        canonicalUrl={`${window.location.origin}/auth`}
        keywords="login, cadastro, autenticação, backlinks"
      />
      <main className="min-h-screen flex items-center justify-center px-4 py-16">
        <article className="w-full max-w-md border rounded-lg p-6 bg-background shadow">
          <h1 className="text-2xl font-semibold mb-4">{mode === "login" ? "Entrar" : "Cadastrar"}</h1>

          <div className="flex gap-2 mb-6">
            <Button variant={mode === "login" ? "default" : "outline"} onClick={() => setMode("login")}>Já tenho conta</Button>
            <Button variant={mode === "signup" ? "default" : "outline"} onClick={() => setMode("signup")}>Sou novo por aqui</Button>
          </div>

          {mode === "signup" && (
            <div className="space-y-4 mb-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(11) 99999-9999" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cpf">CPF</Label>
                <Input id="cpf" value={cpf} onChange={(e) => setCpf(e.target.value)} placeholder="000.000.000-00" />
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@exemplo.com" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Sua senha" />
            </div>
          </div>

          {error && <p className="text-sm text-destructive mt-3">{error}</p>}

          <div className="mt-6">
            {mode === "login" ? (
              <Button className="w-full" onClick={handleLogin} disabled={loading}>
                {loading ? "Entrando..." : "Entrar"}
              </Button>
            ) : (
              <Button className="w-full" onClick={handleSignup} disabled={loading}>
                {loading ? "Cadastrando..." : "Cadastrar"}
              </Button>
            )}
          </div>
        </article>
      </main>
    </>
  );
};

export default Auth;
