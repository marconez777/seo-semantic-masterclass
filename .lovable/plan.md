
Objetivo (o que vai mudar)
- Corrigir a listagem para que as colunas “SITE” e “VALOR” apareçam corretamente em:
  - /comprar-backlinks
  - /comprar-backlinks-[categoria]
- Garantir que o “VALOR” apareça corretamente (sem NaN / vazio) e que o carrinho continue somando corretamente (preço em reais).

Diagnóstico (por que SITE e VALOR estão vazios)
1) O componente `BacklinkTableRow` mostra:
   - SITE: `item.site_name || item.site_url`
   - VALOR: `brl(item.price_cents)` (divide por 100)
2) Porém o backend (view/tabela `backlinks_public`) está entregando os campos no formato do banco:
   - `domain` (não `site_name`)
   - `url` (não `site_url`)
   - `price` em reais (não `price_cents` em centavos)
3) Resultado:
   - `site_name` e `site_url` chegam undefined -> SITE vazio
   - `price_cents` chega undefined -> VALOR vira vazio/NaN

Solução (abordagem)
- Criar um “adapter” (mapeamento) no momento em que os dados chegam do backend, convertendo o formato do banco para o formato esperado pela UI.
- Esse adapter será aplicado nas páginas que carregam `backlinks_public`.

Mudanças planejadas (passo a passo)

1) Criar um helper de adaptação (sem mexer no backend)
- Em cada página que faz `setBacklinks(data ?? [])`, trocar para algo como:
  - `const adapted = (data ?? []).map(mapBacklinkPublicToRowItem)`
  - `setBacklinks(adapted)`
- Regras do adapter:
  - `site_name = row.domain ?? null`
  - `site_url  = row.url ?? null`
  - `price_cents = toCents(row.price)` onde:
    - `toCents(price)` = `Math.round(Number(price || 0) * 100)`
    - se price vier string/numeric, garantimos Number() + fallback 0
  - manter `id`, `da`, `dr`, `traffic`, `category` como vierem

Arquivos afetados:
- `src/pages/ComprarBacklinks.tsx`
- `src/pages/ComprarBacklinksCategoria.tsx`

2) Corrigir o “preço no carrinho” (evitar somar centavos como se fosse reais)
Hoje o `CartContext` soma `item.price` diretamente e o Recibo formata `i.price` como BRL direto (sem /100), então o carrinho e pedidos assumem “reais”, não “centavos”.

O que acontece hoje:
- `BacklinkTableRow` faz `addItem({ price: item.price_cents })`
- Se passarmos `price_cents` (centavos) para o carrinho, ele vai somar 5000 como se fosse R$ 5.000,00, quando na verdade seria R$ 50,00 (exemplo).

Como vamos ajustar:
- Manter `BacklinkTableRow` mostrando o valor usando `price_cents` (para não refatorar UI inteira agora).
- Mas, ao adicionar no carrinho, converter de volta para reais:
  - `price: Math.round(item.price_cents) / 100`
  - assim o carrinho continua consistente com o resto do app (Recibo/pedidos).

Arquivo afetado:
- `src/components/marketplace/BacklinkTableRow.tsx`

3) Ajuste opcional (estabilidade visual do overlay do login)
Você comentou que o bloqueio voltou, então não é urgente.
Mesmo assim, para evitar “sumir de novo” dependendo do tamanho da lista, vou alinhar com o padrão do projeto:
- Garantir que o container da tabela em `/comprar-backlinks` tenha:
  - `relative` e `min-h-[400px]`
Isso ajuda o `TableAuthGate` a sempre se posicionar corretamente.

Arquivo potencialmente afetado:
- `src/pages/ComprarBacklinks.tsx` (apenas classe CSS do wrapper)

Como vamos validar (checklist)
1) Abrir /comprar-backlinks (deslogado)
- Coluna SITE preenchida (mostra domínio/URL)
- Coluna VALOR preenchida (formatação R$ correta)
- Blur + overlay de login continuam funcionando

2) Abrir /comprar-backlinks-[categoria] (deslogado)
- SITE e VALOR preenchidos
- (Se ainda não tiver gate nessa página, podemos padronizar depois; mas seu feedback agora foi só “site e valor”)

3) Clicar em “Comprar” e abrir o carrinho
- Total do carrinho coerente com o valor exibido na tabela (em reais)

Notas técnicas (para manter compatibilidade com o banco)
- O banco usa `domain`, `url`, `price` (reais). A UI atual usa `site_name`, `site_url`, `price_cents`. O adapter resolve isso sem precisar alterar a estrutura do banco.
- O ajuste de “reais x centavos” no carrinho é importante para evitar valores errados no checkout/pedido.

Escopo (o que NÃO será mexido agora)
- Não vou alterar o schema do banco nem a view `backlinks_public`.
- Não vou mexer no sistema de categorias/grid neste passo, porque seu pedido agora é somente “site e valor”.
