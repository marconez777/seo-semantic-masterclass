
# Refatoracao: Sistema Dinamico de Listagem de Backlinks

## Resumo Executivo

Vamos transformar as 17 paginas de categoria individuais em um sistema dinamico unificado. Isso vai eliminar a duplicacao de codigo e tornar modificacoes futuras muito mais simples.

---

## Problema Atual

### Duplicacao Massiva de Codigo
- Existem **17 arquivos** de categoria separados (ComprarBacklinksImoveis.tsx, ComprarBacklinksNoticias.tsx, etc.)
- Cada arquivo tem aproximadamente **370 linhas**
- Total: ~6.300 linhas de codigo duplicado
- Para fazer qualquer alteracao (ex: mudar DR para DA), e necessario editar todos os 17 arquivos

### Consequencias
- Modificacoes sao lentas e propensas a erros
- Risco de inconsistencia entre paginas
- Dificil manter todas as paginas sincronizadas
- Aumento desnecessario do bundle size

---

## Solucao Proposta

Criar uma arquitetura de 3 camadas:

```text
+----------------------------------+
|     Paginas de Categoria         |
|  (apenas SEO e conteudo unico)   |
+----------------------------------+
              |
              v
+----------------------------------+
|    BacklinkMarketplace           |
|    (componente principal)        |
+----------------------------------+
              |
              v
+----------------------------------+
|    Componentes Reutilizaveis     |
|  CategoryGrid | BacklinkFilters  |
|  BacklinkTable | Pagination      |
+----------------------------------+
```

---

## Componentes a Criar/Modificar

### 1. Novo Componente Principal: BacklinkMarketplace

Arquivo: `src/components/marketplace/BacklinkMarketplace.tsx`

Este componente centraliza toda a logica de:
- Fetch de dados do banco
- Filtragem por categoria
- Filtragem por DA, trafego, preco
- Ordenacao
- Paginacao
- Auth gate

```text
interface BacklinkMarketplaceProps {
  category?: string;        // Filtrar por categoria (opcional)
  showCategoryGrid?: boolean; // Mostrar grid de categorias
}
```

### 2. Novo Componente: BacklinkTable

Arquivo: `src/components/marketplace/BacklinkTable.tsx`

Encapsula a tabela com:
- Cabecalho clicavel para ordenacao
- Corpo com BacklinkTableRow
- Loading state
- Empty state

### 3. Novo Hook: useBacklinkFilters

Arquivo: `src/hooks/useBacklinkFilters.ts`

Centraliza a logica de:
- Estado dos filtros (daRange, trafficRange, maxPrice)
- Sincronizacao com URL params
- Funcao parseRange

### 4. Novo Hook: useBacklinksQuery

Arquivo: `src/hooks/useBacklinksQuery.ts`

Gerencia:
- Fetch de dados do Supabase
- Cache com React Query
- Filtragem por categoria no servidor

---

## Nova Estrutura das Paginas de Categoria

Cada pagina de categoria ficara MUITO mais simples, com apenas 3 responsabilidades:

1. **SEO Head** - Titulo, descricao, meta tags unicas
2. **Structured Data** - Schema.org especifico
3. **Conteudo SEO** - Texto unico por categoria

### Exemplo: ComprarBacklinksImoveis.tsx (ANTES: 377 linhas)

```text
// DEPOIS: ~60 linhas
export default function ComprarBacklinksImoveis() {
  return (
    <>
      <SEOHead
        title="Comprar Backlinks de Imoveis..."
        description="..."
      />
      <CategoryStructuredData ... />
      <Header />
      <main>
        <BacklinkMarketplace 
          category="Imoveis"
          showCategoryGrid={true}
        >
          {/* Conteudo SEO unico */}
          <CategorySEOContent 
            title="Backlinks para Imoveis"
            description="..."
            content={<ImoveisContent />}
          />
        </BacklinkMarketplace>
      </main>
      <Footer />
    </>
  );
}
```

---

## Estrutura de Arquivos Final

```text
src/
  components/
    marketplace/
      BacklinkMarketplace.tsx    (NOVO - componente principal)
      BacklinkTable.tsx          (NOVO - tabela com ordenacao)
      BacklinkTableRow.tsx       (existente - manter)
      BacklinkFilters.tsx        (existente - manter)
      CategoryGrid.tsx           (existente - manter)
  hooks/
    useBacklinkFilters.ts        (NOVO - logica de filtros)
    useBacklinksQuery.ts         (NOVO - fetch com React Query)
  pages/
    ComprarBacklinks.tsx         (SIMPLIFICADO)
    ComprarBacklinksImoveis.tsx  (SIMPLIFICADO - ~60 linhas)
    ... (outras 16 categorias)   (SIMPLIFICADAS)
```

---

