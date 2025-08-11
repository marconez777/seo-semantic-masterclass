import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { supabase } from "@/integrations/supabase/client";
import PurchaseModal from "@/components/cart/PurchaseModal";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import BacklinkTableRow from "@/components/marketplace/BacklinkTableRow";
import { Folder, Newspaper, Briefcase, HeartPulse, GraduationCap, Cpu, Wallet, Home, Shirt, Plane, Utensils, PawPrint, Car, Dumbbell, Clapperboard, Megaphone, Scale } from "lucide-react";

// Helper to format BRL
const brl = (v: number) => (v / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });


// Ícones por categoria (mesmo mapeamento do dropdown do Header)
const getCategoryIcon = (name: string) => {
  switch (name) {
    case "Noticias":
      return Newspaper;
    case "Negócios":
      return Briefcase;
    case "Saúde":
      return HeartPulse;
    case "Educação":
      return GraduationCap;
    case "Tecnologia":
      return Cpu;
    case "Finanças":
      return Wallet;
    case "Casa":
      return Home;
    case "Moda":
      return Shirt;
    case "Turismo":
      return Plane;
    case "Alimentação":
      return Utensils;
    case "Pets":
      return PawPrint;
    case "Automotivo":
      return Car;
    case "Esportes":
      return Dumbbell;
    case "Entretenimento":
      return Clapperboard;
    case "Marketing":
      return Megaphone;
    case "Direito":
      return Scale;
    default:
      return Folder;
  }
};

