// Gera um HTML por URL em dist/, a partir do build do Vite e, se houver, do banco.
// Uso: npm run build:ssg — depende de dist/ (cliente) e dist-ssr/ (entry-server) prontos.
// Configuração: scripts/site.mjs. Rotas: scripts/rotas.mjs.
//
// Saída:
//   dist/<path>/index.html   uma por URL pública
//   dist/404.html            servido com status 404 para path desconhecido
//   dist/spa.html            shell vazio, com noindex, para as rotas só-app
//   dist/sitemap.xml         gerado da mesma lista — não tem como divergir do que existe
//   dist-ssr/relatorio.json  título, canonical, h1 etc. por URL
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { loadEnv } from "vite";
import { SITE, MODO, FUSO, FONTES, ARQUIVOS_COM_ROTAS, TEXTOS_DE_CARREGANDO, TETO_DE_SUMICO } from "./site.mjs";
import * as rotasDoSite from "./rotas.mjs";
import { arquivosDoNginx } from "./gerar-nginx.mjs";

process.env.TZ = FUSO;

const { ROTAS_FIXAS, ehSoApp } = rotasDoSite;
// Opcional em rotas.mjs: páginas que já estavam no ar sem <h1>. A regra "mesmo conteúdo"
// não deixa criar um na migração; essas são conferidas por quantidade de texto.
const ROTAS_SEM_H1 = rotasDoSite.ROTAS_SEM_H1 ?? [];
const MINIMO_DE_PALAVRAS_SEM_H1 = 150;
// Opcional em rotas.mjs: páginas que viram HTML mas o site antigo deixava fora do sitemap
// de propósito (campanha paga sem noindex, por exemplo).
const FORA_DO_SITEMAP = rotasDoSite.FORA_DO_SITEMAP ?? [];

const RAIZ = process.cwd();
const DIST = path.join(RAIZ, "dist");
const CONCORRENCIA = 6;
const POR_PAGINA_DO_BANCO = 1000;
const ARQUIVO_URLS_ANTERIORES = path.join(RAIZ, ".prerender-urls.json");

// U+2028/2029 são quebra de linha para o JavaScript e encerrariam o <script> embutido.
const SEPARADORES_DE_LINHA = new RegExp(`[${String.fromCharCode(0x2028, 0x2029)}]`, "g");
const escaparJson = (v) =>
  JSON.stringify(v)
    .replace(/</g, "\\u003c")
    .replace(SEPARADORES_DE_LINHA, (c) => `\\u${c.charCodeAt(0).toString(16)}`);
const escaparXml = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const escaparRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const semBarraFinal = (p) => p.replace(/\/+$/, "") || "/";
const atributo = (tag, nome) => (tag.match(new RegExp(`${nome}="([^"]*)"`)) || [])[1];
const CARREGANDO = new RegExp(`>\\s*(${TEXTOS_DE_CARREGANDO.map(escaparRegex).join("|")})`, "i");

// Rota fixa criada no App.tsx e esquecida em scripts/rotas.mjs não vira HTML nem recebe
// o shell: em produção ela responderia 404 enquanto no `npm run dev` parece normal.
// Rota com :param ou * não é vista aqui — ou é só-app, ou vem de FONTES.
async function conferirRotasDoApp() {
  const semDestino = [];
  for (const arquivo of ARQUIVOS_COM_ROTAS) {
    const codigo = await fs.readFile(path.join(RAIZ, arquivo), "utf8");
    for (const [, rota] of codigo.matchAll(/<Route\s+path=["'](\/[^"':*]*)["']/g)) {
      if (rota !== "/404" && !ROTAS_FIXAS.includes(rota) && !ehSoApp(rota)) semDestino.push(rota);
    }
  }
  if (semDestino.length) {
    throw new Error(`rota sem destino em scripts/rotas.mjs: ${[...new Set(semDestino)].join(", ")}`);
  }
}

