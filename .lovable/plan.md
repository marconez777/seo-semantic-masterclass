

## Plano de Padronizacao das Categorias

### Contexto

O site possui **17 categorias padrao** definidas no menu do Header, mas as paginas de categoria dependem dinamicamente dos dados do banco de dados. Isso causa problemas como:

1. Categorias com nomes errados aparecendo (ex: "Justica" ao inves de "Direito")
2. Categorias faltando (ex: "Pets", "Alimentacao") quando nao ha backlinks cadastrados
3. Icones genericos (Folder) aparecendo para categorias com nomes diferentes do esperado

---

### Solucao em 3 Fases

#### Fase 1: Criar Lista Fixa de Categorias

Adicionar uma constante em `src/lib/category-icons.ts` com as 17 categorias padrao:

```typescript
export const FIXED_CATEGORIES = [
  "Noticias",
  "Negocios",
  "Saude",
  "Educacao",
  "Tecnologia",
  "Financas",
  "Imoveis",
  "Moda",
  "Turismo",
  "Alimentacao",
  "Pets",
  "Automotivo",
  "Esportes",
  "Entretenimento",
  "Marketing",
  "Direito",
  "Maternidade"
] as const;
```

#### Fase 2: Atualizar Mapeamento de Icones

Adicionar aliases no `getCategoryIcon` para nomes alternativos que podem existir no banco:

```typescript
case "Automoveis":
case "Automotivo":
  return Car;
case "Justica":
case "Direito":
  return Scale;
case "Entreterimento":
case "Entretenimento":
  return Clapperboard;
case "Imoveis":
case "Imoveis":
  return Home;
```

#### Fase 3: Padronizar Grid de Categorias

Alterar todas as paginas para usar a lista fixa ao inves de depender do banco.

**De (dinamico - problematico):**
```jsx
{categories.slice(0,16).map((cat) => ...)}
```

**Para (fixo - consistente):**
```jsx
import { FIXED_CATEGORIES } from "@/lib/category-icons";
...
{FIXED_CATEGORIES.map((cat) => ...)}
```

---

### Arquivos a Modificar

| Arquivo | Alteracao |
|---------|-----------|
| `src/lib/category-icons.ts` | Adicionar `FIXED_CATEGORIES` e aliases de icones |
| `src/pages/ComprarBacklinks.tsx` | Usar `FIXED_CATEGORIES` |
| `src/pages/ComprarBacklinksDireito.tsx` | Usar `FIXED_CATEGORIES` |
| `src/pages/ComprarBacklinksTecnologia.tsx` | Usar `FIXED_CATEGORIES` |
| `src/pages/ComprarBacklinksFinancas.tsx` | Usar `FIXED_CATEGORIES` |
| `src/pages/ComprarBacklinksModa.tsx` | Usar `FIXED_CATEGORIES` |
| `src/pages/ComprarBacklinksNoticias.tsx` | Usar `FIXED_CATEGORIES` |
| `src/pages/ComprarBacklinksAutomoveis.tsx` | Usar `FIXED_CATEGORIES` |
| `src/pages/ComprarBacklinksEducacao.tsx` | Usar `FIXED_CATEGORIES` |
| `src/pages/ComprarBacklinksPets.tsx` | Usar `FIXED_CATEGORIES` |
| `src/pages/ComprarBacklinksEsportes.tsx` | Usar `FIXED_CATEGORIES` |
| `src/pages/ComprarBacklinksEntretenimento.tsx` | Usar `FIXED_CATEGORIES` |
| `src/pages/ComprarBacklinksMarketing.tsx` | Usar `FIXED_CATEGORIES` |
| `src/pages/ComprarBacklinksImoveis.tsx` | Usar `FIXED_CATEGORIES` |
| `src/pages/ComprarBacklinksMaternidade.tsx` | Usar `FIXED_CATEGORIES` |
| `src/pages/ComprarBacklinksNegocios.tsx` | Usar `FIXED_CATEGORIES` |
| `src/pages/ComprarBacklinksSaude.tsx` | Usar `FIXED_CATEGORIES` |
| `src/pages/ComprarBacklinksTurismo.tsx` | Usar `FIXED_CATEGORIES` |
| `src/pages/ComprarBacklinksAlimentacao.tsx` | Usar `FIXED_CATEGORIES` |

**Total: 19 arquivos**

---

### Resultado Esperado

Apos a implementacao:

- Todas as 17 categorias aparecerao em todas as paginas
- Todas as categorias terao o icone correto (nenhum Folder generico)
- "Justica" nao aparecera mais (nao esta na lista fixa)
- "Pets" e "Alimentacao" aparecerao mesmo sem backlinks
- Ordem e visual consistentes com o menu superior

---

### Detalhes Tecnicos

O grid atual depende do `useMemo` que extrai categorias unicas dos backlinks:

```typescript
const categories = useMemo(() => {
  const set = new Set<string>();
  (backlinks ?? []).forEach((b) => {
    if (b.category) set.add(String(b.category));
  });
  return Array.from(set).sort();
}, [backlinks]);
```

Este codigo sera mantido apenas para filtragem de dados, mas a renderizacao do grid usara a lista fixa.

