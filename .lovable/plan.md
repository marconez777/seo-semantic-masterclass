

## Esconder botao WhatsApp quando o modal do carrinho estiver aberto

### Alteracao

No arquivo `src/components/ui/whatsapp-fab.tsx`:

1. Importar `useCart` de `@/contexts/CartContext`
2. Verificar `isOpen` do carrinho
3. Se `isOpen` for true, retornar `null` (esconder o botao)

### Detalhes tecnicos

- Adicionar `import { useCart } from "@/contexts/CartContext"`
- No inicio do componente, apos o check de admin: `const { isOpen: cartOpen } = useCart()`
- Adicionar: `if (cartOpen) return null`

Alteracao simples em 3 linhas.

