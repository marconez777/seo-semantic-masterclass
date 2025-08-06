import { useState, useEffect } from "react";
import { Heart, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { useNavigate } from "react-router-dom";
import PurchaseModal from "./PurchaseModal";

type Backlink = Database['public']['Tables']['backlinks']['Row'];

interface BacklinkCardProps {
  backlink: Backlink;
}

const BacklinkCard = ({ backlink }: BacklinkCardProps) => {
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
    checkIfFavorited();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const checkIfFavorited = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('favoritos')
        .select('id')
        .eq('user_id', user.id)
        .eq('backlink_id', backlink.id)
        .single();

      if (!error && data) {
        setIsFavorited(true);
      }
    } catch (error) {
      // Not favorited
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const formatTraffic = (traffic: number) => {
    if (traffic >= 1000000) {
      return `${(traffic / 1000000).toFixed(1)}M`;
    } else if (traffic >= 1000) {
      return `${(traffic / 1000).toFixed(0)}k`;
    }
    return traffic.toString();
  };

  const getDomainFromUrl = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  const handleFavorite = async () => {
    if (!user) {
      // Save current URL for redirect after login
      localStorage.setItem('redirect_after_login', window.location.pathname);
      toast({
        title: "Login necessário",
        description: "Você precisa estar logado para realizar esta ação. Faça login ou crie uma conta gratuita.",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

    // Check if email is confirmed
    if (!user.email_confirmed_at) {
      toast({
        title: "Email não confirmado",
        description: "Você precisa confirmar seu email antes de favoritar backlinks. Verifique sua caixa de entrada.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      if (isFavorited) {
        const { error } = await supabase
          .from('favoritos')
          .delete()
          .eq('user_id', user.id)
          .eq('backlink_id', backlink.id);

        if (error) throw error;
        setIsFavorited(false);
        toast({
          title: "Removido dos favoritos",
          description: "Backlink removido da sua lista de favoritos."
        });
      } else {
        const { error } = await supabase
          .from('favoritos')
          .insert({
            user_id: user.id,
            backlink_id: backlink.id
          });

        if (error) throw error;
        setIsFavorited(true);
        toast({
          title: "Adicionado aos favoritos",
          description: "Backlink salvo na sua lista de favoritos."
        });
      }
    } catch (error) {
      console.error('Error handling favorite:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao processar sua solicitação.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async () => {
    if (!user) {
      // Save current URL for redirect after login
      localStorage.setItem('redirect_after_login', window.location.pathname);
      toast({
        title: "Login necessário",
        description: "Você precisa estar logado para realizar esta ação. Faça login ou crie uma conta gratuita.",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

    // Check if email is confirmed
    if (!user.email_confirmed_at) {
      toast({
        title: "Email não confirmado",
        description: "Você precisa confirmar seu email antes de comprar backlinks. Verifique sua caixa de entrada.",
        variant: "destructive"
      });
      return;
    }

    setShowPurchaseModal(true);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-foreground truncate">
              {getDomainFromUrl(backlink.site_url)}
            </h3>
            <a
              href={backlink.site_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mt-1"
            >
              {backlink.site_url}
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleFavorite}
            disabled={loading}
            className="p-1 h-auto"
          >
            <Heart 
              className={`w-4 h-4 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} 
            />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <Badge variant="secondary" className="text-xs">
            {backlink.categoria}
          </Badge>
          <span className="text-lg font-bold text-primary">
            {formatPrice(Number(backlink.valor))}
          </span>
        </div>
        
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-muted rounded-lg p-2">
            <div className="text-xs text-muted-foreground">DR</div>
            <div className="font-semibold text-foreground">{backlink.dr}</div>
          </div>
          <div className="bg-muted rounded-lg p-2">
            <div className="text-xs text-muted-foreground">DA</div>
            <div className="font-semibold text-foreground">{backlink.da}</div>
          </div>
          <div className="bg-muted rounded-lg p-2">
            <div className="text-xs text-muted-foreground">Tráfego</div>
            <div className="font-semibold text-foreground">
              {formatTraffic(backlink.trafego_mensal)}
            </div>
          </div>
        </div>
        
        <Button 
          onClick={handleBuy} 
          className="w-full"
          disabled={loading}
        >
          Comprar Backlink
        </Button>
      </CardContent>
      
      <PurchaseModal 
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        backlink={backlink}
      />
    </Card>
  );
};

export default BacklinkCard;