

## Corrigir ocultacao de precos e sites na pagina /agencia-de-backlinks

### Problema

A pagina `AgenciaBacklinks.tsx` tem sua propria implementacao de tabela independente. Ela renderiza `BacklinkTableRow` diretamente (linha 529) **sem passar as props `isAuthenticated` e `shouldBlur`**, e tambem nao inclui o overlay `TableAuthGate`. Por isso, todos os precos e sites sao exibidos normalmente mesmo para visitantes nao logados.

### Solucao

Aplicar a mesma logica de bloqueio que ja existe nas outras paginas do marketplace:

**Arquivo: `src/pages/AgenciaBacklinks.tsx`**

1. Importar `useAuth` de `@/hooks/useAuth` e `TableAuthGate` de `@/components/auth/TableAuthGate`
2. Chamar `const { isAuthenticated } = useAuth()` no componente
3. Na lista `visible`, limitar para 7 itens com blur nos ultimos 3 quando nao autenticado (mesma logica do `BacklinkTable.tsx`)
4. Passar `isAuthenticated={isAuthenticated}` e `shouldBlur={item.shouldBlur}` para cada `BacklinkTableRow`
5. Adicionar o componente `TableAuthGate` como overlay sobre a tabela quando `!isAuthenticated`
6. Ocultar a paginacao quando o usuario nao estiver autenticado

### Detalhes tecnicos

- Importar: `useAuth` e `TableAuthGate`
- Modificar o calculo de `visible` (linha 151-154): quando `!isAuthenticated`, pegar apenas 7 itens e marcar `shouldBlur: true` nos itens com index >= 4
- Na renderizacao do `BacklinkTableRow` (linha 529): passar `shouldBlur={b.shouldBlur}` e `isAuthenticated={isAuthenticated}`
- Envolver a tabela em um `div` com `position: relative` e adicionar `<TableAuthGate />` quando `!isAuthenticated`
- Esconder controles de paginacao quando `!isAuthenticated`

