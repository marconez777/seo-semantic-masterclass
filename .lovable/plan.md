
# PRD - Marketplace de Backlinks v2.0

## 1. Visao Geral

Transformar o catalogo atual de compra via WhatsApp em um e-commerce completo com carrinho de compras, checkout com multiplas opcoes de pagamento (PIX manual e Stripe), painel do cliente para acompanhamento de pedidos e painel administrativo robusto e isolado.

---

## 2. Situacao Atual

### Fluxo de Compra Existente
- Usuario navega no catalogo de backlinks (`/comprar-backlinks`)
- Clica em "Comprar" no site desejado
- Abre modal (`ContactModal`) para preencher ancora e URL
- Redireciona para WhatsApp com mensagem pre-formatada
- Processo de pagamento e acompanhamento e manual via WhatsApp

### Painel do Usuario Atual
- Apenas exibe favoritos e perfil basico
- Nao mostra pedidos ou historico de compras
- Nao tem acompanhamento de status

### Painel Admin Atual
- Gerenciamento basico de pedidos (`AdminPedidos`)
- Importacao e gestao de backlinks (`AdminBacklinksManager`, `AdminBacklinksImport`)
- Nao tem gestao de clientes dedicada
- Verificacao de admin via `profiles.is_admin` (inseguro)

---

## 3. Requisitos Funcionais

### 3.1 Sistema de Carrinho de Compras

**Objetivo**: Permitir compra de multiplos backlinks em uma unica transacao

| Funcionalidade | Descricao |
|----------------|-----------|
| Adicionar ao carrinho | Botao "Comprar" adiciona item ao carrinho e abre modal |
| Modal do carrinho | Lista de sites com campos para ancora e URL de destino |
| Opcao "MK escolhe" | Checkbox para delegar escolha de ancora/URL ao admin |
| Persistencia | Carrinho salvo em localStorage |
| Resumo | Exibe precos individuais e total |
| Remocao | Permite remover itens do carrinho |

### 3.2 Checkout e Pagamentos

**Opcoes de Pagamento**:

| Metodo | Descricao |
|--------|-----------|
| PIX via WhatsApp | Cliente finaliza pedido, admin envia QR code manualmente |
| Stripe (Cartao) | Pagamento automatico via Stripe Checkout |

**Fluxo PIX Manual**:
```text
1. Cliente finaliza pedido no sistema
2. Pedido criado com status "aguardando_pagamento"
3. Admin ve pedido no painel com WhatsApp do cliente
4. Admin gera QR code PIX e envia via WhatsApp
5. Apos confirmacao, admin marca como "pago" no sistema
```

### 3.3 Painel do Cliente (Dashboard)

**Novas Funcionalidades**:

| Aba | Funcionalidade |
|-----|----------------|
| Meus Pedidos | Lista de pedidos com status e detalhes |
| Favoritos | Sites favoritos (existente) |
| Perfil | Dados cadastrais (existente) |

**Status de Pedidos**:
- Aguardando Pagamento
- Pago
- Em Producao
- Entregue
- Cancelado

### 3.4 Painel Administrativo

**Modulos Necessarios**:

| Modulo | Funcionalidades |
|--------|-----------------|
| Gestao de Vendas | Ver pedidos, mudar status, marcar pago, ver ancora/URL |
| Gestao de Clientes | Listar usuarios, ver historico, contato WhatsApp |
| Gestao de Sites | CRUD completo, importacao, edicao de metricas |
| Blog | Gestao de posts (existente) |

**Seguranca Admin**:
- Criar tabela `user_roles` separada (nao usar `profiles.is_admin`)
- Funcao `has_role` com SECURITY DEFINER
- Componente `RequireAdminRole` isolado

---

## 4. Alteracoes no Banco de Dados

### 4.1 Nova Tabela: `user_roles`

```text
+-------------------+
|    user_roles     |
+-------------------+
| id        UUID PK |
| user_id   UUID FK |
| role      ENUM    |
| created_at TIMESTAMP |
+-------------------+

Roles: 'admin', 'user'
```

### 4.2 Alteracoes em `order_items_new`

