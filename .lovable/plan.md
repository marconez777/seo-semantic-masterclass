

# Plano: Campo WhatsApp Obrigatorio no Cadastro

## Resumo

Adicionar campo de WhatsApp obrigatorio no cadastro para que o admin possa entrar em contato com o cliente e enviar o QR code do PIX.

---

## Alteracoes Necessarias

### 1. Banco de Dados - Adicionar coluna `whatsapp` em `profiles`

Adicionar nova coluna na tabela `profiles`:

| Campo | Tipo | Descricao |
|-------|------|-----------|
| whatsapp | TEXT | Numero de WhatsApp do cliente (obrigatorio via app) |

### 2. Frontend - Formulario de Cadastro (Auth.tsx)

**Alteracoes:**
- Renomear label de "Telefone" para "WhatsApp" 
- Adicionar validacao: campo obrigatorio
- Adicionar mascara/placeholder: (11) 99999-9999
- Exibir mensagem de erro se nao preenchido
- Continuar salvando em `user_metadata` E criar/atualizar registro em `profiles`

### 3. Criar Perfil ao Cadastrar

Apos o signup, criar automaticamente o registro na tabela `profiles` com:
- `user_id` = ID do usuario autenticado
- `email` = email do usuario
- `full_name` = nome informado
- `whatsapp` = numero informado

**Opcoes de implementacao:**
1. **Trigger no banco** (recomendado): Criar trigger que escuta `auth.users` e cria perfil automaticamente
2. **No frontend**: Apos signup bem sucedido, fazer insert na tabela `profiles`

### 4. Edge Function - Retornar dados do cliente

Atualizar `get-pii-data/index.ts` para buscar dados reais da tabela `profiles`:
- Consultar `profiles` pelo `user_id` do pedido
- Retornar `email`, `full_name` e `whatsapp`

### 5. Painel Admin - Exibir WhatsApp

O `AdminPedidos.tsx` ja esta preparado para exibir `customer_phone` - basta garantir que a edge function retorne o dado corretamente.

---

## Fluxo Completo

```text
1. Usuario acessa /auth e seleciona "Sou novo por aqui"
2. Preenche: Nome, WhatsApp*, Email, Senha
3. Se WhatsApp vazio → erro "WhatsApp e obrigatorio"
4. Ao clicar "Cadastrar":
   a) Supabase cria usuario em auth.users (com metadata)
   b) Trigger cria registro em profiles (com whatsapp)
5. Usuario confirma email e faz login
6. Ao fazer pedido, admin ve WhatsApp na tela de pedidos
7. Admin entra em contato via WhatsApp para enviar PIX
```

---

## Arquivos a Modificar

| Arquivo | Alteracao |
|---------|-----------|
| Migracao SQL | Adicionar coluna `whatsapp` em `profiles` |
| Migracao SQL | Criar trigger para auto-criar perfil |
| `src/pages/Auth.tsx` | Validacao obrigatoria + label WhatsApp |
| `supabase/functions/get-pii-data/index.ts` | Buscar dados de `profiles` |

---

## Secao Tecnica

### Migracao SQL - Coluna WhatsApp

```sql
-- Adicionar coluna whatsapp na tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN whatsapp TEXT;

-- Criar funcao para auto-criar perfil quando usuario e criado
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, whatsapp)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'phone'
  )
  ON CONFLICT (user_id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    whatsapp = COALESCE(EXCLUDED.whatsapp, profiles.whatsapp),
    updated_at = now();
  RETURN NEW;
END;
$$;

-- Criar trigger (apenas se nao existir)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

### Validacao no Frontend (Auth.tsx)

```typescript
const handleSignup = async () => {
  // Validacao
  if (!name.trim()) {
    setError("Nome e obrigatorio");
    return;
  }
  if (!phone.trim()) {
    setError("WhatsApp e obrigatorio para receber o PIX");
    return;
  }
  if (!email.trim()) {
    setError("E-mail e obrigatorio");
    return;
  }
  if (password.length < 6) {
    setError("Senha deve ter no minimo 6 caracteres");
    return;
  }

  setLoading(true);
  setError(null);
  // ... resto do codigo
};
```

### Edge Function Atualizada

```typescript
// Buscar dados de profiles para cada order
const orderUserIds = orders.map(o => o.user_id);

const { data: profiles } = await supabaseClient
  .from('profiles')
  .select('user_id, email, full_name, whatsapp')
  .in('user_id', orderUserIds);

const profileMap = new Map(profiles?.map(p => [p.user_id, p]) ?? []);

const result = orders.map(order => ({
  order_id: order.id,
  customer_email: profileMap.get(order.user_id)?.email ?? null,
  customer_name: profileMap.get(order.user_id)?.full_name ?? null,
  customer_phone: profileMap.get(order.user_id)?.whatsapp ?? null,
  customer_cpf: null // Removido do sistema
}));

return new Response(JSON.stringify({ data: result }), ...);
```

---

## Integracao com Plano Principal

Esta alteracao se integra ao plano do Marketplace v2.0:
- Garante que todo cliente tenha WhatsApp cadastrado
- Admin pode entrar em contato para enviar PIX
- Dados ficam na tabela `profiles` (nao em tabela PII separada - simplificacao)

