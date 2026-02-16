

## Reorganizar "Gerenciar Sites" com Abas e Filtros

### Resumo
Separar a pagina `/admin/sites` em abas (Tabs) para organizar os recursos, e adicionar filtros na aba de listagem similares aos filtros da loja (categoria, DA, trafego, preco, status).

### Estrutura das Abas

| Aba | Conteudo |
|-----|----------|
| **Sites** (padrao) | Listagem com filtros + tabela paginada (AdminBacklinksManager) |
| **Importar** | Componente AdminBacklinksImport |
| **Categorizar** | Componente AdminCategorizer |

### Filtros na aba "Sites"

Inspirados nos filtros da loja (`BacklinkFilters.tsx`), adicionados acima da tabela:

- **Busca por texto** (dominio/URL) - ja existe, sera mantido
- **Categoria** - Select com as 17 categorias oficiais + "Todas"
- **DA** - Select com faixas (Todos, 10-20, 20-30, ... 90-99)
- **Trafego** - Select com faixas (Todos, 0-100, 100-1k, 1k-10k, 10k-100k, 100k+)
- **Preco maximo** - Select com faixas predefinidas em BRL
- **Status** - Select (Todos, Ativo, Inativo)

Todos os filtros serao aplicados na query server-side (Supabase) para manter a performance com muitos registros.

### Detalhes Tecnicos

**Arquivos modificados:**

1. **`src/pages/admin/AdminSites.tsx`**
   - Importar componente `Tabs` do shadcn
   - Criar 3 abas: "Sites", "Importar", "Categorizar"
   - Mover cada componente para sua aba correspondente

2. **`src/components/admin/AdminBacklinksManager.tsx`**
   - Adicionar estados para os novos filtros (category, daRange, trafficRange, maxPrice, status)
   - Criar uma barra de filtros com componentes `Select` acima da tabela
   - Atualizar a funcao `fetchRows` para aplicar os filtros na query Supabase (`.eq()`, `.gte()`, `.lte()`, etc.)
   - Manter a paginacao e busca por texto existentes

**Nenhuma alteracao no banco de dados e necessaria** - todos os filtros usam colunas ja existentes na tabela `backlinks`.

