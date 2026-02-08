# Instruções para Configuração do Resend no Lovable / Supabase

Para que o envio de e-mails funcione corretamente, você precisa adicionar a chave de API do Resend nas variáveis de ambiente do seu projeto no Lovable Cloud (que utiliza o Supabase).

Siga os passos abaixo:

1.  Acesse o painel do **Lovable** (ou Supabase, se tiver acesso direto).
2.  No menu lateral esquerdo, clique em **Secrets** (ícone de chave), conforme mostrado na imagem que você enviou.
3.  Você verá uma tela para gerenciar as "Environment Variables" ou "Secrets".
4.  Clique no botão para adicionar um novo segredo (geralmente **"New Secret"** ou **"Add Secret"**).
5.  Preencha os campos da seguinte forma:
    *   **Name (Nome):** `RESEND_API_KEY`
    *   **Value (Valor):** `Insira sua chave API aqui` (começa com `re_`)
6.  Salve a alteração.

### Verificação

Após adicionar a chave, o sistema redistribuirá automaticamente as Edge Functions com a nova configuração. Isso pode levar alguns segundos.

### Configurações Realizadas no Código

Todas as funções de envio de e-mail foram atualizadas para utilizar o remetente:
*   **Nome:** MK Art SEO / MK Art Agência
*   **Email:** `contato@mkart.com.br`

As funções alteradas foram:
*   `send-contact-email` (Formulário de contato)
*   `send-payment-email` (Envio de dados PIX)
*   `send-activation-email` (Ativação de conta)
*   `send-guest-post-list` (Envio de lista de guest posts)
*   `send-order-status-email` (Notificação de status do pedido)
*   `send-reset-password-email` (Redefinição de senha)
