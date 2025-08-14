# 🩺 Sistema de Monitoramento SEO

Sistema completo de QA e monitoramento SEO com fallbacks seguros.

## 📊 QA Rápido (`scripts/qa-seo.mjs`)

### Funcionalidades
- ✅ Consulta 10 categorias mais recentes do Supabase
- ✅ Valida metas, canonical, JSON-LD, H1
- ✅ Verifica existência de arquivos HTML
- ✅ Saída em tabela detalhada no console
- ✅ Score de qualidade automático

### Uso
```bash
# QA completo
node scripts/qa-seo.mjs

# Via pipeline
node scripts/lovable-pipeline.mjs qa
```

### Saída Exemplo
```
📊 RELATÓRIO DE QA SEO - TABELA RESUMO
════════════════════════════════════════════════════════════════════════════
ARQUIVO                           TITLE LEN DESC LEN CANONICAL OG:IMAGE JSON-LD ISSUES
────────────────────────────────────────────────────────────────────────────
📄 PÁGINAS ESTÁTICAS:
index.html                        54        148       ✅        ➖       ✅      ✅ OK
comprar-backlinks.html           48        152       ✅        ➖       ✅      ✅ OK

🏷️ PÁGINAS DE CATEGORIAS:
comprar-backlinks-tecnologia.html 52        145       ✅        ✅       ✅      ✅ OK
comprar-backlinks-financas.html   49        143       ✅        ✅       ✅      ✅ OK

📈 RESUMO EXECUTIVO
════════════════════════════════════════════════════════════════════════════
📊 Total verificado: 15 páginas
✅ Páginas existentes: 15/15
⚠️ Com problemas: 0/15
📝 Título médio: 51 chars
📄 Descrição média: 146 chars
🔗 Com canonical: 15/15
🖼️ Com OG:image: 12/15
📋 JSON-LD válido: 15/15

🎯 SEO SCORE: 95%
🎉 EXCELENTE - SEO em ótimo estado!
```

## 🩺 Endpoint de Health Check

### Configuração
```bash
# Variável de ambiente
SEO_HEALTH_SECRET=sua-chave-secreta-123
```

### Endpoints Disponíveis

#### 1. Supabase Edge Function
```
GET https://lvinoytvsyloccajnrwp.supabase.co/functions/v1/seo-health-check
Headers: X-Secret-Key: sua-chave-secreta-123
```

#### 2. API Route (se usando Next.js/similar)
```
GET /api/__health/seo
Headers: X-Secret-Key: sua-chave-secreta-123
```

### Resposta JSON
```json
{
  "ok": true,
  "issues": [],
  "checked": 15,
  "summary": {
    "score": 95,
    "total": 15,
    "existing": 15,
    "missing": 0,
    "withIssues": 0,
    "avgTitleLen": 51,
    "avgDescLen": 146
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00.000Z",
    "duration": "245ms",
    "version": "1.0.0",
    "environment": "production"
  }
}
```

### Monitoramento Externo
```bash
# Curl
curl -H "X-Secret-Key: sua-chave" https://seu-site.com/__health/seo

# Monitoramento com UptimeRobot/Pingdom
# Configure para alertar se "ok": false
```

## 🔄 Agendamento Automático

### 1. Cron Manual
```bash
# Execução diária às 6h
0 6 * * * cd /path/to/project && node scripts/cron-seo-check.mjs
```

### 2. Supabase Cron (pg_cron)
```sql
-- Habilitar extensões
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Agendar QA diário
SELECT cron.schedule(
  'daily-seo-check',
  '0 6 * * *', -- 6h da manhã todos os dias
  $$
  SELECT net.http_get(
    url := 'https://lvinoytvsyloccajnrwp.supabase.co/functions/v1/seo-health-check',
    headers := '{"X-Secret-Key": "sua-chave-secreta"}'::jsonb
  );
  $$
);
```

### 3. GitHub Actions
```yaml
# .github/workflows/seo-check.yml
name: Daily SEO Check
on:
  schedule:
    - cron: '0 6 * * *'
  workflow_dispatch:

jobs:
  seo-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: node scripts/qa-seo.mjs
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
```

## 🛡️ Fallbacks Seguros

### 1. Falha do Supabase
```javascript
// Se Supabase não responder:
// ✅ Continua com páginas HTML pré-existentes
// ✅ Loga aviso mas não quebra build
// ✅ Registra no seo-build-report.json
```

### 2. Categoria Individual Falhando
```javascript
// Se uma categoria específica falhar:
// ✅ Pula apenas essa categoria
// ✅ Continue gerando as demais
// ✅ Registra erro no relatório
// ✅ Build não é interrompido
```

### 3. Relatório de Falhas
```json
// dist/seo-build-report.json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "status": "completed_with_errors",
  "supabaseConnected": false,
  "pagesGenerated": 12,
  "categoriesProcessed": 8,
  "errors": [
    "Supabase connection failed: Network timeout",
    "Failed to generate category saude: Missing data"
  ],
  "warnings": [
    "Supabase unavailable - using existing pages",
    "Stats error for category tecnologia: Rate limit"
  ],
  "fallbacksUsed": [
    "Used existing HTML pages due to Supabase failure"
  ],
  "summary": {
    "totalPages": 12,
    "staticPages": 6,
    "categoryPages": 6,
    "errors": 2,
    "warnings": 2,
    "fallbacks": 1
  }
}
```

### 4. Debug Pós-Deploy
```bash
# Verificar relatório
curl https://seu-site.com/seo-build-report.json

# Health check
curl -H "X-Secret-Key: chave" https://seu-site.com/__health/seo

# Logs de build
node scripts/qa-seo.mjs
```

## 🚨 Alertas e Notificações

### Score Crítico (< 50%)
```bash
🚨 [ALERTA] Score SEO crítico!
Issues: [
  "index.html: Título ausente",
  "categoria-x.html: JSON-LD inválido",
  "categoria-y.html: Meta description muito curta"
]
```

### Integração com Slack/Discord
```javascript
// Webhook para alertas
if (result.summary.score < 50) {
  await fetch(SLACK_WEBHOOK_URL, {
    method: 'POST',
    body: JSON.stringify({
      text: `🚨 SEO Score Crítico: ${result.summary.score}%`,
      attachments: [{
        color: 'danger',
        fields: [
          { title: 'Issues', value: result.issues.length },
          { title: 'Pages', value: result.checked }
        ]
      }]
    })
  });
}
```

## 📋 Benefícios do Sistema

### ✅ Deploy Nunca Trava
- Fallbacks automáticos
- Páginas existentes preservadas
- Relatórios detalhados de falhas

### ✅ Monitoramento Contínuo
- QA automático a cada 24h
- Health check para monitoramento externo
- Alertas em tempo real

### ✅ Debug Simplificado
- Relatórios JSON estruturados
- Logs claros e acionáveis
- Tabelas visuais no console

### ✅ Qualidade Garantida
- Validação completa de SEO
- Score objetivo de qualidade
- Histórico de problemas