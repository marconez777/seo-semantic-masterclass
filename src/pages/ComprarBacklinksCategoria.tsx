import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import SEOHead from "@/components/seo/SEOHead";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

import PurchaseModal from "@/components/cart/PurchaseModal";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import { Circle, BookText } from "lucide-react";
import BacklinkTableRow from "@/components/marketplace/BacklinkTableRow";

const brl = (v: number) => (v / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function ComprarBacklinksCategoria() {
  const { categoria } = useParams();
  const [backlinks, setBacklinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [drRange, setDrRange] = useState<{ min: number; max: number | null } | null>(null);
  const [trafficRange, setTrafficRange] = useState<{ min: number; max: number | null } | null>(null);
  const [priceRange, setPriceRange] = useState<{ min: number; max: number | null } | null>(null);

  const drRanges = [
    { label: "10 a 20", min: 10, max: 20 },
    { label: "20 a 30", min: 20, max: 30 },
    { label: "30 a 40", min: 30, max: 40 },
    { label: "40 a 50", min: 40, max: 50 },
    { label: "50 a 60", min: 50, max: 60 },
    { label: "60 a 70", min: 60, max: 70 },
    { label: "70 a 80", min: 70, max: 80 },
    { label: "80 a 90", min: 80, max: 90 },
    { label: "90 a 100", min: 90, max: 100 },
  ];

  const trafficRanges = [
    { label: "0 a 1.000", min: 0, max: 1000 },
    { label: "1.000 a 5.000", min: 1000, max: 5000 },
    { label: "5.000 a 10.000", min: 5000, max: 10000 },
    { label: "10.000 a 50.000", min: 10000, max: 50000 },
    { label: "50.000+", min: 50000, max: null },
  ];

  const priceRanges = [
    { label: "Até R$200", min: 0, max: 20000 },
    { label: "R$200 a R$500", min: 20000, max: 50000 },
    { label: "R$500 a R$1.000", min: 50000, max: 100000 },
    { label: "R$1.000+", min: 100000, max: null },
  ];

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<{ id: string; name: string; price_cents: number } | null>(null);

  const categoryLabel = useMemo(() => decodeURIComponent(String(categoria ?? "")).replace(/^comprar-backlinks-/, "").replace(/-/g, " "), [categoria]);

  useEffect(() => {
    let mounted = true;
    const slugName = decodeURIComponent(String(categoria ?? ""));
    const realName = slugName.replace(/-/g, ' ');
    (async () => {
      const { data, error } = await supabase
        .from('backlinks')
        .select('*')
        .eq('is_active', true)
        .ilike('category', realName);
      if (mounted) {
        if (error) console.error('Erro ao buscar categoria', error);
        setBacklinks(data ?? []);
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [categoria]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    (backlinks ?? []).forEach((b) => { if (b.category) set.add(String(b.category)); });
    return Array.from(set).sort();
  }, [backlinks]);

  const filtered = useMemo(() => {
    return (backlinks ?? []).filter((b) => {
      if (drRange && typeof b.dr === 'number') {
        if (b.dr < drRange.min) return false;
        if (drRange.max !== null && b.dr >= drRange.max) return false;
      }
      if (trafficRange && typeof b.traffic === 'number') {
        if (b.traffic < trafficRange.min) return false;
        if (trafficRange.max !== null && b.traffic >= trafficRange.max) return false;
      }
      if (priceRange && typeof b.price_cents === 'number') {
        if (b.price_cents < priceRange.min) return false;
        if (priceRange.max !== null && b.price_cents >= priceRange.max) return false;
      }
      return true;
    });
  }, [backlinks, drRange, trafficRange, priceRange]);

  const onBuy = (b: any) => {
    setSelected({ id: b.id, name: b.site_name ?? b.site_url ?? 'Backlink', price_cents: b.price_cents });
    setOpen(true);
  };

  return (
    <>
      <SEOHead
        title={`Comprar Backlinks - ${categoryLabel} | MK Art SEO`}
        description={`Backlinks da categoria ${categoryLabel}. Filtre por DR, tráfego e preço.`}
        canonicalUrl={`${window.location.origin}/comprar-backlinks-${encodeURIComponent(String(categoryLabel).toLowerCase().replace(/\s+/g,'-'))}`}
        keywords={`comprar backlinks, ${categoryLabel}`}
      />
      <Header />
      <main className="container mx-auto px-4 py-28 grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Sidebar filters */}
        <aside className="md:col-span-3 space-y-6">
          <section>
            <h2 className="text-lg font-semibold mb-3">Filter by Category</h2>
            <nav className="space-y-2">
              <a className="flex items-center gap-2 hover:underline" href="/comprar-backlinks">
                <Circle size={16} /> <span>All</span>
              </a>
              {categories.map((cat) => (
                <a key={cat} className="flex items-center gap-2 hover:underline" href={`/comprar-backlinks-${encodeURIComponent(String(cat).toLowerCase().replace(/\s+/g,'-'))}`}>
                  <BookText size={16} /> <span>{cat}</span>
                </a>
              ))}
            </nav>
          </section>

          <section className="space-y-5">
            <h2 className="text-lg font-semibold">Filtros</h2>

            <div>
              <h3 className="text-sm font-medium mb-2">DR</h3>
              <ul className="space-y-1">
                <li>
                  <button
                    className={`w-full text-left px-3 py-2 rounded ${!drRange ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'}`}
                    onClick={() => setDrRange(null)}
                  >
                    Todos
                  </button>
                </li>
                {drRanges.map((r) => (
                  <li key={r.label}>
                    <button
                      className={`w-full text-left px-3 py-2 rounded ${drRange?.min === r.min && drRange?.max === r.max ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'}`}
                      onClick={() => setDrRange({ min: r.min, max: r.max })}
                    >
                      {r.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Tráfego mensal</h3>
              <ul className="space-y-1">
                <li>
                  <button
                    className={`w-full text-left px-3 py-2 rounded ${!trafficRange ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'}`}
                    onClick={() => setTrafficRange(null)}
                  >
                    Todos
                  </button>
                </li>
                {trafficRanges.map((r) => (
                  <li key={r.label}>
                    <button
                      className={`w-full text-left px-3 py-2 rounded ${trafficRange?.min === r.min && trafficRange?.max === r.max ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'}`}
                      onClick={() => setTrafficRange({ min: r.min, max: r.max })}
                    >
                      {r.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Preço</h3>
              <ul className="space-y-1">
                <li>
                  <button
                    className={`w-full text-left px-3 py-2 rounded ${!priceRange ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'}`}
                    onClick={() => setPriceRange(null)}
                  >
                    Todos
                  </button>
                </li>
                {priceRanges.map((r) => (
                  <li key={r.label}>
                    <button
                      className={`w-full text-left px-3 py-2 rounded ${priceRange?.min === r.min && priceRange?.max === r.max ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'}`}
                      onClick={() => setPriceRange({ min: r.min, max: r.max })}
                    >
                      {r.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </aside>

        {/* Main list */}
        <section className="md:col-span-9">
          <Breadcrumbs
            className="mb-3"
            items={[
              { name: 'Início', url: '/' },
              { name: 'Comprar Backlinks', url: '/comprar-backlinks' },
              { name: categoryLabel, url: `/comprar-backlinks-${encodeURIComponent(String(categoryLabel).toLowerCase().replace(/\s+/g,'-'))}` },
            ]}
          />
          <h1 className="text-4xl font-bold mb-6">Título h1 (Comprar Backlinks da {categoryLabel})</h1>
          <div className="overflow-x-auto border rounded-xl bg-card shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-accent/40">
                <tr className="text-left">
                  <th className="p-4">SITE</th>
                  <th className="p-4">DR</th>
                  <th className="p-4">DA</th>
                  <th className="p-4">TRÁFEGO/Mês</th>
                  <th className="p-4">CATEGORIA</th>
                  <th className="p-4">VALOR</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td className="p-6" colSpan={7}>Carregando...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td className="p-6" colSpan={7}>Nenhum resultado encontrado.</td></tr>
                ) : (
                  filtered.map((b) => (
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
