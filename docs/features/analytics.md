---
last_validated: 2026-08-28
review_by: 2026-11-28
covers: [src/lib/analytics.ts, src/hooks/useAnalytics.ts, src/lib/webinarTracker.ts, supabase/functions/track/index.ts, supabase/functions/webinar-track/index.ts, src/pages/admin/AdminAnalytics.tsx, src/components/admin/WebinarMetricsTab.tsx, src/components/admin/WebinarSessionDetailDrawer.tsx, index.html]
---

# Analytics próprio

**Estado:** em produção.

## O que faz

Rastreamento de visitas feito pela própria MK, sem depender de ferramenta de terceiro: quem visitou, de onde veio, quanto tempo ficou, até onde rolou a página e o que clicou. Os números aparecem em `/admin/analytics`. Existe um rastreador separado, mais detalhado, para as páginas de campanha (webinar, aula, diagnóstico).

Ferramentas de terceiros (Google Tag Manager, Meta Pixel, Smartlook) rodam em paralelo, carregadas direto no `index.html` — são independentes deste sistema.

## Fluxo

1. `AnalyticsBoot` em `src/App.tsx` chama `useAnalytics()` uma vez.
2. `src/lib/analytics.ts` mantém um `visitor_id` no `localStorage` (`mk_visitor_id`) e um `session_id` no `sessionStorage`, com **expiração por 30 minutos de inatividade**.
3. Detecta dispositivo, sistema e navegador pelo user agent; guarda referrer e parâmetros de campanha.
4. Cada troca de rota vira um pageview, com tempo na página e profundidade de rolagem. **Rotas `/admin` não são rastreadas.**
5. Eventos e pageviews ficam em buffer e são enviados em lote para a edge function `track`.
6. `track` usa `service_role` para fazer upsert em `analytics_visitors` e `analytics_sessions` e inserir em `analytics_pageviews` e `analytics_events`.
7. Ao logar, `analytics.identify()` amarra o `user_id` à sessão.

Campanhas seguem caminho paralelo: `src/lib/webinarTracker.ts` → edge function `webinar-track` → `webinar_sessions` / `webinar_events`, com métricas próprias (tempo de vídeo, rolagem, cliques em CTA, chegada na página de obrigado).

## Arquivos

| Arquivo | Papel |
|---|---|
| `src/lib/analytics.ts` | tracker do site: ids, buffer, envio |
| `src/hooks/useAnalytics.ts` | liga o tracker ao roteador e à sessão |
| `src/lib/webinarTracker.ts` | tracker das páginas de campanha |
| `supabase/functions/track/index.ts` | recebe e grava (público, sem JWT) |
| `src/pages/admin/AdminAnalytics.tsx` | painel de números |

## Casos de borda tratados

- Envio em lote com `flush` na saída da página, para não perder o último evento.
- Sessão expira por inatividade em 30 min e uma nova é criada.
- Falta de `crypto.randomUUID` tem fallback manual.
- Admin fora da amostra, para não poluir os números com o uso interno.

## Casos conhecidos NÃO tratados

- **`track` e `webinar-track` são públicas e sem autenticação**, e respondem a qualquer origem (`Access-Control-Allow-Origin: *`). Qualquer um pode enviar eventos falsos e sujar os números. Não há assinatura nem limite de taxa.
- **O painel trunca os dados em silêncio.** `AdminAnalytics` lê com `.limit(10000)` em sessões e `.limit(20000)` em pageviews e eventos. Passando disso, os totais mostrados ficam errados **sem nenhum aviso na tela** — e num site com tráfego esses tetos chegam rápido.
- Bloqueador de anúncio ou navegação sem `localStorage` faz o visitante sumir da contagem.
- Não há expurgo: `analytics_pageviews` e `analytics_events` crescem sem limite e sem retenção definida.
- Os dados deste sistema não conversam com GTM/Meta Pixel — números diferentes entre os painéis são esperados, não bug.
- Apagar uma sessão em `/admin/aula` remove as linhas de `analytics_events`, `analytics_pageviews` e `analytics_sessions` em três chamadas separadas, sem transação: uma falha no meio deixa dado órfão.
