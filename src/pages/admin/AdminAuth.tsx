import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import SEOHead from "@/components/seo/SEOHead";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { ShieldCheck, AlertTriangle } from "lucide-react";

const AdminAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  // Helper: check admin role using RPC (SECURITY DEFINER - bypasses RLS)
  const checkAdminRole = useCallback(async (userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('has_role', {
        _user_id: userId,
        _role: 'admin'
      });
      
      if (error) {
        console.error('Error checking admin role:', error.message);
        return false;
      }
      
      return !!data;
    } catch (err) {
      console.error('Unexpected error checking admin role');
      return false;
    }
  }, []);

  // Redirect to admin if user is already logged in and is admin
  const redirectIfAdmin = useCallback(async (userId: string) => {
    const isAdmin = await checkAdminRole(userId);
    if (isAdmin) {
      navigate('/admin', { replace: true });
    }
  }, [checkAdminRole, navigate]);

  useEffect(() => {
    // Check current session on mount
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        // Defer async work outside the callback
        setTimeout(() => redirectIfAdmin(data.session!.user.id), 0);
      }
    });

    // Listen for auth state changes - SYNC callback only!
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (session?.user) {
        // Defer async work to avoid SDK deadlock
        setTimeout(() => redirectIfAdmin(session.user.id), 0);
      }
    });

    return () => subscription.unsubscribe();
  }, [redirectIfAdmin]);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (authError) {
        setError(authError.message);
        return;
      }

      if (data.user) {
        // Check if user is admin using RPC
        const isAdmin = await checkAdminRole(data.user.id);

        if (isAdmin) {
          toast({
            title: "Login realizado!",
            description: "Bem-vindo ao painel administrativo.",
          });
          navigate('/admin', { replace: true });
        } else {
          setError('Acesso negado. Você não tem permissão de administrador.');
          await supabase.auth.signOut();
        }
      }
    } catch (err) {
      setError('Erro inesperado ao fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEOHead
        title="Login Admin | MK Art SEO"
        description="Acesso administrativo ao painel de controlo do MK Art SEO"
        canonicalUrl="https://mkart.com.br/admin/login"
        keywords="admin, login, painel administrativo"
        noindex={true}
      />
      <main className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-primary/5 to-secondary/5">
        <article className="w-full max-w-md border rounded-lg p-8 bg-background shadow-lg">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
              <ShieldCheck className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-semibold">Acesso Administrativo</h1>
            <p className="text-muted-foreground mt-2">Entre com suas credenciais de administrador</p>
          </div>

          {error && (
            <Alert className="mb-4 border-destructive/50 bg-destructive/10">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <AlertDescription className="text-destructive">{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="email">E-mail</Label>
              <Input 
                id="email" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="admin@exemplo.com"
                autoComplete="email"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Senha</Label>
              <Input 
                id="password" 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Sua senha de administrador"
                autoComplete="current-password"
              />
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <Button 
              className="w-full" 
              onClick={handleLogin} 
              disabled={loading || !email || !password}
            >
              {loading ? "Verificando..." : "Entrar no Painel Admin"}
            </Button>
            
            <div className="text-center">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/')}
                className="text-muted-foreground hover:text-foreground"
              >
                ← Voltar ao site
              </Button>
            </div>
          </div>
        </article>
      </main>
    </>
  );
};

export default AdminAuth;
