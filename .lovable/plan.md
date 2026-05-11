## Sistema de Analytics First-Party (rastreamento próprio)

Vamos generalizar o padrão já usado no webinar (`webinar_sessions` + `webinar_events` + edge function + tracker no client) para o site inteiro, mantendo tudo no banco do projeto. Sem cookies de terceiros, sem Google Analytics — só dados do nosso servidor.

### O que vamos medir

**Visitas / sessões**
- Pageviews por rota (qual página é mais visitada).
- Sessões únicas (cookie/localStorage `mk_visitor_id` + `mk_session_id` com expiração de 30 min de inatividade).
- Tempo na página, scroll depth, dispositivo, navegador, OS, idioma, país (via header `cf-ipcountry`).
- Origem: referrer + UTMs (`utm_source/medium/campaign/term/content`) + `landing_page`.
- Classificação automática de canal: `organic` / `direct` / `referral` / `paid` / `social` / `email`.

**Eventos**
- `pageview` automático (incluindo SPA route changes via React Router).
- `click_whatsapp` (FAB e qualquer link `wa.me`).
- `click_cta` com label do botão (Comprar Backlinks, Consultoria, etc.).
- `click_outbound` (links externos).
- `signup_started` / `signup_completed` (já amarra com `profiles.signup_source`).
- `lead_submitted` (formulários de contato e backlinks gratuitos).
- `add_to_cart`, `checkout_started`, `order_created`.
- `scroll_75`, `scroll_90` (engajamento).

**Timeline do lead**
- Quando um visitante se cadastra, gravamos seu `user_id` na sessão atual.
- Permite reconstruir cronologicamente: páginas visitadas, cliques, formulários, pedidos.

### Schema do banco

```sql
-- Visitante recorrente (atravessa sessões)
CREATE TABLE analytics_visitors (
  visitor_id text PRIMARY KEY,
  first_seen_at timestamptz DEFAULT now(),
  last_seen_at timestamptz DEFAULT now(),
  user_id uuid,                 -- preenchido após login/signup
  first_referrer text,
  first_landing_path text,
  first_utm_source text,
  first_utm_medium text,
  first_utm_campaign text,
  first_channel text,            -- organic/direct/paid/...
  total_sessions int DEFAULT 1,
  total_pageviews int DEFAULT 0
);

-- Sessão (uma "visita")
CREATE TABLE analytics_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text UNIQUE NOT NULL,
  visitor_id text NOT NULL,
  user_id uuid,
  started_at timestamptz DEFAULT now(),
  last_seen_at timestamptz DEFAULT now(),
  duration_seconds int DEFAULT 0,
  pageview_count int DEFAULT 0,
  event_count int DEFAULT 0,
  landing_path text,
  exit_path text,
  referrer text,
  referrer_host text,
  channel text,                  -- organic/direct/paid/referral/social/email
  utm_source text, utm_medium text, utm_campaign text,
  utm_term text, utm_content text,
  device_type text, os text, browser text, language text,
  screen_size text, viewport_size text,
  ip_country text, ip_city text, timezone text,
  user_agent text,
  -- flags úteis
  signed_up boolean DEFAULT false,
  clicked_whatsapp boolean DEFAULT false,
  created_order boolean DEFAULT false
);

-- Pageview (um por rota)
CREATE TABLE analytics_pageviews (
  id bigserial PRIMARY KEY,
  session_id text NOT NULL,
  visitor_id text NOT NULL,
  user_id uuid,
  path text NOT NULL,
  title text,
  referrer text,
  duration_seconds int,
  scroll_depth_pct int,
  created_at timestamptz DEFAULT now()
);

-- Evento genérico (cliques, conversões, etc.)
CREATE TABLE analytics_events (
  id bigserial PRIMARY KEY,
  session_id text NOT NULL,
  visitor_id text NOT NULL,
  user_id uuid,
  path text,
  event_type text NOT NULL,      -- click_whatsapp, click_cta, signup_completed...
  event_label text,              -- ex: "hero_cta", "+5511..."
  event_data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Índices
CREATE INDEX ON analytics_pageviews (path, created_at DESC);
CREATE INDEX ON analytics_pageviews (session_id);
CREATE INDEX ON analytics_pageviews (user_id, created_at DESC);
CREATE INDEX ON analytics_events (event_type, created_at DESC);
CREATE INDEX ON analytics_events (user_id, created_at DESC);
CREATE INDEX ON analytics_sessions (started_at DESC);
CREATE INDEX ON analytics_sessions (channel, started_at DESC);
CREATE INDEX ON analytics_sessions (user_id);
```

**RLS**: tudo bloqueado por padrão. SELECT só para admins (`has_role(auth.uid(),'admin')`). INSERT/UPDATE só pela edge function (service role) — clients NÃO escrevem direto.

### Tracker no client (`src/lib/analytics.ts`)

Reaproveita o padrão do `webinarTracker`:
- `visitor_id` em `localStorage` (sem expiração).
- `session_id` em `sessionStorage` + timestamp de última atividade; nova sessão se inativo > 30 min.
- Buffer + flush a cada 5s, em `visibilitychange`/`pagehide`/`beforeunload` usa `navigator.sendBeacon`.
- Listener global de cliques (`document.addEventListener("click", ...)`) que detecta:
  - `a[href*="wa.me"]` → `click_whatsapp`
  - `a[href^="http"]` externo → `click_outbound`
  - `[data-track]` → `click_cta` com `data-track` como label.
