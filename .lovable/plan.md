

## Varredura Final #3 - Ultimos Ajustes de SEO Tecnico

Apos as 3 rodadas anteriores de correcoes, o projeto esta em otimo estado. Os problemas restantes sao menores, mas ainda vale corrigir:

---

### 1. Organization schema sem `telephone` no `contactPoint` (MEDIO)

O `contactPoint` no `Index.tsx` (linhas 21-25) tem `contactType` e `availableLanguage`, mas falta o campo `telephone` que o Google espera para validar o ContactPoint.

O mesmo problema existe no `scripts/prerender.js` (linhas 197-201).

**Correcao:** Adicionar `"telephone": "+55 11 98915-1997"` ao contactPoint em ambos os arquivos. Tambem adicionar Facebook ao sameAs do prerender.js (ja foi adicionado no Index.tsx mas nao no prerender).

---

### 2. prerender.js sem Facebook no `sameAs` (BAIXO)

O `scripts/prerender.js` linha 202-206 tem sameAs com WhatsApp, Instagram e YouTube, mas falta o Facebook (`https://facebook.com/mkart.seo`) que ja foi adicionado ao `Index.tsx`.

**Correcao:** Adicionar Facebook ao sameAs do prerender.js.

---

### 3. Blog.tsx com `ogType="website"` (BAIXO)

Na linha 77 do `Blog.tsx`, o `ogType` esta como `"website"`. A pagina de listagem do blog poderia usar `"website"` mas o ideal e nao especificar (ja e o default) para manter consistencia. Nao e um problema real, apenas redundancia.

**Nenhuma correcao necessaria** - o default do SEOHead ja e `"website"`.

---

### 4. SEOHead emite `viewport` e `theme-color` duplicados com index.html (BAIXO)

O `SEOHead.tsx` linhas 59-60 emite `<meta name="theme-color">` e `<meta name="viewport">` que ja existem no `index.html`. O Helmet deveria gerenciar isso sem duplicacao, mas tags identicas em dois lugares podem gerar entradas duplicadas no DOM.

**Correcao:** Remover as tags `theme-color` e `viewport` do `SEOHead.tsx` (linhas 59-60), ja que sao identicas ao `index.html` e nao mudam por pagina.

---

### 5. SEOHead emite `preconnect` duplicado com index.html (BAIXO)

As linhas 63-65 do `SEOHead.tsx` emitem `preconnect` para fonts.googleapis.com e dns-prefetch para mkart.com.br, que ja estao no `index.html`. Duplicar `preconnect` nao causa erros mas e desnecessario.

**Correcao:** Remover as linhas 63-65 do `SEOHead.tsx` (preconnect/dns-prefetch), mantendo apenas as do `index.html`.

---

### 6. `Crawl-delay: 1` no robots.txt pode limitar crawl (INFO)

O `Crawl-delay: 1` no robots.txt forca crawlers a esperar 1 segundo entre requests. O Google ignora essa diretiva, mas Bing e outros respeitam. Para um site pequeno isso nao e problema, mas se quiser crawl mais rapido pode remover.

**Nenhuma correcao necessaria** - informativo apenas.

---

### 7. Sitemap `lastmod` desatualizado (BAIXO)

O `public/sitemap.xml` tem `lastmod` de `2025-06-01` para paginas estaticas e `2025-05-01` para posts. Como o sitemap e estatico e atualizado manualmente, convem atualizar as datas para `2025-07-01` (ou mais recente) para refletir as correcoes feitas.

**Correcao:** Atualizar datas `lastmod` no sitemap para `2026-02-16` (data atual).

---

### Resumo

| Prioridade | Item | Impacto |
|-----------|------|---------|
| Media | contactPoint sem telephone (item 1) | Schema incompleto |
| Baixa | prerender.js sem Facebook no sameAs (item 2) | Inconsistencia |
| Baixa | SEOHead tags duplicadas com index.html (itens 4-5) | DOM limpo |
| Baixa | Sitemap lastmod desatualizado (item 7) | Crawl |

### Detalhes tecnicos das correcoes

| Arquivo | Alteracao |
|---------|----------|
| `src/pages/Index.tsx` | Adicionar `"telephone": "+55 11 98915-1997"` ao contactPoint |
| `scripts/prerender.js` | Adicionar `telephone` ao contactPoint + Facebook ao sameAs |
| `src/components/seo/SEOHead.tsx` | Remover tags duplicadas: `theme-color`, `viewport`, `preconnect`, `dns-prefetch` (linhas 58-65) |
| `public/sitemap.xml` | Atualizar todas as datas `lastmod` para `2026-02-16` |

**Total: 4 arquivos com ajustes finos de schema, limpeza de meta tags duplicadas e atualizacao de sitemap.**

