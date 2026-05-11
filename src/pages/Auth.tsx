import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import SEOHead from "@/components/seo/SEOHead";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/Header";
import { CheckCircle, Mail, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Auth = () => {
  const [mode, setMode] = useState<"login" | "signup" | "forgot-password">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [site, setSite] = useState("");
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
    // Validação obrigatória
    if (!name.trim()) {
      setError("Nome é obrigatório");
      return;
    }
    if (!phone.trim()) {
      setError("WhatsApp é obrigatório para receber o PIX");
      return;
    }
    if (!email.trim()) {
      setError("E-mail é obrigatório");
      return;
    }
    if (password.length < 6) {
      setError("Senha deve ter no mínimo 6 caracteres");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    // Capture origin page (where user came from before /auth)
    let signup_source = "direct";
    try {
      const stored = sessionStorage.getItem("mk_signup_source");
      if (stored) {
        signup_source = stored;
      } else if (document.referrer) {
        const ref = new URL(document.referrer);
        if (ref.origin === window.location.origin) {
          signup_source = ref.pathname || "/";
        } else {
          signup_source = ref.hostname;
        }
      }
    } catch {}

    const redirectUrl = `${window.location.origin}/comprar-backlinks`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { name, phone, site, signup_source },
      },
    });
    
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSuccess("Cadastro realizado com sucesso! Verifique seu e-mail para ativar sua conta.");
      toast({
        title: "Cadastro realizado!",
        description: "Verifique seu e-mail para ativar sua conta.",
      });

      // Notify admin about new customer
      try {
        await supabase.functions.invoke("notify-admin", {
          body: {
            type: "new_customer",
            data: { name: name.trim(), email: email.trim(), phone: phone.trim(), site: site.trim() },
          },
        });
      } catch (notifyErr) {
        console.error("Erro ao notificar admin:", notifyErr);
      }
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    
    if (error) {
      setError(error.message);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Por favor, digite seu e-mail primeiro.");
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth?mode=reset-password`,
    });
    
    setLoading(false);
    
    if (error) {
      setError(error.message);
    } else {
      setResetEmailSent(true);
      setSuccess("E-mail de recuperação enviado! Verifique sua caixa de entrada.");
      toast({
        title: "E-mail enviado!",
        description: "Verifique sua caixa de entrada para redefinir sua senha.",
      });
    }
  };

  return (
    <>
      <SEOHead
        title="Entrar ou Cadastrar | MK Art SEO"
        description="Acesse sua conta para comprar backlinks com segurança. Cadastre-se com nome, telefone e CPF."
        canonicalUrl="https://mkart.com.br/auth"
        keywords="login, cadastro, autenticação, backlinks"
        noindex={true}
      />
      <Header />
      <main className="min-h-screen flex items-center justify-center px-4 py-16">
        <article className="w-full max-w-md border rounded-lg p-6 bg-background shadow">
          <Link to="/comprar-backlinks" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
            <ArrowLeft size={16} />
            Voltar para Comprar Backlinks
          </Link>
          <h1 className="text-2xl font-semibold mb-4">
            {mode === "login" ? "Entrar" : mode === "signup" ? "Cadastrar" : "Recuperar Senha"}
          </h1>

        {mode !== "forgot-password" && (
            <div className="flex gap-2 mb-6">
              <Button variant={mode === "login" ? "default" : "outline"} onClick={() => { setMode("login"); setSuccess(null); setError(null); }}>Já tenho conta</Button>
              <Button variant={mode === "signup" ? "default" : "outline"} onClick={() => { setMode("signup"); setSuccess(null); setError(null); }}>Sou novo por aqui</Button>
            </div>
          )}

          {mode === "forgot-password" && (
            <div className="mb-6">
              <Button variant="outline" onClick={() => setMode("login")} className="text-sm">
                ← Voltar para login
              </Button>
            </div>
          )}

          {success && (
            <Alert className="mb-4 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          {resetEmailSent && (
            <Alert className="mb-4 border-blue-200 bg-blue-50">
              <Mail className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                Se este e-mail estiver cadastrado, você receberá as instruções para redefinir sua senha.
              </AlertDescription>
            </Alert>
          )}

          {mode === "signup" && !success && (
            <div className="space-y-4 mb-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">WhatsApp *</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(11) 99999-9999" required />
                <span className="text-xs text-muted-foreground">Necessário para envio do PIX</span>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="site">Site</Label>
                <Input id="site" type="url" value={site} onChange={(e) => setSite(e.target.value)} placeholder="https://seusite.com.br" />
              </div>
            </div>
          )}

          {!success && (
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@exemplo.com" />
              </div>
              {mode !== "forgot-password" && (
                <div className="grid gap-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Sua senha" />
                </div>
              )}
            </div>
          )}

          {error && <p className="text-sm text-destructive mt-3">{error}</p>}

          {!success && !resetEmailSent && (
            <div className="mt-6 space-y-3">
              {mode === "login" && (
                <>
                  <Button className="w-full" onClick={handleLogin} disabled={loading}>
                    {loading ? "Entrando..." : "Entrar"}
                  </Button>
                  <button
                    type="button"
                    onClick={() => setMode("forgot-password")}
                    className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Esqueci minha senha
                  </button>
                </>
              )}
              
              {mode === "signup" && (
                <Button className="w-full" onClick={handleSignup} disabled={loading}>
                  {loading ? "Cadastrando..." : "Cadastrar"}
                </Button>
              )}
              
              {mode === "forgot-password" && (
                <Button className="w-full" onClick={handleForgotPassword} disabled={loading}>
                  {loading ? "Enviando..." : "Enviar link de recuperação"}
                </Button>
              )}
            </div>
          )}
        </article>
      </main>
    </>
  );
};

export default Auth;
