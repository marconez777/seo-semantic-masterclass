import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import BacklinkTableRow from "./BacklinkTableRow";

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

interface BacklinkTableProps {
  backlinks: Backlink[];
}

const BacklinkTable = ({ backlinks }: BacklinkTableProps) => {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user && backlinks.length > 0) {
      fetchFavorites();
    }
  }, [user, backlinks]);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    } catch (error) {
      console.error('Error checking user:', error);
    }
  };

  const fetchFavorites = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('favoritos')
        .select('backlink_id')
        .eq('user_id', user.id);

      if (error) throw error;

      const favoriteIds = new Set(data?.map(fav => fav.backlink_id) || []);
      setFavorites(favoriteIds);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  return (
    <div className="bg-card border rounded-lg overflow-hidden shadow-sm">
      <table className="w-full">
        <thead className="bg-muted/50 border-b">
          <tr>
            <th className="py-3 px-4 text-left text-xs font-medium text-primary uppercase tracking-wide">#</th>
            <th className="py-3 px-4 text-left text-xs font-medium text-primary uppercase tracking-wide">Site</th>
            <th className="py-3 px-4 text-center text-xs font-medium text-primary uppercase tracking-wide">DR</th>
            <th className="py-3 px-4 text-center text-xs font-medium text-primary uppercase tracking-wide">DA</th>
            <th className="py-3 px-4 text-center text-xs font-medium text-primary uppercase tracking-wide">Tráfego / mês</th>
            <th className="py-3 px-4 text-left text-xs font-medium text-primary uppercase tracking-wide">Categoria</th>
            <th className="py-3 px-4 text-center text-xs font-medium text-primary uppercase tracking-wide">Valor</th>
            <th className="py-3 px-4 text-center text-xs font-medium text-primary uppercase tracking-wide">Ações</th>
          </tr>
        </thead>
        <tbody>
          {backlinks.map((backlink, index) => (
            <BacklinkTableRow
              key={backlink.id}
              backlink={backlink}
              index={index}
              isFavorited={favorites.has(backlink.id)}
              onFavoriteChange={fetchFavorites}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BacklinkTable;