
## Emails Transacionais para o Admin

Criar um sistema de notificacoes por email para o admin (contato@mkart.com.br) sempre que ocorrer:
- Novo pedido criado
- Novo cliente cadastrado
- Novo lead (contato ou backlink lead)

### Como funciona

Uma unica Edge Function `notify-admin` recebera o tipo de evento e os dados relevantes, e enviara um email formatado para contato@mkart.com.br.

Os disparos serao feitos diretamente no codigo frontend, nos pontos onde cada evento ja acontece:

1. **Novo pedido** - Apos criar o pedido no `CartModal.tsx` (linha ~160, junto com o envio do email de pagamento)
2. **Novo cliente** - Apos o signup bem-sucedido no `Auth.tsx`
3. **Novo lead de contato** - Apos salvar no banco no `Contact.tsx` (ja dispara `send-contact-email`, que ja notifica o admin - este caso ja esta coberto)
4. **Novo lead de backlink** - Apos salvar no `BlogSidebar.tsx`

### Detalhes tecnicos

#### 1. Nova Edge Function: `supabase/functions/notify-admin/index.ts`

- Recebe um JSON com `{ type, data }` onde type pode ser: `new_order`, `new_customer`, `new_lead`
- Usa Resend para enviar email para contato@mkart.com.br
- Gera HTML simples com os dados do evento
- Sem autenticacao obrigatoria (verify_jwt = false) pois o signup acontece antes do usuario estar autenticado
- Validacao do payload para evitar abuso

Conteudo dos emails:

**Novo Pedido:**
- Assunto: "Novo Pedido #XXXXXXXX - R$ XXX,XX"
- Corpo: ID do pedido, valor total, quantidade de itens, data

**Novo Cliente:**
- Assunto: "Novo Cliente Cadastrado - Nome"
- Corpo: Nome, email, WhatsApp, data do cadastro

**Novo Lead:**
- Assunto: "Novo Lead - Nome"
- Corpo: Nome, email, site, origem (contato/backlink)

#### 2. Atualizar `supabase/config.toml`

Adicionar configuracao para a nova funcao:
```
[functions.notify-admin]
verify_jwt = false
```

#### 3. Atualizar `src/components/cart/CartModal.tsx`

Apos a criacao do pedido (linha ~160), invocar `notify-admin` com type `new_order` e os dados do pedido. Usar try/catch para nao afetar o fluxo principal.

#### 4. Atualizar `src/pages/Auth.tsx`

Apos o signup bem-sucedido, invocar `notify-admin` com type `new_customer` e os dados do usuario (nome, email, telefone).

#### 5. Atualizar `src/components/blog/BlogSidebar.tsx`

Apos inserir o lead de backlink no banco, invocar `notify-admin` com type `new_lead`.

### Observacoes

- O formulario de contato (`Contact.tsx`) ja envia email para contato@mkart.com.br via `send-contact-email`, entao nao precisa de notificacao duplicada.
- Todas as chamadas ao `notify-admin` serao feitas em blocos try/catch separados para garantir que falhas no envio de email nao afetem o fluxo principal do usuario.
- A RESEND_API_KEY ja esta configurada nos secrets do projeto.
