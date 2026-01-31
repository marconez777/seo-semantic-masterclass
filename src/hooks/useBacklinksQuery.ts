import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface BacklinkData {
  id: string;
  site_name?: string | null;
  site_url?: string | null;
  dr?: number | null;
  da?: number | null;
  traffic?: number | null;
  category: string;
  price_cents: number;
}

// Adapter function to transform DB data to UI format
function adaptBacklinks(data: any[] | null): BacklinkData[] {
  if (!data) return [];
  return data.map((row) => ({
    id: row.id,
    site_name: row.domain ?? null,
    site_url: row.url ?? null,
    dr: row.dr ?? null,
    da: row.da ?? null,
    traffic: row.traffic ?? null,
    category: row.category ?? 'Geral',
    price_cents: Math.round(Number(row.price || 0) * 100),
  }));
}

export function useBacklinksQuery(category?: string) {
  return useQuery({
    queryKey: ['backlinks', category ?? 'all'],
    queryFn: async () => {
      let query = supabase
        .from('backlinks_public')
        .select('*');

      if (category) {
        // Use ilike for case-insensitive matching
        query = query.ilike('category', category);
      }

      const { data, error } = await query.order('da', { ascending: false });

      if (error) {
        console.error('Erro ao buscar backlinks:', error);
        throw error;
      }

      return adaptBacklinks(data);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });
}

// Helper function to filter backlinks on the client side
export function filterBacklinks(
  backlinks: BacklinkData[],
  filters: {
    daRange: string;
    trafficRange: string;
    maxPrice: number | "";
    parseRange: (value: string) => [number, number] | null;
  }
): BacklinkData[] {
  const { daRange, trafficRange, maxPrice, parseRange } = filters;
  const daParsed = parseRange(daRange);
  const trafficParsed = parseRange(trafficRange);

  return backlinks.filter((b) => {
    // DA filter
    if (daParsed) {
      const [min, max] = daParsed;
      if (typeof b.da !== 'number') return false;
      if (b.da < min || b.da > max) return false;
    }
    // Traffic filter
    if (trafficParsed) {
      const [minT, maxT] = trafficParsed;
      if (typeof b.traffic !== 'number') return false;
      if (b.traffic < minT || b.traffic > maxT) return false;
    }
    // Price filter
    if (maxPrice !== "" && typeof b.price_cents === 'number' && b.price_cents > Number(maxPrice)) {
      return false;
    }
    return true;
  });
}

// Helper function to sort backlinks
export function sortBacklinks(
  backlinks: BacklinkData[],
  sortKey: 'site_name' | 'dr' | 'da' | 'traffic' | 'category' | 'price_cents' | null,
  sortDir: 'asc' | 'desc'
): BacklinkData[] {
  if (!sortKey) return backlinks;

  const arr = [...backlinks];
  arr.sort((a, b) => {
    const av = sortKey === 'site_name'
      ? ((a.site_name ?? a.site_url) ?? '').toString().toLowerCase()
      : (a as any)[sortKey];
    const bv = sortKey === 'site_name'
      ? ((b.site_name ?? b.site_url) ?? '').toString().toLowerCase()
      : (b as any)[sortKey];
    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;
    if (typeof av === 'number' && typeof bv === 'number') {
      return sortDir === 'desc' ? bv - av : av - bv;
    }
    const as = String(av);
    const bs = String(bv);
    return sortDir === 'desc' ? bs.localeCompare(as) : as.localeCompare(bs);
  });
  return arr;
}
