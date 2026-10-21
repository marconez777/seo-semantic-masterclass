// Fonte única de "o que é servido como" no site estático. Toda rota fixa dos
// ARQUIVOS_COM_ROTAS (scripts/site.mjs) precisa estar em uma das duas listas — o
// prerender.mjs falha se não estiver. Conteúdo do banco (FONTES) entra sozinho.
// O Nginx é gerado daqui (npm run nginx:gerar): não existe espelho para manter à mão.

const CATEGORIAS = [
  "noticias", "automoveis", "financas", "negocios", "educacao", "moda", "tecnologia",
  "turismo", "alimentacao", "pets", "esportes", "entretenimento", "marketing", "direito",
  "imoveis", "maternidade", "saude",
];

// Viram HTML pronto, um arquivo por URL. Em MODO "app" (site.mjs), fica vazia.
export const ROTAS_FIXAS = [
  "/",
  "/comprar-backlinks",
  ...CATEGORIAS.map((c) => `/comprar-backlinks-${c}`),
  "/agencia-de-backlinks",
  "/consultoria-seo",
  "/consultoria-seo-saas",
  "/contato",
  "/aula-medico",
  "/webinar-medico",
  "/diagnostico",
  "/politica-de-privacidade",
  "/politica-de-cookies",
  "/termos-de-uso",
  "/blog",
  // Pacotes de src/lib/packages.ts (BACKLINK_PACKAGES). Pacote novo entra aqui também.
  "/pacote-backlinks/basico",
  "/pacote-backlinks/medio",
  // Rota dinâmica sem link no site: só as categorias de ALLOWED_CATEGORIES em
  // src/pages/ComprarBacklinksCategoria.tsx viram página; o resto é 404.
  ...[
    "geral", "noticias", "negocios", "saude", "educacao", "tecnologia", "financas",
    "imoveis", "moda", "turismo", "alimentacao", "pets", "automotivo", "esportes",
    "entretenimento", "marketing", "direito", "maternidade",
  ].map((c) => `/comprar-backlinks-categoria/${c}`),
];

// Dependem de quem está vendo (login, token, área logada): recebem o shell vazio com
// noindex (spa.html) e o React monta no navegador.
export const ROTAS_SO_APP = [
  /^\/admin(\/.*)?$/,
  /^\/auth$/,
  /^\/painel$/,
  /^\/403$/,
  /^\/recibo\/[^/]+$/,
  /^\/pedido\/[^/]+$/, // chega com o checkout Asaas (branch feat/pacote-checkout-asaas)
  /^\/continuar-comprando$/,
  /^\/webinar-medico\/obrigado$/,
];

// Páginas que já estavam no ar sem <h1>. Criar um é mudança de conteúdo (fase de SEO,
// depois da migração); até lá o build as confere por quantidade de texto, não pelo h1.
export const ROTAS_SEM_H1 = ["/consultoria-seo", "/consultoria-seo-saas"];

// Viram HTML, mas ficam fora do sitemap: campanha paga, fora de propósito desde antes
// do HTML estático (docs/GOTCHAS.md, SEO).
export const FORA_DO_SITEMAP = ["/webinar-medico"];

export const ehSoApp = (rota) => ROTAS_SO_APP.some((r) => r.test(rota));
