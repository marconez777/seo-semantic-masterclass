
## Plano de Correcao do Posicionamento do TableAuthGate

### Problema Identificado

O componente `TableAuthGate` usa posicionamento `absolute` para exibir o overlay de bloqueio no final da tabela. Para funcionar corretamente, o container pai (a `div` que envolve a tabela) precisa ter `position: relative`.

**No codigo do TableAuthGate (linha 18):**
```jsx
<div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t...">
```

**Problema:** Sem `relative` no container pai, o overlay se posiciona em relacao ao ancestral mais proximo com position definida, causando:
1. A sombra do gradiente "vazando" para a sidebar (primeira seta)
2. O overlay aparecendo no topo da tabela ao inves do final (segunda seta)

---

### Analise das Paginas

**Paginas COM `relative` (corretas):**
- ComprarBacklinks.tsx (pagina padrao)
- ComprarBacklinksAlimentacao.tsx

**Paginas SEM `relative` (com problema) - Total: 18 paginas:**

1. ComprarBacklinksDireito.tsx
2. ComprarBacklinksTecnologia.tsx
3. ComprarBacklinksFinancas.tsx
4. ComprarBacklinksModa.tsx
5. ComprarBacklinksNoticias.tsx
6. ComprarBacklinksAutomoveis.tsx
7. ComprarBacklinksEducacao.tsx
8. ComprarBacklinksPets.tsx
9. ComprarBacklinksEsportes.tsx
10. ComprarBacklinksEntretenimento.tsx
11. ComprarBacklinksMarketing.tsx
12. ComprarBacklinksImoveis.tsx
13. ComprarBacklinksMaternidade.tsx
14. ComprarBacklinksNegocios.tsx
15. ComprarBacklinksSaude.tsx
16. ComprarBacklinksTurismo.tsx
17. AgenciaBacklinks.tsx
18. ContinuarComprando.tsx

---

### Correcao Necessaria

Para cada pagina com problema, alterar:

**De:**
```html
<div className="overflow-x-auto border rounded-xl bg-card shadow-sm">
```

**Para:**
```html
<div className="relative overflow-x-auto border rounded-xl bg-card shadow-sm">
```

---

### Implementacao em 3 Etapas

**Etapa 1 - Corrigir 6 paginas:**
- ComprarBacklinksDireito.tsx (linha 321)
- ComprarBacklinksTecnologia.tsx (linha 293)
- ComprarBacklinksFinancas.tsx (linha 293)
- ComprarBacklinksModa.tsx (linha 293)
- ComprarBacklinksNoticias.tsx (linha 309)
- ComprarBacklinksAutomoveis.tsx (linha 312)

**Etapa 2 - Corrigir 6 paginas:**
- ComprarBacklinksEducacao.tsx (linha 312)
- ComprarBacklinksPets.tsx (linha 304)
- ComprarBacklinksEsportes.tsx (linha 316)
- ComprarBacklinksEntretenimento.tsx (linha 319)
- ComprarBacklinksMarketing.tsx (linha 316)
- ComprarBacklinksImoveis.tsx (linha 264)

**Etapa 3 - Corrigir 6 paginas:**
- ComprarBacklinksMaternidade.tsx (linha 276)
- ComprarBacklinksNegocios.tsx (linha 307)
- ComprarBacklinksSaude.tsx (linha 276)
- ComprarBacklinksTurismo.tsx (linha 304)
- AgenciaBacklinks.tsx (linha 454)
- ContinuarComprando.tsx (linha 372)

---

### Resultado Esperado

Apos a correcao:
- O overlay do TableAuthGate ficara posicionado corretamente no final da tabela
- A sombra do gradiente ficara contida dentro do container da tabela
- O bloqueio funcionara igual em todas as paginas, como na pagina `/comprar-backlinks`
