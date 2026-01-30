
# Alterar Filtro de DR para DA na Barra Lateral

## Resumo
O filtro da barra lateral que atualmente filtra por **DR (Domain Rating)** será alterado para filtrar por **DA (Domain Authority)**.

## O que será alterado

### 1. Componente de Filtros Reutilizável (`BacklinkFilters.tsx`)
- Renomear `drRange` / `setDrRange` para `daRange` / `setDaRange`
- Alterar o título de "DR" para "DA"
- Manter as mesmas faixas de valores (10-20, 20-30, etc.)

### 2. Página Principal (`ComprarBacklinks.tsx`)
- Trocar o state de `drRange` para `daRange`
- Alterar a lógica de filtragem: em vez de filtrar por `b.dr`, filtrar por `b.da`
- Alterar o parâmetro da URL de `?dr=` para `?da=`
- Atualizar os filtros tanto na versão desktop quanto mobile

### 3. Página de Categoria (`ComprarBacklinksCategoria.tsx`)
- Trocar o filtro de `minDR` para `minDA`
- Alterar a lógica de filtragem para usar `b.da`
- Atualizar o label do input de "DR mínimo" para "DA mínimo"

### 4. Páginas de Categorias Específicas (ex: `ComprarBacklinksImoveis.tsx`)
- Aplicar as mesmas alterações: `drRange` → `daRange`, filtrar por `b.da`

## Arquivos afetados

| Arquivo | Alterações |
|---------|------------|
| `src/components/marketplace/BacklinkFilters.tsx` | Props, interface, título da seção |
| `src/pages/ComprarBacklinks.tsx` | State, filtro, URL params, labels |
| `src/pages/ComprarBacklinksCategoria.tsx` | State, filtro, labels |
| `src/pages/ComprarBacklinksImoveis.tsx` | State, filtro, URL params |

## Detalhes Técnicos

### Mudança no state
```text
Antes:  const [drRange, setDrRange] = useState<string>('todos');
Depois: const [daRange, setDaRange] = useState<string>('todos');
```

### Mudança na lógica de filtragem
```text
Antes:  if (typeof b.dr !== 'number') return false;
        if (b.dr < min || b.dr > max) return false;

Depois: if (typeof b.da !== 'number') return false;
        if (b.da < min || b.da > max) return false;
```

### Mudança na URL
```text
Antes:  ?dr=20-30&traffic=1000-10000
Depois: ?da=20-30&traffic=1000-10000
```

### Mudança no label visual
```text
Antes:  <h3>DR</h3>
Depois: <h3>DA</h3>
```

## Resultado esperado
Após a implementação:
- A barra lateral mostrará "DA" em vez de "DR"
- O filtro usará o campo `da` do banco de dados
- A URL usará `?da=` para persistir o filtro
- Todas as páginas de listagem de backlinks terão o filtro consistente
