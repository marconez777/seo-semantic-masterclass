import { useEffect, useMemo, useState } from "react";
import SEOHead from "@/components/seo/SEOHead";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { supabase } from "@/integrations/supabase/client";
import PurchaseModal from "@/components/cart/PurchaseModal";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import BacklinkTableRow from "@/components/marketplace/BacklinkTableRow";
import { getCategoryIcon } from "@/lib/category-icons";
import StructuredData from "@/components/seo/StructuredData";

// Helper to format BRL
const brl = (v: number) => (v / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function ComprarBacklinksSaude() {
  const [backlinks, setBacklinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [drRange, setDrRange] = useState<string>('todos');
  const [trafficRange, setTrafficRange] = useState<string>('todos');
  const [maxPrice, setMaxPrice] = useState<number | "">("");

  // Sorting
  const [sortKey, setSortKey] = useState<'site_name' | 'dr' | 'da' | 'traffic' | 'category' | 'price_cents' | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Modal state
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<{ id: string; name: string; price_cents: number } | null>(null);

  // Paginação
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(20);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data, error } = await supabase
        .from('backlinks_public')
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
    // Remove "Justiça" and add "Todas Categorias"
    const filtered = Array.from(set).filter(cat => cat.toLowerCase() !== 'justiça').sort();
    filtered.unshift('Todas Categorias');
    return filtered;
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

  useEffect(() => {
    setPage(1);
  }, [drRange, trafficRange, maxPrice, sortKey, sortDir, itemsPerPage]);

  const filtered = useMemo(() => {
    const drParsed = parseRange(drRange);
    const trafficParsed = parseRange(trafficRange);

    return (backlinks ?? []).filter((b) => {
      // Only show backlinks in the "saúde" category
      if (b.category?.toLowerCase() !== 'saúde') return false;
      
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
    arr.sort((a, b) => {
      const av = sortKey === 'site_name'
        ? ((a.site_name ?? a.site_url) ?? '').toString().toLowerCase()
        : (a as any)[sortKey!];
      const bv = sortKey === 'site_name'
        ? ((b.site_name ?? b.site_url) ?? '').toString().toLowerCase()
        : (b as any)[sortKey!];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === 'number' && typeof bv === 'number') {
        return sortDir === 'desc' ? (bv as number) - (av as number) : (av as number) - (bv as number);
      }
      const as = String(av);
      const bs = String(bv);
      return sortDir === 'desc' ? bs.localeCompare(as) : as.localeCompare(bs);
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / itemsPerPage));
  const currentPage = Math.min(page, pageCount);
  const visible = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sorted.slice(start, start + itemsPerPage);
  }, [sorted, currentPage, itemsPerPage]);

  const onBuy = (b: any) => {
    setSelected({ id: b.id, name: b.site_name ?? b.site_url ?? 'Backlink', price_cents: b.price_cents });
    setOpen(true);
  };

  return (
    <>
      <SEOHead
        title="Comprar Backlinks Brasileiros no Nicho de Saúde | MK"
        description="Comprar Backlinks de qualidade no Nicho de Saúde. Apareça no Topo do Google e nas Respostas das IAs."
        canonicalUrl="https://mkart.com.br/comprar-backlinks-saude"
        keywords="comprar backlinks saúde, backlinks médicos, DR, DA, tráfego, preço"
      />
      <StructuredData
        type="website"
        data={{
          name: "Comprar Backlinks Brasileiros no Nicho de Saúde",
          description: "Comprar Backlinks de qualidade no Nicho de Saúde. Apareça no Topo do Google e nas Respostas das IAs.",
          url: "https://mkart.com.br/comprar-backlinks-saude"
        }}
      />
      <Header />
      <main className="container mx-auto px-4 py-28 grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Sidebar filters */}
        <aside className="md:col-span-2 space-y-8 md:sticky md:top-24 self-start h-max">
          <section>
            <h2 className="text-base font-semibold mb-2">Filtros</h2>

            <div className="mb-4">
              <h3 className="text-base font-semibold mb-1">DR</h3>
              <ul className="text-sm leading-none">
                {[
                  { v: 'todos', label: 'Todos' },
                  { v: '10-20', label: '10 a 20' },
                  { v: '20-30', label: '20 a 30' },
                  { v: '30-40', label: '30 a 40' },
                  { v: '40-50', label: '40 a 50' },
                  { v: '50-60', label: '50 a 60' },
                  { v: '60-70', label: '60 a 70' },
                  { v: '70-80', label: '70 a 80' },
                  { v: '80-90', label: '80 a 90' },
                  { v: '90-99', label: '90 a 99' },
                ].map(({ v, label }) => (
                  <li key={v}>
                    <button
                      className={`block text-left w-full py-0.5 ${drRange === v ? 'font-semibold text-primary' : ''}`}
                      onClick={() => setDrRange(v)}
                    >
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mb-4">
              <h3 className="text-base font-semibold mb-1">Tráfego</h3>
              <ul className="text-sm leading-none">
                {[
                  { v: 'todos', label: 'Todos' },
                  { v: '0-100', label: '0 a 100' },
                  { v: '100-1000', label: '100 a 1.000' },
                  { v: '1000-10000', label: '1.000 a 10.000' },
                  { v: '10000-100000', label: '10.000 a 100.000' },
                  { v: 'gt-100000', label: 'mais de 100.000' },
                ].map(({ v, label }) => (
                  <li key={v}>
                    <button
                      className={`block text-left w-full py-0.5 ${trafficRange === v ? 'font-semibold text-primary' : ''}`}
                      onClick={() => setTrafficRange(v)}
                    >
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
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
              { name: 'Saúde', url: '/comprar-backlinks-saude' },
            ]}
          />
          <h1 className="text-4xl font-bold mb-6">Backlinks para Saúde</h1>
          <h2 className="text-2xl font-semibold mb-6">Comprar Backlinks de Qualidade para Saúde</h2>
          <p className="text-muted-foreground mb-8">Apareça com sua agência de viagens ou blog no topo do Google e também nas respostas das principais inteligências artificiais.</p>
          
          {categories.length > 0 && (
            <section className="mb-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {categories.slice(0,16).map((cat) => {
                  if (cat === 'Todas Categorias') {
                    return (
                      <a
                        key={cat}
                        href="/comprar-backlinks"
                        className="group flex items-center gap-3 rounded-md p-2 hover:bg-muted transition-colors"
                      >
                        <span className="inline-flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary shadow-sm">
                          {(() => {
                            const IconComp = getCategoryIcon('Folder');
                            return <IconComp className="size-4" aria-hidden="true" />;
                          })()}
                        </span>
                        <span className="flex flex-col">
                          <span className="text-[11px] uppercase tracking-wide text-muted-foreground leading-none">Ver</span>
                          <span className="text-sm font-semibold leading-none mt-1">{cat}</span>
                        </span>
                      </a>
                    );
                  }
                  
                  const slug = String(cat)
                    .toLowerCase()
                    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                    .replace(/\s+/g,'-');
                  const IconComp = getCategoryIcon(String(cat));
                  return (
                    <a
                      key={cat}
                      href={`/comprar-backlinks-${slug}`}
                      className="group flex items-center gap-3 rounded-md p-2 hover:bg-muted transition-colors"
                    >
                      <span className="inline-flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary shadow-sm">
                        <IconComp className="size-4" aria-hidden="true" />
                      </span>
                      <span className="flex flex-col">
                        <span className="text-[11px] uppercase tracking-wide text-muted-foreground leading-none">Backlinks de</span>
                        <span className="text-sm font-semibold leading-none mt-1">{String(cat)}</span>
                      </span>
                    </a>
                  );
                })}
              </div>
            </section>
          )}
          
          <div className="overflow-x-auto border rounded-xl bg-card shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-accent/40">
                <tr className="text-left">
                  <th
                    className="p-4 cursor-pointer select-none"
                    role="button"
                    tabIndex={0}
                    onClick={() => { if (sortKey === 'site_name') setSortDir(sortDir === 'asc' ? 'desc' : 'asc'); else { setSortKey('site_name'); setSortDir('desc'); } }}
                    onKeyDown={(e) => { if (e.key === 'Enter') { if (sortKey === 'site_name') setSortDir(sortDir === 'asc' ? 'desc' : 'asc'); else { setSortKey('site_name'); setSortDir('desc'); } } }}
                  >
                    SITE
                  </th>
                  <th
                    className="p-4 cursor-pointer select-none"
                    role="button"
                    tabIndex={0}
                    onClick={() => { if (sortKey === 'dr') setSortDir(sortDir === 'asc' ? 'desc' : 'asc'); else { setSortKey('dr'); setSortDir('desc'); } }}
                    onKeyDown={(e) => { if (e.key === 'Enter') { if (sortKey === 'dr') setSortDir(sortDir === 'asc' ? 'desc' : 'asc'); else { setSortKey('dr'); setSortDir('desc'); } } }}
                  >
                    DR
                  </th>
                  <th
                    className="p-4 cursor-pointer select-none"
                    role="button"
                    tabIndex={0}
                    onClick={() => { if (sortKey === 'da') setSortDir(sortDir === 'asc' ? 'desc' : 'asc'); else { setSortKey('da'); setSortDir('desc'); } }}
                    onKeyDown={(e) => { if (e.key === 'Enter') { if (sortKey === 'da') setSortDir(sortDir === 'asc' ? 'desc' : 'asc'); else { setSortKey('da'); setSortDir('desc'); } } }}
                  >
                    DA
                  </th>
                  <th
                    className="p-4 cursor-pointer select-none"
                    role="button"
                    tabIndex={0}
                    onClick={() => { if (sortKey === 'traffic') setSortDir(sortDir === 'asc' ? 'desc' : 'asc'); else { setSortKey('traffic'); setSortDir('desc'); } }}
                    onKeyDown={(e) => { if (e.key === 'Enter') { if (sortKey === 'traffic') setSortDir(sortDir === 'asc' ? 'desc' : 'asc'); else { setSortKey('traffic'); setSortDir('desc'); } } }}
                  >
                    TRÁFEGO/Mês
                  </th>
                  <th
                    className="p-4 cursor-pointer select-none"
                    role="button"
                    tabIndex={0}
                    onClick={() => { if (sortKey === 'category') setSortDir(sortDir === 'asc' ? 'desc' : 'asc'); else { setSortKey('category'); setSortDir('desc'); } }}
                    onKeyDown={(e) => { if (e.key === 'Enter') { if (sortKey === 'category') setSortDir(sortDir === 'asc' ? 'desc' : 'asc'); else { setSortKey('category'); setSortDir('desc'); } } }}
                  >
                    CATEGORIA
                  </th>
                  <th
                    className="p-4 cursor-pointer select-none"
                    role="button"
                    tabIndex={0}
                    onClick={() => { if (sortKey === 'price_cents') setSortDir(sortDir === 'asc' ? 'desc' : 'asc'); else { setSortKey('price_cents'); setSortDir('desc'); } }}
                    onKeyDown={(e) => { if (e.key === 'Enter') { if (sortKey === 'price_cents') setSortDir(sortDir === 'asc' ? 'desc' : 'asc'); else { setSortKey('price_cents'); setSortDir('desc'); } } }}
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
                  visible.map((b) => (
                    <BacklinkTableRow key={b.id} item={b} onBuy={onBuy} />
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-3">
              <label className="text-sm">Itens por página:</label>
              <select
                className="bg-card text-foreground border rounded-md px-2 py-1"
                value={itemsPerPage}
                onChange={(e) => { setItemsPerPage(Number(e.target.value)); setPage(1); }}
              >
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={150}>150</option>
              </select>
            </div>
            <div className="flex items-center gap-2 md:ml-auto">
              <button className="px-3 py-1 border rounded-md disabled:opacity-50" disabled={currentPage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Anterior</button>
              <span className="text-sm">Página {currentPage} de {pageCount}</span>
              <button className="px-3 py-1 border rounded-md disabled:opacity-50" disabled={currentPage >= pageCount} onClick={() => setPage((p) => Math.min(pageCount, p + 1))}>Próxima</button>
            </div>
          </div>

          <section className="mt-10 space-y-8">
            <h2 className="text-2xl font-semibold">Porque Comprar Backlinks para Saúde?</h2>
            <p className="text-muted-foreground">O setor de saúde é altamente regulamentado e competitivo online. Para destacar sua clínica, consultório, blog médico ou empresa de saúde nos resultados de busca, é essencial investir em backlinks de qualidade e relevantes.</p>
            
            <h3 className="text-xl font-semibold">Vantagens dos Backlinks para Saúde</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Autoridade Médica:</strong> Melhore o DR/DA do seu site com links de sites respeitados na área da saúde</li>
              <li><strong>Tráfego Qualificado:</strong> Atraia pacientes e profissionais interessados em serviços e informações de saúde</li>
              <li><strong>Relevância Temática:</strong> Links contextualizados no nicho de saúde têm maior peso para o Google</li>
              <li><strong>Credibilidade:</strong> Backlinks de sites médicos renomados aumentam a confiança dos usuários</li>
            </ul>

            <h3 className="text-xl font-semibold">Como Escolher os Melhores Backlinks</h3>
            <p className="text-muted-foreground">Use nossos filtros para encontrar backlinks ideais:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>DR alto:</strong> Sites com DR 40+ passam mais autoridade no setor médico</li>
              <li><strong>Tráfego relevante:</strong> Sites com audiência interessada em saúde e bem-estar</li>
              <li><strong>Preço justo:</strong> Compare custo-benefício baseado na qualidade e autoridade</li>
              <li><strong>Contexto médico:</strong> Links em artigos sobre saúde, medicina, tratamentos</li>
            </ul>
          </section>
        </section>
      </main>
      <Footer />
      <PurchaseModal
        open={open}
        onOpenChange={setOpen}
        product={selected || { id: '', name: '', price_cents: 0 }}
      />
    </>
  );
}