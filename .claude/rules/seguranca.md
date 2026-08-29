---
last_validated: 2026-08-28
review_by: 2026-11-28
covers: [supabase/migrations/**, supabase/functions/**, supabase/config.toml, src/components/auth/RequireRole.tsx, src/hooks/useAuth.tsx, src/integrations/supabase/client.ts, src/lib/sanitize.ts]
---

# Segurança

Este arquivo carrega em **toda** sessão, de propósito. O site está no ar com clientes pagantes: nome, e-mail e pedido de gente real estão nesse banco.

## Autenticação e papéis

- Auth é o Supabase Auth (e-mail + senha). Sessão persistida em `localStorage`, refresh automático — `src/integrations/supabase/client.ts`.
- Ao criar conta, o trigger `handle_new_user()` cria a linha em `profiles`.
- Papéis vivem em `public.user_roles` (enum `app_role`: `admin` | `user`). A verificação canônica é a função `has_role(_user_id, _role)` / `is_admin(_user_id)`, ambas `SECURITY DEFINER`.
- No frontend, `RequireRole` (`src/components/auth/RequireRole.tsx`) protege `/admin` chamando `supabase.rpc('has_role')`.

<important if="mexendo em permissão, rota de admin ou policy">
**Nada que roda no navegador é segurança.** Vale para os três mecanismos deste projeto que parecem proteger e não protegem: `RequireRole` (só esconde a tela), o borrão da vitrine (o catálogo já foi baixado) e o player "locked" do webinar (o arquivo é público). Qualquer pessoa chama a API do Supabase direto. Toda restrição real está na policy de RLS ou dentro de uma edge function. Se você adicionou uma tela de admin, adicione a policy junto.
</important>

## O ponto sensível do modelo de papéis

Existem **duas** verificações de admin convivendo no banco:

1. `is_admin(uid)` lendo `public.user_roles` — a correta, endurecida na migration `20260525160935`.
2. Policies antigas com `EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_admin = true)` — ainda vivas em tabelas criadas em jan/fev de 2026.

A coluna `profiles.is_admin` não é mais fonte da verdade, e a policy de UPDATE de `profiles` impede o usuário de virar esse campo em si mesmo. **Policy nova sempre usa `is_admin(auth.uid())` ou `has_role(...)`, nunca `profiles.is_admin`.** Ao tocar numa policy antiga, migre-a de vez.

## Segredos

- Fica no navegador (e não tem problema): `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`. Só isso.
- Fica **só** nas edge functions, configurado no painel do Supabase: `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `SERPBOT_API_KEY`, `OPENAI_API_KEY`, `GEMINI_API_KEY`, `FIRECRAWL_API_KEY`, `SEO_HEALTH_SECRET`.
- `service_role` ignora RLS por definição. Se ela cair no bundle, todo o resto deste arquivo perde o sentido.
- Nunca prefixe segredo com `VITE_`. O bundler publica tudo que tem esse prefixo — é assim que ele funciona, não é bug.

## RLS — os cinco fatos que causam vazamento

1. **O SQL Editor do Supabase roda como superusuário e ignora RLS.** "Testei lá e veio certo" não prova nada sobre o que o cliente enxerga. Teste válido passa pela API com um token de verdade, ou pelo app aberto em duas contas.
2. **RLS falha em silêncio.** Policy errada não dá erro: devolve as linhas erradas, ou zero linha. Não há stack trace.
3. **Testar como `anon` não basta.** O furo mais comum é o cliente A ver o pedido do cliente B — os dois logados, os dois legítimos. Precisa de dois usuários reais.
4. **View com `SECURITY DEFINER` fura RLS.** `backlinks_public` foi recriada com `WITH (security_invoker = true)` justamente por isso. View nova nasce assim.
5. **RLS entra na mesma migration que cria a tabela.** "Depois eu habilito" é como toda tabela desprotegida nasce.

## Nunca

- Log de `console.log` com e-mail, telefone, CPF ou payload de pedido — nem em dev.
- Chamar `supabase.from(...)` do frontend com a chave de service role.
- `dangerouslySetInnerHTML` sem passar por `sanitizeHtml()` (`src/lib/sanitize.ts`). O conteúdo do blog e das páginas SEO é HTML gravado no banco pelo editor.
- Edge function nova com `verify_jwt = false` sem validar quem chamou. As públicas de hoje (`track`, `webinar-track`, os `send-*`) são públicas por necessidade — cada uma valida a entrada por conta própria.

## Gates automáticos

Instrução em markdown é pedido; hook é garantia. Estes rodam sozinhos (`.claude/settings.json`):

| Quando | O quê |
|---|---|
| a cada edição de arquivo | `check-secrets.mjs` — segredo em variável pública ou chave escrita no código |
| ao encerrar o turno | `check-rls.mjs` — tabela sem RLS, view sem `security_invoker`, policy usando `profiles.is_admin` |
| ao encerrar o turno | `check-types.mjs` — typecheck (pula se `node_modules` não existir) |
| ao encerrar o turno | `docs-drift.mjs` — doc cujo código coberto mudou depois da última validação (só avisa) |

**O gate de RLS é estático: lê as migrations, não o banco.** Ele não substitui teste com token real. Um teste de verdade precisa de dois usuários de clientes diferentes chamando a API — não o SQL Editor. Esse teste **ainda não existe neste projeto**.

## Dados pessoais

Dado pessoal de cliente vive em três lugares, com proteções diferentes:

1. **`profiles`** — nome, e-mail, WhatsApp de quem tem conta. Protegido por RLS (dono + admin).
2. **Caixa de entrada de `contato@mkart.com.br`** — nome, e-mail, telefone e site de quem compra pacote vão só para o e-mail, porque essa modalidade não grava no banco. Fora do alcance de RLS: a proteção é a do provedor de e-mail.
3. **Edge function `get-pii-data`** — exige JWT (a única com `verify_jwt = true`), confere o papel em `user_roles` e devolve os dados do pedido. É chamada por `/recibo/:orderId` e por `/admin` (`AdminPedidos`).

A família de funções `encrypt_pii` / `decrypt_pii` / `get_*_pii_secure` é resto do checkout antigo (tabelas `pedidos` / `pedidos_pii`) e **não tem chamador**. Não construa em cima delas — veja `docs/DECISOES.md` (ADR-002).

## Pontos abertos conhecidos

Levantados na revisão de 2026-08-28. Nenhum é vazamento de dado pessoal; todos são proteção que parece existir e não existe.

- **`backlinks` é legível por qualquer um.** A policy `"Anyone can view backlinks" USING (true)` nunca foi removida, e policies permissivas se somam. A view `backlinks_public` não protege nada — só dá forma à consulta padrão. Exposto: catálogo completo, `observacoes` e sites inativos.
- **O muro de login da vitrine é cosmético.** O catálogo inteiro é baixado antes de o borrão ser aplicado.
- **Os dois buckets do Storage são de leitura pública** (`blog`, `webinar-videos`). O vídeo do webinar abre para quem tiver a URL.
- **`send-package-order` é pública e sem limite de taxa.** Não toca no banco e recalcula o total no servidor, mas cada chamada dispara um e-mail para a MK — dá para inundar a caixa de entrada.

Corrigir o primeiro item é uma migration de uma linha (`DROP POLICY "Anyone can view backlinks" ON public.backlinks;`) — mas ela **muda o que o site mostra hoje**, então confirme com o dono do produto antes de aplicar.
