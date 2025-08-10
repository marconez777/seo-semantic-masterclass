import { useEffect, useMemo, useState } from "react";
import SEOHead from "@/components/seo/SEOHead";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { supabase } from "@/integrations/supabase/client";

import PurchaseModal from "@/components/cart/PurchaseModal";
import Breadcrumbs from "@/components/seo/Breadcrumbs";

import BacklinkTableRow from "@/components/marketplace/BacklinkTableRow";

// Helper to format BRL
const brl = (v: number) => (v / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function ComprarBacklinks() {
  const [backlinks, setBacklinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [minDR, setMinDR] = useState<number | "">("");
  const [minTraffic, setMinTraffic] = useState<number | "">("");
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

  const filtered = useMemo(() => {
    return (backlinks ?? []).filter((b) => {
      if (minDR !== "" && typeof b.dr === 'number' && b.dr < Number(minDR)) return false;
      if (minTraffic !== "" && typeof b.traffic === 'number' && b.traffic < Number(minTraffic)) return false;
      if (maxPrice !== "" && typeof b.price_cents === 'number' && b.price_cents > Number(maxPrice)) return false;
      return true;
    });
  }, [backlinks, minDR, minTraffic, maxPrice]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    if (!sortKey) return arr;
    const isDesc = ['dr','da','traffic','price_cents'].includes(sortKey);
    arr.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === 'number' && typeof bv === 'number') {
        return isDesc ? bv - av : av - bv;
      }
      const as = String(av).toLowerCase();
      const bs = String(bv).toLowerCase();
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
              <ul className="text-sm leading-none">
                <li><button className="block text-left w-full py-0.5" onClick={() => setMinDR("")}>Todos</button></li>
                {[10,20,30,40,50,60,70].map((v) => (
                  <li key={v}>
                    <button
                      className={`block text-left w-full py-0.5 ${minDR === v ? 'font-semibold' : ''}`}
                      onClick={() => setMinDR(v)}
                    >
                      DR {v}+
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mb-4">
              <h3 className="text-base font-semibold mb-1">Tráfego</h3>
              <ul className="text-sm leading-none">
                <li><button className="block text-left w-full py-0.5" onClick={() => setMinTraffic("")}>Todos</button></li>
                {[1000,5000,10000,25000,50000,100000].map((v) => (
                  <li key={v}>
                    <button
                      className={`block text-left w-full py-0.5 ${minTraffic === v ? 'font-semibold' : ''}`}
                      onClick={() => setMinTraffic(v)}
                    >
                      {v >= 1000 ? `${v/1000}k+` : `${v}+`}
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
