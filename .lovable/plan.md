

## Ocultar precos para usuarios nao autenticados

### O que sera feito

Alterar o componente `BacklinkTableRow` para exibir os precos como "---" ou um placeholder quando o usuario nao estiver logado, em vez de mostrar o valor real.

### Implementacao

**Arquivo: `src/components/marketplace/BacklinkTableRow.tsx`**
- Adicionar uma nova prop `isAuthenticated` ao componente
- Na coluna de preco, exibir `R$ ***` ou `--` quando `isAuthenticated` for `false`, em vez do valor real
- Isso se aplica a TODAS as linhas, nao apenas as com blur

**Arquivo: `src/components/marketplace/BacklinkTable.tsx`**
- Passar a prop `isAuthenticated` para cada `BacklinkTableRow`

### Resultado

- Usuarios logados: veem os precos normalmente
- Usuarios nao logados: veem um placeholder no lugar do preco em todas as linhas visiveis (as 4 normais + 3 com blur), incentivando o cadastro para ter acesso completo

