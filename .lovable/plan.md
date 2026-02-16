

## Varredura Final de SEO Tecnico - Problemas Remanescentes

### 1. SearchAction invalido no StructuredData.tsx (CRITICO)

O componente `StructuredData.tsx` ainda gera automaticamente um `SearchAction` apontando para `{url}/search?q=...` em TODAS as paginas que usam `type="website"`. O site nao tem funcionalidade de busca. Isso afeta:
- Index.tsx (gera `https://mkart.com.br/search?q=...`)
- Blog.tsx (gera `https://mkart.com.br/blog/search?q=...`)
- Contact.tsx (gera `https://mkart.com.br/contato/search?q=...`)
- ConsultoriaSeo.tsx (gera `https://mkart.com.br/consultoria-seo/search?q=...`)
- ConsultoriaSaas.tsx (gera `https://mkart.com.br/consultoria-seo-saas/search?q=...`)

**Correcao:** Remover o bloco `potentialAction` / `SearchAction` do tipo `website` no `StructuredData.tsx`.

### 2. publisherLogo errado no BlogPost.tsx (CRITICO)

O `BlogPost.tsx` na linha 126 usa `publisherLogo: "https://mkart.com.br/logo.png"` - arquivo que nao existe. O correto e `https://mkart.com.br/LOGOMK.png`.

**Correcao:** Trocar para `https://mkart.com.br/LOGOMK.png`.

### 3. AgenciaBacklinks.tsx com schema Yoast legado contendo SearchAction invalido

O schema Yoast hardcoded (linhas 174-228) inclui:
- `SearchAction` apontando para `https://mkart.com.br/?s={search_term_string}` (URL WordPress legada que nao existe)
- `og:type` como `"article"` quando deveria ser `"website"` (nao e um artigo)
- `og:site_name` como `"MK - Agencia de Trafego"` diferente do padrao `"MK Art SEO"`
- `og:image` apontando para `https://mkart.com.br/wp-content/uploads/2023/11/dr.png` (URL WordPress que pode nao existir mais)
- `thumbnailUrl` e `contentUrl` tambem apontam para URLs WordPress

**Correcao:** Migrar para usar `SEOHead` + `StructuredData` padronizados, removendo o schema Yoast legado inteiro.

### 4. WebSite StructuredData duplicado em subpaginas

As paginas Contact, ConsultoriaSeo, ConsultoriaSaas e Blog emitem `StructuredData type="website"` com dados locais, gerando schemas WebSite diferentes em cada pagina. O schema WebSite deve existir apenas na homepage (Index.tsx). Subpaginas devem usar `WebPage`.

**Correcao:** Trocar `type="website"` por `type="webpage"` (novo tipo a criar) ou remover completamente dessas subpaginas. Adicionar suporte a `WebPage` no `StructuredData.tsx`.

### 5. Breadcrumbs com URLs relativas vs absolutas (INCONSISTENCIA)

- `DynamicCategoryPage.tsx` breadcrumbItems (linhas 50-54) usa URLs absolutas (`https://mkart.com.br/`)
- `DynamicCategoryPage.tsx` `<Breadcrumbs>` (linhas 99-105) usa URLs relativas (`/`)
- Mesmo padrao no `ComprarBacklinks.tsx` e `Blog.tsx` - URLs relativas

O schema de Breadcrumbs gerado pelo componente `Breadcrumbs.tsx` usa as URLs como passadas, gerando schemas com `/` em vez de `https://mkart.com.br/`. O Google prefere URLs absolutas nos schemas.

**Correcao:** Padronizar todas as URLs de breadcrumbs para absolutas com `https://mkart.com.br`.

### 6. Footer com ano desatualizado e falta de Facebook no sameAs

- Footer mostra `2024` no copyright, deveria ser `2025` ou dinamico
- Facebook (`https://facebook.com/mkart.seo`) aparece no Footer mas nao esta no `sameAs` do Organization schema no Index.tsx

**Correcao:** Atualizar ano para dinamico e adicionar Facebook ao sameAs.

### 7. console.log em producao

`ConsultoriaSeo.tsx` e `ConsultoriaSaas.tsx` tem `console.log("... component rendering")` que polui o console em producao.

**Correcao:** Remover os console.log.

