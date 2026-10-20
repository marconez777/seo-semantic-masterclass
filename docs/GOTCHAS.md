---
last_validated: 2026-10-20
review_by: 2027-02-28
covers: []
---

# Gotchas

Uma linha por armadilha: sintoma → causa → regra. Arquivo de acúmulo — cresce toda vez que alguém perde tempo com algo não-óbvio.

As entradas abaixo foram levantadas lendo o código em 2026-08-28. Nenhuma veio de relato de quem trabalha no projeto — **acrescente as suas**, elas valem mais que estas.

## Ambiente

- `npm run dev` sobe na porta **8080**, não na 5173 padrão do Vite — está fixo em `vite.config.ts`. Link para `localhost:5173` não abre nada.
- Não existe `npm test`. Só há `dev`, `build`, `build:dev`, `lint` e `preview`. Comando de teste inventado falha e faz parecer que o projeto está quebrado.
- **`npm run lint` já sai com 124 erros** (conferido em 2026-08-28), quase todos `no-explicit-any`. "O lint passou" não é sinal de nada aqui; e não adianta ligá-lo como gate sem antes limpar a base. `npx tsc --noEmit`, esse sim, passa limpo — é o sinal confiável.
- O `.env` **não é versionado** (saiu do git em 2026-10-20, depois de já ter saído uma vez e o Lovable o ter devolvido). Na VPS, o `ops/publicar.sh` o gera a cada build com `ops/gerar-env.sh`, a partir da URL e da chave anon da stack; o script recusa chave que não seja `anon`. No dev local: `ssh sfai-vps /var/www/mkart/repo/ops/gerar-env.sh > .env`. Só tem as três `VITE_SUPABASE_*`, que são públicas. **Segredo nunca entra no `.env`.** O build aborta se o bundle falar com o Lovable Cloud (`nxitvhrfloibpwrkskzx`) ou não tiver a URL da stack.
- Endereço de function ou de storage sai da `VITE_SUPABASE_URL`, nunca de `https://${VITE_SUPABASE_PROJECT_ID}.supabase.co`: no auto-hospedado não existe `<id>.supabase.co` e a chamada some em silêncio (o rastreio usa `sendBeacon`).
- Edge function não enxerga as variáveis `VITE_*` do frontend. Segredo de function se grava na VPS com `ops/supabase/definir-segredo.sh`.
- Function nova ou `verify_jwt` mudado: atualize `supabase/config.toml` **e** `supabase/functions/_manifesto-verify-jwt.json`. O roteador da VPS só lê o manifesto, e função fora dele fica fechada: sem JWT, 401 (uma function "pública" nova para de funcionar para o visitante).
- **`src/integrations/supabase/types.ts` pode estar atrasado em relação ao banco.** Como o `strict` do TypeScript está desligado, coluna que existe no banco e não existe no arquivo não gera erro de compilação: falha em runtime. Regere os tipos depois de toda migration.
- **Commit "Lovable update" na `main` depois de 2026-10-20 é alarme.** O Lovable não edita mais o repo; se ele commitar, a sincronização GitHub ↔ Lovable não foi desligada e o commit pode desfazer o que mudou na saída. Avise o Marco antes de publicar.
- Os scripts em `scripts/` apontam para um projeto Supabase **diferente** deste (`lvinoytvsyloccajnrwp`, que nunca foi o do app: era `nxitvhrfloibpwrkskzx` no Lovable e hoje é `api.mkart.com.br`). Se você rodar qualquer um deles esperando efeito no site, não vai acontecer nada.
- As documentações antigas na raiz (`DOCUMENTATION.md`, `ADMIN_IMPORT_DOCUMENTATION.md`, os `README-prerender*`) descrevem tabelas e colunas que não existem mais. Estão marcadas com aviso no topo. A fonte é `docs/`.

## Banco / RLS

