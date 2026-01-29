
## Plano de Padronizacao Visual das Paginas de Categoria

### Analise do Problema

Baseado nas screenshots fornecidas, identifiquei que o layout desejado (padrao) e o da pagina **`/comprar-backlinks`**:
- Nao mostra grid de categorias no topo para usuarios nao logados (apenas vai direto para a tabela)
- Tem sidebar condicional com tratamento mobile (Sheet para filtros)
- Usa a estrutura com wrapper div para o grid

Ja a pagina **`/comprar-backlinks-direito`** (e outras) esta diferente:
- Mostra grid de categorias no topo acima da tabela
- Nao tem tratamento mobile para sidebar
- Usa grid direto no main

### Inconsistencias Encontradas

| Caracteristica | ComprarBacklinks (padrao) | Paginas com Problema |
|---------------|--------------------------|---------------------|
| useIsMobile | Sim | Nao |
| Sheet mobile | Sim | Nao |
| Sidebar condicional | `{!isMobile && ...}` | Sempre visivel |
| Grid categorias | `categories.slice(0,16)` | Com "Ver Todas" + `slice(0,15)` |
| Wrapper div | Sim | Nao |
| TableAuthGate posicao | Correto | Correto |

### Paginas que Precisam de Correcao

**Com problema de layout (sem tratamento mobile + sidebar sempre visivel):**
1. ComprarBacklinksDireito.tsx
2. ComprarBacklinksNoticias.tsx
3. ComprarBacklinksTecnologia.tsx
4. ComprarBacklinksFinancas.tsx
5. ComprarBacklinksEducacao.tsx
6. ComprarBacklinksModa.tsx
7. ComprarBacklinksAutomoveis.tsx
8. ComprarBacklinksAlimentacao.tsx
9. ComprarBacklinksSaude.tsx
10. ComprarBacklinksPets.tsx
11. ComprarBacklinksEsportes.tsx
12. ComprarBacklinksEntretenimento.tsx
13. ComprarBacklinksMarketing.tsx
14. ComprarBacklinksImoveis.tsx
15. ComprarBacklinksMaternidade.tsx
16. ComprarBacklinksNegocios.tsx
17. ComprarBacklinksTurismo.tsx

**AgenciaBacklinks.tsx**: Ja tem tratamento mobile mas usa Helmet em vez de SEOHead

---

### Plano de Implementacao

#### Fase 1: Padronizar Layout de Todas as Paginas de Categoria

Para cada uma das 17 paginas de categoria listadas acima:

1. **Adicionar imports necessarios:**
```typescript
import { useIsMobile } from "@/hooks/use-mobile";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
```

2. **Adicionar hooks e estados:**
```typescript
const isMobile = useIsMobile();
const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
```

3. **Alterar estrutura do main:**
- De: `<main className="... grid ...">` (grid direto)
- Para: `<main className="container mx-auto px-4 py-28"><div className="grid ...">` (com wrapper)

4. **Tornar sidebar condicional:**
- De: `<aside className="md:col-span-2 ...">` (sempre visivel)
- Para: `{!isMobile && (<aside ...>)}` (condicional)

5. **Adicionar Sheet para mobile:**
```jsx
{isMobile && (
  <div className="mb-4">
    <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="w-full">
          <Menu className="mr-2 h-4 w-4" />
          Filtros
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80">
        {/* Filtros duplicados para mobile */}
      </SheetContent>
    </Sheet>
  </div>
)}
```

6. **Ajustar classe da section principal:**
- De: `<section className="md:col-span-10">`
- Para: `<section className={isMobile ? "col-span-1" : "md:col-span-10"}>`

7. **Padronizar grid de categorias (opcional):**
- Remover o grid de categorias para manter igual a pagina principal
- OU manter mas uniformizar o estilo

---

#### Fase 2: Atualizar AgenciaBacklinks.tsx

1. Trocar `Helmet` por `SEOHead`
2. Adicionar `CategoryStructuredData`
3. Adicionar sistema de bloqueio (useAuth + TableAuthGate)

---

### Arquivos a Modificar

**17 paginas de categoria** - adicionar tratamento mobile:
- src/pages/ComprarBacklinksDireito.tsx
- src/pages/ComprarBacklinksNoticias.tsx
- src/pages/ComprarBacklinksTecnologia.tsx
- src/pages/ComprarBacklinksFinancas.tsx
- src/pages/ComprarBacklinksEducacao.tsx
- src/pages/ComprarBacklinksModa.tsx
- src/pages/ComprarBacklinksAutomoveis.tsx
- src/pages/ComprarBacklinksAlimentacao.tsx
- src/pages/ComprarBacklinksSaude.tsx
- src/pages/ComprarBacklinksPets.tsx
- src/pages/ComprarBacklinksEsportes.tsx
- src/pages/ComprarBacklinksEntretenimento.tsx
- src/pages/ComprarBacklinksMarketing.tsx
- src/pages/ComprarBacklinksImoveis.tsx
- src/pages/ComprarBacklinksMaternidade.tsx
- src/pages/ComprarBacklinksNegocios.tsx
- src/pages/ComprarBacklinksTurismo.tsx

**1 pagina institucional**:
- src/pages/AgenciaBacklinks.tsx (ja tem mobile, adicionar SEOHead)

---

### Resultado Esperado

- Todas as paginas terao o mesmo layout visual
- Sidebar escondida no mobile com botao de filtros
- Grid de categorias consistente (ou removido para simplificar)
- Experiencia do usuario uniforme em todas as 19 paginas de listagem

### Prioridade de Implementacao

1. **Alta**: Adicionar tratamento mobile (Sheet + isMobile) - afeta UX em dispositivos moveis
2. **Media**: Padronizar grid de categorias - afeta consistencia visual
3. **Baixa**: Atualizar AgenciaBacklinks para SEOHead - afeta apenas SEO
