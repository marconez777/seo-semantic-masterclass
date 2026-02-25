

## Personalizar o E-mail de Ativacao no Padrao dos Outros E-mails Transacionais

### O que sera feito

O template de ativacao ja tem a estrutura base (logo, heading, botao, footer), mas falta o padrao visual dos outros e-mails transacionais: secao de status com icone/cor, secao de informacoes com background cinza, e separador `Hr`.

### Alteracoes no template

**Arquivo:** `supabase/functions/send-activation-email/_templates/activation-email.tsx`

1. **Adicionar secao de status estilizada** (como no order-status-email): caixa com borda azul, fundo azul claro, icone de boas-vindas, e texto "Conta criada com sucesso"

2. **Substituir a lista de bullets solta** por uma secao `infoSection` com fundo `#f8fafc` e border-radius (mesmo padrao do `orderDetails` no payment-email e `infoSection` no order-status)

3. **Remover a secao CTA secundaria** ("Pronto para impulsionar seu SEO?" com botao verde) - isso nao existe nos outros templates e destoa do padrao

4. **Adicionar import do `Hr`** para separadores visuais, como no payment-email

5. **Padronizar os estilos** para usar exatamente os mesmos valores dos outros templates:
   - `button` com `padding: '14px 28px'` (os outros usam isso, o activation usa `12px 24px`)
   - Adicionar estilos `statusSection`, `statusIcon`, `infoSection`, `infoTitle`, `infoText` seguindo o order-status-email

6. **Footer**: manter o mesmo padrao dos outros (links MK Art SEO, Contato, e um terceiro relevante)

### Estrutura final do e-mail

```text
[Logo MK Art SEO]

Bem-vindo(a) a MK Art SEO!

Ola {nome},
Obrigado por se cadastrar...

+----------------------------------+
|          🎉                       |
|   Conta Criada com Sucesso       |
|   Clique abaixo para ativar      |
+----------------------------------+

    [ Ativar Minha Conta ]

+----------------------------------+
| Apos ativar, voce tera acesso a: |
| - Marketplace com centenas...    |
| - Backlinks de alta autoridade   |
| - Relatorios de entrega          |
| - Suporte especializado          |
+----------------------------------+

Se voce nao se cadastrou...

MK Art SEO • Contato • Comprar Backlinks
```

### Arquivo da Edge Function

O `index.ts` nao precisa de alteracao - apenas o template `.tsx` sera atualizado.

