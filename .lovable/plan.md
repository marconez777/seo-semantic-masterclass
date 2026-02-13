

## Corrigir erro CORS no Sitemap

### Problema
A edge function `generate-sitemap` nao tem headers CORS. Quando o botao "Atualizar Sitemap" no painel admin tenta chamar a funcao a partir do dominio `mkart.com.br`, o navegador bloqueia a requisicao por politica de seguranca (CORS).

### Solucao

**1. Adicionar headers CORS na edge function `generate-sitemap`**

Arquivo: `supabase/functions/generate-sitemap/index.ts`

- Adicionar constante `corsHeaders` com `Access-Control-Allow-Origin: *` e os headers necessarios
- Adicionar handler para requisicoes `OPTIONS` (preflight)
- Incluir os headers CORS em todas as respostas (sucesso e erro)
- Manter o `Content-Type: application/xml` para o sitemap funcionar normalmente para buscadores

### Detalhes tecnicos

```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
```

O handler `Deno.serve` passara a receber o parametro `req` para verificar se e uma requisicao `OPTIONS`. Se for, retorna `200` com os headers CORS. Caso contrario, processa normalmente e inclui os headers CORS na resposta XML.

### Arquivos alterados

- `supabase/functions/generate-sitemap/index.ts` -- adicionar CORS headers

### Resultado

- O botao "Atualizar Sitemap" no admin funcionara sem erros
- O sitemap continuara acessivel normalmente por buscadores em `/sitemap.xml`
- Nenhuma mudanca no frontend necessaria

