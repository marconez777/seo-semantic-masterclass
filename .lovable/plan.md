

# Plano de Correção do Painel Administrativo

## Resumo do Problema

O painel administrativo possui incompatibilidades entre os componentes frontend e a estrutura do banco de dados. Isso impede a importacao de backlinks, criacao de posts e o acesso ao painel admin.

---

## 1. Corrigir AdminBacklinksImport.tsx

**Problema**: Os campos usados no componente nao existem na tabela `backlinks`.

**Mapeamento necessario**:
| Frontend (atual) | Banco de dados (correto) |
|------------------|--------------------------|
| `site_url` | `url` |
| `site_name` | `domain` |
| `price_cents` | `price` (em reais, nao centavos) |
| `is_active: true` | `status: 'ativo'` |

**Alteracoes**:
- Atualizar interface `ParsedRow` para usar `url`, `domain`, `price`
- Atualizar mapeamento no payload de insert
- Converter preco: deixar em reais (dividir centavos por 100)
- Usar `status: 'ativo'` ao inves de `is_active: true`

---

## 2. Corrigir AdminBacklinksManager.tsx

**Problema**: A interface `Backlink` e as queries usam campos inexistentes.

**Mapeamento necessario**:
| Frontend (atual) | Banco de dados (correto) |
|------------------|--------------------------|
| `site_url` | `url` |
| `site_name` | `domain` |
| `price_cents` | `price` |
| `is_active` | `status` |

**Alteracoes**:
- Atualizar interface `Backlink` com os campos corretos
- Atualizar a query para usar `site_url → url` etc
- Atualizar a exibicao na tabela
- Ajustar formatacao do preco (ja esta em reais)
- Exibir `status` ao inves de `is_active`

---

## 3. Corrigir AdminBlogNew.tsx e AdminBlogPublisher.tsx

**Problema**: Os campos usados no insert nao existem na tabela `posts`.

**Mapeamento necessario**:
| Frontend (atual) | Banco de dados (correto) |
|------------------|--------------------------|
| `content_md` | `content` |
| `featured_image_url` | `cover_image` |
| `seo_title` | Nao existe (usar `title`) |
| `seo_description` | `excerpt` |

**Alteracoes**:
- Substituir `content_md` por `content`
- Substituir `featured_image_url` por `cover_image`
- Remover `seo_title` (nao existe na tabela)
- Usar `excerpt` para descricao SEO
- Adicionar `published_at: new Date().toISOString()` quando publicado

---

## 4. Corrigir RequireRole.tsx

**Problema**: O componente busca `profiles.role` que nao existe. O campo correto e `is_admin` (boolean).

**Alteracoes**:
- Remover busca por `role` no JWT/metadata
- Consultar `profiles.is_admin` ao inves de `profiles.role`
- Verificar se `is_admin === true` para role admin

---

## 5. Corrigir AdminAuth.tsx

**Problema**: Tambem busca `profiles.role` que nao existe.

**Alteracoes**:
- Mudar `.select('role')` para `.select('is_admin')`
- Mudar `.eq('id', ...)` para `.eq('user_id', ...)` (campo correto)
- Verificar `profile?.is_admin === true`

---

## 6. Corrigir AdminBlogNew.tsx - Verificacao de Admin

**Problema**: Usa RPC `is_admin` que nao existe no banco.

**Alteracoes**:
- Remover chamada `supabase.rpc('is_admin', ...)`
- Consultar `profiles.is_admin` diretamente
- Usar `.eq('user_id', userId)` ao inves de `.eq('id', userId)`

---

## 7. Corrigir get-pii-data Edge Function

**Problema**: Depende de RPC `get_masked_pii_secure` que nao existe.

**Opcao escolhida**: Simplificar a Edge Function para retornar dados diretamente sem a RPC, ja que o admin ja tem acesso via service role key.

**Alteracoes**:
- Remover chamada `supabase.rpc('get_masked_pii_secure', ...)`
- Consultar dados diretamente via Supabase client com service role
- Manter validacao de admin no inicio
- Corrigir query para usar `.eq('user_id', ...)` na verificacao de admin

---

## 8. Criar Admin Inicial (Migracao SQL)

**Problema**: O banco esta vazio, nenhum usuario tem `is_admin = true`.

**Solucao**: Criar uma migracao que adiciona um trigger para auto-criar perfil e uma funcao para promover usuarios a admin.

```sql
-- Funcao para promover usuario a admin por email
CREATE OR REPLACE FUNCTION promote_to_admin(user_email TEXT)
RETURNS VOID AS $$
DECLARE
  target_user_id UUID;
BEGIN
  SELECT id INTO target_user_id FROM auth.users WHERE email = user_email;
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuario nao encontrado';
  END IF;
  
  INSERT INTO public.profiles (user_id, email, is_admin)
  VALUES (target_user_id, user_email, true)
  ON CONFLICT (user_id) 
  DO UPDATE SET is_admin = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Apos a migracao**: Voce precisara:
1. Criar uma conta via /auth (signup)
2. Executar no SQL Editor do Lovable Cloud: `SELECT promote_to_admin('seu@email.com');`

---

## Ordem de Implementacao

1. **Migracao SQL** - Criar funcao para promover admin
2. **RequireRole.tsx** - Corrigir verificacao de admin
3. **AdminAuth.tsx** - Corrigir login admin
4. **AdminBacklinksImport.tsx** - Corrigir mapeamento de campos
5. **AdminBacklinksManager.tsx** - Corrigir interface e queries
6. **AdminBlogNew.tsx** - Corrigir campos e verificacao admin
7. **AdminBlogPublisher.tsx** - Corrigir campos do post
8. **get-pii-data Edge Function** - Simplificar sem RPC

---

## Resumo das Alteracoes

| Arquivo | Tipo de Alteracao |
|---------|-------------------|
| Migracao SQL | Criar funcao `promote_to_admin` |
| RequireRole.tsx | Usar `is_admin` boolean |
| AdminAuth.tsx | Usar `is_admin` e `user_id` |
| AdminBacklinksImport.tsx | Mapear campos corretamente |
| AdminBacklinksManager.tsx | Mapear campos corretamente |
| AdminBlogNew.tsx | Mapear campos e verificacao |
| AdminBlogPublisher.tsx | Mapear campos |
| get-pii-data/index.ts | Remover RPC inexistente |

---

## Secao Tecnica - Detalhes de Implementacao

### Tabela backlinks (estrutura real)
```typescript
{
  id: string
  url: string          // antes: site_url
  domain: string       // antes: site_name  
  category: string
  price: number        // antes: price_cents (agora em reais)
  da: number
  dr: number
  traffic: number
  status: string       // antes: is_active (boolean)
  tipo: string
  observacoes: string
  created_at: string
  updated_at: string
}
```

### Tabela posts (estrutura real)
```typescript
{
  id: string
  title: string
  slug: string
  content: string      // antes: content_md
  cover_image: string  // antes: featured_image_url
  excerpt: string      // usar para SEO description
  category: string
  tags: string[]
  published: boolean
  published_at: string
  user_id: string
  created_at: string
  updated_at: string
}
```

### Tabela profiles (estrutura real)
```typescript
{
  id: string
  user_id: string      // referencia auth.users.id
  email: string
  full_name: string
  avatar_url: string
  is_admin: boolean    // antes: role (enum)
  created_at: string
  updated_at: string
}
```

