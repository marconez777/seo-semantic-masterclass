

## Separar o Dashboard em 2 Paineis: Loja vs Consultoria

### Resumo
Atualmente o dashboard mostra todas as abas para todos os usuarios, com a consultoria aparecendo como secao extra. A mudanca vai criar dois modos completamente separados:

- **Painel Loja**: Meus Pedidos, Favoritos, Rastreio de Palavras, Perfil
- **Painel Consultoria**: Palavras, Paginas, Backlinks, Blog, Tarefas, Perfil

O tipo de painel e determinado automaticamente: se o usuario tem registro ativo em `consulting_clients`, ve o painel de consultoria. Caso contrario, ve o painel da loja.

### O que muda para o usuario

- **Clientes da loja** continuam vendo exatamente o que veem hoje (pedidos, favoritos, etc.)
- **Clientes de consultoria** (como marco_next7) veem apenas as abas de consultoria + perfil, sem pedidos/favoritos/keywords
- A sidebar muda completamente conforme o tipo de usuario

### Detalhes Tecnicos

**Arquivo alterado:** `src/pages/Dashboard.tsx`

1. **Logica de deteccao**: Ja existe a query em `consulting_clients`. Adicionar um estado `isConsultingClient` (boolean) e um `loading` para evitar flash de conteudo errado.

2. **Sidebar condicional**:
   - Se `isConsultingClient === true`: mostrar sidebar com abas Palavras, Paginas, Backlinks, Blog, Tarefas, Perfil
   - Se `isConsultingClient === false`: mostrar sidebar atual (Pedidos, Favoritos, Rastreio, Perfil)
   - A secao "Links" (Admin, Loja, Site) permanece para ambos

3. **Tab default**: 
   - Consultoria: `tab` inicia como `"palavras"`
   - Loja: `tab` inicia como `"pedidos"` (como ja esta)

4. **Conteudo principal**: renderizar os componentes de consultoria diretamente (sem sub-Tabs), cada aba do sidebar mapeia para um componente

5. **Label do header**: atualizar o mapeamento `tabLabel` para incluir as novas abas de consultoria

Nenhuma alteracao no banco de dados e necessaria - a deteccao ja funciona pela tabela `consulting_clients`.
