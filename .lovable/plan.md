

## Adicionar icones de ordenacao na tabela da loja

### Problema
Na loja (`BacklinkTable.tsx`), os cabecalhos das colunas sao clicaveis para ordenar, mas nao ha indicacao visual de que isso e possivel. O icone so aparece apos o usuario clicar.

### Solucao
Trocar os icones `ChevronUp`/`ChevronDown` pelos mesmos icones usados no admin (`ArrowUp`, `ArrowDown`, `ArrowUpDown`), mostrando `ArrowUpDown` em todas as colunas ordenaveis como estado "idle".

### Arquivo modificado

**`src/components/marketplace/BacklinkTable.tsx`**

- Substituir imports de `ChevronUp`/`ChevronDown` por `ArrowUp`, `ArrowDown`, `ArrowUpDown`
- Atualizar o componente `SortIcon` para:
  - Quando a coluna **nao esta ativa**: mostrar `ArrowUpDown` com opacidade reduzida (`text-muted-foreground/50`)
  - Quando a coluna **esta ativa em asc**: mostrar `ArrowUp`
  - Quando a coluna **esta ativa em desc**: mostrar `ArrowDown`
- Remover a logica que retorna `null` quando a coluna nao esta selecionada
- Usar `size={14}` e layout `inline-flex items-center gap-1` no `<th>` para consistencia visual com o admin

### Resultado
Todas as colunas ordenaveis (Site, DA, Trafego, Categoria, Preco) mostrarao o icone de setas bidirecionais, indicando ao usuario que e possivel clicar para organizar.

