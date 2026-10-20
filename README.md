# MK Art SEO — mkart.com.br

Site e plataforma da MK Art: venda de backlinks, consultoria de SEO, blog e captação de leads.
React + Vite + TypeScript, Tailwind + shadcn/ui, Supabase.

O projeto nasceu no Lovable e saiu dele em 2026-10-20: banco, auth e edge functions rodam num
Supabase auto-hospedado na `sfai-vps` (`https://api.mkart.com.br`), e o site é servido pelo
Nginx da mesma VPS. Push no GitHub não publica nada.

## Rodar localmente

```sh
ssh sfai-vps /var/www/mkart/repo/ops/gerar-env.sh > .env   # .env não é versionado
npm ci --legacy-peer-deps
npm run dev   # porta 8080
```

## Publicar

- Site: `ssh sfai-vps /var/www/mkart/repo/ops/publicar.sh`
- Edge functions: `ssh sfai-vps 'bash /var/www/mkart/repo/ops/supabase/publicar-funcoes.sh </dev/null'`
- Segredo de function: `ssh -t sfai-vps /var/www/mkart/repo/ops/supabase/definir-segredo.sh <NOME>`

Roteiro da migração, estado e como voltar atrás: `ops/VIRADA.md`. Regras para quem mexe no
código (inclusive agentes): `CLAUDE.md` e `docs/`.
