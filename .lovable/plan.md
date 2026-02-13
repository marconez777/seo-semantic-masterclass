

## Integracao Serp Bot - Rastreio de Palavras-Chave

### Resumo

Adicionar uma nova aba "Rastreio de Palavras" no painel do usuario, onde ele pode criar projetos para rastrear posicoes de palavras-chave no Google usando a API do Serp Bot.

### Regras de negocio

- Cada usuario pode criar **1 projeto gratis**
- Projetos adicionais requerem pagamento (planos futuros)
- Cada projeto suporta ate **60 palavras-chave**
- O usuario define: nome do projeto, dominio do site, regiao Google (ex: www.google.com.br), dispositivo (desktop/mobile)
- As verificacoes de posicao sao feitas sob demanda via API do Serp Bot

### Arquitetura

A API do Serp Bot eh read-only e usa uma unica API key compartilhada. Por seguranca, todas as chamadas serao feitas via uma Edge Function (para nao expor a API key no frontend).

```text
Usuario (Frontend)
    |
    v
Edge Function (serpbot-proxy)
    |
    v
API Serp Bot (rank_check, get_serps)
```

Os projetos e palavras-chave ficam no nosso banco de dados (nao no Serp Bot), e usamos a API apenas para consultar posicoes.

### Detalhes tecnicos

#### 1. Novas tabelas no banco de dados

**Tabela `keyword_projects`**
- `id` (uuid, PK)
- `user_id` (uuid, NOT NULL) - referencia ao usuario
- `name` (text, NOT NULL) - nome do projeto
- `domain` (text, NOT NULL) - dominio a rastrear (sem http/www)
- `region` (text, default 'www.google.com.br') - regiao Google
- `device` (text, default 'desktop') - desktop/mobile/tablet
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

RLS: usuario so ve/edita/deleta seus proprios projetos. Admin ve tudo.

**Tabela `tracked_keywords`**
- `id` (uuid, PK)
- `project_id` (uuid, FK -> keyword_projects.id ON DELETE CASCADE)
- `keyword` (text, NOT NULL)
- `current_position` (integer, nullable) - ultima posicao encontrada
- `previous_position` (integer, nullable) - posicao anterior
- `best_position` (integer, nullable) - melhor posicao historica
- `last_checked_at` (timestamptz, nullable)
- `created_at` (timestamptz)

RLS: acesso via join com keyword_projects (usuario so ve keywords dos seus projetos).

**Tabela `keyword_history`**
- `id` (uuid, PK)
- `keyword_id` (uuid, FK -> tracked_keywords.id ON DELETE CASCADE)
- `position` (integer, nullable) - posicao naquele check
- `checked_at` (timestamptz, default now())

RLS: acesso via join com tracked_keywords -> keyword_projects.

#### 2. Nova Edge Function: `serpbot-proxy`

- Armazena a API key do Serp Bot como secret
- Acoes suportadas:
  - `rank_check`: recebe keyword, domain, region, device e retorna a posicao
  - `check_project`: recebe project_id, busca todas as keywords do projeto e faz rank_check para cada uma, salvando os resultados no banco
  - `credit`: retorna o saldo de creditos da API
- verify_jwt = true (apenas usuarios autenticados)
- Validacao: verifica se o projeto pertence ao usuario autenticado

#### 3. Novos componentes frontend

**`src/components/dashboard/KeywordTracker.tsx`** - Componente principal da aba
- Lista os projetos do usuario
- Botao "Novo Projeto" (desabilitado se ja tem 1 projeto gratis)
- Para cada projeto: lista de keywords com posicao atual, variacao, melhor posicao
- Botao "Verificar Posicoes" para rodar o check via edge function
- Indicadores visuais: seta verde (subiu), vermelha (desceu), cinza (sem mudanca)

**`src/components/dashboard/NewProjectModal.tsx`** - Modal para criar projeto
- Campos: nome, dominio, regiao (select com opcoes Google), dispositivo
- Validacao: max 1 projeto gratis

**`src/components/dashboard/AddKeywordForm.tsx`** - Formulario para adicionar keywords
- Input de texto (uma keyword por vez ou em lote separadas por virgula)
- Validacao: max 60 keywords por projeto
- Contador de keywords usadas

#### 4. Alteracoes no Dashboard

- Adicionar nova aba "Rastreio de Palavras" no sidebar com icone `Search`
- Atualizar o `tabLabel` para incluir o novo tab
- Renderizar `KeywordTracker` quando tab === 'keywords'

#### 5. Secret da API

- Salvar `SERPBOT_API_KEY` como secret do projeto (valor: `17d1d57c349c1b17cdf20a1d0c178021`)

### O que NAO esta incluido nesta fase

- Sistema de pagamento para planos extras (sera implementado depois)
- Verificacao automatica/agendada (por enquanto eh manual, sob demanda)
- Gestao de projetos pelo Serp Bot (usamos apenas a API de consulta)

