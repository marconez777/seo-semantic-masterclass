
# Plano: Corrigir E-mails Transacionais - Problema Identificado

## Diagnóstico Detalhado

Após investigação aprofundada, identifiquei que o problema **NÃO é que o domínio não está verificado**, mas sim que **a API Key do Resend armazenada no projeto pertence a uma conta diferente** da conta onde o domínio `mkart.com.br` foi verificado.

### Evidências:

1. O domínio está verificado (como mostra seu print) - há 6 dias
2. O erro persiste para TODAS as funções que usam `mkart.com.br`:
   - `send-payment-email`
   - `send-order-status-email`
   - `send-activation-email`
   - `send-reset-password-email`
   - `send-guest-post-list`
3. A função `send-contact-email` usa `onboarding@resend.dev` (domínio de teste) e provavelmente funcionaria

### Causa Raiz Provável:

A `RESEND_API_KEY` configurada nas Edge Functions foi gerada em uma **conta Resend diferente** daquela onde o domínio `mkart.com.br` foi verificado.

Isso pode acontecer quando:
- Você tem mais de uma conta no Resend
- A API Key foi criada antes de verificar o domínio e houve troca de conta
- Alguém da equipe configurou a API Key de outra conta

---

## Solução

### Passo 1: Verificar a Conta Correta no Resend

1. Acesse https://resend.com/domains
2. Confirme que você está logado na conta onde o domínio `mkart.com.br` está verificado (a mesma do print)
3. Na mesma conta, vá para https://resend.com/api-keys

### Passo 2: Gerar Nova API Key na Conta Correta

1. Clique em "Create API Key"
2. Nomeie como "MK Art Production" 
3. Escolha "Full Access" ou "Sending Access"
4. Copie a nova API Key (começa com `re_`)

### Passo 3: Atualizar a API Key no Lovable

Você precisará atualizar o secret `RESEND_API_KEY` com a nova chave gerada. Eu farei isso através do painel após você fornecer a nova chave.

---

## Implementação Técnica

Após você confirmar a nova API Key, precisarei:

1. **Atualizar o secret `RESEND_API_KEY`** com o valor correto
2. **Fazer deploy das edge functions** para que usem a nova chave

### Arquivos Afetados (não precisam de alteração de código)

As funções já estão corretas, só precisam da API Key certa:

- `supabase/functions/send-payment-email/index.ts`
- `supabase/functions/send-order-status-email/index.ts`
- `supabase/functions/send-activation-email/index.ts`
- `supabase/functions/send-reset-password-email/index.ts`
- `supabase/functions/send-guest-post-list/index.ts`

---

## Como Verificar se a API Key é da Conta Correta

Na página https://resend.com/api-keys você deve ver a lista de API Keys. Compare:

1. O nome da conta no canto superior direito da página
2. Vá para https://resend.com/domains e veja se o domínio `mkart.com.br` aparece como verificado **na mesma conta**

Se você tiver múltiplas contas Resend, verifique cada uma até encontrar onde está a API Key atual e onde está o domínio verificado.

---

## Próximos Passos

Por favor, confirme:

1. Você conseguiu acessar a conta Resend onde o domínio está verificado?
2. Você conseguiu gerar uma nova API Key nessa conta?

Com a nova API Key em mãos, poderei atualizar o sistema e os e-mails funcionarão corretamente.
