

## Correcao: Campo de posicao da API Serp Bot

### Problema

A API do Serp Bot retorna a posicao no campo `pos`, mas a edge function esta lendo `data?.position`. Por isso, todas as posicoes ficam `null` mesmo apos a verificacao ser concluida com sucesso.

Exemplo de resposta real da API:
```text
{
  "request_id": 15884,
  "keyword": "comprar backlinks",
  "pos": 8,
  "found_serp": "https://mkart.com.br/comprar-backlinks",
  "serps": [...]
}
```

### Correcao

No arquivo `supabase/functions/serpbot-proxy/index.ts`, alterar a linha que extrai a posicao:

**De:** `const position = data?.position ?? null;`
**Para:** `const position = data?.pos ?? null;`

Essa mesma correcao se aplica a todos os blocos que leem a resposta da API (action `rank_check` individual tambem pode retornar o campo `pos`).

### Detalhes tecnicos

- Arquivo: `supabase/functions/serpbot-proxy/index.ts`
- Linha aproximada: dentro do loop `for (const kw of keywords)` na action `check_project`
- Apos a correcao, re-deploy da edge function
- Os dados ja salvos com `null` serao atualizados na proxima verificacao

### Resultado esperado

Apos a correcao, ao clicar "Verificar Posicoes", as posicoes reais (ex: 8o lugar) serao salvas no banco e exibidas na tabela do painel.
