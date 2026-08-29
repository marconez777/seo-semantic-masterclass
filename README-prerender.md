> [!WARNING]
> **Documento antigo, conferido em 2026-08-28 e parcialmente incorreto.**
> Ele descreve tabelas e colunas que não existem mais no banco.
> A documentação viva do projeto é `CLAUDE.md`, `docs/` e `.claude/rules/`.
> Mantido só como histórico — não use como fonte, e não corrija: leia `docs/`.

# 📄 Prerendering para SEO

Este projeto implementa prerendering para as páginas de categoria mais importantes, melhorando significativamente o SEO.

## 🎯 Páginas Pré-renderizadas

As seguintes páginas têm arquivos HTML estáticos gerados com SEO otimizado:

### 🏠 Páginas Principais
- `/` - Homepage principal
- `/comprar-backlinks` - Página principal de backlinks
- `/agencia-de-backlinks` - Página da agência
- `/consultoria-seo` - Consultoria SEO
- `/contato` - Página de contato
- `/blog` - Blog SEO

### 📂 Páginas de Categoria
- `/comprar-backlinks-tecnologia` - Backlinks de Tecnologia
- `/comprar-backlinks-noticias` - Backlinks de Notícias  
- `/comprar-backlinks-financas` - Backlinks de Finanças
- `/comprar-backlinks-negocios` - Backlinks de Negócios
- `/comprar-backlinks-moda` - Backlinks de Moda
- `/comprar-backlinks-educacao` - Backlinks de Educação
- `/comprar-backlinks-turismo` - Backlinks de Turismo
- `/comprar-backlinks-automoveis` - Backlinks de Automóveis
- `/comprar-backlinks-saude` - Backlinks de Saúde
- `/comprar-backlinks-direito` - Backlinks de Direito
- `/comprar-backlinks-alimentacao` - Backlinks de Alimentação
- `/comprar-backlinks-pets` - Backlinks de Pets
- `/comprar-backlinks-esportes` - Backlinks de Esportes
- `/comprar-backlinks-entretenimento` - Backlinks de Entretenimento
- `/comprar-backlinks-marketing` - Backlinks de Marketing
- `/comprar-backlinks-imoveis` - Backlinks de Imóveis
- `/comprar-backlinks-maternidade` - Backlinks de Maternidade

**Total: 23 páginas pré-renderizadas**

## 🔧 Como Funciona

### 1. Arquivos HTML Estáticos
Cada página importante tem um arquivo HTML estático em `/public/pages/` com:
- Meta tags SEO otimizadas (título, descrição, keywords)
- Open Graph para redes sociais
- Twitter Card
- Structured Data (schema.org)
- URL canônica
- Preconnect para performance

### 2. Redirecionamentos
O arquivo `/public/_redirects` configura:
- Redirecionamento das rotas para os arquivos HTML pré-renderizados
- Fallback para o SPA normal para outras páginas

### 3. Script de Geração
O script `/scripts/prerender.js` pode ser usado para:
- Gerar novos arquivos HTML
- Atualizar meta tags
- Adicionar novas páginas

## 🚀 Vantagens para SEO

### ✅ Melhorias Implementadas:
- **Indexação Imediata**: Motores de busca veem conteúdo HTML completo
- **Meta Tags Específicas**: Cada categoria tem títulos e descrições únicos
- **Structured Data**: Schema.org para melhor entendimento pelos buscadores
- **Performance**: Carregamento mais rápido da primeira visualização
- **Social Sharing**: Open Graph e Twitter Cards completos

### 📊 Impacto Esperado:
- Melhora no posicionamento das páginas de categoria
- Maior CTR nos resultados de busca
- Melhor performance no Core Web Vitals
- Indexação mais eficiente pelo Google

## 🛠️ Manutenção

### Para adicionar nova página:
1. Adicione a rota no script `/scripts/prerender.js`
2. Execute o script: `node scripts/prerender.js`
3. Adicione o redirecionamento em `/public/_redirects`

### Para atualizar meta tags:
1. Edite os dados no script `/scripts/prerender.js`
2. Regenere os arquivos HTML
3. Faça deploy das alterações

## 📈 Monitoramento

Monitore o desempenho usando:
- Google Search Console
- Google Analytics
- Core Web Vitals
- Ferramentas de SEO (Ahrefs, SEMrush)

O prerendering garante que as páginas mais importantes do site tenham máxima visibilidade nos motores de busca desde o primeiro acesso.