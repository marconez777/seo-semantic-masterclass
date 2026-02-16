

## PRD - Painel de Consultoria SEO Mensal

### Visao Geral do Produto

Criar um painel completo para gerenciar clientes de consultoria SEO mensal, substituindo as planilhas Google atuais. O admin gerencia tudo; o cliente so visualiza.

---

### Usuarios e Permissoes

| Usuario | Pode fazer |
|---------|-----------|
| **Admin** | Criar clientes, projetos, palavras-chave, paginas, backlinks, tarefas, postagens. Editar e excluir tudo. |
| **Cliente de consultoria** | Visualizar seus dados (palavras-chave, paginas, backlinks, tarefas, postagens). Nao edita nada. |

---

### Funcionalidades Principais

#### 1. Gestao de Clientes de Consultoria
- Cadastro de cliente com: nome, dominio, contato (WhatsApp/email)
- Vincular a um user_id existente (para o cliente acessar o painel)
- Cada cliente = 1 site (1 projeto)

#### 2. Pesquisa de Palavras-Chave (aba PALAVRAS)
Baseado na planilha (image-71):
- Tabela com: #, Palavra-chave, Volume de busca, CPC (BRL)
- Admin cadastra e edita; cliente so visualiza
- Sem limite de palavras

#### 3. Paginas e Conteudo SEO (aba PAGINAS)
Baseado na planilha (image-72):
- Agrupamento por pagina (landing page)
- Cada pagina tem: palavra-chave principal, palavras secundarias (com % de reparticao)
- Metadados: URL da pagina, titulo SEO, descricao SEO
- Texto/conteudo associado a cada pagina
- Admin cadastra; cliente visualiza

#### 4. Backlinks Mensais (aba BACKLINKS)
Baseado na planilha (image-73):
- Agrupado por mes (ex: "dezembro 2025")
- Cada backlink: #, Site (dominio), DR, Ancora, URL destino, Link de publicacao, Status
- Minimo 20 backlinks/mes por cliente
- Admin cadastra; cliente visualiza

#### 5. Postagens de Blog
- Lista de postagens feitas para o blog do cliente
- Campos: titulo, URL, data de publicacao, status
- Minimo 10 postagens/mes por cliente
- Admin cadastra; cliente visualiza

#### 6. Quadro de Tarefas (estilo Trello)
Colunas fixas representando as etapas do trabalho:

| Coluna | Descricao |
|--------|-----------|
| **Pesquisa de Palavras-chave** | Pesquisa de keywords, analise de mercado, funil de busca |
| **Redacao e Otimizacao SEO** | Criacao dos textos otimizados |
| **Publicacao de Paginas** | Publicacao das landing pages + metadados |
| **Backlinks do Mes** | Apontar os backlinks mensais (a partir do 2o mes) |
| **Blog do Mes** | Postagens para o blog (a partir do 2o mes) |

Cada tarefa tem: titulo, descricao, data prevista, data de conclusao, status (pendente/em andamento/concluida/atrasada). O cliente ve o progresso e se houve atraso.

---

### Navegacao

**Admin Panel** - Adicionar um grupo "Consultoria" no sidebar:
- Clientes Consultoria (lista de clientes)
- Ao clicar num cliente, abre o painel dele com abas: Palavras | Paginas | Backlinks | Blog | Tarefas

**Painel do Cliente** - Adicionar secao "Consultoria" no sidebar do Dashboard:
- Visivel apenas para clientes vinculados a um projeto de consultoria
- Mesmas abas, mas somente leitura

---

### Banco de Dados - Novas Tabelas

