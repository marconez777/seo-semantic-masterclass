

## Varredura Final - Problemas Remanescentes de SEO

### 1. index.html tem campo "description" duplicado no WebSite schema (CRITICO)

No `index.html` linha 81, o campo `"description"` aparece DUAS VEZES no schema WebSite:
```json
"description": "Compre backlinks brasileiros de alta qualidade para seu site",
"description": "Compre backlinks brasileiros de alta qualidade para seu site"
```
JSON duplicado e invalido. O Google pode ignorar o schema inteiro.

**Correcao:** Remover a linha duplicada.

---

### 2. Organization schema duplicado: index.html + Index.tsx (MEDIO)

Na homepage, o Organization schema e emitido DUAS VEZES:
- `index.html` linhas 52-71 (estatico, sem Facebook no sameAs)
- `Index.tsx` via `StructuredData type="organization"` (dinamico, com Facebook)

Isso gera dois blocos `@type: Organization` conflitantes. O do `index.html` nao tem Facebook e tem descricao diferente.

**Correcao:** Remover o schema Organization do `index.html` (manter apenas o do React que e mais completo e atualizado). O mesmo para o schema WebSite duplicado.

---

### 3. WebSite schema duplicado: index.html + Index.tsx (MEDIO)

Mesmo problema - dois schemas WebSite na homepage. O do `index.html` tem a descricao duplicada.

**Correcao:** Remover os dois blocos de schema do `index.html`, mantendo apenas os do React.

---

### 4. AgenciaBacklinks.tsx com breadcrumbs usando URLs relativas (MEDIO)

Linhas 359-362: breadcrumbs usam `url: '/'` e `url: '/agencia-de-backlinks'` (relativos), gerando schema com URLs incompletas.

**Correcao:** Trocar para URLs absolutas `https://mkart.com.br/` e `https://mkart.com.br/agencia-de-backlinks`.

---

### 5. AgenciaBacklinks.tsx sem Breadcrumbs schema e structured data (MEDIO)

A pagina nao tem `CategoryStructuredData` nem breadcrumbs com URLs absolutas, perdendo oportunidade de dados estruturados para o Google.

**Correcao:** Corrigir breadcrumbs para URLs absolutas.

---

### 6. ContinuarComprando.tsx com breadcrumbs usando URLs relativas (BAIXO)

Linhas 339-342: breadcrumbs usam URLs relativas. Embora a pagina seja noindex, manter consistencia.

**Correcao:** Trocar para URLs absolutas.

---

### 7. Breadcrumbs.tsx ainda tem atributos itemProp residuais (BAIXO)

O componente `Breadcrumbs.tsx` linhas 32-34 tem `itemProp="item"` e `itemProp="name"` no HTML, que sao microdata residuais. Como o schema de breadcrumbs ja e emitido via JSON-LD pelo `StructuredData`, estes atributos microdata sao redundantes e podem confundir.

**Correcao:** Remover os atributos `itemProp` do HTML dos breadcrumbs.

---

### 8. CategoryStructuredData.tsx tem breadcrumb duplicado com Breadcrumbs.tsx (MEDIO)

Nas paginas de categoria (DynamicCategoryPage, ComprarBacklinksCategoria, ComprarBacklinks), o schema de breadcrumbs e emitido DUAS VEZES:
- Via `CategoryStructuredData` (breadcrumb embutido no CollectionPage schema)
- Via `Breadcrumbs` componente (que chama `StructuredData type="breadcrumb"`)

Isso gera dois BreadcrumbList schemas na mesma pagina.

**Correcao:** Remover o bloco `breadcrumb` do `CategoryStructuredData.tsx`, ja que o componente `Breadcrumbs` gera o schema separadamente.

---

### 9. Paginas admin sem SEOHead: AdminContatos, AdminConteudoSEO, AdminPublicacoes (BAIXO)

Estas 3 paginas admin nao tem `SEOHead` com `noindex`. Embora estejam protegidas por auth e dentro do `AdminLayout`, sem `noindex` explicito o Google poderia indexa-las se encontrasse um link.

