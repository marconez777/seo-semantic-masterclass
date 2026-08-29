---
last_validated: 2026-08-28
review_by: 2026-11-28
covers: [supabase/migrations/**, src/integrations/supabase/types.ts]
---

# Modelo de dados

Postgres no Supabase, projeto `nxitvhrfloibpwrkskzx`. 68 migrations em `supabase/migrations/`. As migrations são o histórico e boa parte descreve tabelas que já não existem; `src/integrations/supabase/types.ts` (gerado) é o retrato do schema. Quando os dois discordam, a migration mais recente é que vale — e os tipos precisam ser regerados.

**A modalidade de pacote não tem representação no banco.** O pedido de pacote existe apenas no e-mail enviado pela edge function `send-package-order` — veja `docs/features/pacotes-de-backlinks.md` e a ADR-006.

## Marketplace

### `backlinks`
Catálogo de sites vendidos como guest post.
Colunas com semântica: `status` (só `'ativo'` aparece na vitrine), `price` (reais, não centavos — o frontend converte para centavos em `useBacklinksQuery`), `da` / `dr` / `traffic` (métricas de SEO), `tipo`, `observacoes` (nota interna).
RLS: **atenção — a tabela inteira é legível por qualquer um.** Além das policies que filtram por `status = 'ativo'`, sobrou de 2025-08-06 a policy `"Anyone can view backlinks" FOR SELECT USING (true)`, que nunca foi removida. Policies permissivas se somam (OR), então ela vence todas as outras: um visitante anônimo consegue ler `observacoes` (nota interna) e os sites inativos consultando `backlinks` direto, sem passar pela view. Escrita é só de admin. Ver `docs/GOTCHAS.md`.

### `backlinks_public` (view)
Projeção de `backlinks` com `WHERE status = 'ativo'` e só as colunas públicas. **Criada com `security_invoker = true`** — sem isso ela furaria a RLS. É o que a vitrine lê; a tabela `backlinks` só é lida pelo admin.

### `orders_new`
Um pedido, das **duas** modalidades de compra.
Colunas comuns: `user_id`, `total`, `status` (`aguardando_pagamento` → `pago` / `cancelado`), `payment_method` (sempre `pix_whatsapp` hoje), `payment_status`, `paid_at`, `notes`, `stripe_session_id` (**resíduo, nunca preenchido**).
Todo pedido aqui é da compra avulsa e tem `user_id`: não há coluna de modalidade nem de comprador sem cadastro.
RLS: o cliente logado vê e cria os pedidos dele; admin gerencia todos. **Pedido de visitante tem `user_id` nulo, então nem o próprio comprador consegue lê-lo pela API** — ele só recebe o id na resposta da edge function. Isso é proposital: nenhum INSERT foi aberto para anônimo, senão qualquer um gravaria pedido com o total que quisesse.

### `order_items_new`
Um site dentro do pedido. Colunas: `backlink_id`, `price` congelado no momento da compra, `anchor_text`, `target_url`, `item_status` (`pendente` → `publicado`), `mk_will_choose` (quando o cliente delega a escolha do texto-âncora à MK, `anchor_text` fica nulo e `target_url` recebe o site informado).
`backlink_id` é sempre preenchido: só existe item de site escolhido pelo cliente.
RLS: acesso pelo dono do pedido; admin gerencia todos.

### `favoritos`
Sites que o cliente marcou. `user_id` + `backlink_id`. RLS por dono.

## Contas e papéis

### `profiles`
`user_id` (liga a `auth.users`), `full_name`, `email`, `whatsapp`, `site`, `avatar_url`, `signup_source`, `is_admin`.
Criada automaticamente pelo trigger `handle_new_user()`.
RLS: cada um vê e edita o próprio; admin vê todos. **A policy de UPDATE impede o usuário de alterar o próprio `is_admin`.**

### `user_roles`
`user_id` + `role` (enum `app_role`: `admin` | `user`). **É a fonte da verdade sobre quem é admin** — não a coluna `profiles.is_admin`, que sobrou do modelo antigo.

## Conteúdo

### `posts`
Blog. `slug`, `title`, `excerpt`, `content` (HTML do Tiptap), `cover_image`, `category`, `tags`, `published`, `published_at`.
RLS: público lê só `published = true`; admin gerencia.
O `content` é HTML e **precisa de `sanitizeHtml` antes de renderizar**.

### `page_seo_content`
Textos de SEO por página (`page_slug`), com `meta_title`, `meta_description`, `h1_title`, `intro_text`, `main_content` e `faqs` (JSON). Alimenta as páginas de categoria e é lido por `usePageSEOContent`.

## Consultoria

Oito tabelas com o prefixo `consulting_`, todas amarradas a `consulting_clients`:
`consulting_keywords` e `consulting_keyword_snapshots` (posição ao longo do tempo), `consulting_pages` e `consulting_page_keywords`, `consulting_backlinks`, `consulting_blog_posts`, `consulting_tasks`.
Modelo de acesso: **por cliente**. O cliente enxerga só o que está ligado ao `consulting_clients` dele; admin vê tudo.

## Palavras-chave (produto separado da consultoria)

`keyword_projects` → `tracked_keywords` → `keyword_history` e `keyword_monthly_snapshots`. Alimentadas pela edge function `serpbot-proxy`. Acesso por dono do projeto.

## Leads e captação

- `backlink_leads` — pedido de lista de sites. `name`, `email`, `whatsapp`, `website`, `status`, `notes`.
- `contact_submissions` — formulário de contato. `status`, `read_at`, `notes`.
- `webinar_signups` — inscrição em webinar/aula. `nome`, `email`, `whatsapp`, `especialidade`, `faturamento`, `source`, `session_id`.

Todas aceitam INSERT de anônimo (é formulário público) com validação por trigger (`validate_backlink_lead`, `validate_contact_submission`, `validate_webinar_signup`) e **leitura restrita a admin**.

## Analytics

`analytics_visitors` → `analytics_sessions` → `analytics_pageviews` e `analytics_events`; `webinar_sessions` e `webinar_events` para as páginas de campanha.
Escrita: só pelas edge functions `track` e `webinar-track`, com `service_role`. Leitura: admin.

## Storage

Dois buckets, ambos com **leitura pública**:

- `blog` — imagens de capa e do corpo dos posts. Escrita restrita a admin.
- `webinar-videos` — vídeos das páginas de campanha (ex.: `hero.mp4`). Escrita restrita a admin.

Leitura pública aqui significa: quem tiver a URL abre o arquivo, sem login. Não coloque nada nesses buckets que dependa de estar logado para ser visto.

## Regras de acesso — a especificação

Esta seção é o que as policies têm que cumprir. É contra ela que um teste de RLS deve ser escrito.

| Quem | Enxerga | Escreve |
|---|---|---|
| Visitante (anon) | backlinks ativos (pela view), posts publicados, conteúdo SEO | só formulários de lead e eventos de analytics |
| Cliente logado | os próprios pedidos, itens, favoritos, perfil, projetos de palavra-chave e dados de consultoria do próprio cliente | os próprios pedidos, favoritos, perfil |
| Admin | tudo | tudo |

**O furo a procurar é sempre o mesmo:** cliente A enxergando pedido, lead ou dado de consultoria do cliente B. Os dois estão logados e os dois são legítimos — testar como anônimo não pega isso.

## Migrations

Vivem em `supabase/migrations/`, nomeadas com timestamp. Na prática são aplicadas pelo Lovable/painel do Supabase.

Nunca:
- Criar tabela sem `enable row level security` na mesma migration.
- Criar view sobre tabela protegida sem `WITH (security_invoker = true)`.
- Escrever policy nova usando `profiles.is_admin` — use `is_admin(auth.uid())` ou `has_role(...)`.
- Rodar `supabase db reset` contra o projeto remoto. É banco de produção com cliente pagante.

## Legado — existe nas migrations, não existe no banco

`pedidos`, `pedidos_pii`, `pedidos_pii_masked`, `order_items`, `order_receipts`, `categories`, `checkout_migration_log`. Ficaram do checkout automático anterior. A família de funções `encrypt_pii` / `decrypt_pii` / `get_*_pii_secure` e a edge function `get-pii-data` são desse mesmo período e **não têm chamador no código atual**. Não construa em cima delas sem confirmar. Ver `docs/DECISOES.md` (ADR-002).
