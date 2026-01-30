
Objetivo: destravar o login em `/admin/login` (fica em “Verificando…”) e evitar novos travamentos relacionados a autenticação/roles.

## Diagnóstico (por que está travando)
1) O request de login (senha) está retornando **200 OK** (autenticação funciona).
2) O travamento acontece logo depois, por dois motivos prováveis (e combináveis):
   - **Deadlock/Freeze por callback async em `onAuthStateChange`:** o `AdminAuth.tsx` está usando `supabase.auth.onAuthStateChange(async (...) => { await ... })`. Esse padrão pode travar o fluxo interno do SDK (é um problema conhecido e já documentado nas boas práticas: não usar callback async e não fazer chamadas do backend dentro do callback).
   - **RLS bloqueando a leitura de `user_roles`:** a migration criou políticas em `user_roles` permitindo SELECT apenas para admins (e o check atual tenta fazer `.from('user_roles').select(...)`). Isso gera um “ciclo”: para descobrir se é admin, o app tenta ler `user_roles`, mas ler `user_roles` exige já ser admin.

Resultado típico: UI fica “Verificando…” porque o código fica aguardando uma promise que não resolve corretamente (ou nunca chega a disparar a query seguinte), e o `setLoading(false)` não é atingido.

## Mudanças propostas (alto nível)
A) Padronizar checagem de admin para **RPC `has_role()`** (em vez de SELECT direto em `user_roles`)
- Isso usa a função `SECURITY DEFINER`, que não depende das permissões de SELECT do usuário na tabela.
- Também evita expor lógica de roles via query na tabela.

B) Eliminar callbacks async dentro de `onAuthStateChange`
- Callback deve ser **síncrono** e apenas atualizar estado/acionar side-effects deferidos.
- Qualquer chamada ao backend (RPC/queries) deve ocorrer fora do callback ou com `setTimeout(..., 0)`.

C) Garantir que o botão nunca fique preso em “Verificando…”
- Envolver `handleLogin` em `try/catch/finally` para garantir `setLoading(false)` mesmo em erros inesperados.
- Mostrar mensagem amigável quando a checagem de role falhar (ex.: erro de rede).

## Implementação (passo a passo)

### 1) Corrigir `src/pages/admin/AdminAuth.tsx`
1.1 Criar helper reutilizável no componente:
- `checkAdminRole(userId: string): Promise<boolean>`
- Internamente chamar:
  - `supabase.rpc('has_role', { _user_id: userId, _role: 'admin' })`
- Tratar erro: se der erro, retornar `false` e setar mensagem amigável.

1.2 Ajustar o `useEffect` para evitar callback async:
- Substituir:
  - `supabase.auth.onAuthStateChange(async (...) => { await checkAdminRole(...) })`
- Por:
  - `supabase.auth.onAuthStateChange((_, session) => {`
    - se `session?.user`, disparar `setTimeout(() => redirectIfAdmin(session.user.id), 0)`
  - `})`
- `redirectIfAdmin` faz `await checkAdminRole()` e navega se for admin.

1.3 Ajustar `handleLogin`:
- `setLoading(true)` no início
- `try`:
  - `signInWithPassword`
  - se ok, chamar `checkAdminRole(userId)` via RPC
  - se admin: toast + navigate
  - se não admin: erro + signOut
- `catch`: setError com texto amigável
- `finally`: `setLoading(false)`

Benefício: remove deadlock e remove dependência de SELECT em `user_roles`.

### 2) Corrigir `src/components/auth/RequireRole.tsx` (prevenir travas ao acessar `/admin`)
Mesmo que o login funcione, ao entrar em `/admin` o guard pode travar por padrão semelhante.

2.1 Remover `onAuthStateChange(checkAuth)` onde `checkAuth` é async.
- Fazer `onAuthStateChange((event, session) => { setUser(session?.user ?? null); setLoading(false); /* nada async aqui */ })`

2.2 Mover a checagem de role para um `useEffect` separado:
- Quando `user` mudar:
  - se role requerido é `admin`, chamar `supabase.rpc('has_role', ...)`
  - setar `hasRole`
- Também remover fallback para `profiles.is_admin` (vocês já migraram para RBAC); manter apenas RBAC para consistência e segurança.

2.3 (Opcional, mas recomendado) Evitar `console.error` com detalhes sensíveis em produção:
- Trocar por mensagens mais neutras ou usar logs apenas em dev.

### 3) Validação rápida pós-correção (checklist)
3.1 Login admin:
- Acessar `/admin/login`, entrar com `contato@mkart.com.br`, deve redirecionar para `/admin` rapidamente.
- Se senha inválida, deve mostrar erro e reabilitar botão (sem travar).

3.2 Acesso direto:
- Se já estiver logado e acessar `/admin/login`, deve redirecionar automaticamente para `/admin`.

3.3 Usuário não-admin:
- Login com usuário comum deve:
  - autenticar,
  - falhar na checagem de role,
  - mostrar “Acesso negado…”,
  - e fazer signOut.

3.4 Guard de rota:
- Acessar `/admin` sem sessão deve redirecionar para `/auth` (ou `/admin/login`, dependendo do fluxo desejado).
- Acessar `/admin` com usuário não-admin deve ir para `/403`.

## Observações técnicas (importante)
- A policy atual em `user_roles` (“Admins can view user_roles”) é compatível com essa abordagem, porque a checagem de admin será via `has_role()` e não precisa SELECT na tabela.
- O principal bug do travamento é o uso de callback async dentro de `onAuthStateChange` somado ao uso de query direta na tabela com RLS restritivo.

## Escopo (o que vou mudar)
- `src/pages/admin/AdminAuth.tsx`: refatorar checagem de admin para RPC + remover callback async + robustez no loading.
- `src/components/auth/RequireRole.tsx`: mesma refatoração para evitar travas ao entrar no painel.
- (Sem mudanças de banco necessárias para destravar o login; aproveitamos a função `has_role` já criada.)

## Critérios de aceite
- Botão “Entrar no Painel Admin” nunca fica preso em “Verificando…”.
- Login admin redireciona para `/admin`.
- Não-admin não consegue entrar no painel e recebe feedback adequado.
- Nenhum fluxo depende de SELECT em `user_roles` para descobrir role do usuário.
