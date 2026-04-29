# Quiz de qualificação para o webinar

Substituir o modal de inscrição atual (`WebinarSignupModal`) por um **quiz de 5 etapas** que aparece ao clicar em qualquer CTA "Garantir minha vaga gratuita". O lead responde uma pergunta por vez, sem barra de progresso visível, e é roteado por perfil no final.

## Fluxo das perguntas

| # | Pergunta | Tipo |
|---|----------|------|
| 1 | Qual seu nome? | Input texto |
| 2 | Qual seu e-mail? | Input email |
| 3 | Qual seu WhatsApp? | Input tel |
| 4 | Você é psiquiatra? | Botões: Sim / Não |
| 5 | Qual seu faturamento mensal hoje? | 5 botões: até R$ 10 mil · até R$ 20 mil · até R$ 30 mil · até R$ 40 mil · mais de R$ 50 mil |

Avanço automático ao clicar nas opções de múltipla escolha (etapas 4 e 5). Nas etapas de input (1-3), botão "Continuar →". Botão sutil "← Voltar" a partir da etapa 2.

## Roteamento por resultado

Salva tudo em `webinar_signups` (campo `especialidade` = "Psiquiatria" se Sim, senão "Outra"; `faturamento` = valor escolhido).

- **Qualificado** → redireciona para `/webinar-medico/obrigado` (página atual de sucesso).
  - Critério: `psiquiatra === "Sim"` **E** faturamento ∈ {"Até R$ 30 mil", "Até R$ 40 mil", "Mais de R$ 50 mil"}.
- **Não qualificado** → mostra tela final dentro do próprio modal:
  > "Obrigado por sua aplicação. Iremos analisar seu perfil e entramos em contato."
  
  Sem redirecionamento, sem link do grupo. Botão "Fechar".

## Mudanças técnicas

1. **Reescrever `src/components/webinar/WebinarSignupModal.tsx`**
   - Estado `step` (1-5) + `answers`.
   - Validação por etapa com `zod` (nome ≥ 2, email válido, whatsapp ≥ 8 dígitos).
   - Animação suave de transição entre etapas (fade).
   - Visual mantém a identidade `bg-webinar-cream` / `font-serif-display` / `btn-webinar-cta`.
   - Sem indicador de progresso (conforme pedido).
   - Na etapa 5, ao clicar numa opção: `insert` no Supabase → roteia conforme critério.

2. **Tabela `webinar_signups`** — sem alterações de schema. Reaproveita campos existentes:
   - `especialidade`: "Psiquiatria" ou "Outra"
   - `faturamento`: string da opção escolhida
   - `source`: "webinar-medico" (mantém RLS atual)

3. **Página `/webinar-medico/obrigado`** — sem alterações.

4. **`WebinarMedico.tsx`** — sem alterações (continua abrindo o mesmo modal).

## Detalhes de UX

- Modal um pouco maior (`sm:max-w-lg`) para respirar.
- Cada pergunta com a pergunta em `font-serif-display` grande, centralizada.
- Botões de opção (etapas 4-5) em formato de "cards" empilhados, full-width, com hover destacando borda em `webinar-accent`.
- Inputs com foco em `webinar-accent`.
- Toast de erro caso falhe o insert (mantém `sonner`).
