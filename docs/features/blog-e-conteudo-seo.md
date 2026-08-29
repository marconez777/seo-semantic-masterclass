---
last_validated: 2026-08-28
review_by: 2026-11-28
covers: [src/pages/Blog.tsx, src/pages/BlogPost.tsx, src/pages/AdminBlogNew.tsx, src/pages/admin/AdminBlog.tsx, src/pages/admin/AdminConteudoSEO.tsx, src/components/blog/**, src/components/seo/**, src/components/admin/SEOContentEditor.tsx, src/components/admin/AdminBlogPublisher.tsx, src/hooks/usePageSEOContent.ts, src/lib/sanitize.ts, supabase/functions/publish-scheduled-posts/index.ts, supabase/functions/generate-sitemap/index.ts, public/sitemap.xml, public/robots.txt]
---

# Blog e conteúdo SEO

**Estado:** em produção.

## O que faz

Duas coisas relacionadas:

1. **Blog** — artigos escritos num editor rico dentro do admin, publicados em `/blog` e `/blog/:slug`. Podem ser agendados.
2. **Conteúdo SEO por página** — títulos, descrições, textos de introdução e FAQs que a equipe edita sem tocar em código, e que aparecem nas páginas de categoria do marketplace.

Todo o SEO é feito com meta tags no cliente (`react-helmet-async`); o site não é pré-renderizado.

## Fluxo — blog

1. Admin escreve em `/admin/blog/novo` (ou `/admin/blog/editar/:id`), no `AdminBlogNew`, editor **Tiptap** com imagem, link, alinhamento, YouTube.
2. O slug é gerado do título automaticamente enquanto o campo não for editado à mão.
3. Imagem de capa e imagens do corpo vão para o bucket `blog` do Supabase Storage; a URL pública é gravada no conteúdo.
4. Salva em `posts` (`content` é HTML).
5. Publicação: imediata (`published = true`) ou agendada — grava `published = false` com `published_at` no futuro. A edge function **`publish-scheduled-posts`** vira o flag quando a data chega.
6. `/blog` lista os posts publicados; `/blog/:slug` renderiza o HTML **passando por `sanitizeHtml`**.

## Fluxo — conteúdo SEO por página

`/admin/conteudo-seo` (`AdminConteudoSEO` + `SEOContentEditor`) grava em `page_seo_content`, uma linha por `page_slug`. As páginas de categoria leem por `usePageSEOContent` e montam meta tags, H1, texto de introdução e o bloco de FAQ (`FAQSection` + dados estruturados).

## Arquivos

| Arquivo | Papel |
|---|---|
| `src/pages/AdminBlogNew.tsx` | editor Tiptap, upload de imagem, agendamento |
| `src/pages/BlogPost.tsx` | renderização do post |
| `src/components/seo/SEOHead.tsx` | title, description, canonical, Open Graph, `noindex` |
| `src/components/seo/StructuredData.tsx`, `CategoryStructuredData.tsx` | JSON-LD |
| `src/components/seo/FAQSection.tsx` | FAQ visível + dados estruturados |
| `src/hooks/usePageSEOContent.ts` | leitura e escrita de `page_seo_content` |
| `src/lib/sanitize.ts` | limpeza do HTML antes de renderizar |
| `supabase/functions/publish-scheduled-posts/index.ts` | publica agendados |

## Casos de borda tratados

- HTML do banco é sanitizado com allowlist de tags e atributos (`sanitizeHtml`), com `data-*` bloqueado.
- Slug duplicado é evitado pelo `unique` da coluna — o erro aparece ao salvar.
- Página de campanha usa `SEOHead noindex` e fica fora do sitemap, de propósito.

## Casos conhecidos NÃO tratados

- **`publish-scheduled-posts` não tem agendador confirmado.** A função existe e funciona quando chamada, mas nada no repositório garante que ela é chamada de hora em hora. Post agendado pode simplesmente não sair.
- **Duas fontes de sitemap.** `public/sitemap.xml` é estático, com 46 URLs e `lastmod` congelado em 2026-02-16; a função `generate-sitemap` monta outro a partir do banco. O que está no ar é o estático — **página nova precisa ser adicionada à mão**.
- Post não tem prévia, versionamento nem rascunho separado de agendado: `published = false` significa as duas coisas.
- Imagem enviada para o Storage não é redimensionada nem comprimida.
- O bucket `blog` é de **leitura pública**: a imagem de um post ainda não publicado já está acessível para quem tiver a URL.
- O upload usa `upsert: false`, então reenviar um arquivo com o mesmo nome falha em vez de substituir.
