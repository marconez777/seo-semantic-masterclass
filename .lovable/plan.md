
## Plano de Padronizacao da Experiencia do Usuario nas Paginas de Categoria

### Analise das Inconsistencias Encontradas

Apos analisar todas as paginas de categoria, identifiquei as seguintes diferencas:

---

### 1. Sistema de Bloqueio (useAuth + TableAuthGate + shouldBlur)

**Paginas COM sistema completo de bloqueio** (4 visiveis + 3 blur + overlay):
- ComprarBacklinks.tsx
- ComprarBacklinksTecnologia.tsx
- ComprarBacklinksFinancas.tsx
- ComprarBacklinksModa.tsx
- ComprarBacklinksAutomoveis.tsx
- ComprarBacklinksAlimentacao.tsx

**Paginas SEM sistema de bloqueio** (mostram tudo para nao logados):
- ComprarBacklinksNoticias.tsx
- ComprarBacklinksEducacao.tsx
- ComprarBacklinksPets.tsx
- ComprarBacklinksMarketing.tsx
- ComprarBacklinksEsportes.tsx
- ComprarBacklinksEntretenimento.tsx
- ComprarBacklinksDireito.tsx
- ComprarBacklinksImoveis.tsx
- ComprarBacklinksMaternidade.tsx
- ComprarBacklinksNegocios.tsx
- ComprarBacklinksSaude.tsx
- ComprarBacklinksTurismo.tsx
- AgenciaBacklinks.tsx

---

### 2. Grade de Categorias no Topo

**Tipo A - Apenas categorias dinamicas** (sem link "Ver Todas"):
- ComprarBacklinks.tsx - `categories.slice(0,16)` 
- AgenciaBacklinks.tsx - `categories.slice(0,16)`
- ComprarBacklinksTecnologia.tsx
- ComprarBacklinksFinancas.tsx
- ComprarBacklinksModa.tsx
- ComprarBacklinksNoticias.tsx

**Tipo B - Com link "Ver Todas Categorias" + categorias**:
- ComprarBacklinksEducacao.tsx - Folder + "Ver Todas Categorias" + `categories.slice(0,15)`
- ComprarBacklinksAutomoveis.tsx
- ComprarBacklinksAlimentacao.tsx
- E outras...

---

### 3. Layout Mobile

**Tipo A - Com botao de filtros mobile (Sheet)**:
- ComprarBacklinks.tsx - `isMobile` + Sheet + SheetTrigger
- AgenciaBacklinks.tsx - mesmo sistema

**Tipo B - Sem tratamento mobile** (sidebar sempre visivel):
- Todas as outras paginas de categoria

---

### 4. Pagina AgenciaBacklinks.tsx

- NAO tem useAuth/TableAuthGate (mostra tudo)
- NAO tem SEOHead (usa Helmet diretamente)
- NAO tem CategoryStructuredData

---

### Plano de Padronizacao

**Padrao definido (baseado em ComprarBacklinks.tsx como referencia):**

1. **Sistema de bloqueio**: Todas as paginas devem ter:
   - Import e uso de `useAuth` para `isAuthenticated` e `authLoading`
   - Logica de `visible` com 4 completos + 3 blur para nao autenticados
   - `TableAuthGate` renderizado apos a tabela quando nao autenticado
   - Prop `shouldBlur` passada ao `BacklinkTableRow`

2. **Grade de categorias**: Padrao unificado:
   - Incluir link "Ver Todas Categorias" apontando para `/comprar-backlinks`
   - Mostrar `categories.slice(0, 15)` (15 categorias + 1 link = 16 itens)
   - Import de `Folder` do lucide-react

3. **Layout mobile**: Todas as paginas de categoria devem ter:
   - Import de `useIsMobile`
   - Botao de filtros com Sheet para mobile
   - Sidebar condicional (`!isMobile`)

4. **AgenciaBacklinks.tsx**: Atualizar para:
   - Usar SEOHead em vez de Helmet
   - Adicionar CategoryStructuredData
   - Adicionar sistema de bloqueio

---

### Arquivos a Modificar

**Adicionar sistema de bloqueio COMPLETO (visible + shouldBlur + TableAuthGate):**
1. ComprarBacklinksNoticias.tsx
2. ComprarBacklinksEducacao.tsx
3. ComprarBacklinksPets.tsx
4. ComprarBacklinksMarketing.tsx
5. ComprarBacklinksEsportes.tsx
6. ComprarBacklinksEntretenimento.tsx
7. ComprarBacklinksDireito.tsx
8. ComprarBacklinksImoveis.tsx
9. ComprarBacklinksMaternidade.tsx
10. ComprarBacklinksNegocios.tsx
11. ComprarBacklinksSaude.tsx
12. ComprarBacklinksTurismo.tsx

