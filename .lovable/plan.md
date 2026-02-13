

## Botao "Atualizar Sitemap" no Admin Blog

### Problema
O arquivo `public/sitemap.xml` e estatico e nao se atualiza quando novos posts sao publicados. A edge function `generate-sitemap` ja gera o sitemap completo dinamicamente, mas o arquivo estatico tem prioridade.

### Solucao

**1. Redirecionar `/sitemap.xml` para a edge function dinamica**

Adicionar uma regra no `public/_redirects` para que `/sitemap.xml` seja servido pela edge function (que ja inclui todos os posts automaticamente):

```text
/sitemap.xml  https://nxitvhrfloibpwrkskzx.supabase.co/functions/v1/generate-sitemap  200
```

Remover o arquivo estatico `public/sitemap.xml` para evitar conflitos.

**2. Botao no painel Admin Blog**

Adicionar um botao "Atualizar Sitemap" na pagina `AdminBlog.tsx` que:
- Chama a edge function `generate-sitemap`
- Compara os posts publicados no banco com os que estao no sitemap retornado
- Exibe um toast confirmando quantos posts estao indexados (ex: "Sitemap atualizado com 11 posts")
- Se houver posts faltando, exibe quais foram adicionados

### Arquivos alterados

- `src/pages/admin/AdminBlog.tsx` -- adicionar botao com icone de refresh ao lado do botao "Novo post"
- `public/_redirects` -- adicionar regra de proxy para `/sitemap.xml`
- `public/sitemap.xml` -- deletar arquivo estatico

### Resultado

- O sitemap em `/sitemap.xml` sempre refletira os posts publicados no banco, sem necessidade de atualizar codigo
- O botao no admin serve como confirmacao visual de que o sitemap esta sincronizado
- Cada vez que um post for publicado, o sitemap ja estara atualizado automaticamente na proxima visita do Google