- Testar no SQL Editor do Supabase **não prova nada**: ele roda como superusuário e ignora RLS. Consulta certa lá não diz o que o cliente enxerga.
- Policy errada não devolve erro — devolve linha errada ou lista vazia. Se uma tela ficou vazia sem motivo, suspeite de RLS antes de suspeitar do código.
- `backlinks_public` é **view**, não tabela. Coluna nova em `backlinks` não aparece na vitrine até ser adicionada à view. Se recriar a view, `WITH (security_invoker = true)` é obrigatório.
- **A view não protege nada hoje.** A tabela `backlinks` ainda tem a policy `"Anyone can view backlinks" FOR SELECT USING (true)`, de 2025-08-06, nunca removida. Policies permissivas se somam: basta consultar `backlinks` direto para ler o catálogo inteiro, com `observacoes` e sites inativos. Ao mexer nessa área, remova a policy antes de confiar na view.
- **Policy só some se alguém der `DROP POLICY`.** `CREATE TABLE IF NOT EXISTS` numa migration nova não recria a tabela nem limpa as policies antigas — elas continuam empilhando. Este projeto tem 9 policies em `favoritos` e 6 em `backlinks`, quase todas duplicatas de gerações diferentes.
- Antes de confiar numa policy nova, confira se não existe uma antiga mais permissiva na mesma tabela. Em RLS, a mais frouxa é a que vale.
- **`backlinks.dr` está nulo em 100% das linhas.** A métrica de autoridade que este catálogo tem é **DA**. Filtro, ordenação ou copy escrita em cima de `dr` não dá erro — devolve lista vazia, ordena nada e promete um número que ninguém mede. Foi exatamente o que aconteceu em `/agencia-de-backlinks`, onde as dez faixas de DR do filtro esvaziavam a tabela. Ao mexer em autoridade, use `da`.
- **O catálogo não é 100% brasileiro.** Cerca de 72% dos domínios são `.br` e a maior parte dos `.com` também é do Brasil, mas há ~75 portais `.pt` e `.es`. Tela que promete "portais brasileiros" precisa filtrar, ou vai contradizer a própria headline — é o que `useCatalogStats` faz na amostra da home.
- **O PostgREST corta em 1.000 linhas.** O catálogo já passou disso (1.241 em 2026-08-29). Média ou contagem feita sobre o retorno padrão descreve as primeiras 1.000, não o catálogo. Para agregado, use `count: 'exact'` com `head: true`, ou `range()` explícito.
- `backlinks.price` está em **reais**; a UI trabalha em centavos e a conversão acontece em `useBacklinksQuery` (`price_cents`). Misturar as duas unidades já é o bug mais fácil de cometer nesse fluxo.
- `profiles.is_admin` **não** decide mais quem é admin — `user_roles` decide. Policy nova escrita com `profiles.is_admin` funciona nos testes e cria uma porta lateral.

## Autenticação

- Não chame o Supabase de dentro do callback de `onAuthStateChange`: trava. É por isso que `RequireRole` separa em dois `useEffect` — o callback só guarda a sessão, e a checagem de papel roda depois. Os comentários no arquivo marcam isso; não "simplifique" juntando os dois.
- `RequireRole` protege a tela, não os dados. Tela nova de admin sem policy correspondente é dado exposto para qualquer um que chame a API.
- **"A confirmação de cadastro não funciona", mas o e-mail sai.** Link de e-mail vencido ou já usado (antivírus e Outlook abrem o link antes do cliente) volta para o `emailRedirectTo` com `#error=access_denied&error_code=otp_expired` no hash, e o auth-js não limpa nem avisa. A vitrine ignorava o hash e o cliente caía nela sem saber de nada. Regra: o erro é lido num ponto só, `AuthLinkErrorRedirect` em `App.tsx` (com `src/lib/authLinkError.ts`), que leva para `/auth?link=…` com o aviso e o botão de reenviar. Página nova não precisa tratar isso; não crie um segundo leitor de hash.
- **`signUp` com e-mail já cadastrado devolve sucesso e não manda e-mail.** O GoTrue responde 200 com `user.identities` vazio para não revelar que a conta existe. Tratar como sucesso deixa o cliente esperando um e-mail que nunca chega (e dispara o `notify-admin` de cliente novo). Regra: `identities?.length === 0` é "já tem cadastro" → mande entrar ou recuperar a senha. Do mesmo jeito, `resend` responde 200 para e-mail inexistente ou já confirmado: a mensagem de sucesso tem que ser condicional ("se houver um cadastro pendente…").

## Integrações

