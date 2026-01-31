
# Plano: Editor de Texto Rico (WYSIWYG) para SEO e Blog

## Problema Atual
Os editores atuais de conteudo SEO e Blog usam textarea com Markdown puro, exigindo que o usuario escreva sintaxe como `##` para titulos e `**` para negrito. Isso e confuso e nao mostra visualmente o resultado.

## Solucao Proposta
Substituir o editor Markdown por um editor WYSIWYG usando **Tiptap**, a biblioteca mais moderna e flexivel para React. O usuario vera o texto formatado em tempo real e podera selecionar texto e aplicar estilos com botoes ou atalhos de teclado.

## Funcionalidades do Novo Editor

### Barra de Ferramentas Visual
- **Titulos**: Dropdown para H1, H2, H3, H4
- **Formatacao**: Negrito, Italico, Sublinhado, Tachado
- **Listas**: Lista com marcadores, Lista numerada
- **Blocos**: Citacao, Codigo
- **Links**: Inserir/remover links
- **Alinhamento**: Esquerda, Centro, Direita
- **Desfazer/Refazer**: Historico de edicoes

### Experiencia do Usuario
- Ver o texto formatado enquanto digita (WYSIWYG)
- Selecionar texto e clicar em um botao para aplicar estilo
- Atalhos de teclado (Ctrl+B para negrito, etc)
- Placeholder visual quando vazio
- Exporta HTML limpo para armazenamento

## Arquitetura Tecnica

```text
+-------------------+     +------------------+     +----------------+
| RichTextEditor    | --> | Tiptap Core      | --> | HTML Output    |
| (Componente)      |     | + Extensions     |     | (Armazenado)   |
+-------------------+     +------------------+     +----------------+
         |
         v
+-------------------+
| EditorToolbar     |
| (Barra de botoes) |
+-------------------+
```

## Detalhes Tecnicos

### Novas Dependencias
- `@tiptap/react` - Binding React para Tiptap
- `@tiptap/starter-kit` - Extensoes basicas (headings, lists, bold, italic)
- `@tiptap/extension-link` - Suporte a links
- `@tiptap/extension-underline` - Sublinhado
- `@tiptap/extension-placeholder` - Texto placeholder
- `@tiptap/extension-text-align` - Alinhamento de texto

### Novos Componentes

**1. `src/components/ui/rich-text-editor.tsx`**
Componente reutilizavel que encapsula o editor Tiptap com:
- Hook `useEditor` com extensoes configuradas
- Barra de ferramentas responsiva
- Estilos Tailwind para area de edicao
- Props para valor inicial e callback onChange

**2. `src/components/ui/editor-toolbar.tsx`**
Barra de ferramentas com:
- Toggle buttons para formatacao (negrito, italico, etc)
- Dropdown para selecao de titulos
- Botoes para listas e alinhamento
- Modal para inserir links

### Arquivos a Modificar

**1. `src/components/admin/SEOContentEditor.tsx`**
- Remover textarea e toolbar Markdown
- Importar e usar `RichTextEditor`
- Converter conteudo existente (Markdown para HTML na leitura)
- Salvar como HTML

**2. `src/components/admin/AdminBlogPublisher.tsx`**
- Mesma modificacao do SEOContentEditor
- Substituir textarea por `RichTextEditor`

### Conversao de Dados
- **Leitura**: Se existir conteudo Markdown antigo, converter para HTML
- **Escrita**: Sempre salvar como HTML limpo
- **Preview**: Renderizar HTML diretamente (sem ReactMarkdown)

## Beneficios

1. **Experiencia visual**: Usuario ve exatamente como ficara o texto
2. **Facilidade**: Sem necessidade de conhecer Markdown
3. **Produtividade**: Atalhos de teclado e selecao de texto
4. **Consistencia**: Mesmo editor para SEO e Blog
5. **Flexibilidade**: Mais opcoes de formatacao (alinhamento, sublinhado)

## Resumo de Arquivos

| Acao | Arquivo |
|------|---------|
| Criar | `src/components/ui/rich-text-editor.tsx` |
| Criar | `src/components/ui/editor-toolbar.tsx` |
| Editar | `src/components/admin/SEOContentEditor.tsx` |
| Editar | `src/components/admin/AdminBlogPublisher.tsx` |
| Instalar | Dependencias Tiptap via npm |

## Migracao de Conteudo Existente
O conteudo Markdown existente sera convertido automaticamente para HTML na primeira edicao usando uma funcao de parse simples. O Tiptap suporta importacao de conteudo Markdown atraves de extensao opcional.
