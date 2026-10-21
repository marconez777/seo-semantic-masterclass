// Gera ops/nginx/ a partir de scripts/site.mjs, rotas.mjs e redirects.mjs.
// Uso: npm run nginx:gerar  (e commit). O build falha se ops/nginx/ estiver diferente
// do que este script geraria agora — rota só-app ou redirect novo não fica esquecido.
// Instalar na VPS é outro passo: ops/instalar-nginx.sh.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import * as config from "./site.mjs";
import { ROTAS_SO_APP } from "./rotas.mjs";
import { REDIRECTS } from "./redirects.mjs";

const AVISO = "# GERADO por scripts/gerar-nginx.mjs. Não edite: mude scripts/site.mjs, rotas.mjs ou\n# redirects.mjs e rode `npm run nginx:gerar`.\n";

const escaparRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// Regex entre aspas no Nginx: chave e ponto e vírgula deixam de ser sintaxe.
const aspas = (s) => `"${s.replace(/"/g, '\\"')}"`;

// Opcionais, para projeto que já tinha Nginx instalado antes da skill (site.mjs antigo
// não os exporta): GRUPO_PRINCIPAL dá nome aos arquivos do domínio principal, e
// NGINX_EXTRA entra nas regras antes do `location /` (ex.: uma pasta servida fora do build).
const { SITE, MODO, SLUG, WWW, DOMINIO_TESTE, API } = config;
const GRUPO_PRINCIPAL = config.GRUPO_PRINCIPAL ?? "principal";
const NGINX_EXTRA = (config.NGINX_EXTRA ?? "").trim();

