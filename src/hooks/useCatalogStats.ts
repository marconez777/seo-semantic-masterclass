import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Números agregados do catálogo, para a home.
 *
 * Eles são calculados a partir de `backlinks_public` a cada carregamento, e não
 * escritos à mão na tela, de propósito: número de vitrine digitado no JSX
 * envelhece em silêncio e vira exatamente a métrica inflada que o comprador
 * desta categoria procura. Se o catálogo encolher, a home encolhe junto.
 *
 * **A métrica de autoridade aqui é DA.** A coluna `dr` existe no schema e está
 * nula em todas as linhas. Ver `docs/GOTCHAS.md`.
 */
export interface CatalogStats {
  /** Total de portais no catálogo (contagem exata, não limitada pela página) */
  total: number;
  /** DA médio, arredondado */
  avgDa: number;
  /** Maior DA do catálogo */
  maxDa: number;
}

/**
 * O PostgREST corta em 1.000 linhas por padrão. O catálogo já passou disso, então
 * a média precisa de um range explícito, senão ela é a média das 1.000 primeiras.
 */
const MAX_ROWS = 5000;

export function useCatalogStats() {
  return useQuery<CatalogStats>({
    queryKey: ['catalog-stats'],
    queryFn: async () => {
      const [countResult, daResult] = await Promise.all([
        supabase
          .from('backlinks_public')
          .select('id', { count: 'exact', head: true }),
        supabase
          .from('backlinks_public')
          .select('da')
          .not('da', 'is', null)
          .range(0, MAX_ROWS - 1),
      ]);

      if (countResult.error) throw countResult.error;
      if (daResult.error) throw daResult.error;

      const values = (daResult.data ?? [])
        .map((row) => Number(row.da))
        .filter((n) => Number.isFinite(n));

      const avgDa = values.length
        ? Math.round(values.reduce((sum, n) => sum + n, 0) / values.length)
        : 0;

      return {
        total: countResult.count ?? values.length,
        avgDa,
        maxDa: values.length ? Math.max(...values) : 0,
      };
    },
    staleTime: 1000 * 60 * 30,
  });
}

export interface CatalogSampleRow {
  id: string;
  domain: string;
  da: number | null;
  traffic: number | null;
  category: string;
  price: number;
}

/**
 * Amostra do catálogo para a home.
 *
 * Não são os N portais de maior DA. Só 3% do catálogo passa de DA 80, e uma
 * amostra só com eles cria uma expectativa de preço que o resto do catálogo não
 * cumpre. A amostra atravessa as faixas de autoridade de propósito: mostra o
 * alcance real e ainda ancora por cima.
 */
const SAMPLE_BANDS: Array<{ min: number; max: number; take: number; diversify: boolean }> = [
  // A faixa de topo NÃO diversifica: as duas primeiras linhas são a âncora de
  // autoridade e de preço da página, e trocar o portal de maior tráfego por um
  // de nicho diferente joga fora justamente o que impressiona.
  { min: 80, max: 100, take: 2, diversify: false },
  { min: 60, max: 79, take: 2, diversify: true },
  { min: 40, max: 59, take: 2, diversify: true },
  { min: 20, max: 39, take: 2, diversify: true },
];

/**
 * Quantos candidatos buscar por faixa antes de escolher os `take`.
 *
 * Metade do catálogo é Notícias, e tráfego alto correlaciona com notícia, então
 * ordenar por tráfego dentro da faixa devolve portal de notícia em quase toda
 * linha, o que faz a amostra parecer repetitiva e contradiz a seção de nichos
 * logo abaixo. O excedente precisa ser generoso: com 12 candidatos as faixas
 * ainda vinham 100% Notícias.
 */
const CANDIDATES_PER_BAND = 40;

/**
 * TLDs de fora que existem no catálogo (~75 domínios portugueses e espanhóis).
 *
 * A home promete "portais brasileiros" no H1, então a amostra da vitrine não
 * pode exibir um `.pt` ou um `.es`, porque a primeira linha que contradiz a headline
 * custa mais confiança do que a variedade extra ganha. Isto filtra **só a
 * amostra da home**; o catálogo completo continua mostrando tudo.
 */
const FOREIGN_TLDS = ['.pt', '.es', '.eu'];

const isBrazilianPortal = (domain: string) => {
  const d = domain.toLowerCase();
  return !FOREIGN_TLDS.some((tld) => d.endsWith(tld));
};

function pickVaried<T extends { category: string }>(
  candidates: T[],
  take: number,
  usedCategories: Set<string>
): T[] {
  const picked: T[] = [];

  for (const row of candidates) {
    if (picked.length === take) break;
    if (usedCategories.has(row.category)) continue;
    usedCategories.add(row.category);
    picked.push(row);
  }

  // Faixa em que todas as categorias já apareceram: completa com o que sobrou,
  // porque uma linha repetida é melhor que uma faixa de autoridade ausente.
  for (const row of candidates) {
    if (picked.length === take) break;
    if (picked.includes(row)) continue;
    picked.push(row);
  }

  return picked;
}

export function useCatalogSample() {
  return useQuery<CatalogSampleRow[]>({
    queryKey: ['catalog-sample'],
    queryFn: async () => {
      const bands = await Promise.all(
        SAMPLE_BANDS.map(({ min, max }) =>
          supabase
            .from('backlinks_public')
            .select('id, domain, da, traffic, category, price')
            .gte('da', min)
            .lte('da', max)
            .not('traffic', 'is', null)
            .order('traffic', { ascending: false })
            .limit(CANDIDATES_PER_BAND)
        )
      );

      const usedCategories = new Set<string>();

      return bands
        .flatMap((band, index) => {
          if (band.error) {
            console.error('Erro ao buscar amostra do catálogo', band.error);
            return [];
          }

          const candidates = (band.data ?? [])
            .map((row) => ({
              id: String(row.id),
              domain: String(row.domain ?? ''),
              da: row.da == null ? null : Number(row.da),
              traffic: row.traffic == null ? null : Number(row.traffic),
              category: String(row.category ?? 'Geral'),
              price: Number(row.price ?? 0),
            }))
            .filter((row) => row.domain && isBrazilianPortal(row.domain));

          const { take, diversify } = SAMPLE_BANDS[index];

          if (!diversify) {
            const top = candidates.slice(0, take);
            top.forEach((row) => usedCategories.add(row.category));
            return top;
          }

          return pickVaried(candidates, take, usedCategories);
        })
        .sort((a, b) => (b.da ?? 0) - (a.da ?? 0));
    },
    staleTime: 1000 * 60 * 30,
  });
}
