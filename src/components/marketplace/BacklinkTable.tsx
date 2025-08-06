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