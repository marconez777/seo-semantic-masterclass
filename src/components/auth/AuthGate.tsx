import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { Lock } from "lucide-react";

export function AuthGate() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleAuth = () => {
    navigate('/auth', { state: { from: location.pathname } });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md">
      <div className="max-w-md w-full mx-4 p-8 rounded-lg bg-card border border-border shadow-2xl text-center space-y-6">
        <div className="flex justify-center">
          <div className="p-4 rounded-full bg-primary/10">
            <Lock className="w-12 h-12 text-primary" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">
            Conteúdo Exclusivo
          </h2>
          <p className="text-muted-foreground">
            Faça login ou cadastre-se para ver todos os sites disponíveis e acessar informações completas sobre cada backlink.
          </p>
        </div>

        <div className="space-y-3 pt-4">
          <Button 
            onClick={handleAuth} 
            size="lg" 
            className="w-full"
          >
            Fazer Login
          </Button>
          <Button 
            onClick={handleAuth} 
            variant="outline" 
            size="lg" 
            className="w-full"
          >
            Criar Conta Grátis
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          O cadastro é gratuito e leva menos de 1 minuto
        </p>
      </div>
    </div>
  );
}
