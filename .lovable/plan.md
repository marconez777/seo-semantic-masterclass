## Objetivo

Adicionar um aviso de cookies discreto no canto inferior esquerdo (mínimo de texto, expansível) e criar as três páginas legais com o conteúdo enviado.

## Componente: CookieBanner (compacto + expansível)

Criar `src/components/ui/CookieBanner.tsx` baseado no exemplo enviado, mas reduzido:

- Posição: `fixed bottom-4 left-4`, largura `max-w-xs` (≈ 320px), `z-50`
- Aparece após 800ms; persiste consentimento em `localStorage` (`mk_cookie_consent`) por 12 meses
- Estado fechado (padrão) — texto curto:
  > "Usamos cookies para melhorar sua experiência. [Saiba mais ▾]" + botão "OK"
- Estado expandido (ao clicar em "Saiba mais"): mostra 1–2 linhas extras com links para `/politica-de-privacidade` e `/politica-de-cookies`
- Botão "OK" fecha e salva consentimento; botão X também aceita (consent simples)
- Estilo: card branco arredondado, sombra suave, borda neutra, animação fade/slide-in
- Acessível: `role="dialog"`, `aria-label`, foco gerenciado

Renderizar uma única vez em `src/App.tsx` (dentro do `BrowserRouter`, fora das rotas), assim aparece em todas as páginas.

## Páginas legais

Copiar os arquivos enviados para `src/pages/` (com pequenos ajustes para usar `<Link>` do react-router quando referenciarem outras páginas legais, e envolver com `<Header />` + `<Footer />` para consistência visual):

- `src/pages/PoliticaDePrivacidade.tsx` → rota `/politica-de-privacidade`
- `src/pages/PoliticaDeCookies.tsx` → rota `/politica-de-cookies`
- `src/pages/TermosDeUso.tsx` → rota `/termos-de-uso`

Adicionar `SEOHead` em cada página (title + description + canonical + `noindex` opcional para páginas legais — manter `index` para LGPD).

## Roteamento

Em `src/App.tsx`:
- Importar e renderizar `<CookieBanner />` no nível raiz (após `<CartModal />`)
- Adicionar três `<Route>` para as páginas legais

## Footer (opcional, recomendado)

Adicionar uma linha discreta de links no `Footer.tsx` para Política de Privacidade, Política de Cookies e Termos de Uso (cinza pequeno, abaixo do grid existente).

## Arquivos criados/editados

- criado: `src/components/ui/CookieBanner.tsx`
- criado: `src/pages/PoliticaDePrivacidade.tsx`
- criado: `src/pages/PoliticaDeCookies.tsx`
- criado: `src/pages/TermosDeUso.tsx`
- editado: `src/App.tsx` (rotas + render do banner)
- editado: `src/components/layout/Footer.tsx` (links legais)
