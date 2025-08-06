import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import BacklinkCard from "./BacklinkCard";
import BacklinkFilters from "./BacklinkFilters";
import { Database } from "@/integrations/supabase/types";

type Backlink = Database['public']['Tables']['backlinks']['Row'];

const BacklinkListing = () => {
  const [backlinks, setBacklinks] = useState<Backlink[]>([]);
  const [filteredBacklinks, setFilteredBacklinks] = useState<Backlink[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    categoria: '',
    minDR: 0,
    maxPrice: 1000,
    minTraffic: 0
  });

  useEffect(() => {
    fetchBacklinks();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [backlinks, filters]);

  const fetchBacklinks = async () => {
    try {
      const { data, error } = await supabase
        .from('backlinks')
        .select('*')
        .order('dr', { ascending: false });

      if (error) throw error;
      setBacklinks(data || []);
    } catch (error) {
      console.error('Error fetching backlinks:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...backlinks];

    if (filters.categoria) {
      filtered = filtered.filter(link => 
        link.categoria.toLowerCase().includes(filters.categoria.toLowerCase())
      );
    }

    if (filters.minDR > 0) {
      filtered = filtered.filter(link => link.dr >= filters.minDR);
    }

    if (filters.maxPrice < 1000) {
      filtered = filtered.filter(link => Number(link.valor) <= filters.maxPrice);
    }

    if (filters.minTraffic > 0) {
      filtered = filtered.filter(link => link.trafego_mensal >= filters.minTraffic);
    }

    setFilteredBacklinks(filtered);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-4 gap-8">
      <div className="lg:col-span-1">
        <BacklinkFilters filters={filters} onFiltersChange={setFilters} />
      </div>
      
      <div className="lg:col-span-3">
        {filteredBacklinks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Nenhum backlink encontrado com os filtros aplicados.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredBacklinks.map((backlink) => (
              <BacklinkCard key={backlink.id} backlink={backlink} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BacklinkListing;