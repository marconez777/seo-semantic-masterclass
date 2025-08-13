import { useEffect, useMemo, useState } from "react";
import SEOHead from "@/components/seo/SEOHead";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { supabase } from "@/integrations/supabase/client";
import PurchaseModal from "@/components/cart/PurchaseModal";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import StructuredData from "@/components/seo/StructuredData";
import BacklinkTableRow from "@/components/marketplace/BacklinkTableRow";
import { getCategoryIcon } from "@/lib/category-icons";

// Helper to format BRL
const brl = (v: number) =>
  (v / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// Ícones por categoria (mesmo mapeamento do dropdown do Header)

const normalize = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

export default function ComprarBacklinksNoticias() {
  const [backlinks, setBacklinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [drRange, setDrRange] = useState<string>("todos");
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
        .eq("is_active", true)
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
    const dr = params.get("dr");
    const traffic = params.get("traffic");
    if (dr) setDrRange(dr);
    if (traffic) setTrafficRange(traffic);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (drRange && drRange !== "todos") params.set("dr", drRange);
    else params.delete("dr");
    if (trafficRange && trafficRange !== "todos")
      params.set("traffic", trafficRange);
    else params.delete("traffic");
    const query = params.toString();
    const url = `${window.location.pathname}${query ? `?${query}` : ""}`;
    window.history.replaceState({}, "", url);
  }, [drRange, trafficRange]);

  useEffect(() => {
    setPage(1);
  }, [drRange, trafficRange, maxPrice, sortKey, sortDir, itemsPerPage]);

  const filtered = useMemo(() => {
    const drParsed = parseRange(drRange);
    const trafficParsed = parseRange(trafficRange);

    return (backlinks ?? []).filter((b) => {
      // Restrito a Notícias
      const cat = normalize(String(b.category ?? ""));
      if (cat !== "noticias") return false;

      if (drParsed) {
        const [min, max] = drParsed;
        if (typeof b.dr !== "number") return false;
        if (b.dr < min || b.dr > max) return false;
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
  }, [backlinks, drRange, trafficRange, maxPrice]);

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
    return sorted.slice(start, start + itemsPerPage);
  }, [sorted, currentPage, itemsPerPage]);

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
        title="Backlinks de Qualidade de Notícias para Seu Site | MK"
        description="Comprar backlinks de qualidade de portais de notícias. Melhor Loja onde comprar backlinks para aumentar sua autoridade online!"
        canonicalUrl={`${window.location.origin}/comprar-backlinks-noticias`}
        keywords="backlinks de notícias, comprar backlinks de notícias, backlinks de qualidade"
      />
      <StructuredData
        type="breadcrumb"
        data={{
          items: [
            { name: "Início", url: `${window.location.origin}/` },
            {
              name: "Comprar Backlinks de Notícias",
              url: `${window.location.origin}/comprar-backlinks-noticias`,
            },
          ],
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
                  { v: "todos", label: "Todos" },
                  { v: "10-20", label: "10 a 20" },
                  { v: "20-30", label: "20 a 30" },
                  { v: "30-40", label: "30 a 40" },
                  { v: "40-50", label: "40 a 50" },
                  { v: "50-60", label: "50 a 60" },
                  { v: "60-70", label: "60 a 70" },
                  { v: "70-80", label: "70 a 80" },
                  { v: "80-90", label: "80 a 90" },
                  { v: "90-99", label: "90 a 99" },
                ].map(({ v, label }) => (
                  <li key={v}>
                    <button
                      className={`block text-left w-full py-0.5 ${
                        drRange === v ? "font-semibold text-primary" : ""
                      }`}
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
                  { v: "todos", label: "Todos" },
                  { v: "0-100", label: "0 a 100" },
                  { v: "100-1000", label: "100 a 1.000" },
                  { v: "1000-10000", label: "1.000 a 10.000" },
                  { v: "10000-100000", label: "10.000 a 100.000" },
                  { v: "gt-100000", label: "mais de 100.000" },
                ].map(({ v, label }) => (
                  <li key={v}>
                    <button
                      className={`block text-left w-full py-0.5 ${
                        trafficRange === v ? "font-semibold text-primary" : ""
                      }`}
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
                <li>
                  <button
                    className="block text-left w-full py-0.5"
                    onClick={() => setMaxPrice("")}
                  >
                    Todos
                  </button>
                </li>
                {[5000, 10000, 20000, 50000, 100000, 500000, 1000000, 10000000].map(
                  (v) => (
                    <li key={v}>
                      <button
                        className={`block text-left w-full py-0.5 ${
                          maxPrice === v ? "font-semibold" : ""
                        }`}
                        onClick={() => setMaxPrice(v)}
                      >
                        Até {brl(v)}
                      </button>
                    </li>
                  )
                )}
              </ul>
            </div>
          </section>
        </aside>

        {/* Main list */}
        <section className="md:col-span-10">
          <Breadcrumbs
            className="mb-3"
            items={[
              { name: "Início", url: "/" },
              { name: "Backlinks de Notícias", url: "/comprar-backlinks-noticias" },
            ]}
          />
          <h1 className="text-4xl font-bold mb-6">
            Comprar Backlinks de Qualidade em Portais de Notícias
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

          <div className="overflow-x-auto border rounded-xl bg-card shadow-sm">
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

          {/* Conteúdo SEO específico da página de Notícias */}
          <section className="mt-10 space-y-6">
            <article className="space-y-4">
              <h2 className="text-2xl font-semibold">
                Links em Grandes Portais de Notícias
              </h2>
              <p className="text-muted-foreground">
                Na MK Art, temos parcerias valiosas com os principais portais de notícias do Brasil, além de diversos portais regionais com significativo tráfego, autoridade e sinais sociais. Nossa missão é fornecer Backlinks de Qualidade de Notícias que impulsionem o posicionamento do seu site nos mecanismos de busca.
              </p>
            </article>

            <article className="space-y-4">
              <h2 className="text-2xl font-semibold">A Importância dos Backlinks de Qualidade</h2>
              <p className="text-muted-foreground">
                Backlinks são fundamentais para a construção da autoridade de um site. Em SEO, eles são como "votos de confiança" de outros sites dizendo ao Google que seu site possui conteúdo valioso. Quando falamos em Backlinks de Qualidade de Notícias, nos referimos a links vindos de sites de alta autoridade – geralmente, aqueles com um Domain Rating (DR) entre 60 a 90.
              </p>
              <p className="text-muted-foreground">
                A obtenção de backlinks de qualidade pode acelerar o processo de ranqueamento no Google e em outros sistemas de Inteligência Artificial, como o ChatGPT. Portanto, garantir links de portais bem conceituados pode ser a estratégia que faltava para você se destacar online.
              </p>
            </article>

            <article className="space-y-4">
              <h2 className="text-2xl font-semibold">Tipos de Conteúdos Aceitos</h2>
              <p className="text-muted-foreground">
                O conteúdo a ser publicado pode variar entre uma notícia ou um artigo comum. Isso oferece flexibilidade para alinhar o tipo de material com a mensagem que deseja compartilhar e com o público que deseja atingir. Entretanto, para sites adultos, de apostas ou com temas sensíveis, é essencial que você entre em contato conosco previamente pelo nosso canal de atendimento no WhatsApp. Essa verificação antecipada garante que possamos gerenciar a correspondência com as diretrizes específicas de cada portal.
              </p>
            </article>

            <article className="space-y-4">
              <h2 className="text-2xl font-semibold">Onde Comprar Backlinks</h2>
              <p className="text-muted-foreground">
                Se você está se perguntando onde comprar backlinks de qualidade, a resposta é aqui na MK Art. Oferecemos um catálogo variado de sites para backlinks, assegurando que seu investimento traga retorno em visibilidade e autoridade para seu site.
              </p>
            </article>

            <article className="space-y-4">
              <h2 className="text-2xl font-semibold">Escolhendo Sites para Backlinks</h2>
              <p className="text-muted-foreground">
                Os sites para backlinks escolhidos por nossa equipe são rigorosamente avaliados para garantir que atendem aos mais altos padrões de tráfego e engajamento. Essa seleção cuidadosa faz toda a diferença no desempenho final, pois impacta diretamente no ranqueamento de seu site nos buscadores.
              </p>
            </article>

            <article className="space-y-4">
              <h2 className="text-2xl font-semibold">Como Funciona o Ranqueamento</h2>
              <p className="text-muted-foreground">
                O ranqueamento no Google é um processo complexo que envolve centenas de fatores, sendo os backlinks um dos elementos mais críticos. Quando um portal de notícias estabelece um link para sua página, ele transfere parte de sua autoridade para você, impactando positivamente sua posição nos resultados de busca.
              </p>
              <p className="text-muted-foreground">
                Além disso, ao contar com backlinks de um backlink da 90 (um site com DR de 90), aumenta-se consideravelmente a credibilidade atribuída ao seu site, promovendo uma melhora contínua de ranqueamento. O investimento em backlinks de qualidade é, portanto, essencial para quem deseja aumentar sua visibilidade online rapidamente.
              </p>
            </article>

            <article className="space-y-4">
              <h2 className="text-2xl font-semibold">Melhores Portais de Notícias do Brasil</h2>
              <p className="text-muted-foreground">
                A indústria digital está em constante evolução, e contar com parceiros especializados em SEO pode ser a chave para o sucesso. Na MK Art, ajudamos você a navegar nesse ambiente dinâmico com a confiança de que sua marca está em boas mãos.
              </p>
              <p className="text-muted-foreground">
                Não espere mais para dar o próximo passo na sua estratégia digital. Escolha os melhores links e faça a compra. Se tiver alguma dúvida, não hesite em contatar um de nossos especialistas via WhatsApp. Estamos aqui para ajudar você a alcançar o topo do Google com Backlinks de Qualidade de Notícias.
              </p>
            </article>
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
