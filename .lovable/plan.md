
# Página /diagnostico — Captação de médicos e clínicas

Landing minimalista, exclusiva para médicos/donos de clínica, contendo APENAS a seção mostrada no print (formulário à esquerda + headline/stats à direita), com copy adaptada ao nicho médico e rastreamento equivalente ao do webinar.

## Conteúdo / Copy

**Headline (direita):**
"Sua Clínica em Destaque no Claude, ChatGPT, Perplexity e Google."

**Subheadline:**
"Domine as primeiras posições quando um paciente pesquisa pelo seu tipo de atendimento — no Google e nas principais IAs (Claude, ChatGPT, Perplexity) — e seja encontrado na hora que ele mais precisa."

**Card do formulário (esquerda):**
- Título: "Diagnóstico Gratuito de SEO para Clínicas"
- Subtítulo: "Receba uma análise do site da sua clínica e um plano para aparecer nas respostas da IA e no topo do Google."
- Campos: Nome, Site da clínica, Especialidade (select: Estética, Odontologia, Psiquiatria, Ortopedia, Dermatologia, Ginecologia, Pediatria, Cardiologia, Outro), WhatsApp.
- Botão: "QUERO MEU DIAGNÓSTICO"

**Stats (mantém estética do print, copy ajustada ao nicho):**
- +9 anos · de experiência em SEO e tráfego
- +3.000 · projetos de SEO entregues
- +40 · clientes ativos (clínicas e marcas)
- Faixa inferior: "+R$ 150 milhões em faturamento gerado para clientes desde 2016"

A página NÃO terá Header, Footer, outras seções, FAB do WhatsApp ou banner de cookies abaixando o CTA — apenas a dobra única, como solicitado.

## Tracking (igual /webinar-medico)

Usar o mesmo `webinarTracker` (`src/lib/webinarTracker.ts`) já existente:
- `webinarTracker.init()` no mount
- Rastreamento de `scroll_depth_pct` e `total_time_on_page_seconds`
- Evento `cta_click` ao focar/clicar no formulário
- Evento `signup_submit` + `patchMetrics({ reached_thank_you: true })` no envio bem-sucedido
- `flush(true)` no unmount

Submissão: envia para WhatsApp (`5511989151997`) com mensagem formatada (mesmo padrão do `LeadGenerationSection`), e também grava em uma tabela de leads se desejado — **vou usar apenas WhatsApp + tracking** para manter escopo mínimo. (Se quiser persistir lead no banco, me diga e adiciono.)

## Arquivos

**Novos:**
- `src/pages/Diagnostico.tsx` — página completa (hero único, dark theme igual ao print, formulário + stats, integração com `webinarTracker`).

**Editados:**
- `src/App.tsx` — adicionar rota `/diagnostico` → `Diagnostico`.
- `src/components/ui/whatsapp-fab.tsx` — esconder FAB em `/diagnostico` (igual `/webinar-medico`).
- `src/components/ui/CookieBanner.tsx` — esconder banner em `/diagnostico` para não poluir a dobra única.
- `public/sitemap.xml` — adicionar entrada (página é pública mas exclusiva de divulgação paga; mantenho `noindex` via `SEOHead` e **não** adiciono ao sitemap, para evitar indexação indesejada).

## Estilo

Reproduzir fielmente o visual do print: fundo `bg-slate-900` com blobs purple/blue desfocados, card do formulário `bg-white/10 backdrop-blur`, inputs translúcidos, botão verde, cards de stats com bordas sutis. Reaproveitar os mesmos tokens/cores usados em `LeadGenerationSection`.

## SEO

`<SEOHead noindex title="Diagnóstico SEO para Clínicas | MK" />` — página de campanha, não deve aparecer no Google orgânico.
