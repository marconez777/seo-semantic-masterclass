import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import SEOHead from "@/components/seo/SEOHead";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/Header";
import { CheckCircle, Mail, ArrowLeft, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { authLinkErrorMessage, type AuthLinkKind } from "@/lib/authLinkError";

type AuthMode = "login" | "signup" | "forgot-password" | "resend-confirmation";

// O GoTrue limita um e-mail por usuário a cada 60 s (SMTP_MAX_FREQUENCY).
const RESEND_COOLDOWN_SECONDS = 60;

const confirmationRedirectUrl = () => `${window.location.origin}/comprar-backlinks`;

const Auth = () => {
  const [searchParams] = useSearchParams();
  const linkErrorCode = searchParams.get("link");
  const linkErrorKind: AuthLinkKind = searchParams.get("tipo") === "recuperacao" ? "recuperacao" : "confirmacao";
  const linkErrorText = linkErrorCode ? authLinkErrorMessage({ code: linkErrorCode, kind: linkErrorKind }) : null;

  const linkErrorMode: AuthMode | null = linkErrorCode
    ? linkErrorKind === "recuperacao" ? "forgot-password" : "resend-confirmation"
    : null;
  const [mode, setMode] = useState<AuthMode>(linkErrorMode ?? "login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [emailTaken, setEmailTaken] = useState(false);
  const [notConfirmed, setNotConfirmed] = useState(false);
  const [resendInfo, setResendInfo] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
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
    // Persist origin page (priority: navigation state > document.referrer)
    try {
      const fromState = (location.state as any)?.from;
      const fromPath =
        typeof fromState === "string"
          ? fromState
          : fromState?.pathname ?? null;
      if (fromPath && fromPath !== "/auth") {
        sessionStorage.setItem("mk_signup_source", fromPath);
      } else if (!sessionStorage.getItem("mk_signup_source") && document.referrer) {
        const ref = new URL(document.referrer);
        if (ref.origin === window.location.origin && ref.pathname !== "/auth") {
          sessionStorage.setItem("mk_signup_source", ref.pathname);
        }
      }
    } catch {}

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (session?.user) {
        navigate(redirectTo, { replace: true });
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) navigate(redirectTo, { replace: true });
    });

    return () => subscription.unsubscribe();
  }, [navigate, redirectTo, location.state]);

  // O link de recuperação volta para a própria /auth: sem remontar, o estado
  // inicial não se aplica de novo.
  useEffect(() => {
    if (linkErrorMode) setMode(linkErrorMode);
  }, [linkErrorMode]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const switchMode = (next: AuthMode) => {
    setMode(next);
    setSuccess(null);
    setError(null);
    setEmailTaken(false);
    setNotConfirmed(false);
    setResendInfo(null);
  };

  const handleResendConfirmation = async () => {
    if (!email.trim()) {
      setError("Digite o e-mail que você usou no cadastro.");
      return;
    }

    setResending(true);
    setError(null);
    setResendInfo(null);

    const { error } = await supabase.auth.resend({
      type: "signup",
      email: email.trim(),
      options: { emailRedirectTo: confirmationRedirectUrl() },
    });

    setResending(false);
    setResendCooldown(RESEND_COOLDOWN_SECONDS);

    if (error) {
      const rateLimited = error.status === 429 || error.code === "over_email_send_rate_limit";
      setError(
        rateLimited
          ? "Você pediu outro e-mail há pouco. Aguarde um minuto e tente de novo."
          : "Não foi possível reenviar agora. Tente de novo em instantes.",
      );
      return;
    }

    // O GoTrue responde 200 também quando o e-mail não existe ou já está confirmado.
    setResendInfo(
      "Se houver um cadastro esperando confirmação com este e-mail, enviamos um novo link. Confira também a caixa de spam. Se a conta já estiver confirmada, é só entrar com sua senha.",
    );
    toast({
      title: "E-mail de confirmação reenviado",
      description: "Use o link mais recente: os anteriores deixam de valer.",
    });
  };

  const resendButton = (variant: "default" | "outline") => (
    <Button
      type="button"
      variant={variant}
      className="w-full"
      onClick={handleResendConfirmation}
      disabled={resending || resendCooldown > 0}
    >
      {resending
        ? "Reenviando..."
        : resendCooldown > 0
          ? `Reenviar confirmação em ${resendCooldown}s`
          : "Reenviar e-mail de confirmação"}
    </Button>
  );

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
    setEmailTaken(false);

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

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: confirmationRedirectUrl(),
        data: { name, phone, site, signup_source },
      },
    });

    setLoading(false);
    if (error) {
      setError(error.message);
    } else if (data.user && data.user.identities?.length === 0) {
      // E-mail já cadastrado e confirmado: o GoTrue devolve "sucesso" com
      // identities vazio para não revelar a conta, e nenhum e-mail sai.
      setEmailTaken(true);
      setError("Este e-mail já tem cadastro. Entre com sua senha ou recupere a senha.");
    } else {
      setSuccess("Cadastro realizado com sucesso! Verifique seu e-mail para ativar sua conta.");
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      try {
        const { analytics } = await import("@/lib/analytics");
        analytics.track("signup_completed", { label: signup_source || "direct", data: { email } });
      } catch {}
      toast({
        title: "Cadastro realizado!",
        description: "Verifique seu e-mail para ativar sua conta.",
      });

      // Notify admin about new customer
      try {
        await supabase.functions.invoke("notify-admin", {
          body: {
            type: "new_customer",
            data: { name: name.trim(), email: email.trim(), phone: phone.trim(), site: site.trim(), signup_source },
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
    setNotConfirmed(false);
    setResendInfo(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      if (error.code === "email_not_confirmed") {
        setNotConfirmed(true);
        setError("Seu e-mail ainda não foi confirmado. Clique no link que enviamos ou peça um novo abaixo.");
      } else if (error.code === "invalid_credentials") {
        setError("E-mail ou senha incorretos.");
      } else {
        setError(error.message);
      }
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
            {mode === "login"
              ? "Entrar"
              : mode === "signup"
                ? "Cadastrar"
                : mode === "resend-confirmation"
                  ? "Confirmar cadastro"
                  : "Recuperar Senha"}
          </h1>

          {linkErrorText && (
            <Alert className="mb-4 border-warning/50 bg-warning/10">
              <AlertTriangle className="h-4 w-4 !text-warning" />
              <AlertDescription>{linkErrorText}</AlertDescription>
            </Alert>
          )}

          {(mode === "login" || mode === "signup") && (
            <div className="flex gap-2 mb-6">
              <Button variant={mode === "login" ? "default" : "outline"} onClick={() => switchMode("login")}>Já tenho conta</Button>
              <Button variant={mode === "signup" ? "default" : "outline"} onClick={() => switchMode("signup")}>Sou novo por aqui</Button>
            </div>
          )}

          {(mode === "forgot-password" || mode === "resend-confirmation") && (
            <div className="mb-6">
              <Button variant="outline" onClick={() => switchMode("login")} className="text-sm">
                ← Voltar para login
              </Button>
            </div>
          )}

          {success && (
            <Alert className="mb-4 border-secondary/40 bg-secondary/10">
              <CheckCircle className="h-4 w-4 !text-secondary" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {success && mode === "signup" && (
            <div className="space-y-2 mb-4">
              <p className="text-sm text-muted-foreground">
                Não chegou em alguns minutos? Confira o spam ou peça outro e-mail.
              </p>
              {resendButton("outline")}
            </div>
          )}

          {resetEmailSent && (
            <Alert className="mb-4 border-primary/30 bg-primary/5">
              <Mail className="h-4 w-4 !text-primary" />
              <AlertDescription>
                Se este e-mail estiver cadastrado, você receberá as instruções para redefinir sua senha.
              </AlertDescription>
            </Alert>
          )}

          {resendInfo && (
            <Alert className="mb-4 border-primary/30 bg-primary/5">
              <Mail className="h-4 w-4 !text-primary" />
              <AlertDescription>{resendInfo}</AlertDescription>
            </Alert>
          )}

          {mode === "resend-confirmation" && !linkErrorText && (
            <p className="text-sm text-muted-foreground mb-4">
              Digite o e-mail do cadastro e enviamos um novo link de confirmação.
            </p>
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
              {(mode === "login" || mode === "signup") && (
                <div className="grid gap-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Sua senha" />
                </div>
              )}
            </div>
          )}

          {error && <p className="text-sm text-destructive mt-3">{error}</p>}

          {mode === "signup" && emailTaken && (
            <div className="mt-3 flex gap-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => switchMode("login")}>
                Entrar
              </Button>
              <Button type="button" variant="outline" className="flex-1" onClick={() => switchMode("forgot-password")}>
                Recuperar senha
              </Button>
            </div>
          )}

          {mode === "login" && notConfirmed && <div className="mt-3">{resendButton("outline")}</div>}

          {!success && !resetEmailSent && (
            <div className="mt-6 space-y-3">
              {mode === "login" && (
                <>
                  <Button className="w-full" onClick={handleLogin} disabled={loading}>
                    {loading ? "Entrando..." : "Entrar"}
                  </Button>
                  <button
                    type="button"
                    onClick={() => switchMode("forgot-password")}
                    className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Esqueci minha senha
                  </button>
                  <button
                    type="button"
                    onClick={() => switchMode("resend-confirmation")}
                    className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Não recebi o e-mail de confirmação
                  </button>
                </>
              )}

              {mode === "signup" && (
                <Button className="w-full" onClick={handleSignup} disabled={loading}>
                  {loading ? "Cadastrando..." : "Cadastrar"}
                </Button>
              )}

              {mode === "resend-confirmation" && resendButton("default")}
              
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