const AgenciaBacklinks = () => {
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

  useEffect(() => {
    setPage(1);
  }, [drRange, trafficRange, maxPrice, sortKey, sortDir, itemsPerPage]);

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

  const yoastSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": "https://mkart.com.br/agencia-de-backlinks/",
        "url": "https://mkart.com.br/agencia-de-backlinks/",
        "name": "Agência de Backlinks Premium DR ou DA acima de 50 a 90.",
        "isPartOf": { "@id": "https://mkart.com.br/#website" },
        "primaryImageOfPage": { "@id": "https://mkart.com.br/agencia-de-backlinks/#primaryimage" },
        "image": { "@id": "https://mkart.com.br/agencia-de-backlinks/#primaryimage" },
        "thumbnailUrl": "https://mkart.com.br/wp-content/uploads/2023/11/dr.png",
        "datePublished": "2023-10-27T23:48:21+00:00",
        "dateModified": "2025-04-04T17:14:09+00:00",
        "description": "Agencia de backlinks focada em linkbuilding white hat. Enviamos artigos para os principais sites da internet. Artigos únicos e DoFollow para cada site.",
        "breadcrumb": { "@id": "https://mkart.com.br/agencia-de-backlinks/#breadcrumb" },
        "inLanguage": "pt-BR",
        "potentialAction": [
          { "@type": "ReadAction", "target": ["https://mkart.com.br/agencia-de-backlinks/"] }
        ]
      },
      {
        "@type": "ImageObject",
        "inLanguage": "pt-BR",
        "@id": "https://mkart.com.br/agencia-de-backlinks/#primaryimage",
        "url": "https://mkart.com.br/wp-content/uploads/2023/11/dr.png",
        "contentUrl": "https://mkart.com.br/wp-content/uploads/2023/11/dr.png",
        "width": 161,
        "height": 158
      },
      {
        "@type": "BreadcrumbList",
        "@id": "https://mkart.com.br/agencia-de-backlinks/#breadcrumb",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Início", "item": "https://mkart.com.br/" },
          { "@type": "ListItem", "position": 2, "name": "Agência de Backlinks" }
        ]
      },
      {
        "@type": "WebSite",
        "@id": "https://mkart.com.br/#website",
        "url": "https://mkart.com.br/",
        "name": "MK - Agencia de Tráfego",
        "description": "",
        "potentialAction": [
          {
            "@type": "SearchAction",
            "target": { "@type": "EntryPoint", "urlTemplate": "https://mkart.com.br/?s={search_term_string}" },
            "query-input": { "@type": "PropertyValueSpecification", "valueRequired": true, "valueName": "search_term_string" }
          }
        ],
        "inLanguage": "pt-BR"
      }
    ]
  };

  return (
    <>
      <Helmet>
        <title>Agência de Backlinks Premium DR ou DA acima de 50 a 90.</title>
        <meta name="description" content="Agencia de backlinks focada em linkbuilding white hat. Enviamos artigos para os principais sites da internet. Artigos únicos e DoFollow para cada site." />
        <link rel="canonical" href="https://mkart.com.br/agencia-de-backlinks/" />
        <meta property="og:locale" content="pt_BR" />
        <meta property="og:type" content="article" />
        <meta property="og:title" content="Agência de Backlinks Premium DR ou DA acima de 50 a 90." />
        <meta property="og:description" content="Agencia de backlinks focada em linkbuilding white hat. Enviamos artigos para os principais sites da internet. Artigos únicos e DoFollow para cada site." />
        <meta property="og:url" content="https://mkart.com.br/agencia-de-backlinks/" />
        <meta property="og:site_name" content="MK - Agencia de Tráfego" />
        <meta property="article:modified_time" content="2025-04-04T17:14:09+00:00" />
        <meta property="og:image" content="https://mkart.com.br/wp-content/uploads/2023/11/dr.png" />
        <meta property="og:image:width" content="161" />
        <meta property="og:image:height" content="158" />
        <meta property="og:image:type" content="image/png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:label1" content="Est. tempo de leitura" />
        <meta name="twitter:data1" content="16 minutos" />
        <script type="application/ld+json" className="yoast-schema-graph" dangerouslySetInnerHTML={{ __html: JSON.stringify(yoastSchema) }} />
      </Helmet>

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
              { name: 'Agência de Backlinks', url: '/agencia-de-backlinks' },
            ]}
          />
          <h1 className="text-4xl font-bold mb-6">Agencia de Backlinks de Qualidade</h1>
          {categories.length > 0 && (
            <section className="mb-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {categories.slice(0,16).map((cat) => {
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

          {/* SEO content below the table */}
          <section className="prose prose-neutral dark:prose-invert max-w-none mt-10 text-muted-foreground">
            <h2 className="text-2xl font-semibold text-foreground">O que são Backlinks?</h2>
            <p>Backlinks são links que apontam para o seu site.</p>

            <h2 className="text-2xl font-semibold text-foreground mt-6">Para que servem Backlinks?</h2>
            <p>Servem para passar relevância para o site, e aumentar as chances de posicionamento orgânico nas buscas do Google. Entenda mais sobre, clicando aqui!</p>

            <h2 className="text-2xl font-semibold text-foreground mt-6">Como conseguir Backlinks</h2>
            <p>Antes de fazer essa pergunta, você deve ter um planejamento de onde você está agora e onde quer chegar. É preciso entender que todo site tem um perfil de links, que deve ser analisado hoje pela ferramenta AHRefs, pois é a que mais se aproxima quanto as métricas de cada site. Para fazer isso você deve entender que existe uma nota de relevância que cada site recebe que na ferramenta AHRefs é apontada como DR ( domain rating) ou autoridade do domínio. Já na plataforma MOZ é apontado como DA ( Domain Autorit).</p>
            <p>Cada nota de site equivale a uma concorrência de posicionamento. É preciso saber qual a nota é ideal para o nive de concorrência do seu nicho. Para isso vamos mostrar agora exemplos práticos de sites com notas especificas para conseguir posicionar para palavras chaves especificas de baixa, media e alta concorrência.</p>

            <h2 className="text-2xl font-semibold text-foreground mt-6">O que é um perfil natural de Backlinks?</h2>
            <p>O Google é capaz de identificar quando backlinks são inseridos em um site apenas para passar relevância e obter um bom posicionamento nas buscas. Por isso o robo que rastreia os sites ja possui um algoritmo para rastrear todos os sites de uma rede de sites que sigam esse conceito.</p>
            <p>Para criar backlinks sem medo de ser penalizado, é preciso imitar um perfil de lnks natural, que por padrão segue os seguintes elementos:</p>

            <h2 className="text-2xl font-semibold text-foreground mt-6">Backlinks de vários tipos de sites</h2>
            <p>É preciso receber backlinks de vários tipos de sites: sites de guia, fóruns, blogs de noticias, blogs de temas específicos, blogs de temas racionados, redes sociais e diretorios de listagem.</p>

            <h2 className="text-2xl font-semibold text-foreground mt-6">O padrão é seu inimigo</h2>
            <p>Criando backlinks nunca siga um padrão ou seja, quanto mais variar as fontes de backlinks mais difícil sera para o Google identificar algum tipo de manipulação, na aquisição de backlinks para o seu site.</p>

            <h2 className="text-2xl font-semibold text-foreground mt-6">DR 0 ao 10</h2>
            <p>Quando um domínio tem DR de 0 a 10, ele não é totalmente descartável, pois para um perfil de links natural o ideal é ter backlinks de varias notas, pois dificilmente um site só recebe backlinks com notas altas, e o Google é capaz de ate penalizar o seu site se ele não seguir um perfil de links natural, então precisamos ter esse tipo de site em nosso perfil de links.</p>

            <h2 className="text-2xl font-semibold text-foreground mt-6">DR 10 ao 20</h2>
            <p>Com essa nota, o domínio sera capaz de trazer maior relevância para o seu site, e assim posicionar para palavras chaves de baixa a moderada relevância, porem para um numero menor de palavras chaves.</p>

            <h2 className="text-2xl font-semibold text-foreground mt-6">DR 30 ao 40</h2>
            <p>Com esse domínios é possível posicionar para palavras chaves com nível moderado a alto de concorrência, e ao mesmo tempo com grade quantidade de palavras- chaves.</p>

            <h2 className="text-2xl font-semibold text-foreground mt-6">DR 40 ao 80</h2>
            <p>Com sites que possuem essas notas é possível posicionar palavras chaves e alta a extrema concorrência.</p>

            <h2 className="text-2xl font-semibold text-foreground mt-6">DR 90</h2>
            <p>Estes são verdadeiros unicórnios pois são capazes de levar o seu site ao ápice do posicionamento com varias palavras chaves de extrema concorrência e lucratividade.</p>
            <p>Conseguir uma agencia de Backlinks capaz de inserir links em sites como esse é praticamente impossível nos dias de hoje, a não ser que você esteja disposto a investir muito dinheiro, e nem sempre obter o prometido. A MK Art é uma das pouca agências de backlinks capazes de entregar backlinks em sites grandes, e de altíssima relevância.</p>

            <h2 className="text-2xl font-semibold text-foreground mt-6">Qual o preço dos backlinks de qualidade?</h2>
            <p>Comprar backlinks diretamente com cada site ou blog, geralmente é o que mais acontece no mercado de SEO, o preço de um backlink em um blog de com DR baixo de 10 a 30 custa em média R$100,00. Já blogs com DR 30 a 80 são bem mais caros variando de R$1.000,00 a R$50.000,00 por um único link em uma publicação feita por sua redação.</p>

            <h2 className="text-2xl font-semibold text-foreground mt-6">Como conseguir Backlinks Grátis?</h2>
            <p>Você não é obrigado a pagar por links, você pode pagar redatores ou jornalistas qualificados para escrever os seus conteúdos, com qualidade e que ajudem os usuários, proporcionando a eles uma experiência incrível. Dessa forma, os sites com DR 80 podem aceitar seu conteúdo e você conquistar um link de EXTREMA relevância. Nós da MK Art somos especialistas em gerenciar o seu perfil de links, construindo a autoridade de seu site de forma estratégica, otimizando o investimento e maximizando resultados em monetização usando o Google.</p>
          </section>
        </section>
      </main>
      <Footer />

      {selected && (
        <PurchaseModal open={open} onOpenChange={setOpen} product={selected} />
      )}
    </>
  );
};

export default AgenciaBacklinks;
