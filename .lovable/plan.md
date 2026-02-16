

## Categorizador Automatico de Sites - Aplicacao Direta

### Mudanca em relacao ao plano anterior

Em vez de exigir aprovacao manual para cada sugestao, o sistema vai aplicar a categoria sugerida pela AI diretamente no banco de dados. Voce depois revisa e edita pelo gerenciador de sites existente (`AdminBacklinksManager`).

### Fluxo de uso

1. Acessa `/admin/sites` e ve o card "Categorizar Sites Automaticamente"
2. Clica em "Iniciar" - o sistema processa lotes de 5 sites automaticamente
3. Para cada site: Firecrawl faz scraping, AI sugere categoria, o banco e atualizado imediatamente
4. Uma barra de progresso mostra quantos foram processados (ex: 45/941)
5. Um log em tempo real mostra cada site processado: dominio, categoria antiga ("Geral"), nova categoria
6. O processo continua automaticamente ate acabar (ou voce pode pausar)
7. Depois, voce usa o gerenciador de sites existente para revisar e editar qualquer categoria que nao ficou boa

### Arquitetura tecnica

**1. Edge Function: `categorize-backlinks`**
- Recebe lista de sites (max 5 por chamada)
- Para cada URL, chama Firecrawl para extrair conteudo (markdown, titulo, descricao)
- Envia conteudo para Gemini Flash com as 17 categorias oficiais
- Se scraping falhar, faz fallback analisando apenas o dominio
- Atualiza a categoria diretamente no banco (`UPDATE backlinks SET category = ... WHERE id = ...`)
- Retorna os resultados para o frontend mostrar no log

**2. Componente: `AdminCategorizer.tsx`**
- Botao "Iniciar Categorizacao Automatica"
- Barra de progresso com contadores (processados / total / erros)
- Log scrollavel mostrando cada site processado e sua nova categoria
- Botao de "Pausar/Retomar" para controle
- Processa automaticamente lote apos lote sem intervencao
- Ao terminar, mostra resumo: quantos categorizados, quantos falharam

**3. Prompt da AI**
```
Voce e um classificador de sites. Analise o conteudo abaixo e classifique em UMA das categorias:
Noticias, Negocios, Saude, Educacao, Tecnologia, Financas, Imoveis, Moda, Turismo, Alimentacao, Pets, Automotivo, Esportes, Entretenimento, Marketing, Direito, Maternidade.

Responda APENAS com o nome da categoria, nada mais.
```

### Detalhes tecnicos

| Arquivo | Acao |
|---------|------|
| `supabase/functions/categorize-backlinks/index.ts` | Criar - Edge Function que faz scraping + AI + update no banco |
| `supabase/config.toml` | Adicionar config da funcao |
| `src/components/admin/AdminCategorizer.tsx` | Criar - UI com progresso e log automatico |
| `src/pages/admin/AdminSites.tsx` | Modificar - Adicionar componente |

### Protecoes

- JWT + verificacao de role admin na Edge Function
- Lotes de 5 para evitar timeout e rate limiting do Firecrawl
- Delay de 2 segundos entre lotes para nao sobrecarregar
- Se um site falhar o scraping, tenta classificar pelo dominio antes de pular
- Sites que falharem completamente ficam como "Geral" e aparecem no log como erro

### Custos estimados

- Firecrawl: ~941 scrapes
- Lovable AI (Gemini Flash): ~188 chamadas (5 sites por chamada)

