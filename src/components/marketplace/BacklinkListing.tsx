import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import BacklinkTable from "./BacklinkTable";
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
    minTraffic: 0,
    selectedDRRanges: [] as string[],
    selectedCategories: [] as string[]
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

    // Apply DR range filters
    if (filters.selectedDRRanges && filters.selectedDRRanges.length > 0) {
      filtered = filtered.filter(link => {
        return filters.selectedDRRanges.some(range => {
          const [min, max] = range.split(' a ').map(num => parseInt(num));
          return link.dr >= min && link.dr <= max;
        });
      });
    }

    // Apply category filters
    if (filters.selectedCategories && filters.selectedCategories.length > 0) {
      filtered = filtered.filter(link => 
        filters.selectedCategories.includes(link.categoria)
      );
    }

    // Legacy filters (keeping for backward compatibility)
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
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Nenhum site encontrado
            </h3>
            <p className="text-muted-foreground">
              Tente ajustar os filtros para encontrar mais opções.
            </p>
          </div>
        ) : (
          <BacklinkTable backlinks={filteredBacklinks} />
        )}
      </div>
    </div>
  );
};

export default BacklinkListing;