- E-mail do Resend falha em silêncio: o `try/catch` no checkout é proposital, para não derrubar o pedido. Cliente sem o PIX no e-mail = pedido criado normalmente, falha só no log da função.
- Pagamento não é confirmado por nenhum código. Não existe webhook. Se um pedido "não mudou de status sozinho", é porque ninguém confirmou o PIX no `/admin` — não é bug.
- `supabase/config.toml` marca quase toda function com `verify_jwt = false`: qualquer um na internet pode chamar, e todas respondem com `Access-Control-Allow-Origin: *`. Ao criar function nova, decida o `verify_jwt` conscientemente.
- **`send-package-order` é pública e sem limite de taxa.** Ela não escreve no banco, mas cada chamada dispara um e-mail para `contato@mkart.com.br`. Dá para encher a caixa de entrada com pedidos falsos.
- **Pedido de pacote não tem rede de segurança: ele só existe no e-mail.** Não há linha no banco, não aparece no `/admin` e não dá para reemitir. Se o Resend falhar, o pedido morre ali — por isso a página só mostra sucesso quando a function responde 200, e nunca em `try/catch` silencioso como faz o checkout avulso.
- **O catálogo de preços dos pacotes existe em dois arquivos** — `src/lib/packages.ts` e uma cópia dentro de `send-package-order/index.ts`. Mudar um só faz a tela mostrar um preço e o e-mail cobrar outro.
- Os dois buckets do Storage (`blog` e `webinar-videos`) são de **leitura pública**. O vídeo do webinar abre para quem tiver a URL, sem passar pelo site.

## SEO

- Existem **duas** fontes de sitemap: o arquivo estático `public/sitemap.xml` (46 URLs, `lastmod` de 2026-02-16) e a edge function `generate-sitemap`. Página nova precisa entrar no arquivo estático — é ele que está no ar.
- Página de campanha paga (`/diagnostico`, `/webinar-medico`) leva `noindex` e **fica fora do sitemap**, de propósito.
- Data do webinar, vagas restantes, IDs de vídeo do YouTube, número e link de grupo do WhatsApp e a chave PIX (CNPJ, no template do e-mail) estão **escritos no código**. Mudar qualquer um exige publicar de novo. Em `WebinarMedico.tsx` há ainda um `HERO_VIDEO_ID` declarado e nunca usado, com o ID do vídeo do rickroll — resto de placeholder.
- O FAB do WhatsApp e o banner de cookies são globais (montados em `App.tsx`) e se escondem por **lista de rotas dentro deles** — `whatsapp-fab.tsx` e `CookieBanner.tsx`. Página de dobra única nova precisa entrar nas duas listas, senão o banner empurra o CTA para fora da tela. Header e Footer não têm esse mecanismo: cada página decide se importa os dois.

## Telas e código que parecem vivos e não estão

- `/admin/publicacoes` é uma **tela morta**: só exibe um aviso de "sistema descontinuado", resto do checkout automático. Não construa em cima dela nem tente "consertar".
- `stripe_session_id` em `orders_new`, as funções `encrypt_pii` / `decrypt_pii` e a pasta `scripts/` são da mesma época e estão no mesmo estado.

## Padrões que a IA erra neste projeto

*(inferido do código; corrija e amplie conforme observar)*

- **Cria mais uma página de categoria.** Já existem 20 arquivos `ComprarBacklinks<Categoria>.tsx` quase idênticos. Categoria nova entra em `src/lib/categories.ts` e usa a rota dinâmica `/comprar-backlinks-categoria/:categoria`. Não copie mais um arquivo.
- **Usa cor literal.** `bg-white`, `text-purple-600`, `#8B5CF6` quebram o tema escuro em silêncio. Sempre token (`bg-primary`, `text-muted-foreground`).
- **Edita `src/integrations/supabase/types.ts`.** É gerado. A edição some na próxima regeneração e o tipo volta a divergir.
- **Cria tabela sem RLS.** Em banco de produção com cliente pagante, isso é vazamento. RLS na mesma migration, sempre.
- **Renderiza HTML do banco direto.** Post e conteúdo SEO passam por `sanitizeHtml()` de `src/lib/sanitize.ts` antes de `dangerouslySetInnerHTML`.
- **Confia no `strict` do TypeScript.** Ele está desligado (`tsconfig.app.json`), e o ESLint tem `no-unused-vars` em `off`. Tipo errado e variável morta passam reto até quebrar no navegador.
- **Trata guarda de tela como segurança.** `RequireRole`, o borrão da vitrine e o player "locked" do webinar são todos cosméticos — os dados já foram baixados ou são públicos. Proteção real só na RLS ou dentro de edge function.
- **Cria policy nova sem apagar a antiga.** A permissiva antiga continua valendo e anula a nova.