```text
consulting_clients
  id (uuid, PK)
  user_id (uuid, FK profiles) -- cliente vinculado
  name (text)
  domain (text)
  whatsapp (text)
  email (text)
  status (text: ativo/inativo)
  created_at, updated_at

consulting_keywords
  id (uuid, PK)
  client_id (uuid, FK consulting_clients)
  keyword (text)
  volume (integer)
  cpc (numeric)
  position (integer) -- ordem na lista
  created_at

consulting_pages
  id (uuid, PK)
  client_id (uuid, FK consulting_clients)
  page_url (text)
  seo_title (text)
  seo_description (text)
  main_keyword (text)
  position (integer) -- ordem
  created_at

consulting_page_keywords
  id (uuid, PK)
  page_id (uuid, FK consulting_pages)
  keyword (text)
  repartition (numeric) -- % ex: 0.20 = 0,20%
  created_at

consulting_backlinks
  id (uuid, PK)
  client_id (uuid, FK consulting_clients)
  month (date) -- primeiro dia do mes
  site_domain (text)
  dr (integer)
  anchor_text (text)
  target_url (text)
  publication_url (text)
  status (text: pendente/publicado)
  position (integer) -- ordem #
  created_at

consulting_blog_posts
  id (uuid, PK)
  client_id (uuid, FK consulting_clients)
  month (date)
  title (text)
  url (text)
  status (text: pendente/publicado)
  published_at (timestamp)
  created_at

consulting_tasks
  id (uuid, PK)
  client_id (uuid, FK consulting_clients)
  column_key (text) -- pesquisa/redacao/publicacao/backlinks/blog
  title (text)
  description (text)
  due_date (date)
  completed_at (timestamp)
  status (text: pendente/em_andamento/concluida/atrasada)
  position (integer) -- ordem dentro da coluna
  created_at, updated_at
```

**Politicas RLS:**
- Admin (has_role admin): ALL em todas as tabelas
- Cliente: SELECT apenas nos registros onde `client_id` corresponde ao seu `user_id` via `consulting_clients`

---

### Plano de Implementacao (Fases)

**Fase 1 - Base e Clientes**
- Criar todas as tabelas e RLS no banco
- Criar pagina admin `/admin/consultoria` com lista de clientes
- Formulario de criar/editar cliente
- Adicionar item "Consultoria" no sidebar do admin

**Fase 2 - Aba Palavras-Chave**
- Pagina do cliente com abas (Palavras | Paginas | Backlinks | Blog | Tarefas)
- Tabela de palavras-chave com CRUD inline (admin)
- Importacao em lote (colar lista de palavras)

**Fase 3 - Aba Paginas**
- CRUD de paginas com palavras secundarias e metadados
- Visualizacao agrupada por pagina (como na planilha)

**Fase 4 - Aba Backlinks**
- CRUD de backlinks agrupados por mes
- Filtro por mes
- Contagem de backlinks no mes

**Fase 5 - Aba Blog**
- CRUD de postagens do blog do cliente
- Contagem de posts no mes

**Fase 6 - Quadro de Tarefas**
- Board estilo Kanban com as 5 colunas fixas
- Cards de tarefas com drag (ou botoes de mover)
- Indicadores de atraso (data prevista vs hoje)

**Fase 7 - Painel do Cliente**
- Adicionar secao "Consultoria" no dashboard do cliente
- Mesmas abas mas somente leitura
- Verificar se o user_id esta vinculado a um consulting_client

---

### Resumo de Arquivos a Criar/Editar

| Arquivo | Acao |
|---------|------|
| Migracao SQL | Criar 7 tabelas + RLS |
| `src/layouts/AdminLayout.tsx` | Adicionar grupo "Consultoria" no sidebar |
| `src/App.tsx` | Adicionar rotas `/admin/consultoria` e `/admin/consultoria/:clientId` |
| `src/pages/admin/AdminConsultoria.tsx` | Lista de clientes |
| `src/pages/admin/AdminConsultoriaClient.tsx` | Painel do cliente com abas |
| `src/components/consulting/ConsultingKeywords.tsx` | Aba palavras-chave |
| `src/components/consulting/ConsultingPages.tsx` | Aba paginas |
| `src/components/consulting/ConsultingBacklinks.tsx` | Aba backlinks mensais |
| `src/components/consulting/ConsultingBlogPosts.tsx` | Aba blog |
| `src/components/consulting/ConsultingTaskBoard.tsx` | Quadro de tarefas |
| `src/components/consulting/ClientForm.tsx` | Formulario criar/editar cliente |
| `src/pages/Dashboard.tsx` | Adicionar secao consultoria para clientes |

