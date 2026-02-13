

## Historico Mensal de Rastreio de Palavras-Chave

### O que sera feito

1. **Nova tabela `keyword_monthly_snapshots`** para armazenar a posicao final de cada palavra-chave ao fim de cada mes (colunas: `keyword_id`, `month` (date, primeiro dia do mes), `position`, `checked_at`).

2. **Cron job automatico no dia 28 de cada mes** que chama a edge function `serpbot-proxy` com uma nova action `cron_monthly_check` para verificar todas as palavras de todos os projetos e salvar os snapshots mensais.

3. **Alteracoes na tabela da interface (KeywordTracker.tsx)**:
   - Remover colunas "Variacao", "Melhor" e "Ult. Check"
   - A tabela tera: Palavra-chave | Posicao atual | Colunas dinamicas por mes (ex: Jan/26, Fev/26...)
   - A posicao atual vem de `tracked_keywords.current_position`
   - As posicoes dos meses anteriores vem de `keyword_monthly_snapshots`

4. **Logica de cores**:
   - Primeiro mes registrado: cor neutra (cinza/muted)
   - Meses seguintes: verde se subiu de posicao (numero menor), neutro se igual, laranja se desceu

5. **Data da ultima checagem**: remover a coluna da tabela e exibir um texto pequeno abaixo do botao "Verificar Posicoes" com a data mais recente de `last_checked_at`

### Detalhes tecnicos

**Migracao SQL:**
```sql
CREATE TABLE public.keyword_monthly_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword_id uuid NOT NULL REFERENCES public.tracked_keywords(id) ON DELETE CASCADE,
  month date NOT NULL,
  position integer,
  checked_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(keyword_id, month)
);

ALTER TABLE public.keyword_monthly_snapshots ENABLE ROW LEVEL SECURITY;

-- RLS: users see own snapshots
CREATE POLICY "Users can view own snapshots" ON public.keyword_monthly_snapshots
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tracked_keywords
      JOIN keyword_projects ON keyword_projects.id = tracked_keywords.project_id
      WHERE tracked_keywords.id = keyword_monthly_snapshots.keyword_id
      AND keyword_projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own snapshots" ON public.keyword_monthly_snapshots
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM tracked_keywords
      JOIN keyword_projects ON keyword_projects.id = tracked_keywords.project_id
      WHERE tracked_keywords.id = keyword_monthly_snapshots.keyword_id
      AND keyword_projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all snapshots" ON public.keyword_monthly_snapshots
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
```

**Edge function (`serpbot-proxy`):**
- Adicionar action `cron_monthly_check` que:
  1. Busca todos os projetos (usando service role key)
  2. Para cada projeto, verifica todas as keywords na API
  3. Atualiza `tracked_keywords` (current/previous position)
  4. Insere/atualiza registro em `keyword_monthly_snapshots` com `month = primeiro dia do mes atual`
- Tambem ao fazer `check_project` manual, salvar snapshot do mes atual

**Cron job (SQL via insert tool):**
```sql
SELECT cron.schedule(
  'monthly-keyword-check',
  '0 10 28 * *',
  $$ SELECT net.http_post(
    url:='https://nxitvhrfloibpwrkskzx.supabase.co/functions/v1/serpbot-proxy',
    headers:='{"Content-Type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}'::jsonb,
    body:='{"action":"cron_monthly_check"}'::jsonb
  ) AS request_id; $$
);
```

**Frontend (KeywordTracker.tsx):**
- Buscar snapshots do projeto selecionado: `keyword_monthly_snapshots` agrupados por mes
- Gerar colunas dinamicas (ultimos N meses com dados)
- Colorir celulas: comparar posicao do mes com mes anterior
  - Subiu (numero menor): verde
  - Igual: neutro
  - Desceu (numero maior): laranja
  - Primeiro mes ou sem dado anterior: neutro
- Mostrar `last_checked_at` abaixo do botao "Verificar Posicoes"

