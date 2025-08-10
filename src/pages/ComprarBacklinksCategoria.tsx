import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import SEOHead from "@/components/seo/SEOHead";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PurchaseModal from "@/components/cart/PurchaseModal";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Circle, BookText, Heart } from "lucide-react";

const brl = (v: number) => (v / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function ComprarBacklinksCategoria() {
  const { categoria } = useParams();
  const [backlinks, setBacklinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [minDR, setMinDR] = useState<number | "">("");
  const [minTraffic, setMinTraffic] = useState<number | "">("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");

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

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Filtros</h2>
            <div className="grid gap-2">
              <label className="text-sm">DR mínimo</label>
              <Input type="number" min={0} value={minDR} onChange={(e) => setMinDR(e.target.value === '' ? '' : Number(e.target.value))} />
            </div>
            <div className="grid gap-2">
              <label className="text-sm">Tráfego mínimo</label>
              <Input type="number" min={0} value={minTraffic} onChange={(e) => setMinTraffic(e.target.value === '' ? '' : Number(e.target.value))} />
            </div>
            <div className="grid gap-2">
              <label className="text-sm">Preço máximo (centavos)</label>
              <Input type="number" min={0} value={maxPrice} onChange={(e) => setMaxPrice(e.target.value === '' ? '' : Number(e.target.value))} />
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
                    <tr key={b.id} className="border-t">
                      <td className="p-4">{b.site_name || b.site_url}</td>
                      <td className="p-4 text-primary font-medium">{b.dr ?? '-'}</td>
                      <td className="p-4 text-muted-foreground">{b.da ?? '-'}</td>
                      <td className="p-4">{b.traffic?.toLocaleString('pt-BR') ?? '-'}</td>
                      <td className="p-4"><Badge variant="secondary">{b.category}</Badge></td>
                      <td className="p-4 font-medium">{brl(b.price_cents)}</td>
                      <td className="p-4 flex items-center justify-end gap-2">
                        <Button size="sm" onClick={() => onBuy(b)}>Comprar</Button>
                        <button aria-label="Favoritar" className="p-2 rounded hover:bg-accent"><Heart size={18} /></button>
                      </td>
                    </tr>
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
