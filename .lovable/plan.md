

## Simplificar coluna "Site" no admin e remover URL do modal de edicao

### Alteracoes no arquivo `src/components/admin/AdminBacklinksManager.tsx`

**1. Coluna "Site" - modo visualizacao**
- Remover o link da URL que aparece abaixo do dominio
- Adicionar um icone de link (ExternalLink do lucide-react) ao lado do nome do site, clicavel, que abre a URL em nova aba
- Layout: `dominio.com.br` + icone clicavel ao lado

**2. Coluna "Site" - modo edicao**
- Remover o campo de edicao da URL (segundo Input)
- Manter apenas o campo de edicao do dominio
- Remover `url` do tipo `EditData` e da logica de `handleSave` (ou manter o valor original sem permitir edicao)

### Detalhes tecnicos

- Importar `ExternalLink` de `lucide-react`
- Na linha de visualizacao: trocar o bloco atual (dominio + link abaixo) por um `div` com `flex items-center gap-1` contendo o texto do dominio e um `<a>` com o icone `ExternalLink` size 14
- Na linha de edicao: remover o segundo `<Input>` (campo URL)
- No `handleSave`: nao incluir `url` no payload de update (manter o valor original)

