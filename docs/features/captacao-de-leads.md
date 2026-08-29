---
last_validated: 2026-08-28
review_by: 2026-11-28
covers: [src/pages/WebinarMedico.tsx, src/pages/AulaMedico.tsx, src/pages/WebinarObrigado.tsx, src/pages/Diagnostico.tsx, src/pages/Contact.tsx, src/components/webinar/**, src/components/sections/LeadGenerationSection.tsx, src/components/sections/NewsletterSection.tsx, src/pages/admin/AdminLeads.tsx, src/pages/admin/AdminContatos.tsx, src/pages/admin/AdminWebinar.tsx, src/pages/admin/AdminAula.tsx, supabase/functions/send-contact-email/index.ts, supabase/functions/send-guest-post-list/index.ts, supabase/functions/notify-admin/index.ts]
---

# Captação de leads

**Estado:** em produção.

## O que faz

Quatro portas de entrada para quem ainda não é cliente:

1. **Webinar médico** (`/webinar-medico`) — página longa de inscrição, com vídeo de apresentação e página de obrigado. **É a única das quatro que grava o lead no banco.**
2. **Aula médico** (`/aula-medico`) — landing que convida para um **grupo de WhatsApp**. Não tem vídeo, não tem formulário e **não grava nada no banco**: mede só comportamento.
3. **Diagnóstico** (`/diagnostico`) — dobra única para clínicas, com formulário curto. Página de campanha paga, `noindex`.
4. **Formulário de contato e pedido da lista de sites** — nas páginas institucionais e no marketplace.

## Fluxo

- **Webinar:** `WebinarSignupModal` grava em `webinar_signups` (nome, e-mail, WhatsApp, especialidade, faturamento, origem) e amarra ao `session_id` do rastreador. Comportamento na página (rolagem, tempo, cliques em CTA, chegada na página de obrigado) vai para `webinar_events` via `webinarTracker`.
  O `LockedVideoPlayer` **não é um muro de cadastro**: o vídeo toca livremente ao abrir a página. O "locked" é anti-adiantamento — ele bloqueia arrastar a barra e as teclas de avanço, e registra até onde a pessoa assistiu, em que velocidade e se tirou do mudo.
- **Aula:** `/aula-medico` não usa o `webinarTracker` e sim o `analytics` do site (eventos `aula_view`, `aula_scroll_75`, `aula_whatsapp_click`, `aula_exit`). Todo CTA abre o grupo de WhatsApp.
- **Diagnóstico:** o lead é enviado como mensagem formatada para o **WhatsApp** e o comportamento vai para o rastreador. Confira antes de mexer se essa página grava no banco — na especificação original (`.lovable/plan.md`) ela **não** persiste o lead.
- **Lista de sites:** `LeadGenerationSection` grava em `backlink_leads` e dispara `send-guest-post-list`.
- **Contato:** `/contato` grava em `contact_submissions` e dispara `send-contact-email` + `notify-admin`.
- **Operação:** `/admin/leads` e `/admin/contatos` listam o que entrou, com status e anotações. `/admin/webinar` mostra inscrições e o funil (`WebinarMetricsTab`, `WebinarSessionDetailDrawer`). `/admin/aula` é **só métrica** — lê `analytics_pageviews` / `analytics_events` / `analytics_sessions` da página de aula e permite apagar uma sessão.

## Arquivos

| Arquivo | Papel |
|---|---|
| `src/components/webinar/WebinarSignupModal.tsx` | cadastro do webinar |
| `src/components/webinar/LockedVideoPlayer.tsx` | vídeo travado até o cadastro |
| `src/lib/webinarTracker.ts` | rastreamento das páginas de campanha |
| `src/components/sections/LeadGenerationSection.tsx` | pedido da lista de sites |
| `src/pages/Diagnostico.tsx` | dobra única para clínicas |
| `src/pages/admin/AdminWebinar.tsx` | inscrições e métricas |

## Casos de borda tratados

- Inserção anônima nas três tabelas de lead é validada por trigger no banco (`validate_webinar_signup`, `validate_backlink_lead`, `validate_contact_submission`).
- Leitura dos leads é restrita a admin.
- Páginas de campanha ficam sem Header, Footer, FAB do WhatsApp e banner de cookies, para não empurrar o CTA para fora da tela. Os dois primeiros simplesmente não são importados; os dois últimos são globais e checam a rota internamente.

## Casos conhecidos NÃO tratados

- **Duas das quatro portas não gravam lead nenhum.** `/diagnostico` só monta a mensagem e abre o WhatsApp; `/aula-medico` só abre o grupo. Se o link falhar, se a pessoa não enviar a mensagem ou se ninguém responder, o lead **se perde sem rastro** — nem o nome fica. É a maior perda silenciosa do sistema.
- **A policy de inscrição do webinar exige `source = 'webinar-medico'`.** Qualquer página nova que tente gravar em `webinar_signups` com outra origem é rejeitada pela RLS, em silêncio e sem erro visível.
- **O vídeo do webinar é público.** Está em `webinar-videos/hero.mp4`, num bucket de leitura pública, com a URL escrita direto na página. Quem tiver o link assiste sem passar pelo site.
- **Data, vagas e vídeos são fixos no código.** `WEBINAR_DATE`, `VAGAS_RESTANTES` ("03/10"), os IDs de YouTube e o link do grupo de WhatsApp estão escritos em `WebinarMedico.tsx` e `AulaMedico.tsx`. Mudar qualquer um exige alterar código e publicar de novo — não há tela de admin para isso.
- Não há deduplicação: a mesma pessoa se inscrevendo três vezes vira três linhas.
- Não há confirmação de e-mail nem verificação de WhatsApp — e-mail inventado entra normalmente.
- Formulário público sem CAPTCHA nem limite de taxa: está aberto a envio automatizado, contido só pela validação do trigger.
