import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";

export default function TableAuthGate() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleAuth = (mode: 'login' | 'signup') => {
    navigate('/auth', { 
      state: { 
        mode,
        redirect: location.pathname + location.search 
      }
    });
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-background via-background/95 to-transparent flex items-end justify-center pb-8 z-10">
      <div className="text-center space-y-4 px-4">
        <p className="text-lg font-medium text-foreground">
          Faça login para ver todos os sites disponíveis
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Button onClick={() => handleAuth('login')} size="lg">
            Login
          </Button>
          <Button onClick={() => handleAuth('signup')} variant="outline" size="lg">
            Criar Conta Grátis
          </Button>
        </div>
      </div>
    </div>
  );
}
