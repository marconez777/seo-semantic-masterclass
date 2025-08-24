# MK Art SEO - Documentação Completa

## Visão Geral

O MK Art SEO é uma plataforma para venda de backlinks e serviços de SEO. O sistema foi completamente reestruturado com quarentena do checkout legado e migração para nova arquitetura focada em contato direto.

## Arquitetura do Sistema

### Frontend (React + TypeScript)
- **Framework**: Vite + React + TypeScript
- **Styling**: Tailwind CSS com design system personalizado
- **Componentes**: shadcn/ui customizados
- **Roteamento**: React Router DOM
- **Autenticação**: Supabase Auth

### Backend (Supabase)
- **Banco de dados**: PostgreSQL com RLS (Row Level Security)
- **Edge Functions**: Deno para lógica customizada
- **Armazenamento**: Supabase Storage (bucket 'blog')
- **Autenticação**: Built-in Supabase Auth

## Estrutura do Banco de Dados

### Tabelas Ativas
1. **backlinks** - Produtos principais (sites para backlinks)
2. **backlinks_public** - View pública sincronizada
3. **categories** - Categorias de produtos
4. **posts** - Blog posts
5. **profiles** - Perfis de usuários
6. **user_roles** - Sistema de roles
7. **favoritos** - Favoritos dos usuários
8. **orders_new** - Novos pedidos (substituindo legado)
9. **order_items_new** - Itens dos novos pedidos

### Tabelas Quarentenadas (Legacy)
- pedidos_legacy
- order_items_legacy
- order_receipts_legacy
- payment_logs_legacy

### Funções Seguras
- `get_pii_encryption_key()` - Chave de criptografia
- `has_role()` - Verificação de roles
- `insert_pedidos_pii_encrypted()` - Inserção segura de PII

## Fluxo de Compra Atual

### Sistema Anterior (Desabilitado)
- Carrinho de compras com múltiplos produtos
- Pagamento via PIX automatizado
- Processamento de pedidos automático

### Sistema Atual (Contato Direto)
1. **Navegação**: Usuario explora backlinks por categoria
2. **Interesse**: Clique em "Comprar" abre modal de contato
3. **Contato**: Formulário envia dados via Edge Function
4. **Negociação**: Processo manual via WhatsApp/email
5. **Fechamento**: Acordo direto com cliente

## Principais Páginas

### Públicas
- `/` - Homepage com hero e seções
- `/comprar-backlinks` - Marketplace principal
- `/comprar-backlinks-[categoria]` - Páginas por categoria
- `/agencia-de-backlinks` - Página institucional
- `/consultoria-seo` - Serviços de consultoria
- `/blog` - Blog posts
- `/contato` - Formulário de contato

### Privadas (Auth)
- `/painel` - Dashboard do usuário
- `/recibo/[id]` - Visualização de recibos

### Admin
- `/admin` - Painel administrativo
- `/admin/sites` - Gerenciar backlinks
- `/admin/blog` - Gerenciar posts
- `/admin/blog/novo` - Criar novo post

## Edge Functions Ativas

### send-contact-email
- **Rota**: `/functions/v1/send-contact-email`
- **Uso**: Processar formulários de contato
- **Secrets**: RESEND_API_KEY

### get-pii-data
- **Rota**: `/functions/v1/get-pii-data`
- **Uso**: Acessar dados pessoais criptografados
- **Secrets**: PII_ENCRYPTION_KEY

### seo-health-check
- **Rota**: `/functions/v1/seo-health-check`
- **Uso**: Monitoramento SEO automatizado

## Sistema de Roles

### Tipos de Usuário
- **user** - Usuário padrão
- **admin** - Administrador completo

### Permissões
- Admin: Acesso total ao painel admin
- User: Acesso apenas ao próprio painel

## SEO e Performance

### Otimizações Implementadas
- Meta tags dinâmicas por página
- Structured Data (JSON-LD)
- Sitemap.xml gerado
- Robots.txt configurado
- Páginas pré-renderizadas
- Breadcrumbs semânticos
- Otimização de imagens

### URLs Canonicais
- Base: `https://mkart.com.br`
- Todas as páginas incluem canonical URLs

## Segurança

### RLS (Row Level Security)
- Todas as tabelas protegidas por RLS
- Policies específicas por role
- Dados PII criptografados

### Autenticação
- JWT tokens via Supabase
- Sessions persistentes
- Logout automático em idle

## Migrações Recentes

### Quarentena do Checkout (Concluída)
1. ✅ Backup completo das tabelas legadas
2. ✅ Renomeação para *_legacy
3. ✅ Remoção de Edge Functions de pagamento
4. ✅ Desabilitação de rotas de checkout
5. ✅ Migração para sistema de contato direto
6. ✅ Logs de migração em `checkout_migration_log`

### Próximos Passos
- [ ] Limpeza final de código legacy
- [ ] Otimizações de performance
- [ ] Melhorias no sistema de blog
- [ ] Analytics avançado