

## Landing Page do Webinar Médico

### Objetivo
Criar uma landing page editorial/sóbria em rota dedicada `/webinar-medico` para captação de inscrições no webinar do Dr. Ivan / Marco Guimarães, voltada a donos de clínicas médicas.

### Stack e padrões
- React + Vite + Tailwind + shadcn (já no projeto)
- Rota nova adicionada em `src/App.tsx`, isolada do header/footer atual do site (landing standalone)
- SEO via `SEOHead` existente
- Formulário com validação Zod + persistência em nova tabela Supabase

### Design tokens (adicionar ao `index.css` e `tailwind.config.ts`)
Tokens semânticos novos, escopo da página (não conflitar com o tema atual):
- `--webinar-navy: 215 60% 10%` (#0A1628)
- `--webinar-cream: 60 33% 98%` (#FAFAF7)
- `--webinar-ink: 0 0% 10%`
- `--webinar-ink-inverse: 0 0% 96%`
- `--webinar-accent: 35 56% 59%` (âmbar #D4A15A)
- `--webinar-muted: 215 15% 45%`
- Fontes: Google Fonts `Fraunces` (serif headlines) + `Inter` (corpo), carregadas via `<link>` no `index.html`
- Classes utilitárias: `.font-serif-display`, `.bg-webinar-navy`, `.bg-webinar-cream`, `.text-webinar-accent`, `.btn-webinar-cta`

### Estrutura de arquivos
```text
src/pages/WebinarMedico.tsx              (página, monta as sections)
src/components/webinar/
  ├── WebinarHero.tsx                    (Section 1)
  ├── WebinarCaseIvan.tsx                (Section 2 — fundo navy)
  ├── WebinarLearn.tsx                   (Section 4 — 4 bullets numerados)
  ├── WebinarMoreCases.tsx               (Section 5 — 2 cards)
  ├── WebinarForWhom.tsx                 (Section 6 — comparação)
  ├── WebinarHost.tsx                    (Section 7 — sobre Marco)
  ├── WebinarFAQ.tsx                     (Section 8 — accordion shadcn)
  ├── WebinarFinalCTA.tsx                (Section 9)
  ├── WebinarFooter.tsx                  (Section 10)
  ├── WebinarStickyCTA.tsx               (sticky bar após 40% scroll)
  └── WebinarSignupModal.tsx             (modal com formulário)
```

Layout standalone: a página NÃO usa `Header`/`Footer` globais; tem seu próprio rodapé minimalista. `WhatsAppFAB` continua aparecendo (já é global).

### Conteúdo por seção (resumo)
1. **Hero** — eyebrow `WEBINAR AO VIVO · QUINTA-FEIRA · 20H`, H1 serif, deck, vídeo YouTube embed (placeholder ID configurável), CTA âmbar `Garantir minha vaga gratuita →`, microcopy `03/10 vagas`, faixa de 4 trust signals com check.
2. **Case Dr. Ivan** — fundo navy, 2 colunas desktop / empilhado mobile, vídeo + prosa + 3 métricas grandes (`15-20 leads/dia`, `100% substituição`, `24/7 IA`).
3. **O que você vai aprender** — fundo cream, 4 cards numerados (01–04) com ícones lucide (`Search`, `Filter`, `Bot`, `TrendingDown`), CTA secundário ao final.
4. **Mais 2 casos** — grid 2 colunas, cards com vídeo thumb, pullquote em serif, métricas.
5. **Para quem é / não é** — 2 colunas, `Check` verde vs `X` cinza (lucide).
6. **Sobre o host** — fundo navy, foto à esquerda (placeholder), bio à direita em 4 parágrafos.
7. **FAQ** — `Accordion` shadcn com 6 perguntas.
8. **CTA Final** — fundo navy, centralizado, 3 linhas de detalhes do evento, botão âmbar grande.
9. **Footer** — 3 linhas, minimalista.

### Elementos transversais
- **Sticky CTA**: aparece após `scrollY > 40% do documento` (hook `useEffect` com listener), barra inferior fixa âmbar `QUINTA, 20H · VAGA GRATUITA →`. Click abre o modal.
- **Modal de inscrição** (`Dialog` shadcn): campos `nome`, `email`, `whatsapp`, `especialidade` (Select), `faturamento` (Select com 4 faixas). Validação Zod (nome 2-100, email válido, whatsapp regex br, selects obrigatórios). Após submit: insere em `webinar_signups`, mostra toast, redireciona para `/webinar-medico/obrigado` com instrução do grupo de WhatsApp.

### Página de obrigado
`src/pages/WebinarObrigado.tsx` — confirma inscrição, mostra botão grande "Entrar no grupo do WhatsApp" (link configurável) com aviso de que o link da aula é enviado lá.

### Backend (Lovable Cloud)
Nova tabela `webinar_signups`:
```text
id uuid pk default gen_random_uuid()
created_at timestamptz default now()
nome text not null
email text not null
whatsapp text not null
especialidade text not null
faturamento text not null
source text default 'webinar-medico'
```
RLS:
- INSERT público permitido (`true`) — landing pública, qualquer um se inscreve
- SELECT apenas para admins via `has_role(auth.uid(), 'admin')`
- Sem UPDATE/DELETE públicos

Notificação opcional: reusar edge function `notify-admin` existente (chamar após insert via `.then`) para avisar nova inscrição — sem criar função nova.

### Roteamento
- `src/App.tsx`: adicionar `<Route path="/webinar-medico" element={<WebinarMedico />} />` e `<Route path="/webinar-medico/obrigado" element={<WebinarObrigado />} />`
- Lazy import opcional para não pesar o bundle inicial

### Configuráveis (constantes no topo de `WebinarMedico.tsx`)
```text
WEBINAR_DATE = "Quinta-feira, [DATA]"
HERO_VIDEO_ID = "PLACEHOLDER"
IVAN_VIDEO_ID = "PLACEHOLDER"
CASE_2_VIDEO_ID = "PLACEHOLDER"
CASE_3_VIDEO_ID = "PLACEHOLDER"
WHATSAPP_GROUP_URL = "https://chat.whatsapp.com/PLACEHOLDER"
VAGAS_RESTANTES = "03/10"
```
Você troca direto no arquivo depois de aprovar.

### Não incluído (a confirmar depois se quiser)
- Section 3 (problem agitation) não estava no seu briefing PT-BR, só no prompt em inglês — vou pular; me avise se quiser incluir
- Integração com gateway de pagamento ou plataforma de webinar (Zoom/YouTube Live) — fora do escopo
- Lembretes automáticos por email/WhatsApp pré-evento — fora do escopo

### Entregáveis
- 1 rota nova funcional `/webinar-medico` + `/obrigado`
- Tabela `webinar_signups` com RLS
- Formulário validado e persistente
- Sticky CTA + modal funcionando mobile e desktop
- Tokens de design isolados, sem afetar o resto do site

