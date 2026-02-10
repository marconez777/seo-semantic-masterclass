

## Corrigir Sitemap para incluir posts do blog automaticamente

### Problema identificado
O domínio `mkart.com.br/sitemap.xml` está servindo o arquivo estático `public/sitemap.xml`, que foi criado manualmente em dezembro de 2025 e nao inclui nenhum post do blog. A Edge Function `generate-sitemap` ja existe e busca os posts dinamicamente do banco, mas nao esta sendo utilizada.

### Solucao

**1. Atualizar o arquivo `public/sitemap.xml` para ser gerado dinamicamente**

Como o site e uma SPA hospedada estaticamente, a forma mais confiavel e substituir o conteudo do `public/sitemap.xml` por um redirect ou, melhor ainda, atualizar o proprio arquivo estatico com todos os dados atuais e configurar o `robots.txt` para apontar para a Edge Function.

A melhor abordagem e dupla:

**Opcao A - Apontar o robots.txt para a Edge Function:**
- Atualizar `public/robots.txt` para incluir: `Sitemap: https://nxitvhrfloibpwrkskzx.supabase.co/functions/v1/generate-sitemap`
- Isso faz o Google e outros bots usarem o sitemap dinamico

**Opcao B - Atualizar o sitemap estatico como fallback:**
- Reescrever `public/sitemap.xml` com todas as URLs atuais incluindo os 8 posts publicados
- Adicionar as paginas SEO dinamicas

**2. Corrigir URLs inconsistentes no sitemap estatico**

O sitemap estatico atual tem URLs diferentes das rotas reais:
- `agencia-backlinks` vs rota real `agencia-de-backlinks`
- `consultoria-saas` vs rota real `consultoria-seo-saas`
- `contact` vs rota real `contato`

**3. Garantir que a Edge Function funcione corretamente**

A Edge Function `generate-sitemap` ja esta implementada e busca posts e paginas SEO do banco. Apenas precisa de um pequeno ajuste nas URLs estaticas para manter consistencia.

### Detalhes tecnicos

#### Arquivo 1: `public/robots.txt`
- Adicionar a linha `Sitemap:` apontando para a Edge Function dinamica
- Isso garante que buscadores sempre vejam o sitemap atualizado

#### Arquivo 2: `public/sitemap.xml`
- Reescrever com todas as URLs corretas (paginas estaticas + 8 posts do blog)
- Servir como fallback caso a Edge Function esteja indisponivel

#### Arquivo 3: `supabase/functions/generate-sitemap/index.ts`
- Corrigir URLs estaticas inconsistentes (`/agencia-de-backlinks`, `/consultoria-seo-saas`, `/contato`)
- Manter a logica de busca dinamica de posts e paginas SEO

#### Arquivo 4: `public/robots.txt`
- Atualizar referencia do Sitemap para a Edge Function

### Resultado esperado
- Buscadores (Google, Bing) usarao o sitemap dinamico da Edge Function
- Cada novo post publicado aparecera automaticamente no sitemap
- Paginas SEO gerenciadas pelo admin tambem serao incluidas automaticamente
- O arquivo estatico servira como backup com os dados mais recentes

