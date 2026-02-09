

# Reestruturação do Design - Painel do Usuário e Admin

## Visão Geral

Redesign completo dos painéis (usuário e admin) inspirado no layout de referência NexLink, com sidebar escura, header fixo com perfil do usuário, e area de conteudo limpa e moderna.

## Mudanças Principais

### 1. Sidebar Escura com Ícones

Ambos os painéis terão uma sidebar com fundo escuro (usando as variáveis CSS `--sidebar-*` já definidas no design system), logo no topo, navegação com ícones e labels, e visual mais moderno.

### 2. Header Superior Fixo

Substituir o header atual de cada painel por um header fixo no topo (dentro do layout do painel, nao o Header global do site) contendo:
- Botão de toggle da sidebar (esquerda)
- Breadcrumb ou titulo da seção atual
- Perfil do usuário com dropdown (direita) usando o componente `UserProfileDropdown` já existente
- Botão de sair integrado no dropdown

### 3. Área de Conteúdo Limpa

- Remover headers duplicados dentro das páginas
- Fundo levemente diferenciado (`bg-muted/30`) para a area de conteudo
- Cards com sombras suaves e bordas arredondadas

---

## Detalhes Técnicos

### Arquivos a Modificar

**`src/layouts/AdminLayout.tsx`** - Reestruturação completa:
- Sidebar escura com logo MK Art no topo, itens de menu com ícones coloridos
- Separador visual entre grupos de menu
- Header fixo no topo com `SidebarTrigger`, titulo "Admin", e `UserProfileDropdown`
- Remover o header interno atual (logo + h1 + botão Sair)
- Usar `SidebarInset` com header embutido

**`src/pages/Dashboard.tsx`** - Reestruturação completa do painel do usuário:
- Mesma abordagem da sidebar escura com logo, itens (Pedidos, Favoritos, Perfil, Admin)
- Header fixo no topo com nome do usuário, avatar e dropdown
- Remover Tabs duplicadas (a navegação será feita pela sidebar)
- Manter o conteúdo das seções (OrdersList, FavoritesTable, ProfileSection) renderizados condicionalmente pelo estado `tab`

**`src/components/ui/user-profile-dropdown.tsx`** - Pequeno ajuste:
- Adicionar link "Ir para o site" no dropdown
- Garantir que o `onSignOut` funciona corretamente em ambos os painéis

### Estilo Visual (baseado na referência)

- Sidebar: fundo `hsl(var(--sidebar-background))` (preto/escuro), texto claro
- Item ativo: destaque com fundo `hsl(var(--sidebar-accent))` e texto `hsl(var(--sidebar-primary))`  
- Header: fundo `bg-card/95` com `backdrop-blur`, borda inferior sutil
- Conteúdo: fundo `bg-muted/20` para contraste com os cards brancos
- Cards de stats (admin): manter o design atual com leve refinamento nas sombras

### Estrutura do Layout (Admin)

```text
+------------------+-------------------------------------------+
|                  |  [=] Admin           [Avatar] Nome  v      |
|   [Logo]         |--------------------------------------------|
|   MK Art         |                                            |
|                  |   Conteudo da pagina (Outlet)               |
|   MENU           |                                            |
|   > Pedidos      |                                            |
|   > Clientes     |                                            |
|   > Sites        |                                            |
|   > Publicações  |                                            |
|   > Blog         |                                            |
|   > SEO          |                                            |
|   > Contatos     |                                            |
|   > Leads        |                                            |
|                  |                                            |
+------------------+-------------------------------------------+
```

### Estrutura do Layout (Usuário)

```text
+------------------+-------------------------------------------+
|                  |  [=] Meu Painel      [Avatar] Nome  v      |
|   [Logo]         |--------------------------------------------|
|   MK Art         |                                            |
|                  |   Conteudo (Pedidos/Favoritos/Perfil)       |
|   MINHA CONTA    |                                            |
|   > Pedidos      |                                            |
|   > Favoritos    |                                            |
|   > Perfil       |                                            |
|                  |                                            |
|   -----------    |                                            |
|   > Admin (*)    |                                            |
|   > Loja         |                                            |
|                  |                                            |
+------------------+-------------------------------------------+
```

### Responsividade

- Em mobile, a sidebar continuará colapsando como `offcanvas` (Sheet)
- O header ficará fixo no topo com o trigger da sidebar visível
- O conteúdo ocupará toda a largura

### O que NÃO muda

- Rotas do `App.tsx` permanecem iguais
- Componentes de conteúdo (OrdersList, ProfileSection, FavoritesTable, AdminPedidos, etc.) permanecem iguais
- Header global do site (Header.tsx) não é afetado
- Lógica de autenticação e RBAC permanecem iguais

