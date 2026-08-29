---
last_validated: 2026-08-28
review_by: 2026-11-28
covers: [src/index.css, tailwind.config.ts, src/components/ui/**, src/components/layout/**, components.json]
---

# UI

## Tokens — a regra que mais se quebra aqui

Cor **nunca** é literal. Tudo sai das variáveis CSS de `src/index.css`, expostas no Tailwind como `bg-primary`, `text-muted-foreground`, `border-border` etc.

- `--primary`: roxo `271 76% 53%` — cor da marca, CTAs.
- `--secondary`: verde `134 61% 41%` — confirmação, sucesso, botão de conversão.
- `--destructive`: vermelho · `--warning`: âmbar.
- `--sidebar-*`: paleta escura própria do painel admin.
- Existe tema escuro completo em `.dark`. Escrever `bg-white` ou `text-[#1a1a1a]` quebra o dark mode em silêncio — o layout continua funcionando e só fica ilegível para quem usa tema escuro.

Formato dos tokens é HSL **sem** `hsl()` (`271 76% 53%`), porque o Tailwind embrulha com `hsl(var(--x))`. Token novo tem que seguir o mesmo formato.

## Padrões

- Componentes base: shadcn/ui em `src/components/ui/` (config em `components.json`, estilo `default`, ícones `lucide-react`). Antes de criar um, confira se já existe.
- Variantes de componente: `class-variance-authority`, como nos componentes existentes. Merge de classes com `cn()` de `@/lib/utils`.
- Layout público: `Header` + `Footer` de `src/components/layout/`. Layout admin: `src/layouts/AdminLayout.tsx`.
- Página de campanha paga (`/webinar-medico`, `/diagnostico`) é dobra única: **sem** Header, Footer, FAB do WhatsApp e banner de cookies. Header e Footer bastam não ser importados — cada página monta o próprio layout. Já o FAB e o banner são globais: acrescente a rota nova às listas dentro de `whatsapp-fab.tsx` e `CookieBanner.tsx`.
- Texto do produto é em **português do Brasil**. Nomes de variável em inglês, texto de tela em português.
- Mobile primeiro. `useIsMobile` (`src/hooks/use-mobile.tsx`) quando precisar do breakpoint em JS.

## Não use

- Classe de cor literal (`bg-purple-600`, `text-white`, `#8B5CF6`) fora de página de campanha que já é dark-only por design.
- Biblioteca de componente nova. Tudo que falta se monta com Radix + Tailwind, que já estão aqui.
- `style={{...}}` para o que Tailwind resolve.
