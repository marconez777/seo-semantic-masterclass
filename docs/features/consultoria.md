---
last_validated: 2026-08-28
review_by: 2026-11-28
covers: [src/components/consulting/**, src/components/dashboard/KeywordTracker.tsx, src/components/dashboard/AddKeywordForm.tsx, src/components/dashboard/NewProjectModal.tsx, src/pages/Dashboard.tsx, src/pages/admin/AdminConsultoria.tsx, src/pages/admin/AdminConsultoriaClient.tsx, supabase/functions/serpbot-proxy/index.ts]
---

# Consultoria de SEO e monitoramento de palavras-chave

**Estado:** em produção.

## O que faz

Para o cliente de consultoria, o painel em `/painel` mostra o trabalho em andamento: as palavras-chave que estão sendo monitoradas e como a posição delas evoluiu, as páginas otimizadas, os backlinks conquistados, os textos entregues e as tarefas em aberto. Do lado da MK, `/admin/consultoria` lista os clientes e `/admin/consultoria/:clientId` é a tela de trabalho de cada um.

Existe também um monitor de palavras-chave mais simples, separado da consultoria, para clientes do marketplace.

## Fluxo

1. A MK cadastra o cliente em `consulting_clients` (`ClientFormDialog`).
2. Nas abas do cliente entram palavras-chave, páginas, backlinks, posts e tarefas — cada uma em sua tabela `consulting_*`, todas amarradas ao `consulting_clients`.
3. A edge function **`serpbot-proxy`** consulta a posição das palavras-chave na API do SerpBot e grava:
   - `consulting_keywords` → snapshot em `consulting_keyword_snapshots` (consultoria);
   - `tracked_keywords` → `keyword_history` e `keyword_monthly_snapshots` (monitor avulso).
4. `/painel` descobre o cliente pelo `user_id` (`consulting_clients` com `status = 'ativo'`, via `maybeSingle`) e renderiza os componentes `Consulting*` com `readOnly = true` — o cliente lê, quem edita é a MK.

## Arquivos

| Arquivo | Papel |
|---|---|
| `src/pages/admin/AdminConsultoriaClient.tsx` | tela de trabalho por cliente |
| `src/components/consulting/ConsultingKeywords.tsx` | palavras-chave e evolução de posição |
| `src/components/consulting/ConsultingPages.tsx` | páginas e as palavras ligadas a elas |
| `src/components/consulting/ConsultingTaskBoard.tsx` | quadro de tarefas |
| `src/components/dashboard/KeywordTracker.tsx` | monitor avulso de palavras-chave |
| `supabase/functions/serpbot-proxy/index.ts` | consulta o SerpBot e grava os snapshots |

## Casos de borda tratados

- Snapshot é `upsert` por chave + data, então rodar duas vezes no mesmo dia não duplica linha.
- Separação clara entre a consultoria (`consulting_*`) e o monitor avulso (`keyword_*`), mesmo com o conceito parecido.

## Casos conhecidos NÃO tratados

- **`serpbot-proxy` não tem agendador confirmado no repositório.** Se ninguém a chama, o gráfico congela sem avisar — a tela mostra o último snapshot como se fosse atual. A atualização que existe hoje é **manual**: `ConsultingKeywords` chama a function direto do navegador quando alguém aperta o botão.
- **É pública (`verify_jwt = false`)** e consome cota paga do SerpBot a cada chamada.
- Falha do SerpBot não gera alerta; a lacuna aparece só como buraco no histórico.
- **Um login enxerga um cliente só.** A busca usa `maybeSingle()` filtrando por `status = 'ativo'`: se a mesma pessoa for cadastrada em dois clientes ativos, a consulta falha e o painel fica vazio. Não há modelo de agência com vários clientes por login.
- Cliente com `status` diferente de `'ativo'` perde o acesso ao painel de consultoria sem nenhuma mensagem — a aba simplesmente não aparece.