Adicionar campos para dados do servico:

| Campo | Tipo | Descricao |
|-------|------|-----------|
| anchor_text | TEXT | Texto ancora do link |
| target_url | TEXT | URL de destino |
| item_status | TEXT | Status individual do item |
| mk_will_choose | BOOLEAN | Se true, admin define ancora/URL |

### 4.3 Alteracoes em `orders_new`

Adicionar campos para pagamento:

| Campo | Tipo | Descricao |
|-------|------|-----------|
| payment_method | TEXT | pix_whatsapp, stripe |
| payment_status | TEXT | aguardando, pago, falhou |
| paid_at | TIMESTAMPTZ | Data do pagamento |
| stripe_session_id | TEXT | ID da sessao Stripe (opcional) |

---

## 5. Componentes Frontend

### 5.1 Novos Componentes

| Componente | Descricao |
|------------|-----------|
| `CartContext.tsx` | Estado global do carrinho |
| `CartModal.tsx` | Modal central com tabela de itens |
| `CartIcon.tsx` | Icone no header com contador |
| `OrdersList.tsx` | Lista de pedidos do cliente |
| `OrderDetails.tsx` | Detalhes expandidos do pedido |
| `AdminClientes.tsx` | Pagina de gestao de clientes |
| `RequireAdminRole.tsx` | Guard de rotas admin (isolado) |

### 5.2 Arquivos a Modificar

| Arquivo | Alteracao |
|---------|-----------|
| `Header.tsx` | Adicionar CartIcon |
| `BacklinkTableRow.tsx` | Integrar com carrinho |
| `Dashboard.tsx` | Adicionar aba "Meus Pedidos" |
| `AdminPedidos.tsx` | Exibir campos ancora/URL, botao "Marcar Pago" |
| `AdminLayout.tsx` | Adicionar menu "Clientes" |
| `ContactModal.tsx` | Remover (substituido pelo carrinho) |

---

## 6. Integracao Stripe

### Edge Functions Necessarias

| Funcao | Descricao |
|--------|-----------|
| `create-checkout-session` | Cria sessao de pagamento Stripe |
| `stripe-webhook` | Recebe eventos do Stripe e atualiza pedido |

### Fluxo Stripe

```text
1. Cliente clica "Pagar com Cartao"
2. Frontend chama create-checkout-session
3. Redireciona para Stripe Checkout
4. Apos pagamento, Stripe envia webhook
5. Webhook atualiza status do pedido para "pago"
```

---

## 7. Fluxo do Usuario

### 7.1 Compra com PIX

```text
1. Navega no catalogo
2. Clica "Comprar" em varios sites
3. Modal do carrinho abre
4. Preenche ancora e URL (ou marca "MK escolhe")
5. Clica "Finalizar Pedido"
6. Escolhe "PIX via WhatsApp"
7. Pedido criado (aguardando_pagamento)
8. Tela de confirmacao: "Entraremos em contato via WhatsApp"
9. Admin envia PIX
10. Apos pagar, status muda para "Pago"
11. Cliente acompanha no Dashboard
```

### 7.2 Compra com Stripe

```text
1-5. Mesmo fluxo acima
6. Escolhe "Pagar com Cartao"
7. Redireciona para Stripe
8. Paga com cartao
9. Retorna para confirmacao
10. Pedido ja marcado como "Pago"
```

---

## 8. Ordem de Implementacao

### Fase 1: Seguranca e Banco de Dados
1. Criar tabela `user_roles` com enum de roles
2. Criar funcao `has_role` (SECURITY DEFINER)
3. Migrar admins atuais para nova tabela
4. Adicionar colunas em `order_items_new` (anchor_text, target_url, mk_will_choose)
5. Adicionar colunas em `orders_new` (payment_method, payment_status, paid_at)

### Fase 2: Sistema de Carrinho
6. Criar CartContext com persistencia localStorage
7. Criar CartModal com tabela e inputs
8. Criar CartIcon para Header
9. Atualizar BacklinkTableRow para usar carrinho