**Adicionar layout mobile (Sheet):**
- Todas as 16 paginas de categoria (exceto as que ja tem)

**Padronizar grade de categorias (adicionar "Ver Todas"):**
- Paginas que nao tem o link "Ver Todas Categorias"

**Atualizar AgenciaBacklinks.tsx:**
- Converter para SEOHead
- Adicionar CategoryStructuredData
- Adicionar sistema de bloqueio
- (Opcional: manter layout ja que e uma pagina institucional diferente)

---

### Resumo das Alteracoes por Pagina

| Pagina | Bloqueio | Mobile | Ver Todas |
|--------|----------|--------|-----------|
| ComprarBacklinks | OK | OK | Adicionar |
| ComprarBacklinksTecnologia | OK | Adicionar | Adicionar |
| ComprarBacklinksFinancas | OK | Adicionar | Adicionar |
| ComprarBacklinksModa | OK | Adicionar | Adicionar |
| ComprarBacklinksAutomoveis | OK | Adicionar | OK |
| ComprarBacklinksAlimentacao | OK | Adicionar | OK |
| ComprarBacklinksNoticias | Adicionar | Adicionar | Adicionar |
| ComprarBacklinksEducacao | Adicionar | Adicionar | OK |
| ComprarBacklinksPets | Adicionar | Adicionar | Verificar |
| ComprarBacklinksMarketing | Adicionar | Adicionar | Verificar |
| ComprarBacklinksEsportes | Adicionar | Adicionar | Verificar |
| ComprarBacklinksEntretenimento | Adicionar | Adicionar | Verificar |
| ComprarBacklinksDireito | Adicionar | Adicionar | Verificar |
| ComprarBacklinksImoveis | Adicionar | Adicionar | Verificar |
| ComprarBacklinksMaternidade | Adicionar | Adicionar | Verificar |
| ComprarBacklinksNegocios | Adicionar | Adicionar | Verificar |
| ComprarBacklinksSaude | Adicionar | Adicionar | Verificar |
| ComprarBacklinksTurismo | Adicionar | Adicionar | Verificar |
| AgenciaBacklinks | Adicionar | OK | Adicionar |

---

### Implementacao

Para cada pagina que precisa de atualizacao:

**1. Sistema de bloqueio:**
```text
// Adicionar ao useAuth:
const { isAuthenticated, loading: authLoading } = useAuth();

// Modificar visible:
const visible = useMemo(() => {
  const start = (currentPage - 1) * itemsPerPage;
  const items = sorted.slice(start, start + itemsPerPage);
  
  if (isAuthenticated) {
    return items;
  }
  
  return items.slice(0, 7).map((item, index) => ({
    ...item,
    shouldBlur: index >= 4
  }));
}, [sorted, currentPage, itemsPerPage, isAuthenticated]);

// Adicionar no BacklinkTableRow:
<BacklinkTableRow key={b.id} item={b} onBuy={onBuy} shouldBlur={b.shouldBlur} />

// Adicionar apos </table>:
{!isAuthenticated && !authLoading && <TableAuthGate />}
```

**2. Layout mobile:**
```text
// Adicionar imports:
import { useIsMobile } from "@/hooks/use-mobile";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

// Adicionar estado:
const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

// Adicionar logica de sidebar condicional e botao mobile
```

**3. Grade de categorias:**
```text
// Adicionar link "Ver Todas" antes das categorias:
<a href="/comprar-backlinks" className="group flex items-center gap-3 ...">
  <span className="inline-flex size-9 ...">
    <Folder className="size-4" />
  </span>
  <span className="flex flex-col">
    <span className="text-[11px] ...">Ver Todas</span>
    <span className="text-sm font-semibold ...">Categorias</span>
  </span>
</a>

// Usar categories.slice(0, 15) em vez de slice(0, 16)
```

---

### Resultado Esperado

- Experiencia consistente em todas as 19 paginas de listagem
- Sistema de bloqueio padronizado incentivando cadastro
- Layout responsivo com filtros acessiveis no mobile
- Navegacao entre categorias facilitada com link "Ver Todas"
