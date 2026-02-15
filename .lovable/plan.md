

## Trocar coluna DR por DA no modal do carrinho

### Alteracao

No arquivo `src/components/cart/CartModal.tsx`, substituir a coluna "DR" por "DA":

- No cabecalho da tabela: trocar `<th>DR</th>` por `<th>DA</th>`
- No corpo da tabela: trocar `{item.dr ?? "-"}` por `{item.da ?? "-"}`

Alteracao em 2 linhas apenas.

