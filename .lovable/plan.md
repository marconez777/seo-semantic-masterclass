

## Atualizar sitemap.xml manualmente com todos os 13 posts

### O que sera feito

Criar o arquivo `public/sitemap.xml` com todas as URLs atualizadas, incluindo os 13 posts publicados no blog, as paginas estaticas e as paginas de categoria.

### Conteudo do sitemap

**Paginas estaticas (25 URLs):**
- Home, comprar-backlinks, blog, agencia-de-backlinks, consultoria-seo, consultoria-seo-saas, contato
- 18 paginas de categoria (tecnologia, financas, saude, etc.)

**Posts do blog (13 URLs):**
1. o-que-sao-referring-domains-dominios-de-referencia
2. glossario-de-termos-essenciais-de-seo-off-page
3. o-que-e-texto-ancora-anchor-text-e-por-que-ele-pesa-tanto-no-seo
4. o-que-e-link-juice
5. vale-a-pena-comprar-backlinks
6. o-que-e-domain-authority-da-da-moz
7. a-importancia-dos-backlinks-para-o-algoritmo-do-google
8. diferenca-entre-links-dofollow-e-nofollow
9. como-funciona-o-pagerank-pr
10. diferenca-entre-links-internos-e-links-externos
11. o-que-e-link-building
12. o-que-sao-backlinks-e-para-que-servem-no-seo-e-no-geo
13. o-que-e-domain-rating-dr-do-ahrefs

### Arquivo alterado

- `public/sitemap.xml` -- criar arquivo com todas as 38 URLs

### Importante

Sempre que adicionar novos posts, basta me pedir para atualizar o sitemap novamente. A edge function dinamica continua funcionando normalmente para o `robots.txt` -- este arquivo estatico serve para quem acessa `/sitemap.xml` diretamente e para o Search Console.

