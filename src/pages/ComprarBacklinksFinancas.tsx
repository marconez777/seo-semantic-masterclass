import { useEffect, useMemo, useState } from "react";
import SEOHead from "@/components/seo/SEOHead";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { supabase } from "@/integrations/supabase/client";
import ContactModal from "@/components/ui/ContactModal";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import StructuredData from "@/components/seo/StructuredData";
import CategoryStructuredData from "@/components/seo/CategoryStructuredData";
import BacklinkTableRow from "@/components/marketplace/BacklinkTableRow";
import { getCategoryIcon } from "@/lib/category-icons";
import { Folder } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import TableAuthGate from "@/components/auth/TableAuthGate";
import { useIsMobile } from "@/hooks/use-mobile";
import { BacklinkFiltersSidebar } from "@/components/marketplace/BacklinkFilters";

// Helper to format BRL
const brl = (v: number) =>
  (v / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// Ícones por categoria (mesmo mapeamento do dropdown do Header)

const normalize = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

export default function ComprarBacklinksFinancas() {
  const [backlinks, setBacklinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, loading: authLoading } = useAuth();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Filters
  const [daRange, setDaRange] = useState<string>("todos");
  const [trafficRange, setTrafficRange] = useState<string>("todos");
  const [maxPrice, setMaxPrice] = useState<number | "">("");

  // Sorting
  const [sortKey, setSortKey] = useState<
    | "site_name"
    | "dr"
    | "da"
    | "traffic"
    | "category"
    | "price_cents"
    | null
  >(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  // Modal state
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<
    { id: string; name: string; price_cents: number } | null
  >(null);

  // Paginação
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(20);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data, error } = await supabase
        .from("backlinks_public")
        .select("*")
        .order("dr", { ascending: false });
      if (mounted) {
        if (error) console.error("Erro ao buscar backlinks", error);
        setBacklinks(data ?? []);
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    (backlinks ?? []).forEach((b) => {
      if (b.category) set.add(String(b.category));
    });
    return Array.from(set).sort();
  }, [backlinks]);

  // Helpers
  const parseRange = (value: string): [number, number] | null => {
    if (!value || value === "todos") return null;
    if (value === "gt-100000") return [100001, Number.POSITIVE_INFINITY];
    const [minStr, maxStr] = value.split("-");
    const min = Number(minStr.replace(/\./g, ""));
    const max = Number(maxStr.replace(/\./g, ""));
    if (Number.isNaN(min) || Number.isNaN(max)) return null;
    return [min, max];
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const da = params.get("da");
    const traffic = params.get("traffic");
    if (da) setDaRange(da);
    if (traffic) setTrafficRange(traffic);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (daRange && daRange !== "todos") params.set("da", daRange);
    else params.delete("da");
    if (trafficRange && trafficRange !== "todos")
      params.set("traffic", trafficRange);
    else params.delete("traffic");
    const query = params.toString();
    const url = `${window.location.pathname}${query ? `?${query}` : ""}`;
    window.history.replaceState({}, "", url);
  }, [daRange, trafficRange]);

  useEffect(() => {
    setPage(1);
  }, [daRange, trafficRange, maxPrice, sortKey, sortDir, itemsPerPage]);

  const filtered = useMemo(() => {
    const daParsed = parseRange(daRange);
    const trafficParsed = parseRange(trafficRange);

    return (backlinks ?? []).filter((b) => {
      // Restrito a Finanças
      const cat = normalize(String(b.category ?? ""));
      if (!(cat === "financas")) return false;

      if (daParsed) {
        const [min, max] = daParsed;
        if (typeof b.da !== "number") return false;
        if (b.da < min || b.da > max) return false;
      }
      if (trafficParsed) {
        const [minT, maxT] = trafficParsed;
        if (typeof b.traffic !== "number") return false;
        if (b.traffic < minT || b.traffic > maxT) return false;
      }
      if (
        maxPrice !== "" &&
        typeof b.price_cents === "number" &&
        b.price_cents > Number(maxPrice)
      )
        return false;
      return true;
    });
  }, [backlinks, daRange, trafficRange, maxPrice]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    if (!sortKey) return arr;
    arr.sort((a, b) => {
      const av =
        sortKey === "site_name"
          ? (a.site_name ?? a.site_url ?? "").toString().toLowerCase()
          : (a as any)[sortKey!];
      const bv =
        sortKey === "site_name"
          ? (b.site_name ?? b.site_url ?? "").toString().toLowerCase()
          : (b as any)[sortKey!];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === "number" && typeof bv === "number") {
        return sortDir === "desc"
          ? (bv as number) - (av as number)
          : (av as number) - (bv as number);
      }
      const as = String(av);
      const bs = String(bv);
      return sortDir === "desc" ? bs.localeCompare(as) : as.localeCompare(bs);
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / itemsPerPage));
  const currentPage = Math.min(page, pageCount);
  const visible = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const items = sorted.slice(start, start + itemsPerPage);
    
    if (isAuthenticated) {
      return items;
    }
    
    // For non-authenticated users: show first 4 complete + 3 with blur
    return items.slice(0, 7).map((item, index) => ({
      ...item,
      shouldBlur: index >= 4
    }));
  }, [sorted, currentPage, itemsPerPage, isAuthenticated]);

  const onBuy = (b: any) => {
    setSelected({
      id: b.id,
      name: b.site_name ?? b.site_url ?? "Backlink",
      price_cents: b.price_cents,
    });
    setOpen(true);
  };

  return (
    <>
      <SEOHead
        title="Onde Comprar Backlinks de Qualidade para Finanças | MK"
        description="Loja de backlinks de qualidade em Blogs de Finanças. Melhor Loja onde conseguir backlinks para aparecer no Topo do Google e nas IAs."
        canonicalUrl="https://mkart.com.br/comprar-backlinks-financas"
        keywords="backlinks de finanças, comprar backlinks finanças, backlinks de qualidade"
      />
      <StructuredData
        type="breadcrumb"
        data={{
          items: [
            { name: "Início", url: `${window.location.origin}/` },
            {
              name: "Comprar Backlinks de Finanças",
              url: `${window.location.origin}/comprar-backlinks-financas`,
            },
          ],
        }}
      />
      <CategoryStructuredData
        categoryName="Backlinks de Finanças"
        categoryUrl="https://mkart.com.br/comprar-backlinks-financas"
        backlinks={filtered}
        description="Compre backlinks de qualidade em blogs e portais de finanças. Links com alta autoridade para melhorar seu SEO."
      />
      <Header />
      <main className="container mx-auto px-4 py-28">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <BacklinkFiltersSidebar
            isMobile={isMobile}
            mobileMenuOpen={mobileMenuOpen}
            setMobileMenuOpen={setMobileMenuOpen}
            daRange={daRange}
            setDaRange={setDaRange}
            trafficRange={trafficRange}
            setTrafficRange={setTrafficRange}
            maxPrice={maxPrice}
            setMaxPrice={setMaxPrice}
          />

          {/* Main list */}
          <section className={isMobile ? "col-span-1" : "md:col-span-10"}>
            <Breadcrumbs
              className="mb-3"
            items={[
              { name: "Início", url: "/" },
              { name: "Backlinks de Finanças", url: "/comprar-backlinks-financas" },
            ]}
          />
          <h1 className="text-4xl font-bold mb-6">
            Comprar Backlinks de Finanças
          </h1>

          {categories.length > 0 && (
            <section className="mb-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {categories.slice(0, 16).map((cat) => {
                  const slug = String(cat)
                    .toLowerCase()
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .replace(/\s+/g, "-");
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
                        <span className="text-[11px] uppercase tracking-wide text-muted-foreground leading-none">
                          Backlinks de
                        </span>
                        <span className="text-sm font-semibold leading-none mt-1">
                          {String(cat)}
                        </span>
                      </span>
                    </a>
                  );
                })}
              </div>
            </section>
          )}

          <div className="relative overflow-x-auto border rounded-xl bg-card shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-accent/40">
                <tr className="text-left">
                  <th
                    className="p-4 cursor-pointer select-none"
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      if (sortKey === "site_name")
                        setSortDir(sortDir === "asc" ? "desc" : "asc");
                      else {
                        setSortKey("site_name");
                        setSortDir("desc");
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        if (sortKey === "site_name")
                          setSortDir(sortDir === "asc" ? "desc" : "asc");
                        else {
                          setSortKey("site_name");
                          setSortDir("desc");
                        }
                      }
                    }}
                  >
                    SITE
                  </th>
                  <th
                    className="p-4 cursor-pointer select-none"
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      if (sortKey === "dr")
                        setSortDir(sortDir === "asc" ? "desc" : "asc");
                      else {
                        setSortKey("dr");
                        setSortDir("desc");
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        if (sortKey === "dr")
                          setSortDir(sortDir === "asc" ? "desc" : "asc");
                        else {
                          setSortKey("dr");
                          setSortDir("desc");
                        }
                      }
                    }}
                  >
                    DR
                  </th>
                  <th
                    className="p-4 cursor-pointer select-none"
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      if (sortKey === "da")
                        setSortDir(sortDir === "asc" ? "desc" : "asc");
                      else {
                        setSortKey("da");
                        setSortDir("desc");
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        if (sortKey === "da")
                          setSortDir(sortDir === "asc" ? "desc" : "asc");
                        else {
                          setSortKey("da");
                          setSortDir("desc");
                        }
                      }
                    }}
                  >
                    DA
                  </th>
                  <th
                    className="p-4 cursor-pointer select-none"
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      if (sortKey === "traffic")
                        setSortDir(sortDir === "asc" ? "desc" : "asc");
                      else {
                        setSortKey("traffic");
                        setSortDir("desc");
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        if (sortKey === "traffic")
                          setSortDir(sortDir === "asc" ? "desc" : "asc");
                        else {
                          setSortKey("traffic");
                          setSortDir("desc");
                        }
                      }
                    }}
                  >
                    TRÁFEGO/Mês
                  </th>
                  <th
                    className="p-4 cursor-pointer select-none"
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      if (sortKey === "category")
                        setSortDir(sortDir === "asc" ? "desc" : "asc");
                      else {
                        setSortKey("category");
                        setSortDir("desc");
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        if (sortKey === "category")
                          setSortDir(sortDir === "asc" ? "desc" : "asc");
                        else {
                          setSortKey("category");
                          setSortDir("desc");
                        }
                      }
                    }}
                  >
                    CATEGORIA
                  </th>
                  <th
                    className="p-4 cursor-pointer select-none"
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      if (sortKey === "price_cents")
                        setSortDir(sortDir === "asc" ? "desc" : "asc");
                      else {
                        setSortKey("price_cents");
                        setSortDir("desc");
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        if (sortKey === "price_cents")
                          setSortDir(sortDir === "asc" ? "desc" : "asc");
                        else {
                          setSortKey("price_cents");
                          setSortDir("desc");
                        }
                      }
                    }}
                  >
                    VALOR
                  </th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td className="p-6" colSpan={7}>
                      Carregando...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td className="p-6" colSpan={7}>
                      Nenhum resultado encontrado.
                    </td>
                  </tr>
                ) : (
                  visible.map((b) => (
                    <BacklinkTableRow key={b.id} item={b} onBuy={onBuy} shouldBlur={b.shouldBlur} />
                  ))
                )}
              </tbody>
            </table>
            {!isAuthenticated && !authLoading && <TableAuthGate />}
          </div>

          <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-3">
              <label className="text-sm">Itens por página:</label>
              <select
                className="bg-card text-foreground border rounded-md px-2 py-1"
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setPage(1);
                }}
              >
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={150}>150</option>
              </select>
            </div>
            <div className="flex items-center gap-2 md:ml-auto">
              <button
                className="px-3 py-1 border rounded-md disabled:opacity-50"
                disabled={currentPage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Anterior
              </button>
              <span className="text-sm">
                Página {currentPage} de {pageCount}
              </span>
              <button
                className="px-3 py-1 border rounded-md disabled:opacity-50"
                disabled={currentPage >= pageCount}
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              >
                Próxima
              </button>
            </div>
          </div>

          {/* Conteúdo SEO */}
          <section className="mt-10 space-y-6">
            <h2 className="text-2xl font-semibold">O Papel dos Backlinks no SEO</h2>
            <p className="text-muted-foreground">
              Os backlinks são links de outros sites que direcionam para o seu, e são vistos pelo Google como votos de confiança. Quando um site de autoridade com conteúdo relevante aponta para o seu, isso indica ao Google que seu site possui informações valiosas, aumentando assim sua posição nos mecanismos de busca.
            </p>

            <h2 className="text-2xl font-semibold">Importância de um Representante de Backlinks</h2>
            <p className="text-muted-foreground">
              Um representante de backlinks pode ser um aliado indispensável para qualquer empresa no setor financeiro. Este profissional ou serviço especializado entende as nuances do SEO e possui uma rede estabelecida de sites parceiros que pode ser utilizada para a construção de uma estratégia eficaz de backlinks. Eles garantem que os links obtidos sejam de sites relevantes e de alta qualidade, assegurando que cada backlink adquirido realmente contribua para o crescimento da autoridade de seu site.
            </p>

            <h2 className="text-2xl font-semibold">Como Comprar Backlinks de Qualidade</h2>
            <p className="text-muted-foreground">
              Pesquise Bem o Mercado: Antes de decidir onde comprar backlinks, entenda quais são os sites que oferecem os melhores resultados no setor financeiro. Sites especializados em fintechs, bancos digitais e criptomoedas são preferíveis.
            </p>
            <p className="text-muted-foreground">
              Atenção aos Backlinks Brasileiros: Se o seu público-alvo é majoritariamente brasileiro, é essencial focar em conseguir backlinks nacionais. Isso não apenas melhora o SEO local, mas também aumenta a relevância cultural do seu conteúdo.
            </p>
            <p className="text-muted-foreground">
              Qualidade VS Quantidade: Ao comprar backlinks de qualidade, foque sempre em links provenientes de sites renomados e com boa reputação. Um único backlink de um site de alta confiança pode valer mais do que dezenas de links de sites irrelevantes.
            </p>

            <h2 className="text-2xl font-semibold">Benefícios de Backlinks para Fintechs e Bancos Digitais</h2>
            <p className="text-muted-foreground">
              Aumento da Autoridade de Domínio: Links de qualidade de sites reconhecidos no setor podem sustentar a reputação de sua fintech no mercado digital.
              Maior Visibilidade: Backlinks adequados podem colocar seu site à frente nos resultados de busca, tornando-o mais visível para potenciais clientes e investidores.
            </p>
            <p className="text-muted-foreground">
              Tráfego Qualificado: Combinar backlinks com conteúdo relevante pode atrair um público mais engajado e com maior probabilidade de converter.
            </p>

            <h2 className="text-2xl font-semibold">Dicas Práticas para Comprar Backlinks Brasil</h2>
            <p className="text-muted-foreground">
              Explore Plataformas de Conteúdo Especializado: Envolva-se com blogs voltados ao setor financeiro brasileiro e ofereça conteúdo de guest post em troca de backlinks.
            </p>
            <p className="text-muted-foreground">Parcerias com Influenciadores: Colabore com influenciadores do nicho financeiro, pois eles frequentemente possuem sites ou blogs onde podem incluir backlinks.</p>
            <p className="text-muted-foreground">
              Artigos Patrocinados: Utilize artigos patrocinados em portais respeitados para garantir backlinks robustos e aumentar a visibilidade da sua marca no Brasil.
            </p>

            <p className="text-muted-foreground">
              Finalmente, para qualquer fintech, banco digital, ou empresa contábil que busca avançar no mercado competitivo online, é vital colaborar com um representante de backlinks de confiança. Comece hoje mesmo a investir em backlinks de qualidade e veja sua presença digital crescer significativamente.
            </p>
            <p className="text-muted-foreground">
              Para mais informações, entre em contato com nossa equipe especializada e descubra como podemos transformar a visibilidade online do seu negócio!
            </p>
          </section>
        </section>
        </div>
      </main>
      <Footer />

      {selected && (
        <ContactModal open={open} onOpenChange={setOpen} />
      )}
    </>
  );
}
