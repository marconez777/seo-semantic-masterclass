

## Adicionar Colunas Mensais de Posicao na Aba Palavras (Consultoria)

### Resumo
Transformar a aba "Palavras" da consultoria para incluir colunas dinamicas por mes com posicoes de cada palavra-chave no Google, usando a API do Serp Bot. Sem limitacoes de palavras ou projetos. No primeiro dia de cada mes, um cron job automatico verifica todas as palavras de todos os clientes de consultoria.

### Banco de dados

**Nova tabela: `consulting_keyword_snapshots`**
```text
id (uuid PK)
keyword_id (uuid FK -> consulting_keywords.id ON DELETE CASCADE)
month (date) -- formato YYYY-MM-01
position (integer nullable)
checked_at (timestamptz)
UNIQUE(keyword_id, month)
```

RLS:
- Admin ALL via `has_role()`
- Clientes SELECT via join `consulting_keywords -> consulting_clients.user_id`

**Alteracao na tabela `consulting_keywords`:**
- Adicionar colunas: `current_position integer`, `previous_position integer`, `best_position integer`, `last_checked_at timestamptz`

### Edge Function

**Atualizar `serpbot-proxy/index.ts`** para adicionar nova action: `check_consulting_client`
- Recebe `client_id`
- Busca o `consulting_client` (domain) com service role
- Busca todas as `consulting_keywords` do cliente
- Para cada keyword, chama a API do Serp Bot com o dominio do cliente
- Atualiza `current_position`, `previous_position`, `best_position`, `last_checked_at`
- Insere/upsert em `consulting_keyword_snapshots`
- Sem limite de palavras

**Nova action: `cron_consulting_check`** (chamada pelo cron)
- Busca todos os `consulting_clients` ativos
- Para cada um, busca as keywords e verifica posicoes
- Salva snapshots

### Cron Job

Agendar via `pg_cron` + `pg_net` para executar no dia 1 de cada mes:
```sql
cron.schedule('consulting-monthly-check', '0 10 1 * *', ...)
```
Chama `serpbot-proxy` com action `cron_consulting_check`.

### Frontend

**Atualizar `ConsultingKeywords.tsx`:**
- Buscar `consulting_keyword_snapshots` para as keywords do cliente
- Calcular meses unicos e ordenados
- Adicionar colunas dinamicas por mes (mesmo padrao do `KeywordTracker`)
- Cores semanticas: verde (subiu), laranja (desceu), neutro
- Botao "Verificar Posicoes" (admin only, nao readOnly) que chama `check_consulting_client`
- Mostrar data da ultima checagem
- Manter todas as funcionalidades existentes (add, edit, delete, bulk import)

### Arquivos a criar/editar
1. Migracao SQL: nova tabela + colunas na `consulting_keywords` + RLS
2. `supabase/functions/serpbot-proxy/index.ts`: novas actions
3. `src/components/consulting/ConsultingKeywords.tsx`: colunas mensais + botao verificar
4. Cron job via insert SQL

