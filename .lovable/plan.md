## Mudanças no Hero de /aula-medico

Alterar apenas o componente `Hero` em `src/pages/AulaMedico.tsx`. Nada mais é tocado.

### 1. Reorganizar a eyebrow em dois elementos

Substituir o parágrafo único atual por:

- **Badge/pill** "Somente para médicos donos de clínica"
  - centralizado, acima da eyebrow
  - borda 1px `#C9A36A`, `rounded-full`, padding `6px 14px`
  - texto em caixa baixa, `font-medium`, `~13px`, cor `#2D3F50`

- **Eyebrow principal** "AULA AO VIVO GRATUITA · QUINTA-FEIRA · 20H"
  - `uppercase`, `font-semibold` (600), `tracking-[0.1em]`
  - cor `#2D3F50`, tamanho reduzido (~18px)
  - `margin-bottom: 24px` antes do headline

Atualizar a constante `AULA_QUANDO` ou o texto inline para refletir só "Quinta-feira · 20h" na eyebrow (o restante vai pro badge).

### 2. Ordem final da dobra

```text
[Badge: Somente para médicos donos de clínica]
[Eyebrow: AULA AO VIVO GRATUITA · QUINTA-FEIRA · 20H]
[Headline: Clínica em 1º no Google e nas IAs.]
[Subheadline atual]
[CTA WhatsApp]
[Badge: ● Próxima quinta · 20h]
[Linha "O link de acesso..."]
[3 trust badges]
```

### 3. Ajuste no CTA principal

A classe `btn-webinar-cta` (definida em `src/index.css`) será ajustada apenas no escopo do hero via override local (`style` inline + classes), para não afetar os outros CTAs idênticos (Learn, Final, Sticky). Ou, se preferir aplicar global, alteramos a regra `.btn-webinar-cta` em `src/index.css`.

Proposta: aplicar global em `.btn-webinar-cta`, já que todos os CTAs da página são a mesma identidade visual.

- `background: #A88550`
- `box-shadow: 0 2px 8px rgba(168, 133, 80, 0.25)`
- `hover`: tom mais escuro + `translateY(-1px)`
- texto continua escuro como hoje

### 4. O que não muda

Headline, subheadline, fundo creme, trust badges, badge "Próxima quinta", paleta e tipografia geral permanecem intactos.

### Arquivos alterados

- `src/pages/AulaMedico.tsx` (Hero + constante de data)
- `src/index.css` (apenas a regra `.btn-webinar-cta` e seu `:hover`)