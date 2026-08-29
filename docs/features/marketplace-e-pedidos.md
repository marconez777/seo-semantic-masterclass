---
last_validated: 2026-08-28
review_by: 2026-11-28
covers: [src/components/marketplace/**, src/components/cart/**, src/contexts/CartContext.tsx, src/hooks/useBacklinksQuery.ts, src/hooks/useBacklinkFilters.ts, src/lib/categories.ts, src/pages/ComprarBacklinks.tsx, src/pages/ComprarBacklinksCategoria.tsx, src/pages/ContinuarComprando.tsx, src/pages/Recibo.tsx, src/components/admin/AdminBacklinksImport.tsx, src/components/admin/AdminBacklinksManager.tsx, src/pages/admin/AdminPedidos.tsx, src/pages/admin/AdminSites.tsx]
---

# Marketplace de backlinks e pedidos

**Estado:** em produção, com clientes reais.

## O que faz

O cliente navega por uma vitrine de sites onde a MK publica guest posts, filtra por categoria e métrica de SEO, monta um carrinho, informa a página que quer promover e fecha o pedido. O pagamento é PIX, combinado por e-mail e WhatsApp. A MK confirma o pagamento na mão e vai marcando cada publicação como concluída.

Esta é a compra **avulsa**. Existe uma segunda modalidade, por volume fechado, em `docs/features/pacotes-de-backlinks.md` — ela não compartilha carrinho nem exigência de login com esta.

## Fluxo

1. **Vitrine** — `/comprar-backlinks` (`ComprarBacklinks.tsx`) mostra os cards de pacote (`PackageCards`) e abaixo o `BacklinkMarketplace`, que lê a view `backlinks_public` por `useBacklinksQuery`. Filtro e busca em `useBacklinkFilters` + `BacklinkFilters`.
2. **Categorias** — 17 categorias oficiais em `src/lib/categories.ts`. Cada uma tem uma página estática própria (`ComprarBacklinksSaude.tsx` etc.) **e** existe a rota dinâmica `/comprar-backlinks-categoria/:categoria`. As páginas estáticas existem por SEO; a dinâmica é o caminho para categoria nova.
3. **Carrinho** — `CartContext` guarda os itens no `localStorage` (`mkart_cart`, `mkart_mk_will_choose`, `mkart_customer_site`). Não há carrinho no servidor: trocar de navegador perde tudo.
4. **Destino do link** — para cada item o cliente informa `target_url` e `anchor_text`. Alternativa: marcar "deixar a MK Art escolher" (`mkWillChoose`), aí ele informa só o site e a MK decide as âncoras.
5. **Checkout** — `CartModal.tsx` exige sessão; sem login manda para `/auth` e volta. Cria `orders_new` (`status: aguardando_pagamento`, `payment_method: pix_whatsapp`) e as linhas de `order_items_new`.
6. **E-mails** — dispara `send-payment-email` (PIX para o cliente) e `notify-admin`. Ambos em `try/catch`: **falha de e-mail não cancela o pedido**.
7. **Confirmação** — `/continuar-comprando`, com o id e o total do pedido no state da rota.
8. **Operação** — em `/admin` (raiz = `AdminPedidos`) a equipe confere o PIX, muda o status (disparando `send-order-status-email`) e marca cada item como publicado.
9. **Acompanhamento** — o cliente vê os pedidos em `/painel` (`OrdersList`) e o comprovante em `/recibo/:orderId`.

## Catálogo, do lado do admin

- `/admin/sites` (`AdminSites` + `AdminBacklinksManager`) gerencia a tabela `backlinks`.
- `AdminBacklinksImport` importa planilha `.xlsx` / `.xls` / `.csv` com a biblioteca `xlsx`, valida a categoria contra a lista oficial e **insere** as linhas — não faz upsert, então reimportar a mesma planilha duplica sites.
- `AdminCategorizer` reclassifica sites em lote, apoiado pela edge function `categorize-backlinks`.
- Só entra na vitrine o site com `status = 'ativo'`, porque a view `backlinks_public` filtra por isso.

## Arquivos

| Arquivo | Papel |
|---|---|
| `src/components/marketplace/BacklinkMarketplace.tsx` | vitrine, tabela e filtros |
| `src/components/marketplace/DynamicCategoryPage.tsx` | página de categoria reutilizável |
| `src/hooks/useBacklinksQuery.ts` | leitura da view + conversão reais → centavos |
| `src/contexts/CartContext.tsx` | carrinho e persistência local |
| `src/components/cart/CartModal.tsx` | validação, criação do pedido, e-mails |
| `src/lib/categories.ts` | as 17 categorias oficiais e a conversão nome ↔ slug |
| `src/components/admin/AdminBacklinksImport.tsx` | importação por planilha |
| `src/pages/admin/AdminPedidos.tsx` | operação do pedido |

## Casos de borda tratados

- Item repetido no carrinho → ignorado, `addItem` não duplica `backlink_id`.
- Checkout sem login → manda para `/auth` guardando a origem e volta.
- `target_url` vazio → bloqueia o envio, a menos que "MK escolhe" esteja marcado (aí exige o site do cliente).
- Falha de e-mail → registrada no console, pedido segue.
- Preço → congelado em `order_items_new.price` no momento da compra; mudar o preço do site depois não altera pedido antigo.
- Visitante não logado vê a tabela com as últimas linhas borradas e um convite a criar conta (`TableAuthGate`), e sem controles de paginação.

## Casos conhecidos NÃO tratados

- **Ninguém é avisado de pedido parado.** Pedido criado e nunca conferido fica em `aguardando_pagamento` para sempre, sem alerta e sem expiração.
- **Não há verificação de estoque.** O mesmo site pode ser vendido em dois pedidos simultâneos; a resolução é manual.
- **Reimportar planilha duplica sites** — a importação é `insert`, não `upsert`.
- **Carrinho não sincroniza entre dispositivos** e não é recuperado no login.
- **O muro de login da vitrine é só visual.** `useBacklinksQuery` baixa o catálogo inteiro antes de decidir o que borrar; a lista completa já está no navegador de quem não fez login. Somando à policy que deixa a tabela `backlinks` legível por qualquer um (ver `docs/GOTCHAS.md`), o catálogo é público por dois caminhos independentes.
- **A vitrine não pagina no servidor.** A consulta é `select('*')` sem `limit` nem `range`, e a paginação acontece na memória do navegador. Conforme o catálogo cresce isso fica lento — e, ao passar do teto de linhas do PostgREST (1000 por padrão), sites somem da vitrine **sem erro nenhum**.
- Cancelamento e reembolso não existem no produto: é conversa com o cliente e edição de status à mão.