async function lerFonte(supabase, fonte) {
  const colunaSlug = fonte.colunaSlug ?? "slug";
  const colunas = [colunaSlug, ...(fonte.datas ?? [])].join(", ");
  const linhas = [];
  // O PostgREST devolve no máximo 1000 linhas por pedido.
  for (let de = 0; ; de += POR_PAGINA_DO_BANCO) {
    const { data, error } = await supabase
      .from(fonte.tabela)
      .select(colunas)
      .match(fonte.filtro ?? {})
      .order(colunaSlug)
      .range(de, de + POR_PAGINA_DO_BANCO - 1);
    if (error) throw new Error(`${fonte.tabela}: ${error.message}`);
    linhas.push(...data);
    if (data.length < POR_PAGINA_DO_BANCO) break;
  }
  if (fonte.obrigatoria && linhas.length === 0) {
    throw new Error(`${fonte.tabela} voltou vazio — banco fora ou permissão alterada`);
  }
  return linhas.map((l) => ({
    rota: semBarraFinal(`${fonte.prefixo ?? "/"}${l[colunaSlug]}`.replace(/\/{2,}/g, "/")),
    lastmod: (fonte.datas ?? []).map((c) => l[c]).find(Boolean),
  }));
}

async function urlsDoBanco() {
  const mapa = new Map();
  if (!FONTES.length) return mapa;
  const env = loadEnv("production", RAIZ, "VITE_");
  const chave = env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY;
  if (!env.VITE_SUPABASE_URL || !chave) {
    throw new Error("FONTES configuradas, mas o .env não tem VITE_SUPABASE_URL e a chave pública");
  }
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(env.VITE_SUPABASE_URL, chave, { auth: { persistSession: false } });
  for (const lista of await Promise.all(FONTES.map((f) => lerFonte(supabase, f)))) {
    for (const { rota, lastmod } of lista) mapa.set(rota, lastmod);
  }
  return mapa;
}

// og:title, og:description e og:url repetem título, descrição e canonical. Página que não
// define os seus recebe a cópia aqui: sem eles o link colado no WhatsApp sai sem prévia.
function compartilhamentoQueFalta(head, definidos) {
  const descricao = [...head.matchAll(/<meta\b[^>]*>/g)].find((m) => atributo(m[0], "name") === "description");
  const canonical = [...head.matchAll(/<link\b[^>]*>/g)].find((m) => atributo(m[0], "rel") === "canonical");
  // O texto já sai do Helmet escapado para HTML: vai direto para o atributo.
  const valores = {
    "og:title": (head.match(/<title[^>]*>([^<]*)<\/title>/) || [])[1],
    "og:description": descricao && atributo(descricao[0], "content"),
    "og:url": canonical && atributo(canonical[0], "href"),
  };
  return Object.entries(valores)
    .filter(([chave, valor]) => valor && !definidos.has(chave))
    .map(([chave, valor]) => `<meta property="${chave}" content="${valor}"/>`)
    .join("");
}

// O index.html traz og:type, og:image, robots etc. como padrão. Quando a página define o
// mesmo campo pelo Helmet, o padrão sai — duas og:type no mesmo HTML é o robô quem escolhe.
// O <title> do index.html também sai quando a página tem o seu.
function montarHtml(template, rota, { html, head, state }) {
  const definidos = new Set(
    [...head.matchAll(/<meta\b[^>]*>/g)].map((m) => atributo(m[0], "name") || atributo(m[0], "property")),
  );
  let saida = template.replace(/[ \t]*<meta\b[^>]*>\n?/g, (tag) => {
    const chave = atributo(tag, "name") || atributo(tag, "property");
    return chave && definidos.has(chave) ? "" : tag;
  });
  if (/<title[\s>]/.test(head)) saida = saida.replace(/[ \t]*<title>[\s\S]*?<\/title>\n?/, "");
  saida = saida.replace("</head>", `    ${head}${compartilhamentoQueFalta(head, definidos)}\n  </head>`);
  return saida.replace(
    '<div id="root"></div>',
    `<div id="root" data-ssg-path="${rota}">${html}</div>\n    <script>window.__RQ_STATE__=${escaparJson(state)}</script>`,
  );
}

