import { useState } from "react";
import { Heart, HeartIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import PurchaseModal from "./PurchaseModal";

interface Backlink {
  id: string;
  site_url: string;
  categoria: string;
  valor: number;
  dr: number;
  da: number;
  trafego_mensal: number;
  criado_em: string;
}

interface BacklinkTableRowProps {
  backlink: Backlink;
  index: number;
  isFavorited?: boolean;
  onFavoriteChange?: () => void;
}

const BacklinkTableRow = ({ backlink, index, isFavorited = false, onFavoriteChange }: BacklinkTableRowProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [favorited, setFavorited] = useState(isFavorited);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const getDomainFromUrl = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const handleFavoriteClick = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        toast({
          title: "Login necessário",
          description: "Você precisa estar logado para realizar esta ação. Faça login ou crie uma conta gratuita.",
          variant: "destructive"
        });
        return;
      }

      if (!user.email_confirmed_at) {
        toast({
          title: "E-mail não confirmado",
          description: "Você precisa confirmar seu email antes de favoritar backlinks. Verifique sua caixa de entrada.",
          variant: "destructive"
        });
        return;
      }

      setLoading(true);

      if (favorited) {
        // Remove from favorites
        const { error } = await supabase
          .from('favoritos')
          .delete()
          .eq('user_id', user.id)
          .eq('backlink_id', backlink.id);

        if (error) throw error;

        setFavorited(false);
        toast({
          title: "Removido dos favoritos",
          description: "Backlink removido da sua lista de favoritos."
        });
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('favoritos')
          .insert({
            user_id: user.id,
            backlink_id: backlink.id
          });

        if (error) throw error;

        setFavorited(true);
        toast({
          title: "Adicionado aos favoritos",
          description: "Backlink salvo na sua lista de favoritos."
        });
      }

      onFavoriteChange?.();
    } catch (error) {
      console.error('Error updating favorite:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao processar sua solicitação.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseClick = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        toast({
          title: "Login necessário",
          description: "Você precisa estar logado para realizar esta ação. Faça login ou crie uma conta gratuita.",
          variant: "destructive"
        });
        return;
      }

      if (!user.email_confirmed_at) {
        toast({
          title: "E-mail não confirmado",
          description: "Você precisa confirmar seu email antes de comprar backlinks. Verifique sua caixa de entrada.",
          variant: "destructive"
        });
        return;
      }

      setIsModalOpen(true);
    } catch (error) {
      console.error('Error checking auth:', error);
    }
  };

  return (
    <>
      <tr className="border-b hover:bg-muted/50">
        <td className="py-4 px-4 text-center">
          <span className="text-sm text-muted-foreground">
            {String(index + 1).padStart(2, '0')}
          </span>
        </td>
        
        <td className="py-4 px-4">
          <span className="font-medium text-sm">
            {getDomainFromUrl(backlink.site_url)}
          </span>
        </td>
        
        <td className="py-4 px-4 text-center">
          <span className="font-medium">{backlink.dr}</span>
        </td>
        
        <td className="py-4 px-4 text-center text-primary font-medium">
          {backlink.da}
        </td>
        
        <td className="py-4 px-4 text-center">
          <span className="text-sm">
            {backlink.trafego_mensal.toLocaleString()}
          </span>
        </td>
        
        <td className="py-4 px-4">
          <Badge variant="secondary">
            {backlink.categoria}
          </Badge>
        </td>
        
        <td className="py-4 px-4 text-center font-bold">
          {formatPrice(backlink.valor)}
        </td>
        
        <td className="py-4 px-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <Button size="sm" onClick={handlePurchaseClick}>
              Comprar
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFavoriteClick}
              disabled={loading}
            >
              {favorited ? (
                <Heart className="w-5 h-5 text-primary fill-current" />
              ) : (
                <HeartIcon className="w-5 h-5 text-primary" />
              )}
            </Button>
          </div>
        </td>
      </tr>

      <PurchaseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        backlink={backlink}
      />
    </>
  );
};

export default BacklinkTableRow;