### 8. FAQSection gera FAQPage schema duplicado com microdata

O `FAQSection.tsx` emite DOIS formatos de dados estruturados simultaneamente:
- JSON-LD via `StructuredData type="faq"` 
- Microdata via `itemScope itemType="https://schema.org/FAQPage"` no HTML

Ter ambos pode confundir o Google. O recomendado e usar apenas JSON-LD.

**Correcao:** Remover os atributos `itemScope`, `itemProp` e `itemType` do HTML do `FAQSection.tsx`.

### 9. Paginas pre-renderizadas (public/pages/) com SearchAction invalido

Todas as 15+ paginas em `public/pages/` contem o SearchAction legado do `prerender.js`. Como o `prerender.js` ja foi corrigido para nao incluir SearchAction, as paginas precisam ser regeneradas.

**Correcao:** Atualizar `scripts/prerender.js` para remover o bloco `potentialAction` do WebSite schema. As paginas em `public/pages/` serao regeneradas.

### 10. ComprarBacklinksCategoria.tsx sem CategoryStructuredData

A pagina generica de categoria (`ComprarBacklinksCategoria.tsx`) nao inclui `CategoryStructuredData`, diferente das paginas especificas (via `DynamicCategoryPage.tsx`). Faltam dados estruturados de produto/lista.

**Correcao:** Adicionar `CategoryStructuredData` ao `ComprarBacklinksCategoria.tsx`.

---

### Resumo de prioridades

| Prioridade | Item | Impacto |
|-----------|------|---------|
| Alta | SearchAction invalido no StructuredData.tsx (item 1) | Schema invalido em 5 paginas |
| Alta | publisherLogo errado (item 2) | Logo 404 no Article schema |
| Alta | Schema Yoast legado no AgenciaBacklinks (item 3) | URLs WordPress mortas, dados inconsistentes |
| Media | WebSite duplicado em subpaginas (item 4) | Schemas redundantes |
| Media | Breadcrumbs com URLs relativas (item 5) | Schema nao-ideal |
| Media | FAQSection duplicado JSON-LD + microdata (item 8) | Duplicacao de dados estruturados |
| Media | Paginas pre-renderizadas desatualizadas (item 9) | SearchAction invalido servido a crawlers |
| Baixa | Footer ano 2024 + Facebook no sameAs (item 6) | Dados desatualizados |
| Baixa | console.log em producao (item 7) | Poluicao de console |
| Baixa | ComprarBacklinksCategoria sem structured data (item 10) | Oportunidade perdida |

### Detalhes tecnicos das correcoes

**Arquivos a modificar:**

| Arquivo | Alteracao |
|---------|----------|
| `src/components/seo/StructuredData.tsx` | Remover `potentialAction`/`SearchAction` do tipo `website` |
| `src/pages/BlogPost.tsx` | Corrigir `publisherLogo` para `LOGOMK.png` |
| `src/pages/AgenciaBacklinks.tsx` | Substituir schema Yoast por `SEOHead` + `StructuredData` padrao, corrigir `og:type` para `website` |
| `src/pages/Contact.tsx` | Remover `StructuredData type="website"` |
| `src/pages/ConsultoriaSeo.tsx` | Remover `StructuredData type="website"`, remover console.log |
| `src/pages/ConsultoriaSaas.tsx` | Remover `StructuredData type="website"`, remover console.log |
| `src/pages/Blog.tsx` | Remover `StructuredData type="website"` |
| `src/components/seo/FAQSection.tsx` | Remover microdata duplicado (itemScope/itemProp/itemType) |
| `src/components/layout/Footer.tsx` | Ano dinamico, Facebook no copyright |
| `src/pages/Index.tsx` | Adicionar Facebook ao sameAs do Organization |
| `src/pages/ComprarBacklinks.tsx` | Breadcrumbs com URLs absolutas |
| `src/pages/ComprarBacklinksCategoria.tsx` | Adicionar CategoryStructuredData, breadcrumbs absolutos |
| `src/components/marketplace/DynamicCategoryPage.tsx` | Padronizar breadcrumbs para URLs absolutas |
| `scripts/prerender.js` | Remover SearchAction do WebSite schema |

**Total: 14 arquivos com correcoes de schema, meta dados, dados estruturados e limpeza de codigo.**

