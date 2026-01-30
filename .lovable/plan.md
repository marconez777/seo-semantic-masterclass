

## Remover Coluna DR da Listagem

### Resumo
Excluir completamente a coluna DR (Domain Rating) da tabela de backlinks, pois essa informação não está sendo importada.

---

### Arquivos a Modificar

| Arquivo | Mudança |
|---------|---------|
| `src/components/marketplace/BacklinkTableRow.tsx` | Remover a célula `<td>` que exibe DR |
| `src/pages/ComprarBacklinks.tsx` | Remover cabeçalho `<th>` do DR, atualizar colSpan de 7 para 6 |
| `src/pages/ComprarBacklinksCategoria.tsx` | Remover cabeçalho `<th>` do DR, atualizar colSpan de 7 para 6 |

---

### Detalhes Técnicos

#### 1. BacklinkTableRow.tsx

**Remover linha 110:**
```typescript
// REMOVER esta linha:
<td className="p-4 text-primary font-medium">{item.dr ?? '-'}</td>
```

A tabela fica com: SITE | DA | TRÁFEGO | CATEGORIA | VALOR | (ações)

#### 2. ComprarBacklinks.tsx

**Remover cabeçalho DR (linhas 404-412):**
```typescript
// REMOVER todo este bloco:
<th
  className="p-4 cursor-pointer select-none"
  role="button"
  tabIndex={0}
  onClick={() => { if (sortKey === 'dr') ... }}
  onKeyDown={(e) => { ... }}
>
  DR
</th>
```

**Atualizar colSpan (linhas 454, 456):**
```typescript
// De:
<td className="p-6" colSpan={7}>

// Para:
<td className="p-6" colSpan={6}>
```

#### 3. ComprarBacklinksCategoria.tsx

**Remover cabeçalho DR e atualizar colSpan de 7 para 6.**

---

### Resultado Final

A tabela terá as seguintes colunas:

| SITE | DA | TRÁFEGO/Mês | CATEGORIA | VALOR | (Ações) |
|------|----|-----------:|-----------|-------|---------|
| gazetadopovo.com.br | 92 | 13.888.896 | Notícias | R$ 16.000,00 | [Comprar] |