- Hook `useAnalytics()` plugado no `<App>` para disparar pageview a cada mudança de rota (`useLocation`).
- Quando o usuário loga, chamamos `analytics.identify(user_id)` para amarrar à sessão e ao visitor.

### Edge function `track`

`supabase/functions/track/index.ts` (sem JWT, CORS aberto, anon-friendly):
- Aceita `{ session_id, visitor_id, session_init?, pageviews?, events?, identify? }`.
- Faz upsert em `analytics_visitors` (incrementa contadores, define `first_*` apenas na criação).
- Upsert em `analytics_sessions` (cria com init na primeira vez, depois só atualiza `last_seen_at`, contadores e flags).
- Insere arrays em `analytics_pageviews` e `analytics_events` em lote.
- Calcula `channel` a partir de `referrer + utm_*`:
  - `utm_medium=cpc/paid/...` → paid
  - `referrer` Google/Bing/DuckDuckGo sem UTM paid → organic
  - `referrer` Instagram/Facebook/LinkedIn → social
  - `referrer` vazio + sem UTM → direct
  - resto → referral
- Validação com Zod, limites (máx 50 eventos por payload), trunca strings longas, captura IP country via header.

### Painel admin (`/admin/analytics`)

Nova rota e item no sidebar do AdminLayout. Tabs:

1. **Visão geral** (filtro por período: 7d / 30d / 90d / custom)
   - KPIs: visitantes únicos, sessões, pageviews, taxa de conversão (signup/sessões), cliques no WhatsApp, pedidos.
   - Gráfico de linha: sessões/dia, separado por canal.
   - Pizza: distribuição por canal (organic vs direct vs paid vs social vs referral).

2. **Páginas**
   - Top páginas por pageviews.
   - Páginas que mais geraram **cadastros** (joinando com `analytics_events.event_type='signup_completed'`).
   - Páginas que mais geraram **cliques no WhatsApp**.
   - Tempo médio na página, scroll médio.

3. **Origens**
   - Tabela: referrer host, sessões, conversões, taxa.
   - Tabela: UTMs (campanhas pagas).
   - Top palavras-chave de busca orgânica (referrer Google/Bing).

4. **Leads** (timeline)
   - Lista de leads recentes (de `profiles`) com "ver jornada".
   - Modal com timeline cronológica: páginas visitadas → cliques → formulários → pedidos. Lê `analytics_pageviews` + `analytics_events` filtrando por `user_id` ou `visitor_id`.

5. **Tempo real** (opcional, simples)
   - Sessões ativas nos últimos 5 min (`last_seen_at > now()-interval '5 min'`).
   - Páginas sendo vistas agora.

### Integração com o resto do app

- `src/pages/Auth.tsx`: ao concluir signup, chamar `analytics.track("signup_completed")` e `analytics.identify(user_id)`. Já estamos gravando `signup_source` em `profiles`.
- `src/components/ui/whatsapp-fab.tsx`: adicionar `data-track="whatsapp_fab"`.
- CTAs principais (`HeroSection`, `PricingSection`, etc.): adicionar `data-track="hero_cta"`, etc.
- `CartContext`: disparar `add_to_cart`, `checkout_started`.
- `OrdersList`/checkout: disparar `order_created`.

### Privacidade / LGPD

- Banner de cookies já existe — adicionar lógica para só enviar tracking se `mk_cookie_consent === "accepted"`. Caso contrário, gravamos só pageview anônimo sem `visitor_id` persistente (modo "do not track").
- Não armazenamos IP — só país.
- Documentar na Política de Cookies que usamos analytics first-party próprio.

### Arquivos a criar / editar

**Criar**
- `supabase/functions/track/index.ts` — edge function.
- `src/lib/analytics.ts` — tracker singleton.
- `src/hooks/useAnalytics.ts` — hook de pageview + click listener.
- `src/pages/admin/AdminAnalytics.tsx` — painel.
- `src/components/admin/analytics/OverviewTab.tsx`
- `src/components/admin/analytics/PagesTab.tsx`
- `src/components/admin/analytics/SourcesTab.tsx`
- `src/components/admin/analytics/LeadsTimelineTab.tsx`
- `src/components/admin/analytics/RealtimeTab.tsx`
- Migration SQL.

**Editar**
- `src/App.tsx` — montar `useAnalytics()` global.
- `src/layouts/AdminLayout.tsx` — adicionar item "Analytics" no sidebar.
- `src/components/ui/CookieBanner.tsx` — disparar consent para o tracker.
- `src/components/ui/whatsapp-fab.tsx`, CTAs principais — adicionar `data-track`.
- `src/pages/Auth.tsx` — chamar `analytics.identify()` e `track("signup_completed")` no signup.

### Notas técnicas
- Volume esperado é baixo, mas adicionamos índices em `path`, `event_type`, `created_at`, `user_id`, `session_id`. Se crescer muito, podemos rodar agregações diárias num cron + tabela `analytics_daily_rollup`.
- A edge function NÃO usa JWT (visitantes anônimos precisam mandar dados). Validação rigorosa de tamanho/tipos para evitar abuse. Rate limit simples por `visitor_id` se necessário (futuro).
- O painel usa `supabase.from(...).select()` direto com RLS de admin — sem precisar de outra edge function para leitura.