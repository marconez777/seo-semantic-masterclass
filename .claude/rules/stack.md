---
last_validated: 2026-08-28
review_by: 2026-11-28
covers: [package.json, vite.config.ts, tsconfig.app.json, src/integrations/supabase/client.ts, src/hooks/**, src/lib/utils.ts]
---

# Stack

## Versões e particularidades

- **Vite 5** + `@vitejs/plugin-react-swc`. Dev na porta **8080** (`vite.config.ts`), não 5173.
- **React 18.3** + **react-router-dom 6**. Todas as rotas ficam em `src/App.tsx`, sem lazy loading.
- **TypeScript 5.5** com `strict` desligado e `noImplicitAny: false` (`tsconfig.app.json`). O compilador não vai te salvar — confira os tipos à mão.
- **Supabase JS 2.93**. Tipos do banco gerados em `src/integrations/supabase/types.ts` — **arquivo gerado, não edite à mão**; regenere pelo CLI do Supabase.
- **TanStack Query 5** para leitura de dados do servidor. `QueryClient` único, criado em `src/App.tsx`.
- **Tiptap 3** é o editor do blog e do conteúdo SEO.
- **Deno** nas edge functions (`supabase/functions/`) — não é Node. Import por URL, `Deno.env.get()` para segredo.

## Padrões

- Alias `@/` aponta para `src/`. Use sempre; caminho relativo longo (`../../..`) é sinal de que você está no lugar errado.
- Leitura de dados: hook em `src/hooks/` usando TanStack Query. Já existem `useBacklinksQuery`, `usePageSEOContent`, `useBacklinkFilters`, `useAnalytics`, `useAuth`.
- Escrita de dados: `supabase.from(...)` direto no componente é o padrão vigente aqui. Não crie uma camada de serviço nova só para uma tela.
- Estado global: só o carrinho, em `src/contexts/CartContext.tsx`, persistido em `localStorage` nas chaves `mkart_*`.
- Toast: `useToast` de `@/components/ui/use-toast`. O `sonner` também está instalado — prefira o primeiro, é o que o resto do app usa.
- Componente de UI novo: veja se o shadcn/ui já tem em `src/components/ui/` antes de escrever.

## Não use

- `npm test` — **não existe suíte de testes neste projeto.** Não invente comando nem arquivo de teste sem combinar antes.
- `fetch` cru para o Supabase — use o client de `@/integrations/supabase/client`.
- Editar `src/integrations/supabase/types.ts` à mão — é gerado e será sobrescrito.
- Criar mais uma página `ComprarBacklinks<Categoria>.tsx`. Já são 20 quase idênticas; categoria nova entra pela rota dinâmica `/comprar-backlinks-categoria/:categoria` (`ComprarBacklinksCategoria.tsx`) e pela lista em `src/lib/categories.ts`.
- Os scripts em `scripts/` (prerender, pipeline, QA de SEO) — **não estão ligados a nenhum comando do `package.json`** e ninguém no time sabe dizer se ainda rodam. Não imite esse código e não construa em cima dele sem confirmar. Ver `docs/DECISOES.md` (ADR-004).