export function arquivosDoNginx() {
  const host = new URL(SITE).host;
  const base = `/var/www/${SLUG}`;
  const robots = `$${SLUG.replace(/[^a-zA-Z0-9]/g, "_")}_robots`;
  const snippet = `snippets/${SLUG}-regras.conf`;
  const acme = `    location ^~ /.well-known/acme-challenge/ {\n        root ${base}/acme;\n    }\n`;
  const ssl = (cert) =>
    `    ssl_certificate /etc/letsencrypt/live/${cert}/fullchain.pem;\n` +
    `    ssl_certificate_key /etc/letsencrypt/live/${cert}/privkey.pem;\n` +
    `    include /etc/letsencrypt/options-ssl-nginx.conf;\n` +
    `    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;\n`;
  const ouvir80 = "    listen 80;\n    listen [::]:80;\n";
  const ouvir443 = "    listen 443 ssl http2;\n    listen [::]:443 ssl http2;\n";
  // MODO "app": o domínio principal também sai com noindex — não há nada para o Google.
  const robotsPrincipal = MODO === "app" ? "noindex, nofollow" : "";
  const site = (valorRobots) => `    set ${robots} "${valorRobots}";\n    include ${snippet};\n`;

  const redirects = Object.entries(REDIRECTS)
    .map(([de, para]) => `rewrite ${aspas(`^${escaparRegex(de.replace(/\/+$/, ""))}/?$`)} ${para} permanent;`)
    .join("\n");
  // O PCRE do Nginx não precisa da barra escapada que o JavaScript põe em r.source.
  const soApp = ROTAS_SO_APP.map((r) => `(?:${r.source.replace(/\\\//g, "/")})`).join("|");

  const arquivos = {};

  arquivos["ops/nginx/regras.conf"] = `${AVISO}
# Regras do site estático. Instalado como ${snippet} e incluído pelos blocos
# server dos outros arquivos desta pasta (ops/instalar-nginx.sh).
# Quem inclui define ${robots}: vazio no domínio principal (o Nginx não envia
# cabeçalho de valor vazio), "noindex, nofollow" no endereço de teste.
# As mesmas regras estão em scripts/servir-dist.mjs (npm run preview:ssg).

# \`atual\` é um link para a pasta do último build que passou (ops/publicar.sh) —
# a troca é atômica, e um build que falha no meio nunca chega a ser servido.
root ${base}/atual;

charset utf-8;
gzip on;
gzip_types text/css text/javascript application/javascript application/json application/xml image/svg+xml;

# Endereços antigos com página equivalente: 301 direto para ela, com ou sem barra no
# fim. Ficam antes da regra da barra para o visitante dar um salto só.
${redirects || "# (nenhum)"}

# O canonical de toda página é sem barra no fim.
rewrite ^/(.+)/$ /$1 permanent;

# add_header não é herdado por um location que declara o seu: por isso o
# X-Robots-Tag e o nosniff (um .js respondido como HTML não roda) aparecem repetidos em cada um.
${
  soApp
    ? `
# Rotas só-app: recebem o shell vazio (com noindex) e o React monta no navegador.
location ~ ${aspas(soApp)} {
    add_header Cache-Control "no-cache";
    add_header X-Robots-Tag ${robots} always;
    add_header X-Content-Type-Options nosniff always;
    try_files /spa.html =404;
}
`
    : ""
}
# Nome de arquivo com hash do conteúdo: pode ficar em cache para sempre.
location /assets/ {
    add_header Cache-Control "public, max-age=31536000, immutable";
    add_header X-Robots-Tag ${robots} always;
    add_header X-Content-Type-Options nosniff always;
    try_files $uri =404;
}

${NGINX_EXTRA ? `${NGINX_EXTRA}\n\n` : ""}# Uma URL só responde 200 se existir um arquivo gerado para ela. Path desconhecido é
# 404 de verdade — o shell respondendo 200 para qualquer endereço é "soft 404" para o
# Google e porta de entrada de spam.
location / {
    add_header Cache-Control "no-cache";
    add_header X-Robots-Tag ${robots} always;
    add_header X-Content-Type-Options nosniff always;
    try_files $uri $uri/index.html =404;
}

error_page 404 /404.html;
location = /404.html {
    internal;
    add_header X-Robots-Tag ${robots} always;
    add_header X-Content-Type-Options nosniff always;
}
`;

  const www = WWW ? `www.${host}` : null;

  arquivos[`ops/nginx/${GRUPO_PRINCIPAL}.http.conf`] = `${AVISO}
# Domínio principal ANTES de existir certificado: serve por HTTP, o suficiente para o
# certbot validar. O ops/instalar-nginx.sh troca pela variante https quando o
# certificado existe.

server {
${ouvir80}    server_name ${host};

${acme}
${site(robotsPrincipal)}}
${
  www
    ? `
server {
${ouvir80}    server_name ${www};

${acme}
    # O canonical de toda página é sem www.
    location / {
        return 301 http://${host}$request_uri;
    }
}
`
    : ""
}`;

  arquivos[`ops/nginx/${GRUPO_PRINCIPAL}.https.conf`] = `${AVISO}
# Domínio principal com certificado (emitido por webroot; o certbot não edita este
# arquivo). A renovação chega por HTTP na pasta acme.

server {
${ouvir80}    server_name ${[host, www].filter(Boolean).join(" ")};

${acme}
    location / {
        return 301 https://${host}$request_uri;
    }
}
${
  www
    ? `
server {
${ouvir443}    server_name ${www};

${ssl(host)}
    # O canonical de toda página é sem www.
    return 301 https://${host}$request_uri;
}
`
    : ""
}
server {
${ouvir443}    server_name ${host};

${ssl(host)}
${site(robotsPrincipal)}}
`;

  if (DOMINIO_TESTE) {
    arquivos["ops/nginx/teste.http.conf"] = `${AVISO}
# Endereço de teste ANTES de existir certificado. Mesmo conteúdo do domínio principal,
# sempre com noindex: sem ele o Google indexaria as duas cópias.

server {
${ouvir80}    server_name ${DOMINIO_TESTE};

${acme}
${site("noindex, nofollow")}}
`;
    arquivos["ops/nginx/teste.https.conf"] = `${AVISO}
# Endereço de teste com certificado. Mesmo conteúdo do domínio principal, sempre com
# noindex: sem ele o Google indexaria as duas cópias.

server {
${ouvir80}    server_name ${DOMINIO_TESTE};

${acme}
    location / {
        return 301 https://${DOMINIO_TESTE}$request_uri;
    }
}

server {
${ouvir443}    server_name ${DOMINIO_TESTE};

${ssl(DOMINIO_TESTE)}
${site("noindex, nofollow")}}
`;
  }

  if (API) {
    const proxy = (extra = "", timeout = "120s") =>
      `        proxy_pass http://127.0.0.1:${API.porta};\n` +
      `        proxy_http_version 1.1;\n` +
      `        proxy_set_header Host $host;\n` +
      `        proxy_set_header X-Real-IP $remote_addr;\n` +
      `        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n` +
      `        proxy_set_header X-Forwarded-Proto $scheme;\n${extra}` +
      `        proxy_read_timeout ${timeout};\n`;
    const rotasDaApi = `
    # Envio de imagens pelo admin.
    client_max_body_size 50m;

    # Só as rotas de API saem para a internet. O Studio (painel do banco, na raiz do
    # gateway) e o pg-meta ficam de fora de propósito: abrem só por túnel SSH para
    # 127.0.0.1:${API.porta}.
    location ~ ^/(rest|auth|storage|functions|graphql)/v1(/|$) {
${proxy()}    }

    location ~ ^/realtime/v1(/|$) {
${proxy('        proxy_set_header Upgrade $http_upgrade;\n        proxy_set_header Connection "upgrade";\n', "300s")}    }

    location / {
        return 404;
    }
`;
    arquivos["ops/nginx/api.http.conf"] = `${AVISO}
# API do Supabase auto-hospedado ANTES de existir certificado.

server {
${ouvir80}    server_name ${API.dominio};

${acme}${rotasDaApi}}
`;
    arquivos["ops/nginx/api.https.conf"] = `${AVISO}
# API do Supabase auto-hospedado (gateway em 127.0.0.1:${API.porta}). É o endereço que vai
# no VITE_SUPABASE_URL do site.

server {
${ouvir80}    server_name ${API.dominio};

${acme}
    location / {
        return 301 https://${API.dominio}$request_uri;
    }
}

server {
${ouvir443}    server_name ${API.dominio};

${ssl(API.dominio)}${rotasDaApi}}
`;
  }

  // Lido pelo ops/instalar-nginx.sh: o que instalar e qual certificado procurar.
  const grupos = [`${GRUPO_PRINCIPAL}:${host}`, DOMINIO_TESTE && `teste:${DOMINIO_TESTE}`, API && `api:${API.dominio}`];
  arquivos["ops/nginx/hosts.env"] = `${AVISO}SLUG=${SLUG}
BASE=${base}
GRUPOS="${grupos.filter(Boolean).join(" ")}"
CERTIFICADO_PRINCIPAL="-d ${host}${www ? ` -d ${www}` : ""}"
`;

  return arquivos;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const gerados = arquivosDoNginx();
  fs.mkdirSync("ops/nginx", { recursive: true });
  for (const antigo of fs.readdirSync("ops/nginx")) {
    if (!gerados[`ops/nginx/${antigo}`]) console.log(`ops/nginx/${antigo} não é gerado: confira se ainda é usado`);
  }
  for (const [arquivo, conteudo] of Object.entries(gerados)) {
    const antes = fs.existsSync(arquivo) ? fs.readFileSync(arquivo, "utf8") : null;
    fs.writeFileSync(arquivo, conteudo);
    console.log(`${antes === conteudo ? "igual   " : antes === null ? "criado  " : "mudou   "} ${arquivo}`);
  }
}