**Correcao:** Adicionar `SEOHead` com `noindex={true}` nestas 3 paginas.

---

### 10. sitemap.xml com URL `consultoria-saas` diferente do canonical `consultoria-seo-saas` (MEDIO)

O sitemap lista `https://mkart.com.br/consultoria-saas` (linha 8), mas o `ConsultoriaSaas.tsx` define canonical como `https://mkart.com.br/consultoria-seo-saas`. Inconsistencia entre sitemap e canonical.

**Correcao:** Atualizar o sitemap para usar `https://mkart.com.br/consultoria-seo-saas`.

---

### 11. SEOHead ogImage default aponta para arquivo inexistente (BAIXO)

O default `ogImage = "/og-image.jpg"` no `SEOHead.tsx` aponta para um arquivo que nao existe no `public/`. O fallback `defaultImage = "https://mkart.com.br/og-image.jpg"` tambem nao existe. O logo real e `LOGOMK.png`.

**Correcao:** Alterar o default para `https://mkart.com.br/LOGOMK.png`.

---

### 12. sitemap.xml sem `lastmod` (BAIXO)

O sitemap nao tem datas `lastmod`, que ajudam o Google a priorizar o crawl de paginas atualizadas.

**Correcao:** Adicionar `lastmod` com a data atual nas URLs do sitemap.

---

### Resumo de prioridades

| Prioridade | Item | Impacto |
|-----------|------|---------|
| Alta | description duplicada no WebSite schema (item 1) | JSON invalido |
| Alta | Organization + WebSite schemas duplicados index.html vs React (itens 2-3) | Schemas conflitantes |
| Media | Breadcrumbs duplicados: CategoryStructuredData + Breadcrumbs (item 8) | Schema duplicado |
| Media | AgenciaBacklinks breadcrumbs com URLs relativas (item 4) | Schema incompleto |
| Media | sitemap vs canonical inconsistente consultoria-saas (item 10) | URL errada no sitemap |
| Baixa | Breadcrumbs.tsx com itemProp residual (item 7) | Microdata redundante |
| Baixa | Admin pages sem SEOHead (item 9) | Falta noindex |
| Baixa | ogImage default inexistente (item 11) | Imagem 404 |
| Baixa | sitemap sem lastmod (item 12) | Crawl subotimo |
| Baixa | ContinuarComprando breadcrumbs relativos (item 6) | Consistencia |

### Detalhes tecnicos das correcoes

| Arquivo | Alteracao |
|---------|----------|
| `index.html` | Remover os 2 blocos `<script type="application/ld+json">` (Organization e WebSite) - o React ja gera esses schemas na homepage |
| `src/components/seo/CategoryStructuredData.tsx` | Remover o bloco `breadcrumb` do schema (linhas 95-117) |
| `src/components/seo/Breadcrumbs.tsx` | Remover atributos `itemProp="item"` e `itemProp="name"` do HTML |
| `src/components/seo/SEOHead.tsx` | Alterar `ogImage` default de `/og-image.jpg` para `https://mkart.com.br/LOGOMK.png` e `defaultImage` para o mesmo |
| `src/pages/AgenciaBacklinks.tsx` | Breadcrumbs com URLs absolutas (`https://mkart.com.br/` e `https://mkart.com.br/agencia-de-backlinks`) |
| `src/pages/ContinuarComprando.tsx` | Breadcrumbs com URLs absolutas |
| `src/pages/admin/AdminContatos.tsx` | Adicionar `SEOHead` com `noindex={true}` |
| `src/pages/admin/AdminConteudoSEO.tsx` | Adicionar `SEOHead` com `noindex={true}` |
| `src/pages/admin/AdminPublicacoes.tsx` | Adicionar `SEOHead` com `noindex={true}` |
| `public/sitemap.xml` | Corrigir `consultoria-saas` para `consultoria-seo-saas`, adicionar `lastmod` |

**Total: 10 arquivos com correcoes de schemas duplicados, URLs inconsistentes e limpeza de microdata.**

