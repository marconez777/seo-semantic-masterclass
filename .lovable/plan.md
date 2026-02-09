

# Corrigir E-mails Transacionais: Logo, Build Error e Aviso de Seguranca

## Problemas Identificados

1. **Erro de build**: `send-activation-email/index.ts` importa `@react-email/components@0.0.31` (versao inexistente). Deve ser `@0.0.22` como nas demais funcoes.

2. **Logo errado**: Todos os templates de e-mail referenciam `https://mkart.com.br/LOGOMK.png` que exibe um logo preto. Precisa ser substituido pelo logo colorido (azul/roxo) que voce enviou.

3. **Aviso "Nao e possivel verificar se este email veio do remetente"**: Esse aviso e exibido pelo provedor de e-mail (Gmail, Outlook, etc.) quando o dominio nao tem registros **SPF** e **DMARC** configurados no DNS. Isso nao e resolvido no codigo -- precisa ser configurado no painel DNS do dominio `mkart.com.br`.

## Alteracoes no Codigo

### 1. Corrigir build error
- **Arquivo**: `supabase/functions/send-activation-email/index.ts`
- Alterar `@react-email/components@0.0.31` para `@0.0.22`

### 2. Atualizar logo em todos os templates
O logo colorido sera copiado para `public/images/mkart-logo.png` e a URL nos templates sera atualizada para `https://mkart.com.br/images/mkart-logo.png`.

Arquivos afetados (4 templates):
- `supabase/functions/send-payment-email/_templates/payment-email.tsx`
- `supabase/functions/send-order-status-email/_templates/order-status-email.tsx`
- `supabase/functions/send-activation-email/_templates/activation-email.tsx`
- `supabase/functions/send-reset-password-email/_templates/reset-password-email.tsx`

### 3. Aviso de seguranca do e-mail (acao sua no DNS)

Para resolver o aviso "Nao e possivel verificar se este email veio do remetente", voce precisa adicionar estes registros DNS no painel do seu dominio `mkart.com.br`:

**SPF** (registro TXT no dominio raiz):
```text
Tipo: TXT
Nome: @
Valor: v=spf1 include:amazonses.com ~all
```
(O Resend usa Amazon SES. Verifique no painel do Resend se ha instrucoes especificas de SPF.)

**DMARC** (registro TXT):
```text
Tipo: TXT
Nome: _dmarc
Valor: v=DMARC1; p=none; rua=mailto:contato@mkart.com.br
```

O Resend tambem pode ter sugerido registros DKIM -- verifique em https://resend.com/domains se ha algum registro pendente.

## Resumo

| Item | Tipo | Acao |
|------|------|------|
| Build error (versao 0.0.31) | Codigo | Corrigir import |
| Logo preto nos e-mails | Codigo | Trocar URL da imagem |
| Aviso de seguranca | DNS | Adicionar SPF + DMARC |

