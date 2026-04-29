
# Tracking detalhado de leads do Webinar

Objetivo: rastrear cada visitante da página `/webinar-medico` com o máximo de informações (origem, dispositivo, comportamento de vídeo, cliques em CTA, etapas do formulário) e ligar essas informações ao lead quando ele se inscreve. Exibir tudo numa nova aba "Métricas" dentro de `AdminWebinar`.

## 1. Banco de dados (2 novas tabelas)

### `webinar_sessions` — uma linha por visitante (sessão anônima)
- `id` uuid PK
- `session_id` text UNIQUE (gerado no client, salvo em `localStorage`)
- `signup_id` uuid NULL (preenchido quando vira lead → FK lógica para `webinar_signups.id`)
- `first_seen_at`, `last_seen_at` timestamptz
- `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term` text
- `referrer`, `landing_url` text
- `user_agent`, `device_type` (mobile/tablet/desktop), `os`, `browser` text
- `screen_size`, `viewport_size`, `language`, `timezone` text
- `ip_country`, `ip_city` text (best-effort, opcional)
- Métricas de vídeo agregadas (denormalizadas para listagem rápida):
  - `video_started` bool
  - `video_watch_seconds` int (tempo real assistindo, sem contar pausa)
  - `video_max_position_seconds` int (até onde chegou)
  - `video_completion_pct` numeric
  - `video_completed` bool
  - `unmuted` bool
  - `went_fullscreen` bool
  - `max_speed` numeric
- Métricas de CTA:
  - `cta_clicks` int (total)
  - `cta_hero_clicks`, `cta_learn_clicks`, `cta_final_clicks`, `cta_sticky_clicks` int
  - `first_cta_clicked` text (qual CTA abriu o modal pela primeira vez)
- Métricas de formulário:
  - `signup_modal_opened` bool
  - `signup_step_reached` int (1..5)
  - `signup_completed` bool
  - `signup_qualified` bool
- `total_time_on_page_seconds` int
- `scroll_depth_pct` int

### `webinar_events` — log granular de eventos (auditoria/timeline)
- `id` uuid PK
- `session_id` text (não FK, indexed)
- `event_type` text (ex: `page_view`, `video_play`, `video_pause`, `video_seek_blocked`, `video_unmute`, `video_fullscreen`, `video_speed_change`, `video_progress_25/50/75/100`, `cta_click`, `signup_open`, `signup_step`, `signup_submit`, `signup_qualified`, `signup_unqualified`, `page_leave`)
- `event_data` jsonb (payload livre: posição do vídeo, qual CTA, qual step, etc.)
- `created_at` timestamptz

### RLS
- `webinar_sessions` e `webinar_events`:
  - INSERT público com `WITH CHECK (true)` (qualquer visitante pode inserir)
  - UPDATE público apenas em `webinar_sessions` pelo próprio `session_id` — para simplificar e evitar problemas, faremos upsert/update via uma **edge function** `webinar-track` (com service role) em vez de UPDATE direto do client
  - SELECT/DELETE/UPDATE só admin (`has_role(auth.uid(), 'admin')`)

### Vínculo com lead
Adicionar coluna `session_id text` em `webinar_signups` para amarrar o lead à sessão (preenchida no insert do modal).

## 2. Edge Function `webinar-track`

Endpoint único que recebe batch de eventos e atualiza a sessão de forma idempotente.

Body:
```json
{
  "session_id": "uuid",
  "session_init": { /* utm, referrer, ua, device, ... só na 1ª chamada */ },
  "events": [
    { "type": "video_play", "data": { "at": 12.3 }, "ts": 1714... },
    ...
  ],
  "metrics_patch": {
    "video_watch_seconds": 87,
    "video_max_position_seconds": 120,
    "scroll_depth_pct": 80,
    ...
  }
}
```

Comportamento:
1. UPSERT em `webinar_sessions` (cria se não existir com dados de `session_init`)
2. Sempre atualiza `last_seen_at` + faz merge de `metrics_patch` (usando `GREATEST` para campos cumulativos, OR para booleans, soma para contadores)
3. INSERT em `webinar_events` para cada evento
4. Sem JWT obrigatório (`verify_jwt = false`), com rate limiting básico por IP+session

## 3. Client-side tracker (`src/lib/webinarTracker.ts`)

Singleton que:
- Garante `session_id` em `localStorage` (`webinar_session_id`)
- Captura UTMs da URL, referrer, UA, device, viewport, timezone, language na primeira chamada
- Buffer de eventos com flush a cada 5s + no `visibilitychange` (hidden) + no `beforeunload` (usa `navigator.sendBeacon`)
- Métodos: `init()`, `track(type, data)`, `patchMetrics(patch)`, `flush()`

