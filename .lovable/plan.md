

# Agendamento de Postagens do Blog

## Visao Geral

Adicionar a opcao de **agendar** um post do blog para uma data e hora futura no horario de Brasilia (UTC-3). O post ficara como rascunho (`published = false`) ate a data agendada, quando sera automaticamente publicado por uma funcao backend executada via cron job.

## Como Funciona

1. Na tela de criar/editar post (`AdminBlogNew`), o admin escolhe entre **"Publicar agora"** ou **"Agendar"**
2. Se agendar, seleciona data e hora (exibidas em horario de Brasilia)
3. O post e salvo com `published = false` e `published_at` preenchido com a data futura (convertida para UTC no banco)
4. Uma funcao backend roda a cada minuto via cron job, verifica posts com `published = false` e `published_at <= agora`, e os publica automaticamente
5. Na listagem do admin (`AdminBlog`), posts agendados aparecem com badge "Agendado" em azul

## Detalhes Tecnicos

### 1. Modificar `AdminBlogNew.tsx`

- Adicionar estado `publishMode`: `"now"` ou `"schedule"`
- Adicionar estado `scheduledDate` e `scheduledTime` para a data e hora
- Exibir um seletor com dois botoes (Publicar Agora / Agendar)
- Quando "Agendar" for selecionado, exibir DatePicker + Input de hora (HH:mm)
- Na funcao `savePost`:
  - Se `publishMode === "now"`: manter comportamento atual (`published: true`, `published_at: now`)
  - Se `publishMode === "schedule"`: salvar com `published: false` e `published_at` como a data/hora selecionada convertida de Brasilia (UTC-3) para UTC

### 2. Modificar `AdminBlog.tsx` (listagem)

- Adicionar coluna `published_at` na query (ja existe)
- Atualizar a logica do Badge de status:
  - `published === true` -> Badge verde "Publicado"
  - `published === false` e `published_at` no futuro -> Badge azul "Agendado" com a data
  - `published === false` e sem `published_at` -> Badge cinza "Rascunho"

### 3. Criar Edge Function `publish-scheduled-posts`

- Arquivo: `supabase/functions/publish-scheduled-posts/index.ts`
- Logica: consulta posts com `published = false` e `published_at <= now()`, e faz `UPDATE` para `published = true`
- Usa service role key para ter acesso total (o RLS exige admin)
- Adicionar config no `config.toml` com `verify_jwt = false`

### 4. Criar Cron Job via SQL

- Usar `pg_cron` + `pg_net` para chamar a edge function a cada minuto
- Isso garante que posts agendados sejam publicados automaticamente sem intervencao manual

### 5. Modificar `AdminBlogNew.tsx` para carregar dados de agendamento ao editar

- Ao carregar um post existente com `published = false` e `published_at` futuro, preencher o modo "Agendar" com a data/hora convertida para horario de Brasilia

### Arquivos a Criar/Modificar

| Arquivo | Acao |
|---|---|
| `src/pages/AdminBlogNew.tsx` | Adicionar UI de agendamento (date picker + hora) |
| `src/pages/admin/AdminBlog.tsx` | Badge "Agendado" na listagem |
| `supabase/functions/publish-scheduled-posts/index.ts` | Edge function para publicar posts agendados |
| `supabase/config.toml` | Registrar nova function |
| SQL (cron job) | Agendar execucao a cada minuto |

### Conversao de Fuso Horario

- O usuario seleciona data e hora em **horario de Brasilia (America/Sao_Paulo)**
- Antes de salvar no banco, a data e convertida para UTC usando offset -3h (ou respeitando horario de verao via `Intl.DateTimeFormat`)
- Na exibicao, as datas sao convertidas de volta para horario de Brasilia usando `toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })`

