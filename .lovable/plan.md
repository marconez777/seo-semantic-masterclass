## Nova página: Aula Grátis para Médicos

Criar uma landing page de divulgação de aula ao vivo (não webinar com inscrição), focada em capturar entradas em um grupo de WhatsApp, com o mesmo visual e padrão de rastreio da página `/webinar-medico`.

### Rota e arquivo
- Rota: `/aula-medico` (registrada em `src/App.tsx`)
- Página: `src/pages/AulaMedico.tsx`
- Reutiliza tokens de design do tema `webinar-*` já existentes (cream, navy, accent, serif-display) para manter o mesmo conceito visual.

### Conteúdo da página

Headline principal:
- "Clínica em 1° no Google e nas IAs"
- Subtítulo / tarja superior: "Aula ao vivo gratuita · Quinta-feira · 20h · Para médicos donos de clínica"

Seções (na mesma ordem visual do webinar):
1. **Hero** — headline, subheadline, CTA grande "Entrar no grupo do WhatsApp" + badge "Aula ao vivo quinta-feira 20h". Sem player de vídeo (é divulgação, não replay).
2. **O que você vai aprender** — 3-4 bullets curtos: aparecer em 1º no Google local, ser citado pelo ChatGPT/Gemini/Perplexity, atrair pacientes sem tráfego pago, estrutura de SEO + GEO para clínicas.
3. **Para quem é** — médicos donos de clínica que querem crescer organicamente (reaproveita estilo de `WebinarForWhom`).
4. **Sobre o anfitrião** — bloco do Marco Guimarães (reaproveita layout de `WebinarHost`).
5. **FAQ curto** — 3-4 perguntas: é gratuito? precisa instalar algo? vai ter gravação? como recebo o link?
6. **CTA final** — "Entre no grupo agora e receba o link da aula".
7. **Footer** — mesmo `WebinarFooter`.
8. **Sticky CTA mobile** — botão fixo "Entrar no grupo do WhatsApp".

CTA = link direto para o grupo do WhatsApp (placeholder `https://chat.whatsapp.com/SEU_GRUPO` — usuário substitui depois; deixarei comentário no código).

### Rastreio (painel admin)

Usa o sistema **first-party analytics** já existente (`src/lib/analytics.ts` + edge function `track`), que já é disparado automaticamente pelo `useAnalytics` em todas as rotas. Então:

- Pageviews em `/aula-medico` aparecem automaticamente em `/admin/analytics` (Páginas mais visitadas, Funil, Realtime).
- Eventos extras disparados via `track(eventName, props)` quando o usuário clicar em qualquer CTA do grupo de WhatsApp:
  - `aula_whatsapp_click` com `{ source: 'hero' | 'final' | 'sticky' }`
- Esses eventos já são listados nas abas "Páginas" (conversão por página) e "Leads" (timeline) do painel `AdminAnalytics`, sem precisar de mudanças no admin.

Opcional (não incluso para manter escopo enxuto): adicionar uma aba dedicada "Aula Médico" no AdminAnalytics — mas como o sistema atual já segmenta por página/evento, não é necessário.

### SEO
- `SEOHead` com título: "Aula Grátis para Médicos · Clínica em 1º no Google e nas IAs"
- Descrição: "Aula ao vivo gratuita na quinta às 20h. Aprenda a posicionar sua clínica em 1º no Google e ser indicada pelas IAs."
- Canonical: `https://mkart.com.br/aula-medico`

### Reaproveitamento de componentes
- `WebinarFooter`, `WebinarHost`, `WebinarForWhom`, `WebinarFAQ`, `WebinarStickyCTA` (passando novo texto/handler), `WebinarFinalCTA`.
- Para Hero e Learn, criar variações simplificadas inline na própria `AulaMedico.tsx` (sem vídeo, sem contador de vagas, com CTA apontando para WhatsApp).

### Arquivos a criar/editar
- **Criar**: `src/pages/AulaMedico.tsx`
- **Editar**: `src/App.tsx` (importar e registrar rota `/aula-medico`)
- **Editar**: `public/sitemap.xml` (adicionar a nova URL)

### Pontos a confirmar antes de implementar
- Link do grupo de WhatsApp (ou deixo placeholder `https://chat.whatsapp.com/...` para você colar depois?)
- Data específica da próxima aula (ex.: "Quinta 22/05") ou manter genérico "Toda quinta às 20h"?
