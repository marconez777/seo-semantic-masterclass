import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Home } from 'lucide-react';
import SEOHead from '@/components/seo/SEOHead';

export default function Forbidden() {
  return (
    <>
      <SEOHead
        title="403 - Acesso Negado | MK Art SEO"
        description="Você não tem permissão para acessar esta página."
        canonicalUrl={`${window.location.origin}/403`}
        noindex={true}
      />

      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="flex justify-center">
            <div className="rounded-full bg-destructive/10 p-4">
              <AlertTriangle className="h-12 w-12 text-destructive" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-foreground">403</h1>
            <h2 className="text-xl font-semibold text-foreground">Acesso Negado</h2>
            <p className="text-muted-foreground">
              Você não tem permissão para acessar esta área. Esta seção é restrita apenas para administradores.
            </p>
          </div>

          <div className="space-y-4">
            <Button asChild className="w-full">
              <Link to="/">
                <Home className="mr-2 h-4 w-4" />
                Voltar ao Início
              </Link>
            </Button>

            <Button variant="outline" asChild className="w-full">
              <Link to="/painel">
                Ir para o Painel
              </Link>
            </Button>
          </div>

          <div className="text-xs text-muted-foreground">
            Se você acredita que deveria ter acesso a esta área, entre em contato com o administrador.
          </div>
        </div>
      </div>
    </>
  );
}