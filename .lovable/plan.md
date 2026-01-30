

## Categoria "Geral" + Trafego Opcional

### Resumo
1. Sites importados sem categoria serao automaticamente atribuidos a categoria "Geral"
2. "Geral" NAO aparecera no grid de categorias publico
3. Sites com "Geral" aparecerao na listagem "Todas Categorias"
4. Trafego pode ser importado vazio (fica como `null`)
5. Na listagem, trafego `0` ou `null` mostrara "-" (traco)

---

### Arquivos a Modificar

| Arquivo | Mudanca |
|---------|---------|
| `src/components/admin/AdminBacklinksImport.tsx` | Adicionar "Geral" as categorias, atribuir automaticamente quando vazio, atualizar textos de ajuda |
| `src/components/marketplace/BacklinkTableRow.tsx` | Mostrar "-" quando trafego for `0` ou `null` |
| `src/pages/ComprarBacklinks.tsx` | Filtrar "Geral" do grid de categorias |
| `src/pages/ComprarBacklinksCategoria.tsx` | Adicionar "Geral" a lista de categorias permitidas + filtrar do grid |

---

### Detalhes Tecnicos

#### 1. AdminBacklinksImport.tsx

**Adicionar "Geral" ao array de categorias:**
```typescript
const ALLOWED_CATEGORIES = [
  "Geral",  // <-- Nova categoria (sera oculta no frontend)
  "Noticias",
  // ... resto
] as const;
```

**Atribuir automaticamente quando vazio:**
```typescript
// Na funcao startImport, ajustar a logica:
const canonical = toCanonicalCategory(categoryRaw || "") || "Geral";
// Assim, se categoryRaw estiver vazio, usa "Geral"
```

**Atualizar texto de ajuda:**
```
"Colunas: URL, Categoria (opcional), DA, Trafego Mensal (opcional), Valor"
"Se categoria estiver vazia, sera atribuida como 'Geral'"
```

#### 2. BacklinkTableRow.tsx

**Linha 112 - Ajustar exibicao de trafego:**
```typescript
// De:
<td className="p-4">{item.traffic?.toLocaleString('pt-BR') ?? '-'}</td>

// Para:
<td className="p-4">{item.traffic ? item.traffic.toLocaleString('pt-BR') : '-'}</td>
```

Isso faz com que `0`, `null` e `undefined` mostrem "-".

#### 3. ComprarBacklinks.tsx

**Filtrar "Geral" do grid de categorias (linha ~366):**
```typescript
// De:
{categories.slice(0,16).map((cat) => {

// Para:
{categories.filter(c => c !== 'Geral').slice(0,16).map((cat) => {
```

#### 4. ComprarBacklinksCategoria.tsx

**Adicionar "Geral" a lista de categorias permitidas:**
```typescript
const ALLOWED_CATEGORIES = [
  "Geral",  // <-- Adicionar aqui
  "Noticias",
  // ... resto
] as const;
```

**Filtrar "Geral" do grid de categorias na sidebar (se existir).**

---

### Resultado Visual

**Grid de categorias (publico):**
```
+-------------+-------------+-------------+-------------+
| Noticias    | Negocios    | Saude       | Educacao    |
+-------------+-------------+-------------+-------------+
| Tecnologia  | Financas    | Imoveis     | Moda        |
+-------------+-------------+-------------+-------------+
(Geral NAO aparece aqui)
```

**Listagem "Todas Categorias":**
```
| SITE           | DR | DA | TRAFEGO   | CATEGORIA  | VALOR   |
|----------------|----|----|-----------|------------|---------|
| exemplo.com    | 45 | 38 | 15.000    | Tecnologia | R$ 350  |
| siteimportado  | 30 | 25 | -         | Geral      | R$ 200  |  <-- trafego vazio
| outrosite.com  | 55 | 42 | 50.000    | Saude      | R$ 600  |
```

**Importacao:**
```
Planilha:
| URL                    | Categoria | DA | Trafego | Valor |
|------------------------|-----------|----| --------|-------|
| site1.com              |           | 30 |         | 200   |  <- sera "Geral", trafego null
| site2.com              | Saude     | 45 | 15000   | 350   |  <- normal
```

---

### Observacoes
- Nenhuma alteracao de banco de dados necessaria (colunas ja sao nullable)
- A categoria "Geral" pode ser alterada posteriormente no admin se desejado
- Sites com "Geral" aparecem normalmente na busca e listagem principal

