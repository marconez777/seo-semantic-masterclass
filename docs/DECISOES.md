---
last_validated: 2026-08-28
review_by: 2027-02-28
covers: []
---

# Decisões

Append-only. Decisão superada não é reescrita: ganha entrada nova, e a antiga muda de status e aponta para a nova.

Estas entradas foram reconstruídas a partir do código e do histórico do git em 2026-08-28. O **contexto** de cada uma é inferência — corrija onde estiver errado, é para isso que serve o arquivo.

---

## ADR-001 · 2025-06 — Frontend falando direto com o Supabase, sem backend próprio
**Status:** aceita
**Contexto:** projeto iniciado no Lovable, que gera SPA React + Supabase. Time pequeno, sem gente de infraestrutura.
**Escolha:** SPA estática conversando direto com o Supabase; o que precisa de segredo vira edge function.
**Descartamos:** API própria (Node/Nest) — custo de manutenção e de deploy que o time não tem.
**Consequência:** **não existe lugar central para checar permissão.** Toda regra de acesso vira policy de RLS, e um erro de policy é um vazamento direto, sem intermediário. É o que torna o gate de RLS o teste mais importante do repo.

## ADR-002 · 2025-08-19 — Trocar checkout automático por PIX combinado por fora
**Status:** aceita
**Contexto:** existia um checkout com gateway (edge function `abacate-create-billing`, tabelas `pedidos` / `pedidos_pii` com dados criptografados, página `Cart.tsx`).
**Escolha:** o pedido é criado no site, e o pagamento é combinado por e-mail/WhatsApp. Alguém confirma o PIX na mão e muda o status no `/admin`.
**Descartamos:** manter o gateway — o volume não justificava a complexidade nem o custo de guardar CPF criptografado.
**Consequência:** nenhum código confirma pagamento; não há webhook. Um pedido pago e não conferido fica parado indefinidamente, e ninguém é avisado. Sobraram no banco as funções de criptografia de dado pessoal e a coluna `stripe_session_id`, sem uso.

## ADR-003 · 2026-01-30 — `backlinks_public` como view com `security_invoker`
**Status:** aceita
**Contexto:** a vitrine precisa ser pública, mas a tabela `backlinks` tem coluna interna (`observacoes`, `status`) e sites inativos.
**Escolha:** uma view com as colunas públicas e `WHERE status = 'ativo'`, criada com `WITH (security_invoker = true)`.
**Descartamos:** (a) tabela espelho sincronizada por trigger — era o modelo anterior, com trigger `sync_backlinks_public`, e dava divergência; (b) view comum — view no Postgres roda como quem a criou e **furaria a RLS**.
**Consequência:** todo consumo público de backlink passa pela view. Coluna nova só aparece na vitrine se for adicionada à view.

## ADR-004 · 2026-05-25 — Papel de admin sai de `profiles.is_admin` e vai para `user_roles`
**Status:** aceita
**Contexto:** `profiles` é editável pelo próprio usuário. Com o admin decidido por uma coluna dessa tabela, um cliente podia se promover a admin.
**Escolha:** tabela `user_roles` com enum `app_role`; `is_admin()` e `has_role()` passam a ler dela; a policy de UPDATE de `profiles` bloqueia alteração do próprio `is_admin`; `EXECUTE` de funções `SECURITY DEFINER` sensíveis revogado de `anon` e `authenticated`.
**Descartamos:** manter a coluna e só endurecer a policy — deixa a porta aberta para a próxima policy escrita por descuido.
**Consequência:** convivem duas verificações de admin no banco. Policies de tabelas criadas em jan/fev de 2026 ainda consultam `profiles.is_admin`. Migrar essas policies é dívida aberta.

## ADR-005 · 2026-08-28 — Scripts de prerender e pipeline mantidos, mas fora do build
**Status:** proposta *(precisa de confirmação humana)*
**Contexto:** `scripts/` tem ~20 arquivos de prerender, servidor de produção, detecção de crawler e QA de SEO, com quatro READMEs próprios. **Nenhum está ligado a comando do `package.json`**, e ninguém no time hoje sabe dizer se ainda rodam. Três deles (`build-prerender.mjs`, `generate-redirects.js`, `prerender-supabase.js`) trazem uma chave `anon` fixa de um **projeto Supabase diferente** (`lvinoytvsyloccajnrwp`, e não `nxitvhrfloibpwrkskzx`) — evidência forte de que são restos de outro projeto e não têm efeito nenhum sobre este site.
**Escolha provisória:** não apagar, e tratar como código não suportado: não imitar esse padrão, não construir em cima dele, e não presumir que o site é pré-renderizado.
**Descartamos:** apagar agora — sem certeza de que não existe processo externo chamando esses scripts.
**Consequência:** o SEO do site depende de renderização no cliente e das meta tags do `react-helmet-async`. Se em algum momento a decisão for "o site precisa de HTML pronto para o robô", esta entrada vira uma ADR nova.

## ADR-006 · 2026-08-28 — Pacotes de backlinks com compra sem cadastro
**Status:** aceita
**Contexto:** a compra avulsa obriga o cliente a escolher site a site e a criar conta antes de fechar. Isso derruba a conversão de quem só quer volume por um preço fixo.
**Escolha:** uma modalidade paralela (`/pacote-backlinks/:slug`) com preço fechado, sem login e **sem banco**. A página mostra a chave PIX e uma edge function pública (`send-package-order`) **recalcula o total no servidor** e manda o pedido inteiro por e-mail para a MK. Nada é gravado; o `/admin` continua atendendo só a compra avulsa.
**Descartamos:** (a) gravar em `orders_new` com colunas de pacote e de visitante — chegou a ser implementado e foi revertido em 2026-08-29, porque exigia também tela de alocação de site no admin antes de servir para operar; (b) abrir INSERT de `orders_new` para anônimo — deixaria qualquer um gravar pedido com o total que quisesse; (c) obrigar cadastro no pacote — era exatamente o atrito que a modalidade existe para remover.
**Consequência:** o pedido de pacote **só existe no e-mail**. E-mail que não sai é pedido perdido, não há histórico consultável, não há status, e nem o cliente nem a MK conseguem reabrir o pedido depois. O catálogo de preços passa a existir em dois lugares (cliente e function) e precisa ser mudado nos dois. Levar o pacote para o banco e para o painel é trabalho já previsto — quando acontecer, esta ADR ganha uma sucessora.
