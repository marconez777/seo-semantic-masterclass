

## Alterar Categorizador para usar ChatGPT com sua API Key

### O que muda

Trocar o Lovable AI Gateway (`ai.gateway.lovable.dev`) pela API da OpenAI (`api.openai.com`) na Edge Function `categorize-backlinks`, usando sua propria chave da OpenAI.

### Passos

1. **Solicitar sua OpenAI API Key** - Vou pedir para voce colar sua chave da OpenAI, que sera armazenada de forma segura como secret do projeto (nunca fica no codigo).

2. **Alterar a Edge Function `categorize-backlinks`**
   - Trocar o endpoint de `https://ai.gateway.lovable.dev/v1/chat/completions` para `https://api.openai.com/v1/chat/completions`
   - Trocar a autenticacao de `LOVABLE_API_KEY` para `OPENAI_API_KEY`
   - Usar o modelo `gpt-4o-mini` (rapido, barato, ideal para classificacao em lote) - ou `gpt-4o` se preferir mais precisao
   - O formato da requisicao e resposta e identico (ambos seguem o padrao OpenAI), entao a mudanca e minima

### Detalhes tecnicos

| Arquivo | Acao |
|---------|------|
| `supabase/functions/categorize-backlinks/index.ts` | Modificar - trocar endpoint e API key |

### Sobre custos

- Os creditos serao descontados da **sua conta OpenAI** (platform.openai.com)
- `gpt-4o-mini`: ~$0.15 por 1M tokens input / ~$0.60 por 1M tokens output (muito barato para classificacao)
- Estimativa para 941 sites: menos de $1 total com gpt-4o-mini

