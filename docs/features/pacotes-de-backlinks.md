---
last_validated: 2026-08-29
review_by: 2026-11-29
covers: [src/lib/packages.ts, src/lib/package-faqs.ts, src/pages/PacoteBacklinks.tsx, src/components/marketplace/PackageCards.tsx, src/components/marketplace/DynamicCategoryPage.tsx, supabase/functions/send-package-order/index.ts]
---

# Pacotes de backlinks

**Estado:** em produção desde 2026-08-29, com a edge function publicada e o envio de pedido testado ponta a ponta. **Não usa banco de dados.**

## O que faz

Uma segunda forma de comprar, ao lado da loja avulsa: em vez de escolher site por site, o cliente compra um **volume fechado** por preço fixo, e a MK escolhe os sites dentro de uma faixa de autoridade. É mais simples, mais barato por link e **não exige cadastro**.

| Pacote | Entrega | Faixa de DA | Preço | Âncoras escolhidas pela MK |
|---|---|---|---|---|
| Básico | 20 backlinks | 20 a 30 | R$ 197 | + R$ 97 |
| Médio | 20 backlinks | 30 a 40 | R$ 497 | incluso |
| Personalizado | a combinar | — | sob consulta | — (vai para o WhatsApp) |

Prazo anunciado: 1 a 3 dias úteis nos dois pacotes fechados. A compra avulsa tem prazo e formas de pagamento diferentes — o FAQ da vitrine descreve **só ela**, e é por isso que os cards trazem o prazo dentro do próprio card.

## Fluxo

1. Os cards aparecem em `/comprar-backlinks` e nas 20 páginas de categoria, pela prop `topSection` do `BacklinkMarketplace` — renderizada **fora** do grid de 12 colunas, para não ficar espremida ao lado da sidebar de filtros.
2. "Comprar" leva a `/pacote-backlinks/:slug` (`noindex`); "Personalizado" abre o WhatsApp com mensagem pronta.
3. Na página o cliente informa contato (nome, e-mail, WhatsApp) e escolhe quem define as âncoras: ele mesmo, uma linha por backlink com colagem em massa, ou a MK — o que soma `anchorServicePrice` ao total. **A chave PIX não aparece em lugar nenhum do site** — quem manda é a equipe, depois de receber o pedido.
4. "Enviar pedido" chama a edge function `send-package-order` (pública, aceita visitante).
5. A function **recalcula o total do zero** a partir da própria cópia do catálogo. O valor que veio do navegador é ignorado.
6. Ela monta um e-mail com o pedido inteiro — pacote, total, contato, e as 20 linhas de âncora e destino — e manda para `contato@mkart.com.br`, com `replyTo` do cliente.
7. A página troca para a tela de confirmação: resumo, total e o aviso de que a equipe vai mandar o PIX pelo WhatsApp.

## Por que não passa pelo banco

Decisão consciente para colocar a modalidade no ar sem depender do resto (ADR-006). Gravar em `orders_new` chegou a ser implementado e foi revertido: sem uma tela no admin para registrar **qual site recebeu cada um dos 20 links**, o pedido gravado não servia para operar — a coluna Site ficaria "a alocar" para sempre, e a alocação teria de ser feita no SQL Editor, 20 vezes por pedido.

O custo dessa escolha está em "Casos conhecidos NÃO tratados", e não é pequeno.

## Arquivos

| Arquivo | Papel |
|---|---|
| `src/lib/packages.ts` | catálogo, preços e cálculo do total no cliente |
| `src/lib/package-faqs.ts` | os 13 avisos da página de pacote |
| `src/components/marketplace/PackageCards.tsx` | os três cards |
| `src/components/marketplace/DynamicCategoryPage.tsx` | injeta os cards nas 20 páginas de categoria |
| `src/pages/PacoteBacklinks.tsx` | página de finalização e tela de confirmação |
| `supabase/functions/send-package-order/index.ts` | valida, recalcula o total e envia o e-mail |

## Casos de borda tratados

- Preço adulterado no navegador é ignorado — o total sai do catálogo do servidor.
- Slug inválido em `/pacote-backlinks/:slug` redireciona para `/comprar-backlinks`.
- A quantidade de linhas enviadas tem que bater exatamente com a do pacote; senão a function recusa.
- Todo texto do cliente passa por `escapeHtml` antes de entrar no e-mail.
- **Falha de envio não é engolida.** Ao contrário do checkout avulso, que segue em frente se o e-mail falhar, aqui a página só mostra sucesso com resposta 200 — sem banco, e-mail que não sai é pedido perdido.

## Casos conhecidos NÃO tratados

- **O pedido só existe no e-mail.** Não há linha no banco, não aparece no `/admin`, não tem status, não dá para reemitir nem para o cliente consultar. Perder o e-mail é perder o pedido.
- **Nem o cliente nem a MK têm histórico.** Nenhuma das duas pontas consegue listar pedidos de pacote depois.
- **O catálogo de preços existe em dois lugares** — `src/lib/packages.ts` e uma cópia dentro de `send-package-order/index.ts`. Mudar um só faz a tela mostrar um preço e o e-mail cobrar outro. A duplicação é obrigatória (edge function não importa de `src/`); o jeito é mudar os dois juntos.
- **A function é pública e sem limite de taxa.** Cada chamada dispara um e-mail: dá para inundar a caixa de entrada da MK.
- **Dados pessoais do comprador ficam só na caixa de e-mail**, fora do alcance de RLS.

## Próximo passo previsto

Levar o pacote para o banco e para o painel. Quando acontecer, precisa vir junto: colunas de modalidade em `orders_new`, contato de visitante, **e uma tela de alocação de site por item** — sem a terceira, a segunda não serve para operar.
