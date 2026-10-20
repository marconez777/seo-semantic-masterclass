# Virada do mkart: Lovable Cloud → sfai-vps

Banco e site saem do Lovable e vão para a `sfai-vps`, no molde do Just Services (2026-10-12):
Supabase próprio em `/opt/supabase/mkart` (gateway `127.0.0.1:8106`, pooler `5444`/`6544`),
API pública em `https://api.mkart.com.br`, site estático em `/var/www/mkart`, Nginx do host na
frente. Decidido com o Marco em 2026-10-14. O checkout Asaas **não** entra nesta virada: as 4
functions e a migration `package_orders` ficam para depois, na branch `feat/pacote-checkout-asaas`.

Quem faz cada passo está entre colchetes. **[Marco]** é o que só você consegue (painéis, DNS,
chaves). **[Claude]** roda pelo `ssh sfai-vps`.

## Estado em 2026-10-20

Passos 1 a 7, 9 e 10 feitos. Backup `seo-semantic-masterclass_261020.backup` carregado (156
contas, 1.241 sites, 18 pedidos, 21 posts), 36 arquivos copiados, `api.mkart.com.br` com
certificado, site publicado em `/var/www/mkart/atual` e Nginx do site instalado na
variante http (só ACME). Segredos: só `SMTP_PASS` e `OPENAI_API_KEY`; o Marco deixou o resto
para depois, e sem `RESEND_API_KEY` o `send-contact-email` responde 500.
O que apareceu no backup e entrou nos scripts: o papel `sandbox_exec_<id>`, o gatilho
`on_auth_user_created` (esquema `auth`), três jobs do `pg_cron` (recriados apontando para
`http://api-gw:8000`), vídeo de 84 MB (limite subido para 200 MB) e `npm ci` exigindo
`--legacy-peer-deps`. Na virada, como ninguém escreve no banco novo antes dela, o passo 12
pode ser recriar o banco vazio e rodar `carregar-banco.sh` + `copiar-arquivos.sh` com a
exportação nova, em vez de mesclar.

## Antes da virada (o site antigo segue no ar, nada muda para o cliente)

1. **[Claude]** Levar o repositório para `/var/www/mkart/repo` (rsync da branch
   `sair-do-lovable`, sem `.git`, como no Just Services).
2. **[Claude]** `ops/supabase/criar-stack.sh`: cria `/opt/supabase/mkart` a partir do molde
   do CRM, com chaves novas e sem mostrá-las. Cadastro de cliente **aberto**, confirmação
   por e-mail **ligada** e e-mail do auth pelo SMTP do Resend.
3. **[Claude]** `ops/supabase/publicar-funcoes.sh` e subir a stack
   (`sudo docker compose up -d` em `/opt/supabase/mkart`).
4. **[Marco]** Exportar o banco no Lovable Cloud, do mesmo jeito que você fez com o
   `host-hearth_260905.backup` e o `mindscape-revive_261008.backup.zip`, e me avisar onde
   o arquivo ficou. **[Claude]** leva o arquivo para `~/migracao-mkart/origem.backup` na VPS
   e guarda o `.env` atual em `~/migracao-mkart/env-antigo`.
5. **[Claude]** Antes de carregar, ler o índice do backup (`pg_restore -l`) e conferir:
   esquema `private` (as funções `encrypt_pii`/`decrypt_pii` de 2025), jobs do `pg_cron`
   (o `publish-scheduled-posts` não tem chamador no código, então ou existe um job no banco
   ou ele está morto), extensões e buckets. O que aparecer e não estiver no
   `carregar-banco.sh` entra no script antes de rodar.
6. **[Claude]** `ops/supabase/carregar-banco.sh` (numa transação: se falhar, o banco
   continua vazio). Entram o `public`, as contas de login com o hash da senha, os buckets e
   as policies de storage.
7. **[Claude]** `ops/supabase/copiar-arquivos.sh`: copia os arquivos dos buckets `blog` e
   `webinar-videos` e troca, em todas as colunas de texto do `public`, o endereço
   `nxitvhrfloibpwrkskzx.supabase.co` por `api.mkart.com.br`, com os gatilhos desligados
   (para não mexer em `updated_at`).
8. **[Marco]** Gravar os segredos, um por vez, de um terminal seu:
   ```bash
   ssh -t sfai-vps /var/www/mkart/repo/ops/supabase/definir-segredo.sh RESEND_API_KEY
   ```
   Repita para `SMTP_PASS` (uma chave do Resend, pode ser a mesma), `SERPBOT_API_KEY`,
   `OPENAI_API_KEY`, `GEMINI_API_KEY`, `FIRECRAWL_API_KEY` e `SEO_HEALTH_SECRET`. O valor
   não aparece na tela nem passa por esta conversa.
