

## Corrigir Detecção de Posições no Serp Bot

### Problema
A API do Serp Bot não está retornando posições para keywords que estão claramente na primeira página. Causas identificadas:

1. **Sem delay entre requisições** — todas as keywords são verificadas em rajada, causando rate-limiting ou respostas vazias da API
2. **Sem logging** — não há como ver o que a API realmente retorna, dificultando o diagnóstico
3. **Sem retry** — se uma requisição falha ou retorna vazio, a keyword é marcada como "não encontrada" permanentemente

### Alterações

**Arquivo:** `supabase/functions/serpbot-proxy/index.ts`

1. **Adicionar delay de 1.5 segundos entre cada requisição** — evita rate-limiting da API do Serp Bot

2. **Adicionar logging detalhado** — logar a URL chamada e a resposta completa da API para cada keyword, permitindo diagnosticar o que está acontecendo

3. **Adicionar retry automático** — se a API retornar `pos` como `null`/`undefined` ou um erro, tentar novamente após 3 segundos (máximo 1 retry)

4. **Verificar campo correto da resposta** — a API pode retornar `data.position` em vez de `data.pos` dependendo da versão; logar toda a resposta para confirmar

5. **Retornar a resposta raw da API nos resultados** — para que no frontend você possa ver exatamente o que a API retornou para cada keyword

### Aplicar a mesma correção para ambas as funções:
- `checkConsultingKeyword` (consultoria)
- `checkAndUpdateKeyword` (loja/dashboard)

### Resultado esperado
- Keywords na primeira página passarão a ser detectadas corretamente
- Logs permitirão diagnosticar qualquer keyword que ainda falhe
- O delay evita que a API ignore requisições por excesso de chamadas

