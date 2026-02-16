

## Auditoria de SEO Tecnico - Problemas e Melhorias

### 1. URLs inconsistentes nos Structured Data (CRITICO)

**Index.tsx** usa `https://seo-semantic-masterclass.lovable.app` como URL da organizacao e do website nos schemas, enquanto o canonical e todas as outras paginas usam `https://mkart.com.br`. Isso confunde os motores de busca sobre qual e o dominio principal.

- `organizationData.url` e `organizationData.logo` apontam para `seo-semantic-masterclass.lovable.app`
- `websiteData.url` aponta para `seo-semantic-masterclass.lovable.app`

**Contact.tsx** tambem usa `seo-semantic-masterclass.lovable.app` no `pageData.url`.

**ConsultoriaSeo.tsx** usa `seo-semantic-masterclass.lovable.app` no `pageData.url`.

**Correcao:** Trocar todas as referencias para `https://mkart.com.br`.

---

### 2. Paginas sem SEOHead (CRITICO)

- **ConsultoriaSeo.tsx**: Nao tem componente `SEOHead`, apenas `StructuredData`. Falta title, description e canonical no `<head>`.
- **Contact.tsx**: Nao tem `SEOHead`, apenas `StructuredData`. Falta title, description e canonical.

**Correcao:** Adicionar `SEOHead` com title, description, canonical e keywords nestas paginas.

---

### 3. AggregateRating fabricado no CategoryStructuredData (RISCO)

O `CategoryStructuredData.tsx` gera `aggregateRating` com valores calculados artificialmente (DR+DA/20 como rating, traffic/1000 como reviewCount). Isso viola as diretrizes do Google para dados estruturados - ratings devem ser de avaliacoes reais de usuarios. Pode resultar em penalizacao ou remocao de rich snippets.

**Correcao:** Remover o bloco `aggregateRating` do schema.

---

### 4. StructuredData.tsx injeta scripts duplicados sem limpeza adequada

O componente `StructuredData` usa `useEffect` para adicionar `<script>` ao `<head>`, mas se o componente re-renderizar rapidamente, scripts duplicados podem aparecer. Alem disso, o cleanup depende de `document.head.removeChild` que pode falhar se o DOM mudar.

**Correcao:** Migrar para usar `Helmet` (react-helmet-async) para injetar JSON-LD, garantindo deduplicacao automatica.

---

### 5. Breadcrumbs com URLs duplicadas no Schema

O `DynamicCategoryPage.tsx` gera breadcrumbs DUAS VEZES:
- Uma via `<StructuredData type="breadcrumb">` com URLs absolutas (`https://mkart.com.br/`)
- Outra via `<Breadcrumbs>` que internamente tambem chama `<StructuredData type="breadcrumb">` com URLs relativas (`/`)

Isso injeta dois schemas BreadcrumbList na pagina, com URLs diferentes, confundindo o Google.

**Correcao:** Remover o `<StructuredData type="breadcrumb">` extra do `DynamicCategoryPage.tsx` e padronizar URLs absolutas nos breadcrumbs.

---

### 6. BlogPost canonical usa `window.location.origin` (PROBLEMA)

Em `BlogPost.tsx`, o `canonicalUrl` e gerado com `window.location.origin`, que no preview sera `lovable.app` em vez de `mkart.com.br`. O canonical deve ser sempre o dominio de producao.

**Correcao:** Usar `https://mkart.com.br/blog/${post.slug}` como canonical.

---

### 7. ComprarBacklinksCategoria canonical usa `window.location.origin`

Mesmo problema do BlogPost - canonical gerado dinamicamente com `window.location.origin`.

**Correcao:** Usar `https://mkart.com.br/comprar-backlinks-...` como canonical.

---

### 8. NotFound com canonical `/404`

A pagina 404 define `canonicalUrl="/404"` - uma URL relativa e que nao deveria ser indexada.

**Correcao:** Adicionar `noindex={true}` e remover o canonical da pagina 404.

---

### 9. Sitemap com URL incorreta

O sitemap lista `consultoria-seo-saas` mas a rota HTML pre-renderizada e `consultoria-saas.html` e o `_redirects` nao tem entrada para `consultoria-seo-saas`.

**Correcao:** Adicionar redirect para `/consultoria-seo-saas` no `_redirects` e criar o HTML pre-renderizado correspondente, OU corrigir a URL no sitemap.

---

### 10. robots.txt expoe URL interna do backend

O Sitemap no robots.txt aponta para `https://nxitvhrfloibpwrkskzx.supabase.co/functions/v1/generate-sitemap` - uma URL interna. O ideal e apontar para `https://mkart.com.br/sitemap.xml`.

**Correcao:** Trocar para `Sitemap: https://mkart.com.br/sitemap.xml`.

---

### 11. Textos placeholder em ComprarBacklinksCategoria

O componente generico `ComprarBacklinksCategoria.tsx` tem textos placeholder: "Titulo h1 (Comprar Backlinks da...)" e "Titulo h2 (Como escolher os melhores backlinks...)". Isso prejudica o SEO se a pagina for indexada.

**Correcao:** Substituir por textos reais ou usar o sistema de conteudo SEO dinamico (usePageSEOContent).

---

### 12. Textos em ingles no ComprarBacklinksCategoria

A sidebar tem "Filter by Category" e "All" em ingles, sendo o site em portugues.

**Correcao:** Trocar para "Filtrar por Categoria" e "Todos".

---

### 13. og:image sem dimensoes adequadas

Na pagina Index, o `ogImage` default e `/og-image.jpg` que provavelmente nao existe. O fallback global no SEOHead e `https://mkart.com.br/og-image.jpg`. Verificar se esse arquivo existe.

---

### Resumo de prioridades

| Prioridade | Item | Impacto |
|-----------|------|---------|
| Alta | URLs lovable.app nos schemas (item 1) | Confunde indexacao |
| Alta | Paginas sem SEOHead (item 2) | Sem meta tags |
| Alta | AggregateRating falso (item 3) | Risco de penalizacao |
| Alta | Canonical com window.location (itens 6-7) | Canonical errado |
| Media | Breadcrumbs duplicados (item 5) | Schema duplicado |
| Media | Sitemap vs redirects inconsistente (item 9) | Pagina nao acessivel |
| Media | robots.txt com URL interna (item 10) | Expoe infraestrutura |
| Media | 404 com canonical (item 8) | SEO incorreto |
| Baixa | StructuredData via useEffect (item 4) | Potencial duplicacao |
| Baixa | Textos placeholder/ingles (itens 11-12) | UX/SEO menor |
| Baixa | og:image inexistente (item 13) | Compartilhamento social |

### Detalhes tecnicos das correcoes

**Arquivos a modificar:**
- `src/pages/Index.tsx` - corrigir URLs para mkart.com.br
- `src/pages/Contact.tsx` - adicionar SEOHead, corrigir URL
- `src/pages/ConsultoriaSeo.tsx` - adicionar SEOHead, corrigir URL
- `src/pages/BlogPost.tsx` - canonical fixo com mkart.com.br
- `src/pages/ComprarBacklinksCategoria.tsx` - canonical fixo, traduzir textos, remover placeholders
- `src/pages/NotFound.tsx` - adicionar noindex, remover canonical
- `src/components/seo/CategoryStructuredData.tsx` - remover aggregateRating
- `src/components/marketplace/DynamicCategoryPage.tsx` - remover StructuredData breadcrumb duplicado
- `public/robots.txt` - corrigir URL do sitemap
- `public/sitemap.xml` - verificar consistencia com _redirects
- `public/_redirects` - adicionar entrada para consultoria-seo-saas

