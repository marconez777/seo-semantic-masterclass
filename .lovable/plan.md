
# Plano: Corrigir Grid de Categorias e Migrar Filtro para DA

## Resumo das Alteracoes

Duas correcoes principais serao implementadas:

1. **Grid de categorias completo e padronizado**: O quadro de categorias em todas as paginas sera atualizado para mostrar as 17 categorias oficiais do menu, mais um botao "Todas Categorias" que leva a `/comprar-backlinks`.

2. **Migracao do filtro DR para DA**: A barra lateral de filtros passara a filtrar por DA (Domain Authority) em vez de DR (Domain Rating).

---

## Parte 1: Grid de Categorias Completo

### Problema Atual
- As paginas de categoria geram a lista de categorias dinamicamente a partir dos dados do banco
- Isso faz com que algumas categorias fiquem faltando se nao houver backlinks naquela categoria
- Nao ha consistencia com o menu do Header

### Solucao
Criar uma lista fixa das 17 categorias oficiais (mesmas do menu) e usar essa lista em todas as paginas de categoria.

### Lista Oficial de Categorias (17 itens)
1. Noticias
2. Negocios
3. Saude
4. Educacao
5. Tecnologia
6. Financas
7. Imoveis
8. Moda
9. Turismo
10. Alimentacao
11. Pets
12. Automotivo
13. Esportes
14. Entretenimento
15. Marketing
16. Direito
17. Maternidade

### Mudanca no Codigo
Em cada pagina de categoria, o grid de categorias sera substituido por uma lista fixa com:
- Primeiro item: "Todas Categorias" apontando para `/comprar-backlinks`
- Seguido das 17 categorias oficiais com seus icones

---

## Parte 2: Migracao do Filtro de DR para DA

### Problema Atual
- O componente `BacklinkFilters.tsx` exibe "DR" e usa `drRange`/`setDrRange`
- As paginas de categoria filtram por `b.dr` na logica de filtragem
- A URL usa `?dr=` como parametro

### Solucao
- Renomear props e state de `drRange` para `daRange`
- Alterar labels de "DR" para "DA"
- Alterar a logica de filtragem para usar `b.da`
- Alterar parametro URL de `?dr=` para `?da=`

---

## Arquivos a Serem Modificados

### Componente de Filtros
| Arquivo | Alteracoes |
|---------|-----------|
| `src/components/marketplace/BacklinkFilters.tsx` | Renomear props drRange->daRange, label "DR"->"DA" |

### Pagina Principal
| Arquivo | Alteracoes |
|---------|-----------|
| `src/pages/ComprarBacklinks.tsx` | State drRange->daRange, filtro b.da, URL ?da= |

### Paginas de Categoria (17 arquivos)
Cada arquivo recebera as seguintes alteracoes:
- Grid de categorias com lista fixa das 17 categorias oficiais + "Todas Categorias"
- State: `drRange` -> `daRange`
- Filtro: `b.dr` -> `b.da`
- URL: `?dr=` -> `?da=`

Lista de arquivos:
1. ComprarBacklinksAlimentacao.tsx
2. ComprarBacklinksAutomoveis.tsx
3. ComprarBacklinksDireito.tsx
4. ComprarBacklinksEducacao.tsx
5. ComprarBacklinksEntretenimento.tsx
6. ComprarBacklinksEsportes.tsx
7. ComprarBacklinksFinancas.tsx
8. ComprarBacklinksImoveis.tsx
9. ComprarBacklinksMarketing.tsx
10. ComprarBacklinksMaternidade.tsx
11. ComprarBacklinksModa.tsx
12. ComprarBacklinksNegocios.tsx
13. ComprarBacklinksNoticias.tsx
14. ComprarBacklinksPets.tsx
15. ComprarBacklinksSaude.tsx
16. ComprarBacklinksTecnologia.tsx
17. ComprarBacklinksTurismo.tsx

---

## Detalhes Tecnicos

### Constante de Categorias Oficiais
Sera criada uma constante reutilizavel:

```text
const OFFICIAL_CATEGORIES = [
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
  "Maternidade",
];
```

### Estrutura do Grid de Categorias
```text
<section className="mb-6">
  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
    {/* Primeiro: link "Todas Categorias" */}
    <a href="/comprar-backlinks">
      <Folder icon />
      "Ver Todas" / "Categorias"
    </a>
    
    {/* Depois: 17 categorias oficiais */}
    {OFFICIAL_CATEGORIES.map((cat) => (
      <a href={`/comprar-backlinks-${slug(cat)}`}>
        <CategoryIcon />
        "Backlinks de" / {cat}
      </a>
    ))}
  </div>
</section>
```

### Mudanca no BacklinkFilters.tsx
```text
// Interface - ANTES
interface BacklinkFiltersProps {
  drRange: string;
  setDrRange: (v: string) => void;
  ...
}

// Interface - DEPOIS  
interface BacklinkFiltersProps {
  daRange: string;
  setDaRange: (v: string) => void;
  ...
}

// Label - ANTES
<h3>DR</h3>

// Label - DEPOIS
<h3>DA</h3>
```

### Mudanca na Logica de Filtragem
```text
// ANTES
const drParsed = parseRange(drRange);
if (drParsed) {
  if (b.dr < min || b.dr > max) return false;
}

// DEPOIS
const daParsed = parseRange(daRange);
if (daParsed) {
  if (b.da < min || b.da > max) return false;
}
```

### Mudanca na URL
```text
// ANTES
params.set("dr", drRange);
const dr = params.get("dr");

// DEPOIS
params.set("da", daRange);
const da = params.get("da");
```

---

## Resultado Esperado

Apos a implementacao:

1. **Grid de categorias**: Todas as paginas de categoria mostrarao:
   - Primeiro item: "Todas Categorias" com icone de pasta
   - 17 categorias oficiais (mesmas do menu dropdown)
   - Consistencia visual entre todas as paginas

2. **Filtro por DA**: 
   - Label "DA" na barra lateral (desktop e mobile)
   - Filtragem usando o campo `da` do banco de dados
   - URL com parametro `?da=` para persistencia

3. **Consistencia**: As mesmas categorias do menu aparecerao no grid de cada pagina de categoria.
