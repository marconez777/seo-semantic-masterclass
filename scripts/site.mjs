// Configuração do site estático. Fonte única para o build (prerender.mjs), o servidor
// local (servir-dist.mjs), o Nginx (gerar-nginx.mjs) e a regeração automática na VPS
// (impressao-do-conteudo.mjs). Mudou aqui: `npm run nginx:gerar` e commit.

// "site": as rotas públicas viram HTML pronto (o caso normal).
// "app":  sistema atrás de login, nada para o Google. Nenhuma página é renderizada no
//         build; toda rota é só-app, o domínio inteiro sai com noindex, robots.txt com
//         Disallow e sem sitemap. Sobram o 404 de verdade e a publicação atômica.
export const MODO = "site";

// Endereço canônico: https, sem www, sem barra no fim. Vai no sitemap e na
// conferência de canonical.
export const SITE = "https://mkart.com.br";

// Nome curto do site na VPS: /var/www/<SLUG>, arquivos do Nginx e do snippet.
export const SLUG = "mkart";

// true: www.<domínio> redireciona para o domínio sem www.
export const WWW = true;

// Endereço de teste que serve o mesmo build com noindex. null para não ter.
// O mkart já estava na VPS quando virou HTML estático: sem endereço de teste.
export const DOMINIO_TESTE = null;

// Só se o Supabase do site roda na mesma VPS: { dominio: "api.exemplo.com", porta: 8101 }.
// A porta é a do gateway (Kong) do Supabase, em 127.0.0.1.
// A API (api.mkart.com.br, gateway em 127.0.0.1:8106) roda nesta VPS, mas os
// ops/nginx/api.*.conf continuam escritos à mão: têm ajustes que o gerado não tem
// (envio de 200 MB sem buffer). Por isso null aqui.
export const API = null;

// O Nginx do mkart foi instalado na virada (2026-10-20) com o grupo "site"
// (/etc/nginx/sites-available/mkart-site.conf). Trocar o nome deixaria dois server
// para mkart.com.br.
export const GRUPO_PRINCIPAL = "site";

// Templates dos e-mails do auth (ops/email/). O auth da stack busca cada um por URL ao
// mandar o e-mail. Ficam fora do build do site para mudar sem publicar o site:
// ops/supabase/aplicar-emails.sh os copia para /var/www/mkart/email.
export const NGINX_EXTRA = `
location ^~ /email/ {
    alias /var/www/mkart/email/;
    add_header Cache-Control "no-cache";
    add_header X-Robots-Tag "noindex" always;
}`;

// Fuso de quem lê o site. As datas são formatadas no fuso de quem renderiza; fixar o
// do público evita o HTML dizer "6 de outubro" e o navegador, ao hidratar, "5 de outubro".
export const FUSO = "America/Sao_Paulo";

// Onde estão os <Route path="…"> do app. O build confere que toda rota fixa tem destino.
export const ARQUIVOS_COM_ROTAS = ["src/App.tsx"];

// Conteúdo do banco que vira página. Uma linha publicada = uma URL `${prefixo}${slug}`.
// Lidas com a chave pública do .env (VITE_SUPABASE_URL + VITE_SUPABASE_PUBLISHABLE_KEY
// ou VITE_SUPABASE_ANON_KEY): a mesma permissão que o visitante tem.
//   tabela      nome da tabela
//   prefixo     "/" para /<slug>, "/blog/" para /blog/<slug>
//   colunaSlug  padrão "slug"
//   datas       colunas para o <lastmod> do sitemap, na ordem de preferência
//   filtro      igualdades: { status: "published" }
//   obrigatoria true: tabela vazia derruba o build (banco fora ou permissão alterada)
// Site sem banco: deixe a lista vazia.
export const FONTES = [
  { tabela: "posts", prefixo: "/blog/", datas: ["updated_at", "published_at"], filtro: { published: true }, obrigatoria: true },
];

// Não viram URL mas aparecem no HTML: o catálogo (tabelas e amostra da home, sem
// updated_at na view) e os textos das páginas de categoria editados no admin. O cron
// regera quando alguma linha muda.
export const VIGIAR = [
  { tabela: "backlinks_public", colunas: "*", ordem: "id" },
  { tabela: "page_seo_content", colunas: "page_slug,updated_at", ordem: "page_slug" },
];

// Texto do <Suspense fallback> e dos estados de carregamento. Se aparecer no HTML final,
// o conteúdo não chegou e o build falha.
export const TEXTOS_DE_CARREGANDO = ["Carregando", "Loading"];

// Acima disso de URLs sumindo em relação ao build anterior, o build falha. Sumiço em
// massa quase sempre é banco fora ou permissão alterada, não conteúdo despublicado.
export const TETO_DE_SUMICO = 0.1;
