## Objetivo

Melhorar a faixa de benefícios abaixo do botão CTA na seção Hero do `/webinar-medico`, deixando-a mais profissional e adicionando o item "Somente para psiquiatras".

## Mudanças

**Arquivo:** `src/components/webinar/WebinarHero.tsx` (lista de benefícios, linhas 40–52)

### 1. Conteúdo
Adicionar um novo item no início da lista:
- **Somente para psiquiatras** (novo, primeiro)
- Dentro da Resolução CFM 2.336/2023
- Método aplicado em dezenas de clínicas
- Ao vivo, com espaço para perguntas
- Sem promessa milagrosa

Total: 5 itens (grid passa de 4 para 5 colunas em desktop).

### 2. Visual mais profissional

Trocar os checks "soltos" por **cards individuais** com:

- Container em card: borda sutil (`border-webinar`), fundo branco semi-translúcido (`bg-white/70 backdrop-blur-sm`), cantos arredondados (`rounded-xl`), padding confortável e sombra suave que aumenta no hover.
- Ícone de check em **badge circular** (size-6) com fundo `bg-webinar-accent/15` e ring `ring-webinar-accent/30`, dando peso visual ao check ao invés do "V pequeno solto".
- Tipografia ajustada: peso `font-medium`, cor `text-webinar-ink` (mais legível) e tamanho 15–16px (mais elegante que 20px gigante).
- Layout: grid responsivo `1 col mobile → 2 cols tablet → 5 cols desktop`, gap maior, max-width ampliado para `5xl`.

### Antes vs depois

```text
ANTES:  ✓ Texto solto              ✓ Texto solto
DEPOIS: ┌──────────────────┐       ┌──────────────────┐
        │ ⊕  Texto em card │       │ ⊕  Texto em card │
        └──────────────────┘       └──────────────────┘
```

Tudo segue o design system existente (tokens `webinar-accent`, `webinar-ink`, `border-webinar`) — sem cores hardcoded.