function auditar(rota, { html, head, passadas, errosDeConsulta }) {
  const meta = (chave) => {
    const tag = [...head.matchAll(/<meta\b[^>]*>/g)].find(
      (m) => atributo(m[0], "name") === chave || atributo(m[0], "property") === chave,
    );
    return tag ? atributo(tag[0], "content") : undefined;
  };
  const texto = html.replace(/<(script|style)[\s\S]*?<\/\1>/g, " ").replace(/<[^>]+>/g, " ");
  const linkCanonical = [...head.matchAll(/<link\b[^>]*>/g)].find((m) => atributo(m[0], "rel") === "canonical");
  return {
    rota,
    titulo: (head.match(/<title[^>]*>([^<]*)<\/title>/) || [])[1] || "",
    descricao: meta("description") || "",
    canonical: linkCanonical ? atributo(linkCanonical[0], "href") : "",
    robots: meta("robots") || "",
    h1: (html.match(/<h1[\s>]/g) || []).length,
    jsonLd: (head.match(/application\/ld\+json/g) || []).length + (html.match(/application\/ld\+json/g) || []).length,
    palavras: texto.split(/\s+/).filter(Boolean).length,
    passadas,
    errosDeConsulta,
    // O texto do <Suspense fallback> / isLoading no HTML final é conteúdo que não chegou.
    carregando: CARREGANDO.test(html),
  };
}

async function emLotes(itens, tamanho, fn) {
  const fila = [...itens];
  await Promise.all(
    Array.from({ length: tamanho }, async () => {
      for (let item = fila.shift(); item !== undefined; item = fila.shift()) await fn(item);
    }),
  );
}

// O Nginx é gerado de site.mjs, rotas.mjs e redirects.mjs. Arquivo do repositório que
// não bate com o que seria gerado agora é espelho esquecido: em produção a rota só-app
// ou o redirect novo não existiriam.
async function nginxDesatualizado() {
  const diferentes = [];
  for (const [arquivo, conteudo] of Object.entries(arquivosDoNginx())) {
    const atual = await fs.readFile(path.join(RAIZ, arquivo), "utf8").catch(() => null);
    if (atual !== conteudo) diferentes.push(arquivo);
  }
  return diferentes;
}

const comNoindex = (template) =>
  template
    .replace(/[ \t]*<meta name="robots"[^>]*>\n?/, "")
    .replace("</head>", '    <meta name="robots" content="noindex" />\n  </head>');

// MODO "app": sistema atrás de login. Nada é renderizado; toda rota recebe o shell com
// noindex, URL desconhecida recebe o mesmo shell com status 404 (o app decide o que
// mostrar), e o robô é mandado embora pelo robots.txt.
async function modoApp(template) {
  await conferirRotasDoApp();
  if (ROTAS_FIXAS.length) throw new Error('MODO "app" com ROTAS_FIXAS: deixe a lista vazia em scripts/rotas.mjs');
  const shell = comNoindex(template);
  await fs.writeFile(path.join(DIST, "spa.html"), shell);
  await fs.writeFile(path.join(DIST, "404.html"), shell);
  await fs.writeFile(path.join(DIST, "robots.txt"), "User-agent: *\nDisallow: /\n");
  await fs.rm(path.join(DIST, "sitemap.xml"), { force: true });
  const nginx = await nginxDesatualizado();
  if (nginx.length) {
    console.error(`\nFALHOU: ops/nginx desatualizado (${nginx.join(", ")}): rode npm run nginx:gerar e faça commit`);
    process.exit(1);
  }
  console.log('\nMODO "app": shell com noindex para as rotas só-app, robots.txt com Disallow, sem sitemap');
  process.exit(0);
}

