
## Paginacao no Blog + Ultimos Posts na Home

### 1. Paginacao na pagina do Blog (`src/pages/Blog.tsx`)

- Adicionar estado `page` (iniciando em 1) e constante `PAGE_SIZE = 15`
- Usar `.range()` na query do Supabase para buscar apenas os posts da pagina atual
- Fazer uma query separada com `count: 'exact'` para obter o total de posts
- Exibir o componente `PaginationBar` (ja existente em `src/components/ui/pagination-bar.tsx`) abaixo da lista de posts
- O primeiro post so tera variante "featured" na pagina 1
- Ao mudar de pagina, fazer scroll to top

### 2. Secao "Ultimos Posts" na Home (`src/pages/Index.tsx`)

- Criar um novo componente `src/components/sections/LatestBlogPosts.tsx`
- Buscar os 3 ultimos posts publicados do banco (`posts` table, `published = true`, `order by created_at desc`, `limit 3`)
- Exibir em grid de 3 colunas (1 coluna no mobile)
- Cada card tera: imagem (ou gradiente), titulo, excerpt truncado, data
- Reutilizar o estilo do BlogCard mas em formato vertical (card padrao sem a variante featured)
- Adicionar botao "Ver todos os posts" linkando para `/blog`
- Posicionar na Home acima do Footer, abaixo do NewsletterSection

### Detalhes tecnicos

**Blog.tsx:**
- `const PAGE_SIZE = 15`
- Query com `supabase.from("posts").select("id,title,slug,cover_image,excerpt,created_at", { count: 'exact' }).eq("published", true).order("created_at", { ascending: false }).range((page-1)*PAGE_SIZE, page*PAGE_SIZE - 1)`
- Estado `total` para o count
- Resetar `page` para 1 se necessario
- Importar e usar `PaginationBar` passando `page`, `pageSize`, `total`, `onPageChange`

**LatestBlogPosts.tsx:**
- Query simples com `.limit(3)`
- Grid responsivo: `grid-cols-1 md:grid-cols-3`
- Cards verticais com imagem no topo, titulo e excerpt abaixo
- Link para `/blog` no final da secao

**Index.tsx:**
- Importar `LatestBlogPosts`
- Colocar entre `NewsletterSection` e `Footer`
