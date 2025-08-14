# 🚀 Pipeline de Prerendering do Lovable

Sistema completo de geração de páginas estáticas com SEO otimizado para o Lovable.

## 📋 Configuração no Lovable

### 1. Variáveis de Ambiente (Obrigatórias)

Configure no painel Lovable em **Settings → Environment Variables**:

```
SUPABASE_URL=https://lvinoytvsyloccajnrwp.supabase.co
SUPABASE_ANON_KEY=sua_chave_aqui
SITE_URL=https://seu-site.lovable.app
```

### 2. Build Commands

Configure em **Project Settings → Build**:

```bash
# Prebuild Command:
node scripts/build-prerender.mjs

# Build Command:
vite build

# Publish Directory:
dist
```

## 🔧 Scripts Disponíveis

### Pipeline Completo
```bash
node scripts/lovable-pipeline.mjs
```
Executa todas as etapas: Prebuild → Build → QA → Publish

### Etapas Individuais
```bash
# Apenas prebuild (páginas estáticas)
node scripts/lovable-pipeline.mjs prebuild

# Apenas QA de SEO
node scripts/lovable-pipeline.mjs qa

# QA SEO independente
node scripts/qa-seo.mjs
```

## 📊 Etapas do Pipeline

### 1. 🎯 Prebuild (`build-prerender.mjs`)
- Conecta ao Supabase
- Gera páginas estáticas com SEO otimizado
- Cria sitemap.xml, robots.txt, _redirects, vercel.json
- **Saída:** Páginas HTML em `/dist`

### 2. ⚡ Build (`vite build`)
- Compila aplicação React/Vite
- Gera assets otimizados
- **Saída:** App SPA em `/dist`

### 3. 🔍 QA (`qa-seo.mjs`)
- Verifica SEO de todas as páginas
- Valida meta tags, structured data, acessibilidade
- Gera relatório de qualidade
- **Falha:** Se problemas críticos encontrados

### 4. 🚀 Publish
- Valida arquivos obrigatórios
- Confirma estrutura correta
- **Saída:** Site pronto para deploy

## 📄 Páginas Geradas

### Estáticas
- `/` (homepage)
- `/comprar-backlinks`
- `/agencia-de-backlinks`
- `/consultoria-seo`
- `/contato`
- `/blog`

### Dinâmicas (do Supabase)
- `/comprar-backlinks-{categoria}` (para cada categoria)

## 🔧 Arquivos de Configuração

### `/dist/_redirects` (Netlify)
```
/comprar-backlinks-tecnologia /comprar-backlinks-tecnologia.html 200
# ...
/* /index.html 200
```

### `/dist/vercel.json` (Vercel)
```json
{
  "rewrites": [
    {
      "source": "/comprar-backlinks-tecnologia",
      "destination": "/comprar-backlinks-tecnologia.html"
    }
  ]
}
```

## 🐛 Troubleshooting

### Erro: Variáveis de ambiente
```
❌ [ENV FAILED] Variáveis obrigatórias ausentes: SUPABASE_URL
💡 [CORREÇÃO] Configure no painel Lovable: Settings → Environment Variables
```

### Erro: Conexão Supabase
```
❌ [PREBUILD FAILED] Falha na conexão com Supabase
💡 [CORREÇÃO] Verifique logs do Supabase e configuração de rede
```

### Erro: QA SEO reprovado
```
❌ [QA FAILED] QA reprovou - Problemas críticos de SEO encontrados
💡 [CORREÇÃO] Revise os logs acima e corrija os problemas antes do deploy
```

## 📊 Logs e Monitoramento

### Logs do Pipeline
```
🕐 [14:30:15] [PREBUILD] Iniciando geração de páginas estáticas...
📡 Conectando ao Supabase: https://...
📂 Buscando categorias do Supabase...
✅ 12 categorias encontradas
📄 Gerando páginas estáticas...
✅ Página gerada: index.html
✅ Categoria gerada: comprar-backlinks-tecnologia.html (15 backlinks)
```

### Relatório QA
```
📊 RELATÓRIO DE QA SEO
✅ PERFEITO! Todas as verificações passaram
🚀 DEPLOY AUTORIZADO - Site aprovado no QA
```

## 🎯 Integração com Lovable

### Configuração Automática
O pipeline funciona automaticamente no Lovable quando configurado corretamente:

1. **Deploy:** Lovable detecta mudanças
2. **Prebuild:** Executa `build-prerender.mjs`
3. **Build:** Executa `vite build`
4. **QA:** Valida qualidade (opcional)
5. **Publish:** Deploy para produção

### Monitoramento
- Logs visíveis no painel do Lovable
- Erros com mensagens de correção claras
- Falhas param o deploy automaticamente

## 🚀 Resultado Final

### Para Crawlers/Bots
- Recebem HTML estático com SEO perfeito
- Carregamento instantâneo
- Structured data completo

### Para Usuários
- Recebem SPA React interativa
- Experiência fluida
- Funcionalidades completas

### Híbrido Perfeito
- SEO máximo + UX máxima
- Melhor de ambos os mundos
- Performance otimizada