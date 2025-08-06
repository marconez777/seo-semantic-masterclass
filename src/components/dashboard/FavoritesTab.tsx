import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import PurchaseModal from "@/components/marketplace/PurchaseModal";
import { Database } from "@/integrations/supabase/types";

type Backlink = Database['public']['Tables']['backlinks']['Row'];

interface Favorite {
  id: string;
  criado_em: string;
  backlinks: Backlink;
}

interface FavoritesTabProps {
  userId: string;
}

const FavoritesTab = ({ userId }: FavoritesTabProps) => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBacklink, setSelectedBacklink] = useState<Backlink | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchFavorites();
  }, [userId]);

  const fetchFavorites = async () => {
    try {
      const { data, error } = await supabase
        .from('favoritos')
        .select(`
          id,
          criado_em,
          backlinks (
            id,
            site_url,
            dr,
            da,
            trafego_mensal,
            categoria,
            valor,
            criado_em
          )
        `)
        .eq('user_id', userId)
        .order('criado_em', { ascending: false });

      if (error) throw error;
      setFavorites(data || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar seus favoritos.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (favoriteId: string) => {
    try {
      const { error } = await supabase
        .from('favoritos')
        .delete()
        .eq('id', favoriteId);

      if (error) throw error;

      setFavorites(favorites.filter(fav => fav.id !== favoriteId));
      toast({
        title: "Removido dos favoritos",
        description: "Removido dos seus favoritos com sucesso."
      });
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover dos favoritos.",
        variant: "destructive"
      });
    }
  };

  const handleBuyClick = (backlink: Backlink) => {
    setSelectedBacklink(backlink);
    setShowPurchaseModal(true);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-center">
            <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Nenhum favorito encontrado
            </h3>
            <p className="text-muted-foreground mb-6">
              Você ainda não favoritou nenhum site.
            </p>
            <Button asChild>
              <a href="/comprar-backlinks">Explorar Backlinks</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {favorites.map((favorite) => (
          <Card key={favorite.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg truncate">
                    {getDomainFromUrl(favorite.backlinks.site_url)}
                  </CardTitle>
                  <Badge variant="secondary" className="text-xs mt-2">
                    {favorite.backlinks.categoria}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveFavorite(favorite.id)}
                  className="p-1 h-auto text-muted-foreground hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="text-center">
                <span className="text-2xl font-bold text-primary">
                  {formatPrice(Number(favorite.backlinks.valor))}
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-muted rounded-lg p-2">
                  <div className="text-xs text-muted-foreground">DR</div>
                  <div className="font-semibold text-foreground">{favorite.backlinks.dr}</div>
                </div>
                <div className="bg-muted rounded-lg p-2">
                  <div className="text-xs text-muted-foreground">DA</div>
                  <div className="font-semibold text-foreground">{favorite.backlinks.da}</div>
                </div>
                <div className="bg-muted rounded-lg p-2">
                  <div className="text-xs text-muted-foreground">Tráfego</div>
                  <div className="font-semibold text-foreground">
                    {formatTraffic(favorite.backlinks.trafego_mensal)}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={() => handleBuyClick(favorite.backlinks)}
                  className="flex-1"
                >
                  Comprar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemoveFavorite(favorite.id)}
                  className="px-3"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedBacklink && (
        <PurchaseModal 
          isOpen={showPurchaseModal}
          onClose={() => {
            setShowPurchaseModal(false);
            setSelectedBacklink(null);
          }}
          backlink={selectedBacklink}
        />
      )}
    </>
  );
};

export default FavoritesTab;