## Beneficios

### 1. Manutencao Simplificada
- Para alterar filtros: editar 1 arquivo (BacklinkFilters.tsx)
- Para alterar tabela: editar 1 arquivo (BacklinkTable.tsx)
- Para alterar logica: editar 1 arquivo (BacklinkMarketplace.tsx)

### 2. Consistencia Garantida
- Todas as paginas usam os mesmos componentes
- Impossivel ter paginas com comportamentos diferentes

### 3. Performance Melhorada
- React Query faz cache automatico dos dados
- Possibilidade de filtrar no servidor (reduz dados transferidos)
- Bundle menor (menos codigo duplicado)

### 4. Escalabilidade
- Adicionar nova categoria: criar arquivo de ~60 linhas
- Adicionar novo filtro: alterar 1 componente

---

## Plano de Implementacao

### Fase 1: Criar Infraestrutura (hooks e componentes base)
1. Criar `useBacklinkFilters.ts`
2. Criar `useBacklinksQuery.ts`
3. Criar `BacklinkTable.tsx`
4. Criar `BacklinkMarketplace.tsx`

### Fase 2: Migrar Pagina Principal
5. Refatorar `ComprarBacklinks.tsx` para usar BacklinkMarketplace

### Fase 3: Migrar Paginas de Categoria
6. Refatorar as 17 paginas de categoria (uma por vez)
7. Testar cada migracao

### Fase 4: Limpeza
8. Remover codigo duplicado
9. Testar todas as paginas

---

## Detalhes Tecnicos

### useBacklinkFilters.ts

```text
export function useBacklinkFilters() {
  const [daRange, setDaRange] = useState('todos');
  const [trafficRange, setTrafficRange] = useState('todos');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  
  // Sync with URL
  useEffect(() => { ... });
  
  // Parse range helper
  const parseRange = (value: string) => { ... };
  
  return {
    daRange, setDaRange,
    trafficRange, setTrafficRange,
    maxPrice, setMaxPrice,
    parseRange
  };
}
```

### useBacklinksQuery.ts

```text
export function useBacklinksQuery(category?: string) {
  return useQuery({
    queryKey: ['backlinks', category],
    queryFn: async () => {
      let query = supabase
        .from('backlinks_public')
        .select('*');
      
      if (category) {
        query = query.ilike('category', category);
      }
      
      const { data } = await query.order('da', { ascending: false });
      return adaptBacklinks(data);
    }
  });
}
```

### BacklinkMarketplace.tsx

```text
interface Props {
  category?: string;
  showCategoryGrid?: boolean;
  seoContent?: React.ReactNode;
}

export function BacklinkMarketplace({ 
  category, 
  showCategoryGrid = true,
  seoContent 
}: Props) {
  const { data: backlinks, isLoading } = useBacklinksQuery(category);
  const filters = useBacklinkFilters();
  const isMobile = useIsMobile();
  const { isAuthenticated } = useAuth();
  
  const filtered = useMemo(() => {
    return applyFilters(backlinks, filters);
  }, [backlinks, filters]);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
      <BacklinkFiltersSidebar 
        isMobile={isMobile}
        {...filters}
      />
      
      <section className="md:col-span-10">
        {showCategoryGrid && <CategoryGrid currentCategory={category} />}
        
        <BacklinkTable 
          data={filtered}
          isLoading={isLoading}
          isAuthenticated={isAuthenticated}
        />
        
        {seoContent}
      </section>
    </div>
  );
}
```

---

## Comparacao de Esforco Futuro

| Tarefa | Antes | Depois |
|--------|-------|--------|
| Mudar DR para DA | 17 arquivos | 1 arquivo |
| Adicionar novo filtro | 17 arquivos | 1 arquivo |
| Corrigir bug na tabela | 17 arquivos | 1 arquivo |
| Adicionar nova categoria | Criar 370 linhas | Criar 60 linhas |
| Alterar grid de categorias | 17 arquivos | 1 arquivo |

---

## Consideracoes de SEO

As paginas de categoria mantem:
- URLs unicas por categoria (/comprar-backlinks-imoveis)
- Meta tags unicas (title, description)
- Structured Data unico (CategoryStructuredData)
- Conteudo textual unico para SEO
- Arquivos HTML pre-renderizados em /public/pages/

Isso garante que o SEO nao sera afetado pela refatoracao.

---

## Resultado Esperado

1. **Codigo mais limpo**: 17 arquivos de ~60 linhas em vez de ~370 linhas
2. **Manutencao 17x mais rapida**: alterar 1 arquivo em vez de 17
3. **Performance similar ou melhor**: cache com React Query
4. **SEO preservado**: meta tags e conteudo unico por pagina
5. **Consistencia garantida**: impossivel ter comportamentos diferentes entre paginas
