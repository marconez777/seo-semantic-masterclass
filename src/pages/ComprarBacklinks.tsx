import { useEffect, useMemo, useState } from "react";
import SEOHead from "@/components/seo/SEOHead";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { supabase } from "@/integrations/supabase/client";

import PurchaseModal from "@/components/cart/PurchaseModal";
import Breadcrumbs from "@/components/seo/Breadcrumbs";

import BacklinkTableRow from "@/components/marketplace/BacklinkTableRow";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";


// Helper to format BRL
const brl = (v: number) => (v / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function ComprarBacklinks() {
  const [backlinks, setBacklinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [drRange, setDrRange] = useState<string>('todos');
  const [trafficRange, setTrafficRange] = useState<string>('todos');
  const [maxPrice, setMaxPrice] = useState<number | "">("");

  // Sorting
  const [sortKey, setSortKey] = useState<'site_name' | 'dr' | 'da' | 'traffic' | 'category' | 'price_cents' | null>(null);

  // Modal state
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<{ id: string; name: string; price_cents: number } | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data, error } = await supabase
        .from('backlinks')
        .select('*')
        .eq('is_active', true)
        .order('dr', { ascending: false });
      if (mounted) {
        if (error) console.error('Erro ao buscar backlinks', error);
        setBacklinks(data ?? []);
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    (backlinks ?? []).forEach((b) => { if (b.category) set.add(String(b.category)); });
    return Array.from(set).sort();
  }, [backlinks]);

  // Helpers
  const parseRange = (value: string): [number, number] | null => {
    if (!value || value === 'todos') return null;
    if (value === 'gt-100000') return [100001, Number.POSITIVE_INFINITY];
    const [minStr, maxStr] = value.split('-');
    const min = Number(minStr.replace(/\./g, ''));
    const max = Number(maxStr.replace(/\./g, ''));
    if (Number.isNaN(min) || Number.isNaN(max)) return null;
    return [min, max];
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const dr = params.get('dr');
    const traffic = params.get('traffic');
    if (dr) setDrRange(dr);
    if (traffic) setTrafficRange(traffic);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (drRange && drRange !== 'todos') params.set('dr', drRange); else params.delete('dr');
    if (trafficRange && trafficRange !== 'todos') params.set('traffic', trafficRange); else params.delete('traffic');
    const query = params.toString();
    const url = `${window.location.pathname}${query ? `?${query}` : ''}`;
    window.history.replaceState({}, '', url);
  }, [drRange, trafficRange]);

  const filtered = useMemo(() => {
    const drParsed = parseRange(drRange);
    const trafficParsed = parseRange(trafficRange);

    return (backlinks ?? []).filter((b) => {
      if (drParsed) {
        const [min, max] = drParsed;
        if (typeof b.dr !== 'number') return false;
        if (b.dr < min || b.dr > max) return false;
      }
      if (trafficParsed) {
        const [minT, maxT] = trafficParsed;
        if (typeof b.traffic !== 'number') return false;
        if (b.traffic < minT || b.traffic > maxT) return false;
      }
      if (maxPrice !== "" && typeof b.price_cents === 'number' && b.price_cents > Number(maxPrice)) return false;
      return true;
    });
  }, [backlinks, drRange, trafficRange, maxPrice]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    if (!sortKey) return arr;
    const isDesc = ['dr','da','traffic','price_cents'].includes(sortKey as string);
    arr.sort((a, b) => {
      const av = sortKey === 'site_name'
        ? ((a.site_name ?? a.site_url) ?? '').toString().toLowerCase()
        : a[sortKey];
      const bv = sortKey === 'site_name'
        ? ((b.site_name ?? b.site_url) ?? '').toString().toLowerCase()
        : b[sortKey];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === 'number' && typeof bv === 'number') {
        return isDesc ? (bv as number) - (av as number) : (av as number) - (bv as number);
      }
      const as = String(av);
      const bs = String(bv);
      return isDesc ? bs.localeCompare(as) : as.localeCompare(bs);
    });
    return arr;
  }, [filtered, sortKey]);

  const onBuy = (b: any) => {
    setSelected({ id: b.id, name: b.site_name ?? b.site_url ?? 'Backlink', price_cents: b.price_cents });
    setOpen(true);
  };

  return (
    <>
      <SEOHead
        title="Comprar Backlinks de Qualidade | MK Art SEO"
        description="Catálogo de backlinks com alto DR, DA e tráfego. Filtre por autoridade, tráfego e preço e compre com segurança."
        canonicalUrl={`${window.location.origin}/comprar-backlinks`}
        keywords="comprar backlinks, link building, DR, DA, tráfego, preço"
      />
      <Header />
      <main className="container mx-auto px-4 py-28 grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Sidebar filters */}
        <aside className="md:col-span-2 space-y-8">
          <section>
            <h2 className="text-base font-semibold mb-2">Categorias</h2>
            <nav>
              <ul className="text-sm leading-none">
                <li>
                  <a className="block py-0.5" href="/comprar-backlinks">Todos</a>
                </li>
                {categories.map((cat) => (
                  <li key={cat}>
                    <a className="block py-0.5" href={`/comprar-backlinks-${encodeURIComponent(String(cat).toLowerCase().replace(/\s+/g,'-'))}`}>
                      {cat}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-2">Filtros</h2>

            <div className="mb-4">
              <h3 className="text-base font-semibold mb-1">DR</h3>
              <Select value={drRange} onValueChange={setDrRange}>
                <SelectTrigger aria-label="Filtro de DR" className="w-full">
                  <SelectValue placeholder="DR" />
                </SelectTrigger>
                <SelectContent className="bg-popover text-popover-foreground border shadow-md z-50">
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="10-20">10 a 20</SelectItem>
                  <SelectItem value="20-30">20 a 30</SelectItem>
                  <SelectItem value="30-40">30 a 40</SelectItem>
                  <SelectItem value="40-50">40 a 50</SelectItem>
                  <SelectItem value="50-60">50 a 60</SelectItem>
                  <SelectItem value="60-70">60 a 70</SelectItem>
                  <SelectItem value="70-80">70 a 80</SelectItem>
                  <SelectItem value="80-90">80 a 90</SelectItem>
                  <SelectItem value="90-99">90 a 99</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="mb-4">
              <h3 className="text-base font-semibold mb-1">Tráfego</h3>
              <Select value={trafficRange} onValueChange={setTrafficRange}>
                <SelectTrigger aria-label="Filtro de Tráfego" className="w-full">
                  <SelectValue placeholder="Tráfego" />
                </SelectTrigger>
                <SelectContent className="bg-popover text-popover-foreground border shadow-md z-50">
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="0-100">0 a 100</SelectItem>
                  <SelectItem value="100-1000">100 a 1.000</SelectItem>
                  <SelectItem value="1000-10000">1.000 a 10.000</SelectItem>
                  <SelectItem value="10000-100000">10.000 a 100.000</SelectItem>
                  <SelectItem value="gt-100000">mais de 100.000</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <h3 className="text-base font-semibold mb-1">Preço máximo</h3>
              <ul className="text-sm leading-none">
                <li><button className="block text-left w-full py-0.5" onClick={() => setMaxPrice("")}>Todos</button></li>
                {[5000,10000,20000,50000,100000,500000,1000000,10000000].map((v) => (
                  <li key={v}>
                    <button
                      className={`block text-left w-full py-0.5 ${maxPrice === v ? 'font-semibold' : ''}`}
                      onClick={() => setMaxPrice(v)}
                    >
                      Até {brl(v)}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </aside>

        {/* Main list */}
        <section className="md:col-span-10">
          <Breadcrumbs
            className="mb-3"
            items={[
              { name: 'Início', url: '/' },
              { name: 'Comprar Backlinks', url: '/comprar-backlinks' },
            ]}
          />
          <h1 className="text-4xl font-bold mb-6">Título h1 (Comprar Backlinks)</h1>
          <div className="overflow-x-auto border rounded-xl bg-card shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-accent/40">
                <tr className="text-left">
                  <th
                    className="p-4 cursor-pointer select-none"
                    role="button"
                    tabIndex={0}
                    onClick={() => setSortKey('site_name')}
                    onKeyDown={(e) => { if (e.key === 'Enter') setSortKey('site_name'); }}
                  >
                    SITE
                  </th>
                  <th
                    className="p-4 cursor-pointer select-none"
                    role="button"
                    tabIndex={0}
                    onClick={() => setSortKey('dr')}
                    onKeyDown={(e) => { if (e.key === 'Enter') setSortKey('dr'); }}
                  >
                    DR
                  </th>
                  <th
                    className="p-4 cursor-pointer select-none"
                    role="button"
                    tabIndex={0}
                    onClick={() => setSortKey('da')}
                    onKeyDown={(e) => { if (e.key === 'Enter') setSortKey('da'); }}
                  >
                    DA
                  </th>
                  <th
                    className="p-4 cursor-pointer select-none"
                    role="button"
                    tabIndex={0}
                    onClick={() => setSortKey('traffic')}
                    onKeyDown={(e) => { if (e.key === 'Enter') setSortKey('traffic'); }}
                  >
                    TRÁFEGO/Mês
                  </th>
                  <th
                    className="p-4 cursor-pointer select-none"
                    role="button"
                    tabIndex={0}
                    onClick={() => setSortKey('category')}
                    onKeyDown={(e) => { if (e.key === 'Enter') setSortKey('category'); }}
                  >
                    CATEGORIA
                  </th>
                  <th
                    className="p-4 cursor-pointer select-none"
                    role="button"
                    tabIndex={0}
                    onClick={() => setSortKey('price_cents')}
                    onKeyDown={(e) => { if (e.key === 'Enter') setSortKey('price_cents'); }}
                  >
                    VALOR
                  </th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td className="p-6" colSpan={7}>Carregando...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td className="p-6" colSpan={7}>Nenhum resultado encontrado.</td></tr>
                ) : (
                  sorted.map((b) => (
                    <BacklinkTableRow key={b.id} item={b} onBuy={onBuy} />
                  ))
                )}
              </tbody>
            </table>
          </div>

          <section className="mt-10">
            <h2 className="text-2xl font-semibold mb-2">Título h2 (Como escolher os melhores backlinks para o seu site de Saúde:)</h2>
            <p className="text-muted-foreground">Texto SEO com 500 palavras e títulos h2, h3 e listagens</p>
          </section>
        </section>
      </main>
      <Footer />

      {selected && (
        <PurchaseModal open={open} onOpenChange={setOpen} product={selected} />
      )}
    </>
  );
}
