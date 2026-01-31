
# Correcao do Bug de Conversao de Preco no Carrinho

## Problema Identificado

Ha uma inconsistencia no uso da funcao `brl()` entre os componentes:

```text
Fluxo atual com BUG:

Banco (reais)    useBacklinksQuery     BacklinkTableRow     CartContext      CartModal
    250       →   price_cents=25000  →  brl(25000)=R$250   →  price=250   →  brl(250)=R$2.50 ❌
                  (x100)                 (/100)                              (/100 ERRADO!)
```

A funcao `brl()` divide por 100 porque espera centavos, mas o `CartContext` armazena precos em **reais**.

---

## Solucao

Corrigir o `CartModal.tsx` para formatar precos em reais diretamente, sem dividir por 100:

### Arquivo: src/components/cart/CartModal.tsx

**Mudanca 1**: Trocar a funcao `brl()` por `brlFromReais()`:

```typescript
// ANTES
function brl(v: number) {
  return (v / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// DEPOIS
function brlFromReais(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
```

**Mudanca 2**: Atualizar as 2 chamadas da funcao:
- Linha 267: `{brl(item.price)}` → `{brlFromReais(item.price)}`
- Linha 307: `{brl(total)}` → `{brlFromReais(total)}`

---

## Resultado Esperado

```text
Fluxo corrigido:

Banco (reais)    useBacklinksQuery     BacklinkTableRow     CartContext      CartModal
    250       →   price_cents=25000  →  brl(25000)=R$250   →  price=250   →  brlFromReais(250)=R$250 ✅
                  (x100)                 (/100)                              (sem divisao)
```

---

## Arquivos a Modificar

| Arquivo | Alteracao |
|---------|-----------|
| `src/components/cart/CartModal.tsx` | Renomear `brl()` para `brlFromReais()` e remover divisao por 100 |

---

## Verificacao

Apos a correcao:
- Listagem: R$ 250,00
- Carrinho (por item): R$ 250,00
- Carrinho (total): R$ 250,00
