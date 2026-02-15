

## Melhorias na tabela de Gerenciar Sites (Admin)

### 1. Unificar colunas "Dominio" e "URL"

As colunas "Dominio" e "URL" mostram dados redundantes (ex: `moveisdecorando.com.br` e `moveisdecorando.com.br`). Serao unificadas em uma unica coluna "Site" que exibe o dominio como texto principal e a URL como link clicavel abaixo.

### 2. Adicionar edicao inline de cada item

Cada linha tera um botao "Editar" ao lado do "Excluir". Ao clicar, a linha entra em modo de edicao com campos editaveis para:
- **Dominio/URL**
- **Categoria** (select com as categorias existentes)
- **DR e DA** (inputs numericos)
- **Trafego** (input numerico)
- **Preco** (input numerico em reais)
- **Status** (select: ativo/inativo)

Botoes "Salvar" e "Cancelar" substituem os de acao durante a edicao.

---

### Detalhes tecnicos

**Arquivo: `src/components/admin/AdminBacklinksManager.tsx`**

- Reduzir `colSpan` de 8 para 7 (uma coluna a menos)
- Unificar as colunas "Dominio" e "URL" em uma coluna "Site" que exibe o dominio em negrito e a URL como link abaixo
- Adicionar estado `editingId` (string | null) e `editData` (Partial de Backlink)
- Ao clicar "Editar", preencher `editData` com os valores atuais da linha e setar `editingId`
- Renderizar inputs inline quando `editingId === b.id`
- Funcao `handleSave` faz `supabase.from("backlinks").update(editData).eq("id", editingId)` e atualiza o estado local
- Botao "Cancelar" limpa `editingId` e `editData`
- Usar `<Input>` para campos texto/numerico e `<select>` nativo para categoria e status
- Importar lista de categorias de `src/lib/categories.ts` para o select de categoria