9. **[Marco]** DNS de `mkart.com.br`. A zona está no **Registro.br** (NS `*.sec.dns.br`), não
   na Hostinger. Crie primeiro só o registro A de `api` → `179.197.232.202`, como já existe
   o `api.sfai`. **[Claude]** instala o Nginx da API (`ops/instalar-nginx.sh api`), emite o
   certificado e roda a bateria de testes abaixo **contra a API nova, com o site ainda no
   Lovable**.
10. **[Claude]** Trocar o `.env` do repo pela URL e pela chave publicável da stack nova (desde
    2026-10-20 ele não é versionado: o `publicar.sh` o gera com `ops/gerar-env.sh`), e
    `ops/publicar.sh` (o build aborta se ainda apontar para `nxitvhrfloibpwrkskzx`).

## A virada (janela curta, de preferência à noite)

11. **[Marco]** Congelar o admin antigo: nada de post, pedido manual ou importação de sites
    no Lovable a partir daqui.
12. **[Marco]** Nova exportação do Lovable Cloud. **[Claude]** mescla o que entrou desde o
    passo 4 (pedidos, cadastros, leads, eventos), como foi feito na Clínica ÓR.
13. **[Marco]** DNS: `@` e `www` → `179.197.232.202`. **[Claude]** instala o Nginx do site
    (`ops/instalar-nginx.sh site`) e emite o certificado de `mkart.com.br` + `www`.
14. **[Claude]** Conferência no ar (lista abaixo).

## Bateria de testes (antes e depois do DNS do site)

| O quê | Como | Esperado |
|---|---|---|
| Vitrine | `GET /rest/v1/backlinks_public` com a chave publicável | mesmo número de sites ativos do banco antigo |
| Furo conhecido | `GET /rest/v1/backlinks` sem login | igual ao banco antigo (hoje legível: policy `"Anyone can view backlinks"`) |
| Dado de cliente | `orders_new`, `profiles`, `contact_submissions` sem login | 0 linhas |
| Login | entrar com uma conta de cliente existente | entra (a senha veio como hash) |
| Cadastro | criar conta nova | chega o e-mail de confirmação (SMTP do Resend) e o link ativa |
| Esqueci a senha | pedir pela tela `/auth` | chega o e-mail |
| Admin | `/admin` com o seu login | abre e lista pedidos |
| Funções públicas | `track`, `webinar-track`, `send-contact-email` | 200 ou 400 para entrada inválida, nunca 401 |
| Função fechada | `get-pii-data` sem JWT | 401 |
| Imagens | posts do blog e vídeo do webinar | carregam de `api.mkart.com.br/storage` |
| Funções no ar = repo | `cat /opt/supabase/mkart/volumes/functions/_versao.txt` | o commit publicado |

## Depois da virada

- **[Claude]** `ops/instalar-backup.sh` (diário às 02:15, em `/opt/backups/mkart`).
- **[Marco]** Despublicar no Lovable e desligar a sincronização GitHub ↔ Lovable. Até lá,
  um commit do Lovable na `main` pode desfazer mudanças da saída (o `.env` já não
  é risco: o build o gera a partir da stack).
- **[Claude]** Atualizar a documentação do repo: a regra "banco via Lovable"
  (`docs/PENDENTE-BANCO-LOVABLE.md`, o `bash-guard`, o `CLAUDE.md`) deixa de valer, e o
  deploy de function passa a ser `ops/supabase/publicar-funcoes.sh`. **Feito em 2026-10-20
  nesta branch** (`CLAUDE.md`, `docs/`, `.claude/rules/seguranca.md`, `README.md`; saiu o
  `public/_redirects`). Falta o que só existe na branch `feat/pacote-checkout-asaas`
  (`docs/PENDENTE-BANCO-LOVABLE.md`, `docs/referencia/37-env-e-secrets.md`,
  `scripts/gates/bash-guard.mjs` e os docs renomeados para `docs/0x-*`/`docs/dominios/`):
  ajustar quando ela for juntada a esta.
- **[Claude]** Retomar o Asaas na stack nova: migration `package_orders`, as 4 functions no
  manifesto, os segredos `ASAAS_*` e `HEARTH_*`, o webhook no Asaas apontando para
  `https://api.mkart.com.br/functions/v1/asaas-webhook` e o `MKART_CALLBACK_URL` do
  host-hearth para `https://api.mkart.com.br/functions/v1/package-order-callback`.
- Limpar `~/migracao-mkart` na VPS: o backup tem nome, e-mail e pedido de cliente.

## Para voltar atrás

Até o passo 13 o site antigo não foi tocado. Depois dele: DNS de volta para como estava
em 2026-10-14 (`@` → `185.158.133.1`, `www` → `168.220.87.211`, ambos registro A) e
republicar no Lovable. Funciona enquanto o projeto no
Lovable Cloud estiver ligado, por isso ele só é desligado depois de uma semana estável.