async function main() {
  const inicio = Date.now();
  if (/SEU-DOMINIO/.test(SITE)) throw new Error("scripts/site.mjs ainda com o domínio de exemplo");
  // dist/index.html ainda é o shell do Vite; a home renderizada vai por cima dele.
  const template = await fs.readFile(path.join(DIST, "index.html"), "utf8");
  if (!template.includes('<div id="root"></div>')) {
    throw new Error("dist/index.html não é o shell do Vite — rode pelo `npm run build:ssg`");
  }
  if (MODO === "app") return modoApp(template);
  const { render } = await import(pathToFileURL(path.join(RAIZ, "dist-ssr", "entry-server.js")).href);

  await conferirRotasDoApp();
  const doBanco = await urlsDoBanco();
  const rotas = [...new Set([...ROTAS_FIXAS, ...doBanco.keys()])];

  const relatorio = [];
  const falhas = [];
  await emLotes(rotas, CONCORRENCIA, async (rota) => {
    try {
      const resultado = await render(rota);
      const linha = auditar(rota, resultado);
      relatorio.push(linha);
      if (linha.errosDeConsulta.length) falhas.push(`${rota}: ${linha.errosDeConsulta.join("; ")}`);
      else if (linha.carregando) falhas.push(`${rota}: HTML final ainda com texto de carregamento`);
      else if (linha.h1 === 0 && !ROTAS_SEM_H1.includes(rota)) falhas.push(`${rota}: sem <h1> — a página renderizou vazia?`);
      else if (linha.h1 === 0 && linha.palavras < MINIMO_DE_PALAVRAS_SEM_H1) {
        falhas.push(`${rota}: sem <h1> e só ${linha.palavras} palavras — a página renderizou vazia?`);
      }

      const destino = rota === "/" ? path.join(DIST, "index.html") : path.join(DIST, rota, "index.html");
      await fs.mkdir(path.dirname(destino), { recursive: true });
      await fs.writeFile(destino, montarHtml(template, rota, resultado));
    } catch (e) {
      falhas.push(`${rota}: ${e instanceof Error ? e.message : String(e)}`);
    }
  });
  relatorio.sort((a, b) => a.rota.localeCompare(b.rota));

  // As rotas só-app respondem 200 com o shell vazio. Com o "index, follow" do
  // index.html, o robô guardaria uma página em branco para /admin e as outras.
  await fs.writeFile(path.join(DIST, "spa.html"), comNoindex(template));
  await fs.writeFile(path.join(DIST, "404.html"), montarHtml(template, "/404", await render("/404")));

  // No sitemap só entra o que a própria página declara como principal: canonical
  // apontando para outra URL ou noindex ficam de fora. A comparação é pela URL inteira —
  // só pelo path, canonical para o mesmo endereço em OUTRO domínio passaria batido.
  const noSitemap = relatorio.filter(
    (l) =>
      !FORA_DO_SITEMAP.includes(l.rota) &&
      !/noindex/i.test(l.robots) &&
      (!l.canonical || semBarraFinal(l.canonical) === semBarraFinal(`${SITE}${l.rota}`)),
  );
  const entradas = noSitemap.map(({ rota }) => {
    const lastmod = doBanco.get(rota);
    const loc = escaparXml(rota === "/" ? `${SITE}/` : `${SITE}${rota}`);
    return `  <url>\n    <loc>${loc}</loc>${lastmod ? `\n    <lastmod>${String(lastmod).slice(0, 10)}</lastmod>` : ""}\n  </url>`;
  });
  await fs.writeFile(
    path.join(DIST, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entradas.join("\n")}\n</urlset>\n`,
  );

  await fs.writeFile(path.join(RAIZ, "dist-ssr", "relatorio.json"), JSON.stringify(relatorio, null, 2));

  const nginx = await nginxDesatualizado();
  if (nginx.length) falhas.push(`ops/nginx desatualizado (${nginx.join(", ")}): rode npm run nginx:gerar e faça commit`);

  let anteriores = [];
  try {
    anteriores = JSON.parse(await fs.readFile(ARQUIVO_URLS_ANTERIORES, "utf8"));
  } catch {
    // primeiro build nesta máquina: não há com o que comparar
  }
  const geradas = new Set(relatorio.map((l) => l.rota));
  const sumiram = anteriores.filter((r) => !geradas.has(r));

  const sem = (campo) => relatorio.filter((l) => !l[campo]).length;
  console.log(`\n${relatorio.length} páginas em ${((Date.now() - inicio) / 1000).toFixed(1)}s · ${noSitemap.length} no sitemap`);
  console.log(
    `sem título: ${sem("titulo")} · sem descrição: ${sem("descricao")} · sem canonical: ${sem("canonical")} · ` +
      `sem JSON-LD: ${sem("jsonLd")} · h1 ≠ 1: ${relatorio.filter((l) => l.h1 !== 1).length}`,
  );
  if (sumiram.length) console.log(`\nsumiram desde o build anterior (${sumiram.length}):\n  ${sumiram.join("\n  ")}`);

  if (falhas.length) {
    console.error(`\nFALHOU em ${falhas.length} ponto(s):\n  ${falhas.join("\n  ")}`);
    process.exit(1);
  }
  if (anteriores.length && sumiram.length / anteriores.length > TETO_DE_SUMICO) {
    console.error(`\nFALHOU: ${sumiram.length} de ${anteriores.length} URLs sumiram (teto ${TETO_DE_SUMICO * 100}%).`);
    process.exit(1);
  }
  await fs.writeFile(ARQUIVO_URLS_ANTERIORES, JSON.stringify([...geradas].sort(), null, 2));
  // O cliente do Supabase deixa um timer de renovação de sessão vivo.
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
