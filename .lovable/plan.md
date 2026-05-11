## Melhorias na página Admin → Clientes

Adicionar 4 funcionalidades à tela `/admin/clientes`:

### 1. Origem do lead (de qual página se cadastrou)
- Adicionar campo `signup_source` (texto) na tabela `profiles`.
- Capturar a rota atual no momento do signup (ex.: `/comprar-backlinks`, `/consultoria-seo`, `/webinar-medico`, `/auth`) e enviar em `options.data` no `supabase.auth.signUp`.
- Atualizar o trigger `handle_new_user()` para gravar esse campo a partir de `raw_user_meta_data->>'signup_source'`.
- Para usuários antigos, exibir "—".

### 2. Contagem total
- Mostrar acima da tabela: `X clientes encontrados` (respeitando filtro de busca).
- Mostrar também o total geral (sem filtro) entre parênteses quando houver busca.

### 3. Paginação
- Paginação client-side de 20 itens por página (volume baixo de profiles).
- Controles: « Anterior · Página X de Y · Próxima » + seletor de tamanho (20/50/100).
- Reset para página 1 quando a busca muda.

### 4. Exportar para Excel
- Botão "Exportar Excel" no topo, ao lado de "Atualizar".
- Usa a lib `xlsx` (já instalada).
- Exporta a lista filtrada atual (não só a página visível) com colunas:
  Nome, E-mail, WhatsApp, Site, Origem, Pedidos, Total Gasto (R$), Cadastro.
- Nome do arquivo: `clientes-YYYY-MM-DD.xlsx`.

### Nova coluna na tabela
Ordem final: Cliente · Contato · Site · **Origem** · Pedidos · Total Gasto · Cadastro · Ações.

### Detalhes técnicos
- Migration: `ALTER TABLE profiles ADD COLUMN signup_source text;` + atualização de `handle_new_user()` para incluir o campo.
- `src/pages/Auth.tsx`: ler `location.state?.from` ou `document.referrer` e enviar como `signup_source` no metadata do `signUp`.
- `src/pages/admin/AdminClientes.tsx`:
  - Adicionar `signup_source` na interface, no `select` e no map.
  - Adicionar estado `page` e `pageSize`; derivar `paginatedClientes` via `slice`.
  - Adicionar handler `exportToExcel()` usando `XLSX.utils.json_to_sheet` + `XLSX.writeFile`.
  - Adicionar coluna "Origem" na `<table>`.
  - Mostrar contagem ("X de Y clientes") acima da tabela.
- Sem mudanças em RLS (admins já têm acesso total a `profiles`).