## 4. Instrumentação dos componentes existentes

- **`WebinarMedico.tsx`**: chama `tracker.init()` no mount; emite `page_view`; mede `total_time_on_page_seconds` e `scroll_depth_pct` (listener de scroll com throttle)
- **`LockedVideoPlayer.tsx`**: 
  - emite `video_play`, `video_pause`, `video_unmute`, `video_fullscreen`, `video_speed_change`, `video_seek_blocked`, `video_ended`
  - marcos de progresso 25/50/75/100% (uma vez cada)
  - acumula `video_watch_seconds` (intervalo entre `play` e `pause/end/leave`)
  - envia `video_max_position_seconds`, `video_completion_pct`, `unmuted`, `went_fullscreen`, `max_speed` no patch
- **`WebinarHero` / `WebinarLearn` / `WebinarFinalCTA` / `WebinarStickyCTA`**: cada `onCTAClick` agora também chama `tracker.track('cta_click', { source: 'hero'|'learn'|'final'|'sticky' })` e incrementa contador correspondente. Faremos isso via wrapper na própria `WebinarMedico.tsx` para não passar prop em todos.
- **`WebinarSignupModal`**: 
  - on open → `signup_open`
  - cada avanço de step → `signup_step` com `{ step }`
  - no submit → `signup_submit`, depois `signup_qualified` ou `signup_unqualified`
  - inclui `session_id` no insert de `webinar_signups`

## 5. Admin: nova aba "Métricas" em `AdminWebinar`

Refatorar `AdminWebinar.tsx` para usar `Tabs` com:
- **Aba "Inscrições"**: tabela atual (intacta)
- **Aba "Métricas"** (nova):
  - **Cards de visão geral** (período filtrável: 7d / 30d / tudo):
    - Visitantes únicos
    - Iniciaram vídeo (% sobre visitantes)
    - Tempo médio assistido
    - % completaram vídeo
    - Cliques em CTA (total + breakdown por origem hero/learn/final/sticky)
    - Modais abertos
    - Inscrições completas
    - Inscrições qualificadas
    - Funil de conversão: Visitou → Assistiu → Clicou CTA → Abriu modal → Completou inscrição → Qualificado (com %)
  - **Gráfico de retenção do vídeo** (linha): % de sessões ainda assistindo a cada 10% do vídeo
  - **Breakdown por dispositivo / origem UTM / referrer** (tabelinhas top 10)
  - **Tabela de sessões** (paginada, com busca):
    - Colunas: data, dispositivo, UTM source, % vídeo assistido, tempo, CTAs clicados, virou lead? (badge), nome do lead se houver
    - Click na linha → **Drawer de detalhe** com timeline de eventos da sessão (lista de `webinar_events` ordenada) + todos os campos da `webinar_sessions`
  - Botão "Exportar métricas CSV"

## 6. Privacidade

- Não armazenar IP cru — só país/cidade derivados (via header `cf-ipcountry` ou similar disponível na edge function, best-effort; se indisponível deixa null)
- Tudo é dado anônimo de comportamento até virar lead, quando ligamos via `session_id`

## Arquivos a criar/editar

**Novos:**
- Migração: tabelas `webinar_sessions`, `webinar_events`, coluna `session_id` em `webinar_signups`, RLS
- `supabase/functions/webinar-track/index.ts`
- `src/lib/webinarTracker.ts`
- `src/components/admin/WebinarMetricsTab.tsx`
- `src/components/admin/WebinarSessionDetailDrawer.tsx`

**Editados:**
- `src/pages/admin/AdminWebinar.tsx` — adicionar Tabs (Inscrições | Métricas)
- `src/pages/WebinarMedico.tsx` — init tracker, wrap CTAs
- `src/components/webinar/LockedVideoPlayer.tsx` — emitir eventos de vídeo
- `src/components/webinar/WebinarSignupModal.tsx` — emitir eventos de form + enviar `session_id` no insert
- `src/components/webinar/WebinarStickyCTA.tsx` — wrap CTA (via prop ou hook)

## Detalhes técnicos

- Edge function usa `corsHeaders` do supabase-js, `verify_jwt = false`, valida payload com Zod
- Tracker usa `navigator.sendBeacon` no unload (síncrono e confiável)
- Patches de métricas usam SQL com `GREATEST(coalesce(col,0), $new)` para campos "máx visto" e `col + $delta` para contadores
- Gráficos do admin com Recharts (já no projeto via `chart.tsx`)
