---
last_validated: 2026-08-28
review_by: 2026-11-28
covers: [src/App.tsx, src/contexts/**, src/hooks/**, src/integrations/supabase/**, src/lib/**, supabase/functions/**, supabase/config.toml, index.html]
---

# Arquitetura

## Visão

Aplicação de página única (React + Vite) servida como site estático, falando **direto** com o Supabase pelo navegador. Não existe backend próprio: o que precisa de segredo ou de privilégio roda como edge function no Supabase (Deno). O banco é Postgres, e a proteção dos dados é RLS — não há camada de API intermediária para checar permissão.

Quatro produtos convivem no mesmo app:

1. **Marketplace de backlinks** — em duas modalidades: compra **avulsa** (vitrine, carrinho, o cliente escolhe site a site) e compra por **pacote** (volume fechado, sem escolher sites, com checkout próprio). O pagamento é PIX combinado por fora nas duas.
2. **Consultoria de SEO** — área do cliente com palavras-chave, páginas, tarefas e relatórios.
3. **Blog e páginas de conteúdo SEO** — conteúdo editado no admin, servido nas rotas públicas.
4. **Captação de leads** — webinar, aula, diagnóstico e formulário de contato, com rastreamento próprio.

Tudo é operado por um painel administrativo em `/admin`, protegido por papel.

## Fluxo principal — da vitrine ao pedido

1. Visitante abre `/comprar-backlinks`. `useBacklinksQuery` lê a view **`backlinks_public`** (só linhas com `status = 'ativo'`, e sem as colunas internas da tabela `backlinks`).
2. Ele adiciona sites ao carrinho. O carrinho vive em `CartContext` e é gravado no `localStorage` (`mkart_cart`) — sobrevive a recarregar a página, some se trocar de navegador.
3. Ao finalizar (`CartModal`), o app exige sessão. Sem login, redireciona para `/auth` e volta.
4. Cria a linha em `orders_new` (`status: aguardando_pagamento`, `payment_method: pix_whatsapp`) e as linhas em `order_items_new` (`item_status: pendente`).
5. Dispara duas edge functions em paralelo, **ambas sem travar o pedido se falharem**: `send-payment-email` (dados do PIX para o cliente) e `notify-admin` (aviso interno).
6. Carrinho é limpo e o cliente vai para `/continuar-comprando`.
7. **Daqui em diante é manual**: alguém confere o PIX e muda o status do pedido em `/admin` (raiz do admin = tela de pedidos). A mudança de status dispara `send-order-status-email`.

O passo 7 é a fronteira mais importante do sistema: **nenhum código confirma pagamento**. Não existe webhook de gateway.

## Fluxo alternativo — compra de pacote

Caminho separado, que **não** compartilha carrinho, tabela de itens escolhidos nem exigência de login com o fluxo acima:

1. Os cards de pacote aparecem em `/comprar-backlinks` e em todas as páginas de categoria (`PackageCards`), e levam a `/pacote-backlinks/:slug`.
2. A página coleta contato, site de destino e as URLs/âncoras — ou o opcional "a MK escolhe as âncoras". A chave PIX fica visível na tela desde o começo.
3. Ela chama a edge function **`send-package-order`**, que **recalcula o total no servidor** a partir da própria cópia do catálogo. Preço adulterado no navegador é ignorado.
4. A function **não grava nada**: monta um e-mail com o pedido inteiro e manda para `contato@mkart.com.br`, com `replyTo` do cliente.
5. A página troca para a tela de confirmação, repetindo a chave PIX e o botão de mandar o comprovante no WhatsApp.

**Este fluxo não passa pelo banco nem pelo `/admin`.** O pedido de pacote existe apenas no e-mail — decisão consciente para colocar a modalidade no ar rápido (ADR-006). Consequência direta: **se o e-mail não sair, o pedido se perde**, e é por isso que a página só mostra sucesso quando a function responde 200.

## Fronteiras

| Peça | Responsabilidade | Não é responsável por |
|---|---|---|
| React (`src/`) | telas, carrinho, chamadas ao Supabase | autorização — só esconde botão |
| RLS no Postgres | quem lê e escreve o quê | validar regra de negócio complexa |
| Edge functions | o que precisa de `service_role` ou de chave de terceiro | lógica de tela |
| `RequireRole` | esconder `/admin` de quem não é admin | impedir acesso à API |
| Painel do Supabase | segredos, migrations aplicadas | versionar decisão (isso é `docs/`) |
| Supabase Storage | arquivos de blog e vídeos de campanha | esconder arquivo — os dois buckets são de leitura pública |

## Autorização em duas camadas

- **Camada de tela:** `RequireRole` (`src/components/auth/RequireRole.tsx`) chama `has_role` via RPC e manda para `/403` quem não for admin.
- **Camada real:** policies de RLS. Ver `docs/MODELO-DE-DADOS.md`.

Só a segunda protege dado. A primeira melhora a experiência.

## Edge functions

| Função | Para quê | JWT |
|---|---|---|
| `track` | recebe o rastreamento first-party do site e grava em `analytics_*` | público |
| `webinar-track` | mesmo, para as páginas de webinar/aula/diagnóstico | público |
| `send-payment-email` | dados do PIX após o pedido | público |
| `send-order-status-email` | avisa o cliente quando o status muda | público |
| `send-activation-email`, `send-reset-password-email` | e-mails de conta | público |
| `send-contact-email`, `send-guest-post-list`, `notify-admin` | contato, lista de sites, aviso interno | público |
| `publish-scheduled-posts` | publica posts agendados do blog | público |
| `generate-sitemap` | monta sitemap a partir de `posts` e `page_seo_content` | público |
| `seo-health-check` | verificação de saúde de SEO, protegida por `SEO_HEALTH_SECRET` | público |
| `serpbot-proxy` | consulta posição de palavra-chave e grava snapshots | público |
| `categorize-backlinks` | classifica sites importados por categoria | público |
| `send-package-order` | envia por e-mail o pedido de pacote, recalculando o total no servidor | público |
| `get-pii-data` | devolve dado pessoal do pedido; usada por `/recibo/:orderId` e por `/admin` | exige JWT |

"Público" aqui é `verify_jwt = false` em `supabase/config.toml`: qualquer um na internet pode chamar. Cada uma valida a entrada por conta própria. Função nova que mexe em dado sensível deve exigir JWT.

## Integrações externas

| Serviço | Para quê | Onde está o código | Como falha |
|---|---|---|---|
| Supabase | banco, auth, functions | `src/integrations/supabase/`, `supabase/` | site abre, mas nenhuma lista carrega e login não funciona |
| Resend | todos os e-mails transacionais | `supabase/functions/send-*`, `notify-admin` | **em silêncio**: o pedido é criado normalmente e o cliente não recebe o PIX. Só aparece no log da função |
| SerpBot | posição de palavra-chave | `supabase/functions/serpbot-proxy` | ranking fica desatualizado; o painel mostra o último snapshot sem avisar que envelheceu |
| OpenAI / Gemini / Firecrawl | categorização e apoio de conteúdo | `categorize-backlinks`, `seo-health-check` | recurso de importação/análise para; o resto do site segue |
| WhatsApp (link) | destino dos leads de campanha | `LeadGenerationSection`, `src/pages/Diagnostico.tsx` | link abre em página quebrada; **o lead se perde**, pois parte das campanhas não grava no banco |
| GTM, Meta Pixel, Smartlook | marketing e gravação de sessão | `index.html` | nada quebra; só some a métrica |

## Publicação

O código é editado em duas frentes — este repositório e o **Lovable**, que commita direto na branch. A publicação sai do Lovable. Em `public/` convivem `netlify.toml`, `vercel.json` e `_redirects`, resíduos de tentativas de hospedagem anteriores: não são a rota atual de deploy.
