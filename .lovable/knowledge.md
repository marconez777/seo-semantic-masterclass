# MK Art SEO — mkart.com.br

Plataforma da MK Art: venda de backlinks (guest posts), consultoria de SEO e captação de leads para clínicas e empresas. Está no ar, com clientes pagantes e dados pessoais reais no banco.

Este arquivo é um resumo. A fonte da verdade é o repositório: `CLAUDE.md`, `docs/` e `.claude/rules/`.

## Jornadas principais

1. **Cliente compra avulso:** navega a vitrine por categoria → monta o carrinho → informa a página que quer promover (ou delega a escolha à MK) → faz login → o pedido é criado. O PIX chega por e-mail e a MK confirma o pagamento à mão.
2. **Cliente compra um pacote:** escolhe Básico ou Médio nos cards → preenche contato e site → o pedido é **enviado por e-mail para a MK**, sem cadastro e sem passar pelo banco. Ele vê a chave PIX na tela e manda o comprovante no WhatsApp. Preço e prazo são fechados; a MK escolhe os sites.
3. **Cliente acompanha:** vê pedidos, favoritos e o andamento das publicações em `/painel`.
4. **Cliente de consultoria:** acompanha em `/painel` as palavras-chave monitoradas, as páginas otimizadas, os backlinks conquistados e as tarefas.
5. **Visitante vira lead:** chega por webinar, aula, diagnóstico ou formulário de contato e o time recebe o cadastro em `/admin`.
6. **MK opera tudo:** `/admin` — pedidos, clientes, catálogo de sites, blog, conteúdo SEO, leads e métricas.

## Papéis

- **Visitante:** vê a vitrine de sites ativos, o blog publicado e as páginas de conteúdo. Só consegue enviar formulário.
- **Cliente logado:** vê e cria os **próprios** pedidos, favoritos, perfil e os dados de consultoria **dele**. Nunca os de outro cliente.
- **Admin:** vê e gerencia tudo. Quem é admin está na tabela `user_roles`, nunca na coluna `profiles.is_admin`.

## Design

Sensação: **profissional e direto, de agência que mostra número** — nada de decoração.
Cores: roxo (primária, CTA) e verde (conversão, confirmação). Existe tema escuro completo.
Sim: componentes shadcn/ui já existentes; tokens de cor (`bg-primary`, `text-muted-foreground`); mobile primeiro; texto em português do Brasil com conteúdo real, nunca placeholder.
Não: cor literal (`bg-white`, `#8B5CF6`) — quebra o tema escuro em silêncio; biblioteca de componente nova; `style={{...}}` para o que o Tailwind resolve.

## Regras de dados

- Toda tabela nasce com RLS habilitada, **na mesma migration**. Sem exceção.
- Modelo de acesso: **por usuário** (o cliente vê o que é dele) e **por cliente de consultoria** (para as tabelas `consulting_*`).
- Nunca aparece para quem não deve: pedido, lead, contato, inscrição de webinar e dado de analytics — tudo isso é só do dono e do admin.
- Segredo (`service_role`, chave do Resend, do SerpBot, da OpenAI) vive **só** em edge function. Nada com prefixo `VITE_` guarda segredo: esse prefixo publica a variável no navegador.
- View sobre tabela protegida precisa de `WITH (security_invoker = true)`, senão fura a RLS.
- Policy nova não substitui a antiga: as duas passam a valer, e a mais frouxa é que decide. Apague a antiga com `DROP POLICY`.
- Nada que roda no navegador protege dado. Esconder na tela, borrar ou travar o player é enfeite — a proteção é policy de RLS ou edge function.
- HTML vindo do banco (post, conteúdo SEO) passa por `sanitizeHtml` antes de ser renderizado.

## O que você erra sempre neste projeto

- **Cria mais uma página de categoria.** Já existem 20 arquivos `ComprarBacklinks<Categoria>.tsx` quase idênticos. Categoria nova entra em `src/lib/categories.ts` e usa a rota dinâmica `/comprar-backlinks-categoria/:categoria`.
- **Usa cor literal em vez de token.** Quebra o tema escuro sem dar erro.
- **Edita `src/integrations/supabase/types.ts`.** É gerado; a edição some.
- **Cria tabela ou policy sem RLS.** Em banco com cliente pagante, é vazamento.
- **Escreve policy com `profiles.is_admin`.** Use `is_admin(auth.uid())` ou `has_role(...)`.
- **Confia no TypeScript.** O modo `strict` está desligado neste projeto.
- **Inventa `npm test`.** Não existe suíte de testes aqui.
- **Esquece de regerar os tipos do Supabase depois de uma migration.** Com o `strict` desligado, o tipo atrasado não dá erro — quebra em produção.
- **Muda o preço do pacote em um lugar só.** O catálogo vive em `src/lib/packages.ts` e numa cópia dentro da edge function `send-package-order`. Tem que mudar nos dois.
- **Grava pedido de pacote no banco.** Hoje ele só existe no e-mail, de propósito. Levar para o banco é uma decisão de produto, não um detalhe de implementação.
