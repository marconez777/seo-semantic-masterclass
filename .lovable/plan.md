# PRD - Marketplace de Backlinks v2.0

## Status: ✅ Implementado (Fases 1-5)

---

## Resumo da Implementação

### ✅ Fase 1: Segurança e Banco de Dados - CONCLUÍDA
- [x] Criar tabela `user_roles` com enum `app_role` (admin, user)
- [x] Criar função `has_role` (SECURITY DEFINER)
- [x] Migrar admins existentes de `profiles.is_admin` para `user_roles`
- [x] Adicionar colunas em `order_items_new` (anchor_text, target_url, mk_will_choose, item_status)
- [x] Adicionar colunas em `orders_new` (payment_method, payment_status, paid_at, stripe_session_id)
- [x] Atualizar RLS policies para usar `has_role`

### ✅ Fase 2: Sistema de Carrinho - CONCLUÍDA
- [x] Criar `CartContext.tsx` com persistência localStorage
- [x] Criar `CartModal.tsx` com tabela de itens e validação
- [x] Criar `CartIcon.tsx` para Header
- [x] Atualizar `BacklinkTableRow.tsx` para usar carrinho
- [x] Integrar CartProvider no App.tsx
- [x] Adicionar CartIcon no Header.tsx

### ✅ Fase 3: Checkout PIX - CONCLUÍDA
- [x] Fluxo de finalização de pedido no CartModal
- [x] Criação de pedido com status "aguardando_pagamento"
- [x] Redirecionamento para /continuar-comprando após checkout

### ✅ Fase 4: Dashboard do Cliente - CONCLUÍDA
- [x] Criar componente `OrdersList.tsx`
- [x] Adicionar aba "Meus Pedidos" no Dashboard
- [x] Exibir lista de pedidos com status expandível

### ✅ Fase 5: Painel Admin - CONCLUÍDA
- [x] Atualizar `RequireRole` para usar tabela `user_roles`
- [x] Refatorar `AdminPedidos.tsx` com:
  - Visualização de itens do pedido
  - Campos de âncora e URL
  - Botão "Marcar como Pago"
  - Botão WhatsApp para contato
  - Alteração de status do pedido e itens

### 🔲 Fase 6: Stripe (Opcional) - PENDENTE
- [ ] Criar edge function `create-checkout-session`
- [ ] Criar edge function `stripe-webhook`
- [ ] Integrar no fluxo de checkout

---

## Arquivos Criados/Modificados

### Novos Arquivos
- `src/contexts/CartContext.tsx` - Estado global do carrinho
- `src/components/cart/CartIcon.tsx` - Ícone com contador
- `src/components/cart/CartModal.tsx` - Modal do carrinho
- `src/components/dashboard/OrdersList.tsx` - Lista de pedidos do cliente

### Arquivos Modificados
- `src/App.tsx` - Adicionado CartProvider e CartModal
- `src/components/layout/Header.tsx` - Adicionado CartIcon
- `src/components/marketplace/BacklinkTableRow.tsx` - Integrado com carrinho
- `src/pages/Dashboard.tsx` - Adicionada aba "Meus Pedidos"
- `src/pages/admin/AdminPedidos.tsx` - Refatorado completamente
- `src/components/auth/RequireRole.tsx` - Usando user_roles

---

## Fluxo de Compra Implementado

1. Usuário navega no catálogo de backlinks
2. Clica "Comprar" → Item adicionado ao carrinho (botão muda para "No carrinho")
3. Clica no ícone do carrinho no header para abrir modal
4. Preenche âncora e URL para cada site (ou marca "Deixar a MK Art escolher")
5. Clica "Finalizar Pedido (PIX)"
6. Pedido criado com status "aguardando_pagamento"
7. Usuário redirecionado para continuar comprando
8. Admin vê pedido no painel com dados do cliente
9. Admin entra em contato via WhatsApp (botão direto)
10. Admin marca pedido como "Pago"
11. Cliente acompanha status no Dashboard → Meus Pedidos

---

## Próximos Passos (Opcional)

1. **Integração Stripe** - Pagamento automático com cartão
2. **Notificações por email** - Confirmação de pedido
3. **AdminClientes** - Página dedicada para gestão de clientes
4. **Remover ContactModal** - Componente obsoleto após implementação do carrinho
