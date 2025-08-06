import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import PurchaseModal from "@/components/marketplace/PurchaseModal";

interface Favorite {
  id: string;
  backlink_id: string;
  criado_em: string;
  backlinks: {
    id: string;
    site_url: string;
    categoria: string;
    valor: number;
    dr: number;
    da: number;
    trafego_mensal: number;
    criado_em: string;
  };
}

interface FavoritesTableProps {
  userId: string;
}

const FavoritesTable = ({ userId }: FavoritesTableProps) => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBacklink, setSelectedBacklink] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
          backlink_id,
          criado_em,
          backlinks (
            id,
            site_url,
            categoria,
            valor,
            dr,
            da,
            trafego_mensal,
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

  const removeFavorite = async (favoriteId: string) => {
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const getDomainFromUrl = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  const handlePurchaseClick = (backlink: any) => {
    setSelectedBacklink(backlink);
    setIsModalOpen(true);
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
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-foreground mb-2">
          Nenhum favorito encontrado
        </h3>
        <p className="text-muted-foreground mb-6">
          Você ainda não favoritou nenhum backlink.
        </p>
        <Button asChild>
          <a href="/comprar-backlinks">Explorar Backlinks</a>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="py-3 px-4 text-left text-sm font-medium text-blue-600">#</th>
              <th className="py-3 px-4 text-left text-sm font-medium text-blue-600">SITE</th>
              <th className="py-3 px-4 text-center text-sm font-medium text-blue-600">DR</th>
              <th className="py-3 px-4 text-center text-sm font-medium text-blue-600">DA</th>
              <th className="py-3 px-4 text-center text-sm font-medium text-blue-600">TRÁFEGO /MÊS</th>
              <th className="py-3 px-4 text-left text-sm font-medium text-blue-600">CATEGORIA</th>
              <th className="py-3 px-4 text-center text-sm font-medium text-blue-600">VALOR</th>
              <th className="py-3 px-4 text-center text-sm font-medium text-blue-600">AÇÕES</th>
            </tr>
          </thead>
          <tbody>
            {favorites.map((favorite, index) => (
              <tr key={favorite.id} className="border-b hover:bg-muted/50">
                <td className="py-4 px-4 text-center">
                  <span className="text-sm text-muted-foreground">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </td>
                
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {favorite.backlinks.dr}
                    </div>
                    <span className="font-medium text-sm">
                      {getDomainFromUrl(favorite.backlinks.site_url)}
                    </span>
                  </div>
                </td>
                
                <td className="py-4 px-4 text-center">
                  <span className="font-medium">{favorite.backlinks.dr}</span>
                </td>
                
                <td className="py-4 px-4 text-center text-blue-600 font-medium">
                  {favorite.backlinks.da}
                </td>
                
                <td className="py-4 px-4 text-center">
                  <span className="text-sm">
                    {favorite.backlinks.trafego_mensal.toLocaleString()}
                  </span>
                </td>
                
                <td className="py-4 px-4">
                  <Badge variant="outline" className="text-orange-600 border-orange-200">
                    {favorite.backlinks.categoria}
                  </Badge>
                </td>
                
                <td className="py-4 px-4 text-center font-bold">
                  {formatPrice(favorite.backlinks.valor)}
                </td>
                
                <td className="py-4 px-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => handlePurchaseClick(favorite.backlinks)}
                      className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-1 text-xs font-medium rounded"
                    >
                      COMPRAR
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFavorite(favorite.id)}
                      className="p-1 hover:bg-red-100"
                    >
                      <X className="w-5 h-5 text-red-500" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedBacklink && (
        <PurchaseModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedBacklink(null);
          }}
          backlink={selectedBacklink}
        />
      )}
    </>
  );
};

export default FavoritesTable;