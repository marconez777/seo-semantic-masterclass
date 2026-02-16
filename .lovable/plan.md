

## Redirecionar botao "Comprar" para login quando usuario nao esta logado

### Problema

O `handleAddToCart` no `BacklinkTableRow.tsx` adiciona o item ao carrinho sem verificar se o usuario esta autenticado. O componente ja recebe a prop `isAuthenticated`, mas nao a utiliza nessa funcao.

### Solucao

No arquivo `src/components/marketplace/BacklinkTableRow.tsx`:

1. Importar `useNavigate` de `react-router-dom`
2. No `handleAddToCart`, adicionar uma verificacao no inicio: se `!isAuthenticated`, redirecionar para `/auth` com `state: { from: location.pathname }` e retornar sem adicionar ao carrinho
3. Mesma logica sera aplicada: usuario deslogado clica em "Comprar" e vai para a tela de login/cadastro

### Detalhes tecnicos

- Importar `useNavigate` e `useLocation` de `react-router-dom`
- No inicio de `handleAddToCart`: `if (!isAuthenticated) { navigate('/auth', { state: { from: location.pathname } }); return; }`
- Nenhuma outra alteracao necessaria, pois a prop `isAuthenticated` ja e passada corretamente pelo `BacklinkTable` e pela pagina `AgenciaBacklinks`