### Fase 3: Checkout
10. Criar fluxo de finalizacao de pedido (PIX manual)
11. Criar tela de confirmacao
12. Integrar Stripe (opcional, fase posterior)

### Fase 4: Dashboard do Cliente
13. Adicionar aba "Meus Pedidos" no Dashboard
14. Criar componentes OrdersList e OrderDetails

### Fase 5: Painel Admin
15. Criar RequireAdminRole usando user_roles
16. Atualizar AdminPedidos com campos de ancora/URL e acoes
17. Criar AdminClientes

### Fase 6: Stripe (Opcional)
18. Criar edge function create-checkout-session
19. Criar edge function stripe-webhook
20. Integrar no fluxo de checkout

---

## 9. Criterios de Aceite

| Requisito | Criterio |
|-----------|----------|
| Carrinho | Usuario adiciona multiplos itens e eles persistem ao recarregar |
| Validacao | Nao pode finalizar sem ancora/URL (ou "MK escolhe" marcado) |
| Pedido criado | Aparece como "Aguardando Pagamento" no Dashboard |
| Admin ve dados | Admin ve ancora, URL e WhatsApp do cliente |
| Marcar pago | Admin consegue mudar status para "Pago" |
| Seguranca | Roles verificados via tabela separada, nao profiles.is_admin |

---

## 10. Secao Tecnica

### Interface CartItem

```typescript
interface CartItem {
  backlink_id: string;
  domain: string;
  url: string;
  dr: number | null;
  da: number | null;
  traffic: number | null;
  category: string;
  price: number;
  anchor_text?: string;
  target_url?: string;
}

interface CartContextType {
  items: CartItem[];
  mkWillChoose: boolean;
  setMkWillChoose: (value: boolean) => void;
  addItem: (backlink: BacklinkData) => void;
  removeItem: (backlink_id: string) => void;
  updateItem: (backlink_id: string, data: Partial<CartItem>) => void;
  clearCart: () => void;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  total: number;
  itemCount: number;
  isInCart: (backlink_id: string) => boolean;
}
```

### Migracao SQL - User Roles

```sql
-- Criar enum de roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Criar tabela user_roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Habilitar RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Funcao SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Policy: apenas admins podem ver
CREATE POLICY "Admins can view user_roles"
ON public.user_roles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Migrar admins existentes
INSERT INTO public.user_roles (user_id, role)
SELECT user_id, 'admin'::app_role
FROM public.profiles
WHERE is_admin = true
ON CONFLICT (user_id, role) DO NOTHING;
```

### Migracao SQL - Order Items

```sql
ALTER TABLE public.order_items_new
ADD COLUMN anchor_text TEXT,
ADD COLUMN target_url TEXT,
ADD COLUMN item_status TEXT DEFAULT 'pendente',
ADD COLUMN mk_will_choose BOOLEAN DEFAULT false;
```

### Migracao SQL - Orders

```sql
ALTER TABLE public.orders_new
ADD COLUMN payment_method TEXT DEFAULT 'pix_whatsapp',
ADD COLUMN payment_status TEXT DEFAULT 'aguardando',
ADD COLUMN paid_at TIMESTAMPTZ,
ADD COLUMN stripe_session_id TEXT;
```

---

## 11. Arquivos a Criar

| Arquivo | Descricao |
|---------|-----------|
| `src/contexts/CartContext.tsx` | Estado global do carrinho |
| `src/components/cart/CartModal.tsx` | Modal do carrinho |
| `src/components/cart/CartTable.tsx` | Tabela de itens |
| `src/components/cart/CartIcon.tsx` | Icone no header |
| `src/components/dashboard/OrdersList.tsx` | Lista de pedidos |
| `src/components/dashboard/OrderDetails.tsx` | Detalhes do pedido |
| `src/pages/admin/AdminClientes.tsx` | Gestao de clientes |
| `src/components/admin/RequireAdminRole.tsx` | Guard isolado |
| `src/pages/OrderConfirmation.tsx` | Confirmacao de pedido |
| `supabase/functions/create-checkout-session/index.ts` | Stripe checkout |
| `supabase/functions/stripe-webhook/index.ts` | Webhook Stripe |
