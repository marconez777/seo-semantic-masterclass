import { useEffect, useState, useMemo } from "react";
import SEOHead from "@/components/seo/SEOHead";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { supabase } from "@/integrations/supabase/client";
import NewBuyModal from "@/components/checkout/NewBuyModal";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import StructuredData from "@/components/seo/StructuredData";
import BacklinkTableRow from "@/components/marketplace/BacklinkTableRow";

const CATEGORY = "Alimentação";

export default function ComprarBacklinksAlimentacao() {
  const [backlinks, setBacklinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<{ sku?: string; titulo?: string; preco?: string | number; categoria?: string }>();

  function handleComprar(item: any) {
    setCurrent({
      sku: item.id,
      titulo: item.site_name || item.site_url,
      preco: (item.price_cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
      categoria: item.category
    });
    setOpen(true);
  }

  function handleContinue(item?: typeof current) {
    const sku = item?.sku ? `sku=${encodeURIComponent(item.sku)}` : "";
    const categoria = item?.categoria ? `&categoria=${encodeURIComponent(item.categoria)}` : "";
    window.location.href = `/proximo?${sku}${categoria}`;
  }

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data, error } = await supabase
        .from('backlinks_public')
        .select('*')
        .eq('is_active', true)
        .eq('category', CATEGORY);
      if (mounted) {
        if (error) console.error('Erro ao buscar backlinks', error);
        setBacklinks(data ?? []);
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const structuredData = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `Backlinks de ${CATEGORY}`,
    "description": `Lista de backlinks para sites de ${CATEGORY}.`,
    "itemListElement": backlinks.map((b, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "item": {
        "@type": "Product",
        "name": b.site_name || b.site_url,
        "description": `Backlink do site ${b.site_name || b.site_url} com DR ${b.dr} e tráfego de ${b.traffic}.`,
        "sku": b.id,
        "offers": {
          "@type": "Offer",
          "price": (b.price_cents / 100).toFixed(2),
          "priceCurrency": "BRL",
          "availability": "https://schema.org/InStock"
        }
      }
    }))
  }), [backlinks]);

  return (
    <>
      <SEOHead
        title={`Comprar Backlinks de ${CATEGORY} | MK Art SEO`}
        description={`Fortaleça seu site de ${CATEGORY} com backlinks de alta qualidade. Melhore seu SEO e aumente sua autoridade online.`}
        canonicalUrl={`https://mkartseo.com.br/comprar-backlinks-alimentacao`}
      />
      <StructuredData data={structuredData} />
      <Header />
      <main className="container mx-auto px-4 py-28">
        <Breadcrumbs
          items={[
            { name: "Início", url: "/" },
            { name: "Comprar Backlinks", url: "/comprar-backlinks" },
            { name: CATEGORY, url: "/comprar-backlinks-alimentacao" },
          ]}
        />
        <h1 className="text-4xl font-bold mb-2">Backlinks de {CATEGORY}</h1>
        <p className="text-muted-foreground mb-6">
          Explore nossa seleção de backlinks de alta qualidade para sites de {CATEGORY}.
        </p>

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
                <tr><td className="p-6 text-center" colSpan={7}>Carregando...</td></tr>
              ) : backlinks.length === 0 ? (
                <tr><td className="p-6 text-center" colSpan={7}>Nenhum backlink encontrado.</td></tr>
              ) : (
                backlinks.map((b) => (
                  <BacklinkTableRow key={b.id} item={b} onBuy={handleComprar} />
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
      <Footer />
      <NewBuyModal
        open={open}
        item={current}
        onClose={() => setOpen(false)}
        onContinue={handleContinue}
      />
    </>
  );
}
