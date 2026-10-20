# MK Art SEO — mkart.com.br

Site e plataforma da MK Art: venda de backlinks (guest posts), consultoria de SEO e captação de leads. **Está em produção com clientes reais e dados pessoais no banco.**

## Contrato

<important if="escrevendo qualquer código neste repo">
- Stack: React 18 + Vite 5 + TypeScript, Tailwind + shadcn/ui, Supabase auto-hospedado na `sfai-vps` (banco, auth, edge functions em `/opt/supabase/mkart`, API em `https://api.mkart.com.br`), site estático servido pelo Nginx da VPS. Saiu do Lovable Cloud em 2026-10-20. Não introduza dependência nova sem perguntar.
- **Toda tabela nova nasce com RLS habilitada, na mesma migration.** Sem exceção — o banco tem dado de cliente pagante.
- **`service_role` nunca sai de edge function.** Nada de `VITE_*` com segredo: variável `VITE_` vai para o navegador por definição do bundler.
- HTML vindo do banco (post de blog, conteúdo SEO) **passa por `sanitizeHtml`** de `src/lib/sanitize.ts` antes de ir para `dangerouslySetInnerHTML`.
- Nada que roda no navegador protege dado. Guarda de rota, borrão e player travado são cosméticos: a restrição real é policy de RLS ou edge function.
- Depois de toda migration, **regere `src/integrations/supabase/types.ts`**. Com o `strict` desligado, tipo atrasado não dá erro — quebra em produção.
- Antes de criar página, componente ou hook novo, **procure o existente**. Este repo tem 20 páginas `ComprarBacklinks*` quase idênticas — duplicar mais é o modo de falha nº 1 aqui.
- Antes de implementar, leia `docs/GOTCHAS.md`.
- Comandos: `npm run dev` (porta 8080) · `npm run build` · `npm run lint`. **Não existe suíte de testes** — não invente `npm test`.
</important>

## Publicação (VPS, não Lovable)

<important if="aplicando migration, publicando function ou site, ou mexendo em segredo">
Tudo passa pelo kit em `ops/` (roteiro e estado em `ops/VIRADA.md`). Nada disso é automático: o push no GitHub não publica nada, e o Lovable não publica mais o mkart.

- **Site:** `ssh sfai-vps /var/www/mkart/repo/ops/publicar.sh`. Gera o `.env` a partir da stack (`ops/gerar-env.sh`), faz build e só troca `/var/www/mkart/atual` se passar.
- **`.env` não é versionado.** Para o dev local: `ssh sfai-vps /var/www/mkart/repo/ops/gerar-env.sh > .env`. Não faça `git add .env`.
- **Edge function:** `ssh sfai-vps 'bash /var/www/mkart/repo/ops/supabase/publicar-funcoes.sh </dev/null'`. Publica todas. Function nova ou `verify_jwt` mudado: atualize `supabase/config.toml` **e** `supabase/functions/_manifesto-verify-jwt.json` (função fora do manifesto fica fechada).
- **Migration:** aplicada na stack `/opt/supabase/mkart`, no container `mkart-db` (`psql -U supabase_admin -d postgres -v ON_ERROR_STOP=1`), a partir do arquivo em `supabase/migrations/`. Depois, regere `types.ts`.
- **Segredo:** o Marco grava de um terminal dele, `ssh -t sfai-vps /var/www/mkart/repo/ops/supabase/definir-segredo.sh <NOME>`. O valor nunca passa pela conversa.
- Mudança que mexe no banco, na function ou no site de produção pede o ok do Marco antes de rodar.
</important>

## Onde está o quê

- `docs/ARQUITETURA.md` — como as peças se conectam. Leia antes de mexer em fluxo de dados.
- `docs/MODELO-DE-DADOS.md` — tabelas, relações, policies de RLS, o que é legado.
- `docs/DECISOES.md` — por que as coisas são como são. Leia antes de propor mudar arquitetura.
- `docs/GOTCHAS.md` — o que quebra sempre neste projeto.
- `docs/features/` — uma doc por feature. Leia só a da feature em que você vai mexer.
  - `marketplace-e-pedidos.md` · `pacotes-de-backlinks.md` · `consultoria.md` · `blog-e-conteudo-seo.md` · `analytics.md` · `captacao-de-leads.md`
- `.claude/rules/` — convenções por domínio: `stack.md`, `seguranca.md`, `ui.md`.
- `ops/` — kit da VPS (stack Supabase, Nginx, publicação, backup diário às 02:15). `ops/VIRADA.md` tem o roteiro da saída do Lovable e como voltar atrás.

## Como trabalhamos

- Plano antes de editar em tarefa não-trivial. Fatias verticais (migration → hook → tela), não fases horizontais.
- Um commit por unidade lógica. Feature, correção e bump de dependência são três commits.
- O Lovable não edita mais este repo. Se ainda aparecer commit "Lovable update" na `main`, a sincronização GitHub ↔ Lovable não foi desligada: avise o Marco antes de publicar.
- Página nova precisa de `SEOHead`, entrada em `public/sitemap.xml` e, se for de campanha paga, `noindex`.

## Manutenção automática da documentação

<important if="terminando uma feature, tomando decisão de arquitetura, mudando schema ou corrigindo um bug não-óbvio">
O usuário não vai lembrar de pedir. Faça por conta própria, sem perguntar:

- Corrigiu bug não-óbvio → acrescente uma linha a `docs/GOTCHAS.md` (sintoma → causa → regra).
- Esse mesmo gotcha já estava lá → promova para `.claude/rules/`, é convenção agora.
- Feature entregue, decisão tomada ou schema alterado → atualize a doc correspondente e o `last_validated` dela.
- Encontrou doc que virou mentira → corrija na hora.

Faça em silêncio, junto com o trabalho. No fim do turno, avise em uma linha só: "atualizei a documentação (gotcha novo sobre X)". Não peça permissão e não descreva o que escreveu.
</important>
