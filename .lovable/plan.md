

## Correcoes de SEO - Telefone Errado e Dados Inconsistentes

### Problema Principal: Telefone placeholder em todos os schemas

O numero `5511999999999` (placeholder) aparece em **19 arquivos** no `sameAs` do Organization schema. O numero correto do WhatsApp e `5511989151997` (conforme usado no FAB, LeadGeneration e PaymentModal).

### Problemas encontrados

#### 1. Telefone placeholder `5511999999999` (CRITICO - 19 arquivos)

**Arquivos afetados:**
- `index.html` (schema Organization no HTML base)
- `scripts/prerender.js` (gera todas as paginas pre-renderizadas)
- `supabase/functions/send-payment-email/_templates/payment-email.tsx` (email de pagamento)
- Todas as 15 paginas em `public/pages/*.html` (geradas pelo prerender)

**Correcao:** Trocar `5511999999999` por `5511989151997` em `index.html`, `scripts/prerender.js` e no template de email. As paginas em `public/pages/` serao regeneradas automaticamente pelo prerender.

#### 2. Dois numeros de WhatsApp diferentes no codigo (INCONSISTENCIA)

- `5511989151997` - usado no FAB, LeadGeneration, PaymentModal (numero principal)
- `5511991795436` - usado no ContactModal e PricingSection (numero diferente)

**Correcao:** Confirmar qual e o numero correto e padronizar. Baseado na memoria do projeto, o numero principal e `5511989151997`. Trocar em `ContactModal.tsx` e `PricingSection.tsx`.

#### 3. Organization schema duplicado e inconsistente

O schema Organization aparece em DOIS lugares com dados diferentes:
- **index.html**: nome "MK Art SEO", logo "LOGOMK.png", tem `contactPoint`, sameAs com WhatsApp
- **Index.tsx (React)**: nome "MK Art - Agencia de SEO", logo "logo.png", sameAs com Instagram e YouTube, SEM contactPoint

Isso gera **dois schemas Organization** na pagina inicial, confundindo o Google.

**Correcao:** Unificar no `Index.tsx` com todos os dados corretos (contactPoint, sameAs completo com WhatsApp + Instagram + YouTube, logo correto). Remover ou simplificar o schema do `index.html` para evitar duplicacao.

#### 4. Schema WebSite tambem duplicado

- **index.html**: WebSite com SearchAction apontando para `/comprar-backlinks?q=`
- **Index.tsx**: WebSite com SearchAction apontando para `/search?q=`
- Nenhuma dessas URLs de busca existe de verdade no site

**Correcao:** Remover o SearchAction (o site nao tem funcionalidade de busca global) ou apontar para a URL correta. Manter apenas um schema WebSite.

#### 5. Logo inconsistente

- `index.html` usa `https://mkart.com.br/LOGOMK.png` 
- `Index.tsx` usa `https://mkart.com.br/logo.png`
- O arquivo real no projeto e `public/LOGOMK.png`

**Correcao:** Padronizar para `https://mkart.com.br/LOGOMK.png` em todos os lugares.

#### 6. Auth.tsx ainda usa `window.location.origin` no canonical

A pagina de auth usa `canonicalUrl={window.location.origin}/auth` que em preview aponta para lovable.app. Porem, como a pagina de auth deve ser `noindex`, basta adicionar `noindex={true}`.

**Correcao:** Adicionar `noindex={true}` ao SEOHead da pagina Auth.

#### 7. Paginas admin sem `noindex`

Varias paginas admin (AdminSites, AdminClientes, AdminLeads) tem canonical com `window.location.origin` mas nao marcam `noindex`. Paginas administrativas nunca devem ser indexadas.

**Correcao:** Adicionar `noindex={true}` em todas as paginas admin que ainda nao tem.

---

### Detalhes tecnicos das correcoes

**Arquivos a modificar:**

| Arquivo | Alteracao |
|---------|----------|
| `index.html` | Trocar `5511999999999` por `5511989151997`, corrigir SearchAction, adicionar Instagram/YouTube ao sameAs |
| `scripts/prerender.js` | Trocar `5511999999999` por `5511989151997` |
| `supabase/functions/send-payment-email/_templates/payment-email.tsx` | Trocar `5511999999999` por `5511989151997` |
| `src/pages/Index.tsx` | Adicionar contactPoint, WhatsApp ao sameAs, corrigir logo para LOGOMK.png, remover SearchAction invalido |
| `src/components/ui/ContactModal.tsx` | Trocar `5511991795436` por `5511989151997` |
| `src/components/sections/PricingSection.tsx` | Trocar `5511991795436` por `5511989151997` |
| `src/pages/Auth.tsx` | Adicionar `noindex={true}`, usar canonical fixo |
| `src/pages/admin/AdminSites.tsx` | Adicionar `noindex={true}` |
| `src/pages/admin/AdminClientes.tsx` | Adicionar `noindex={true}` |
| `src/pages/Dashboard.tsx` | Adicionar `noindex={true}`, canonical fixo |
| `src/pages/Recibo.tsx` | Adicionar `noindex={true}`, canonical fixo |

**Total: 11 arquivos, corrigindo telefone errado, schemas duplicados, logos inconsistentes e paginas privadas sem noindex.**
