

## Processar Keywords em Lotes para Maior Precisao

### Problema
A Edge Function tem timeout de ~60 segundos. Com 126 keywords, delay de 1.5s + retries, impossivel processar tudo em uma unica chamada. O SerpBot web funciona porque processa no servidor dele sem limite de tempo.

### Solucao: Sistema de Lotes com Progresso

**Abordagem:** Processar em lotes de 10 keywords por chamada. O frontend dispara lotes sequenciais automaticamente ate terminar todas.

### Alteracoes

**1. Edge Function (`serpbot-proxy/index.ts`)**

- Nova action `check_consulting_batch`: recebe `client_id` + `offset` + `batch_size` (default 10)
- Busca keywords com `OFFSET/LIMIT` ordenadas por `id`
- Delay de 3 segundos entre cada keyword (mais lento = mais preciso)
- Retry com delay de 5 segundos (em vez de 3)
- Retorna `{ results, total, offset, has_more }` para o frontend saber se ha mais lotes
- Mesma logica de admin check

- Atualizar `cron_consulting_check` para tambem usar lotes: processar 10 por vez, chamando a si mesmo recursivamente ou usando a mesma logica interna com delays maiores (cron nao tem timeout tao apertado, mas manter consistencia)

**2. Frontend (`ConsultingKeywords.tsx`)**

- `handleCheckPositions` agora faz um loop:
  1. Chama `check_consulting_batch` com offset=0
  2. Recebe resposta com `has_more=true` → chama novamente com offset=10
  3. Repete ate `has_more=false`
  4. Atualiza UI apos cada lote (refresh parcial)
- Mostrar progresso: "Verificando lote 2/13..." no toast
- Cada lote e fire-and-forget com `keepalive`
- Se o usuario sair da pagina, os lotes ja enviados continuam (os proximos nao)

**3. Melhorias de precisao adicionais**

- Aumentar delay entre requests para 3s (SerpBot web demora ~1s por keyword, mas queremos margem)
- Aumentar delay do retry para 5s
- Adicionar segundo retry (total 2 retries) para keywords que falharem
- Logar o HTTP status code da resposta do SerpBot (pode estar retornando 429)

### Arquivos alterados
1. `supabase/functions/serpbot-proxy/index.ts` — nova action batch + delays maiores
2. `src/components/consulting/ConsultingKeywords.tsx` — loop de lotes com progresso

### Resultado esperado
- 126 keywords processadas em ~13 lotes de 10
- Cada lote leva ~30-50s (dentro do timeout)
- Delays maiores = API do SerpBot responde com dados reais
- Progresso visivel no frontend

