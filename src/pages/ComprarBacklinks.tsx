import { useEffect, useMemo, useState } from "react";
import SEOHead from "@/components/seo/SEOHead";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/contexts/CartContext";
import PurchaseModal from "@/components/cart/PurchaseModal";

// Helper to format BRL
const brl = (v: number) => (v / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function ComprarBacklinks() {
  const [backlinks, setBacklinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [minDR, setMinDR] = useState<number | "">("");
  const [minTraffic, setMinTraffic] = useState<number | "">("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");

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
        <aside className="md:col-span-3 space-y-6">
          <section>
            <h2 className="text-lg font-semibold mb-3">Filtrar por Categoria</h2>
            <nav className="space-y-2">
              <a className="block text-primary hover:underline" href="/comprar-backlinks">Todas</a>
              {categories.map((cat) => (
                <a key={cat} className="block hover:underline" href={`/comprar-backlinks-${encodeURIComponent(String(cat).toLowerCase().replace(/\s+/g,'-'))}`}>{cat}</a>
              ))}
            </nav>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Filtros</h2>
            <div className="grid gap-2">
              <label className="text-sm">DR mínimo</label>
              <Input type="number" min={0} value={minDR} onChange={(e) => setMinDR(e.target.value === '' ? '' : Number(e.target.value))} placeholder="Ex: 40" />
            </div>
            <div className="grid gap-2">
              <label className="text-sm">Tráfego mínimo</label>
              <Input type="number" min={0} value={minTraffic} onChange={(e) => setMinTraffic(e.target.value === '' ? '' : Number(e.target.value))} placeholder="Ex: 10000" />
            </div>
            <div className="grid gap-2">
              <label className="text-sm">Preço máximo (centavos)</label>
              <Input type="number" min={0} value={maxPrice} onChange={(e) => setMaxPrice(e.target.value === '' ? '' : Number(e.target.value))} placeholder="Ex: 150000" />
            </div>
          </section>
        </aside>

        {/* Main list */}
        <section className="md:col-span-9">
          <h1 className="text-3xl font-bold mb-4">Comprar Backlinks</h1>
          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-accent/40">
                <tr className="text-left">
                  <th className="p-3">Site</th>
                  <th className="p-3">DR</th>
                  <th className="p-3">DA</th>
                  <th className="p-3">Tráfego/Mês</th>
                  <th className="p-3">Categoria</th>
                  <th className="p-3">Valor</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td className="p-4" colSpan={7}>Carregando...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td className="p-4" colSpan={7}>Nenhum resultado encontrado.</td></tr>
                ) : (
                  filtered.map((b) => (
                    <tr key={b.id} className="border-t">
                      <td className="p-3">{b.site_name || b.site_url}</td>
                      <td className="p-3">{b.dr ?? '-'}</td>
                      <td className="p-3">{b.da ?? '-'}</td>
                      <td className="p-3">{b.traffic?.toLocaleString('pt-BR') ?? '-'}</td>
                      <td className="p-3">{b.category}</td>
                      <td className="p-3">{brl(b.price_cents)}</td>
                      <td className="p-3 text-right"><Button size="sm" onClick={() => onBuy(b)}>Comprar</Button></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
      <Footer />

      {selected && (
        <PurchaseModal open={open} onOpenChange={setOpen} product={selected} />
      )}
    </>
  );
}
