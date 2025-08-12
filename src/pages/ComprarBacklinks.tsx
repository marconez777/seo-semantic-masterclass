import { useEffect, useMemo, useState } from "react";
import SEOHead from "@/components/seo/SEOHead";
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
    case "Notícias":
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

export default function ComprarBacklinks() {
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

  return (
    <>
      <SEOHead
        title="Comprar Backlinks de em Grandes Portais | MK"
        description="Comprar Backlinks de qualidade no Nicho que você escolher. Apareça no Topo do Google e nas Respostas das IAs."
        canonicalUrl={`${window.location.origin}/comprar-backlinks`}
        keywords="comprar backlinks, link building, DR, DA, tráfego, preço"
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
            ]}
          />
          <h1 className="text-4xl font-bold mb-6">Comprar Backlinks em Grandes Portais</h1>
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
            <h2 className="text-2xl font-semibold">Porque Comprar Backlinks de Qualidade?</h2>
            <p className="text-muted-foreground">Dificilmente você conseguirá chegar na primeira página com o seu site sem comprar backlinks de qualidade.</p>
            <p className="text-muted-foreground">Porém você precisa entender que se trata de apenas uma parte do processo de posicionamento de sites.</p>
            <p className="text-muted-foreground">Que começa após descobrir qual a palavra-chave que você quer ranquear e que realmente vai trazer resultados em monetização, depois criar e otimizar um texto em uma página também otimizada.</p>
            <p className="text-muted-foreground">Ai sim, depois de ter feito tudo isso, não tem nada mais a ser feito a não ser comprar backlinks de qualidade para que essa página fique em primeiro no Google.</p>
            <p className="text-muted-foreground">Essa estratégia pode ser classificada como proibida pelo Google se não for feita da maneira correta. Por isso, você precisa de muita atenção na hora de escolher a empresa em que irá fazer a compra de backlinks.</p>

            <h2 className="text-2xl font-semibold">O que são Backlinks e Como Funcionam?</h2>
            <p className="text-muted-foreground">Backlinks, ou hiperlinks, são elementos que permitem a navegação entre diferentes páginas na internet. Eles são vitais para os mecanismos de busca que os utilizam para navegar e indexar as páginas e conteúdos dos sites na internet. Por isso é muito bom para  ranquear o site, comprar backlink.</p>

            <h2 className="text-2xl font-semibold">Comprar Backlinks para o Google.</h2>
            <p className="text-muted-foreground">O Google utiliza backlinks para descobrir novas páginas e decidir como uma página deve ser posicionada nos resultados de busca. Sites de alta qualidade que linkam para o seu contribuem significativamente para uma melhor classificação.</p>
            <p className="text-muted-foreground">Existe a compra de backlinks comuns e os que são de alta qualidade, fazer a escolha correta pode fazer toda a diferença na hora de conseguir bons resultados. Existem três tipos de backlinks:</p>

            <h3 className="text-xl font-semibold">1 – Comprar Backlinks de Automação:</h3>
            <p className="text-muted-foreground">São a primeira opção para quem deseja comprar backlinks baratos e geralmente em grande quantidade, como por exemplo em pacotes que você encontra no Mercado livre de mais de 50 a 1000 links por aproximadamente R$30 a R$100. Esses links são criados usando estratégias que eram utilizadas lá em 2010, quando o Google ainda estava passando por vários ajustes e não conseguia detectar a qualidade dos backlinks. Hoje, depois de vários updates, o Google se tornou uma das inteligências artificiais mais poderosas e é capaz de detectar e penalizar esse tipo de prática de comprar backlinks baratos.</p>

            <h3 className="text-xl font-semibold">2 – Comprar Backlinks Comuns:</h3>
            <p className="text-muted-foreground">São links de fontes variadas como:</p>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li>Fóruns de discussão, onde você pode responder perguntas de possíveis clientes e indicar o seu site com um link.</li>
              <li>Diretórios locais, em que você consegue cadastrar o endereço e o telefone da sua empresa com um link para o seu site.</li>
              <li>Comentários em blogs, onde você também consegue inserir um link em um comentário de alguma postagem.</li>
              <li>Diretórios de artigos, que são sites que você consegue publicar um artigo que pode ter um link para seu site.</li>
              <li>Press Release, que é nada mais do que uma assessoria de imprensa onde você paga para ter uma matéria divulgada em vários grandes portais.</li>
            </ul>
            <p className="text-muted-foreground">Essas fontes são boas para você ter um perfil de backlinks natural e variado, evitando até alguma penalização do Google.</p>

            <h3 className="text-xl font-semibold">3 – Comprar Backlinks de Qualidade:</h3>
            <p className="text-muted-foreground">São backlinks de nichos relacionados de forma contextual, ou seja, dentro de artigos que abordam temas relacionados com o conteúdo que estão direcionando. São sites brasileiros e sempre estão escritos na língua portuguesa. Sempre opte por comprar backlinks brasileiros.</p>
            <p className="text-muted-foreground">O que irá definir a qualidade, são um conjunto de métricas que devem ser analisadas. Por isso, para não ser penalizado ao comprar backlinks, você precisa analisar bem os links da empresa contratada, levando em conta todas métricas relevantes e também se os links são feitos de forma manual e com conteúdo gerado por um redator profissional sem plágio e uso excessivo de inteligência artificial.</p>
            <p className="text-muted-foreground">Para ficar mais prático, segue um checklist que você pode usar para fazer essa análise.</p>

            <h2 className="text-2xl font-semibold">CHECKLIST – Analisando a Autoridade de um Site para Avaliar a Compra de Backlinks</h2>
            <p className="text-muted-foreground">Você deve analisar os seguintes critérios, usando a ferramenta Ahrefs (separamos um link da versão grátis):</p>
            <ol className="list-decimal pl-6 space-y-1 text-muted-foreground">
              <li>1 – DR – O Domain Rating deve ter de 15 a 30 para concorrência média, 30 a 60 para concorrência alta e 60 a 90 para concorrência muito alta;</li>
              <li>2 – Quantidade de Backlinks Únicos – A quantidade de Referring Domains deve ter de 15 a 300 backlinks únicos;</li>
              <li>3 – Tráfego – Também é um critério ou métrica muito relevante para o Google. Um site com tráfego de 10 a 1.000 visitas mensais é considerado razoável, já sites com mais de 10.000 mil visitas são muito bons e qualquer coisa acima disso são ótimos e muito eficazes para o posicionamento das palavras chaves mais concorridas.</li>
              <li>4 – Referências – Liste os sites que apontam para o site em que você vai comprar um backlink e visite alguns deles para ver se são sites reais, brasileiros e com conteúdo único e de qualidade.</li>
              <li>5 – Links Dofollow / Nofollow – O site precisa ter uma variação próxima de links 80% dofollow e 20% nofollow.</li>
              <li>6 – Perfil sem SPAM / Tóxico – Faça uma análise dos backlinks do site para ver se eles são sites reais e brasileiros, ou se são apenas sites com lista de links, em inglês, sem conteúdo e com alto nível de Spam. Que são os sites com bastante backlinks de referência mas baixo DR.</li>
              <li>7 – Links de Saída – Quanto mais links de saída o site tiver, mais a autoridade está sendo dividida e menos autoridade o seu site irá receber.</li>
              <li>8 – Gráfico de Aquisição de Links – Veja a curva do gráfico que mostra o histórico de links que o site recebeu ao longo do tempo, se for muito acentuada, é um site com Spam.</li>
            </ol>

            <h2 className="text-2xl font-semibold">A Importância de Comprar Backlinks para o Seu Negócio</h2>
            <p className="text-muted-foreground">Comprar Backlinks é essencial para o ranqueamento no Google, especialmente se o seu conteúdo já está otimizado. Eles não apenas aumentam a visibilidade de suas buscas orgânicas e o tráfego real, mas também oferecem um ROI superior em comparação com outras estratégias de marketing digital como tráfego pago.</p>

            <h2 className="text-2xl font-semibold">Benefícios Duradouros e Crescimento Sustentável:</h2>
            <p className="text-muted-foreground">Os resultados obtidos por meio de backlinks de qualidade são duradouros, contribuindo para um crescimento constante em clientes e vendas, além de proporcionar um controle mais efetivo e uma estratégia transparente para seu marketing digital.</p>

            <h2 className="text-2xl font-semibold">Diferenciais na Compra de Backlinks de qualidade com a MK</h2>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li><strong>Links Permanentes e Garantidos em Contrato:</strong> Se caso algum link sair do ar faremos a substituição por outro em um site com as mesmas métricas em poucas horas.</li>
              <li><strong>Redação Profissional:</strong> Qualidade Editorial Garantida. O nosso conteúdo é gerado por redatores profissionais com qualidade e atualizado, gerando pautas relevantes sem plágio ou uso excessivo de Inteligência Artificial, o famoso ctrl c + ctrl v.</li>
              <li><strong>Contextualidade:</strong> Nós nos certificamos de que cada backlink inserido seja contextual e relevante ao tema tratado. Inserimos o seu backlink de forma contextual em artigos com temas relacionados ao assunto da página de destino e com âncoras variadas.</li>
              <li><strong>Backlinks Brasileiros e Manuais:</strong> Não usamos ferramentas de automação nem fonte de links de outros idiomas ou de outros países. Todos os nossos sites são de blogs reais e brasileiros.</li>
              <li><strong>Guest Posts Exclusivos:</strong> Temos parcerias exclusivas com mais de 1.000 blogs que abrem espaço apenas para nossa agência para que nossos redatores contribuam com conteúdos de qualidade.</li>
              <li><strong>Eficiência e Precisão:</strong> Utilizamos a ferramenta AHREFS, muito mais efetiva e precisa do que outras ferramentas como MOZ ou SEMrush, na hora de analisar os backlinks. Isso nos permite garantir que os backlinks que você está comprando realmente são de qualidade.</li>
            </ul>

            <h2 className="text-2xl font-semibold">Qual o Preço de Backlinks de Qualidade?</h2>
            <p className="text-muted-foreground">O valor de um backlink de qualidade, contextual em um blog real, com DR baixo de 10 a 30 custa em média R$ 100,00. Já blogs com DR 30 a 80 são bem mais caros variando de R$ 300,00 a R$ 10.000,00.</p>

            <h2 className="text-2xl font-semibold">Vantagens de Comprar Backlinks</h2>
            <p className="text-muted-foreground">Eficiência no Processo de Seleção: Entendemos que a busca por sites adequados para comprar backlinks pode ser extenuante. Por isso, simplificamos esse processo.</p>
            <p className="text-muted-foreground">Já temos uma lista curada de sites, meticulosamente selecionados por nicho, idioma e autoridade de domínio, prontos para hospedar seus links. Essa abordagem pré-filtrada garante que você não perca tempo procurando os locais perfeitos para os seus links.</p>
            <p className="text-muted-foreground">Negociações Transparentes e Diretas: Eliminamos as extensas negociações com proprietários de sites. Nossos pacotes de backlinks são precificados de maneira clara e acessível, detalhados, permitindo que você faça escolhas rapidamente.</p>
            <p className="text-muted-foreground">Planejamento Claro de Orçamento de SEO: Com a transparência de nossos preços, você pode facilmente determinar a quantidade para comprar backlinks, alinhando suas ações de SEO com seu orçamento de marketing sem surpresas.</p>
            <p className="text-muted-foreground">Agilidade na Publicação: Cooperamos apenas com plataformas de confiança que garantem a rápida publicação de conteúdos. Assim que verificados, os artigos contendo seus backlinks serão colocados online sem atrasos desnecessários.</p>
            <p className="text-muted-foreground">Criação de Conteúdo Profissional: Nossa equipe de redatores especializados produzirá conteúdos altamente relevantes e adaptados à página e palavra-chave que você deseja ranquear. Isso assegura não só a contextualidade, mas também a maximização da eficácia do backlink.</p>
            <p className="text-muted-foreground">Resultados Tangíveis e Rápidos: Com nosso serviço, você notará melhorias significativas em seu posicionamento dentro de duas a quatro semanas, graças à qualidade e estratégia de nossos backlinks.</p>
            <p className="text-muted-foreground">Entre em contato agora com a nossa equipe e veja qual o melhor plano para sua estratégia de SEO hoje!</p>
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
