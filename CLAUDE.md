# MK Art SEO — mkart.com.br

Site e plataforma da MK Art: venda de backlinks (guest posts), consultoria de SEO e captação de leads. **Está em produção com clientes reais e dados pessoais no banco.**

## Contrato

<important if="escrevendo qualquer código neste repo">
- Stack: React 18 + Vite 5 + TypeScript, Tailwind + shadcn/ui, Supabase (banco, auth, edge functions), publicado pelo Lovable. Não introduza dependência nova sem perguntar.
- **Toda tabela nova nasce com RLS habilitada, na mesma migration.** Sem exceção — o banco tem dado de cliente pagante.
- **`service_role` nunca sai de edge function.** Nada de `VITE_*` com segredo: variável `VITE_` vai para o navegador por definição do bundler.
- HTML vindo do banco (post de blog, conteúdo SEO) **passa por `sanitizeHtml`** de `src/lib/sanitize.ts` antes de ir para `dangerouslySetInnerHTML`.
- Nada que roda no navegador protege dado. Guarda de rota, borrão e player travado são cosméticos: a restrição real é policy de RLS ou edge function.
- Depois de toda migration, **regere `src/integrations/supabase/types.ts`**. Com o `strict` desligado, tipo atrasado não dá erro — quebra em produção.
- Antes de criar página, componente ou hook novo, **procure o existente**. Este repo tem 20 páginas `ComprarBacklinks*` quase idênticas — duplicar mais é o modo de falha nº 1 aqui.
- Antes de implementar, leia `docs/GOTCHAS.md`.
- Comandos: `npm run dev` (porta 8080) · `npm run build` · `npm run lint`. **Não existe suíte de testes** — não invente `npm test`.
</important>

## Onde está o quê

- `docs/ARQUITETURA.md` — como as peças se conectam. Leia antes de mexer em fluxo de dados.
- `docs/MODELO-DE-DADOS.md` — tabelas, relações, policies de RLS, o que é legado.
- `docs/DECISOES.md` — por que as coisas são como são. Leia antes de propor mudar arquitetura.
- `docs/GOTCHAS.md` — o que quebra sempre neste projeto.
- `docs/features/` — uma doc por feature. Leia só a da feature em que você vai mexer.
  - `marketplace-e-pedidos.md` · `pacotes-de-backlinks.md` · `consultoria.md` · `blog-e-conteudo-seo.md` · `analytics.md` · `captacao-de-leads.md`
- `.claude/rules/` — convenções por domínio: `stack.md`, `seguranca.md`, `ui.md`.

## Como trabalhamos

- Plano antes de editar em tarefa não-trivial. Fatias verticais (migration → hook → tela), não fases horizontais.
- Um commit por unidade lógica. Feature, correção e bump de dependência são três commits.
- O código também é editado pelo Lovable, que commita direto na branch. Antes de mexer, confira se não há commit novo: um `git pull` esquecido vira conflito na interface do Lovable.
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
