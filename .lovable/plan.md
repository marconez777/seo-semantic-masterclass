# Rastreio da Aula Médico no Admin + Link do WhatsApp

## 1. Atualizar link do WhatsApp na página `/aula-medico`

Em `src/pages/AulaMedico.tsx`, trocar:
```
const WHATSAPP_GROUP_URL = "https://chat.whatsapp.com/SEU_GRUPO_AQUI";
```
por:
```
const WHATSAPP_GROUP_URL = "https://chat.whatsapp.com/Eqrg6lc0Lo3GtyYvZbjU7H?mode=gi_t";
```
Todos os 4 botões (hero / aprender / final / sticky) já usam essa constante, então passam a apontar para o grupo correto automaticamente.

## 2. Tela de rastreio no Admin (parecida com Webinar)

Criar uma página no admin com o mesmo conceito da aba "Métricas & Rastreamento" do Webinar, mas focada em **cliques no botão de WhatsApp** (em vez de view de vídeo). Sem novo schema — usa os dados que já estão sendo gravados pelo sistema first-party.

**KPIs no topo (cards)**
- Total de sessões em `/aula-medico`
- Sessões que clicaram no WhatsApp
- Taxa de conversão (cliques / sessões) em %
- Total de cliques
- Quebra por fonte: Hero · Aprender · Final · Sticky

**Tabela de sessões** (uma linha por sessão que visitou /aula-medico)
- Data/hora · Dispositivo (ícone) · OS · Navegador · País
- UTM source / medium / campaign · Referrer
- Tempo na página · Scroll %
- Cliques totais + badge da primeira fonte clicada
- Status: "Clicou" (verde) / "Não clicou"

**Filtros**: Período (7 / 30 / Todos) · Busca · Dispositivo · "Só quem clicou"
**Ações**: Exportar CSV · Atualizar · Excluir sessão

**Como funciona (técnico)** — sem mudança de schema:
- `analytics_sessions` → linha base por sessão
- `analytics_pageviews` filtrado em `path = '/aula-medico'` → identifica sessões que visitaram a página + tempo/scroll
- `analytics_events` filtrado em `event_type = 'aula_whatsapp_click'` → cliques por sessão e por fonte (`event_label`)

3 queries em paralelo, agregação no cliente por `session_id`.

## Arquivos

**Criar**
- `src/pages/admin/AdminAula.tsx` — página com KPIs, filtros e tabela (modelo: `WebinarMetricsTab`)
- `src/components/admin/AulaSessionDetailDrawer.tsx` — drawer com detalhes da sessão e timeline de cliques

**Editar**
- `src/pages/AulaMedico.tsx` — atualizar `WHATSAPP_GROUP_URL`
- `src/App.tsx` — registrar rota `/admin/aula` dentro do `AdminLayout`
- `src/layouts/AdminLayout.tsx` — adicionar item "Aula Médico" no menu (ícone `GraduationCap`)

## Fora de escopo
- Não cria tabela nova nem edge function.
- Não mexe no tracker `src/lib/analytics.ts` (eventos já estão sendo enviados).
