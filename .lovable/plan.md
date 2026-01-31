

# Sistema de Gestao de Conteudo SEO para Paginas de Categoria

## Objetivo

Criar um modulo administrativo para gerenciar textos SEO dinamicos para a pagina principal `/comprar-backlinks` e para as 17 paginas de categoria. Os textos serao armazenados no banco de dados e carregados dinamicamente, permitindo edicao sem alterar codigo.

---

## Dados Existentes a Preservar

Ao criar o sistema, inserir automaticamente os metadados e textos que ja existem nas paginas:

### Pagina Principal: comprar-backlinks

| Campo | Valor |
|-------|-------|
| Meta Title | Comprar Backlinks de em Grandes Portais - MK |
| Meta Description | Comprar Backlinks de qualidade no Nicho que voce escolher. Apareca no Topo do Google e nas Respostas das IAs. |
| H1 | Comprar Backlinks em Grandes Portais |
| SEO Content | Por que comprar backlinks de qualidade? Os backlinks sao um dos principais fatores de ranqueamento do Google... |
| FAQs | 5 perguntas sobre backlinks, DA/DR, processo de compra, prazo e permanencia |

### Categorias (17 paginas)

Cada categoria tem seus metadados preservados:

- **Noticias**: Meta title, description, H1, H2, seoContent
- **Negocios**: Meta title, description, H1, H2, seoContent  
- **Saude**: Meta title, description, H1, H2, seoContent (YMYL)
- **Educacao**: Meta title, description, H1, H2, seoContent
- **Tecnologia**: Meta title, description, H1, H2, seoContent
- **Financas**: Meta title, description, H1, H2, seoContent
- **Imoveis**: Meta title, description, H1, H2, seoContent (texto extenso)
- **Moda**: Meta title, description, H1, H2, seoContent
- **Turismo**: Meta title, description, H1, H2, seoContent
- **Alimentacao**: Meta title, description, H1, H2, seoContent
- **Pets**: Meta title, description, H1, H2, seoContent
- **Automoveis**: Meta title, description, H1, H2, seoContent
- **Esportes**: Meta title, description, H1, H2, seoContent
- **Entretenimento**: Meta title, description, H1, H2, seoContent
- **Marketing**: Meta title, description, H1, H2, seoContent
- **Direito**: Meta title, description, H1, H2, seoContent
- **Maternidade**: Meta title, description, H1, H2, seoContent

---

## Arquitetura

```text
+------------------+       +-------------------+       +----------------------+
|  Painel Admin    |  -->  |  Tabela           |  <--  |  Paginas Publicas    |
|  AdminConteudoSEO|       |  page_seo_content |       |  ComprarBacklinks*   |
+------------------+       +-------------------+       +----------------------+
```

---

## Banco de Dados

### Nova tabela: page_seo_content

```sql
CREATE TABLE public.page_seo_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_slug text UNIQUE NOT NULL,
  meta_title text,
  meta_description text,
  meta_keywords text,
  h1_title text,
  h2_subtitle text,
  intro_text text,
  main_content text,
  faqs jsonb DEFAULT '[]'::jsonb,
  canonical_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Trigger para updated_at
CREATE TRIGGER update_page_seo_content_updated_at
  BEFORE UPDATE ON public.page_seo_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE public.page_seo_content ENABLE ROW LEVEL SECURITY;

-- Qualquer um pode ler (para SEO)
CREATE POLICY "Public can view page_seo_content"
  ON public.page_seo_content FOR SELECT USING (true);

-- Apenas admins podem gerenciar
CREATE POLICY "Admins can manage page_seo_content"
  ON public.page_seo_content FOR ALL
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));
```

---

## Novos Arquivos

### 1. src/pages/admin/AdminConteudoSEO.tsx

Pagina principal do modulo com:
- Lista de todas as paginas com conteudo SEO
- Status: configurado / nao configurado
- Acoes: editar, duplicar
- Botao para adicionar novo conteudo

### 2. src/components/admin/SEOContentEditor.tsx

Editor completo baseado no AdminBlogPublisher com:

**Campos de Metadados:**
- Select de pagina (dropdown com 18 slugs pre-definidos)
- Meta Title (input, max 60 chars)
- Meta Description (textarea, max 160 chars)
- Meta Keywords (input)
- URL Canonica (input)

**Campos de Conteudo:**
- H1 Title (input)
- H2 Subtitle (input)
- Intro Text (textarea curto)
- Main Content (textarea com toolbar Markdown)

**Editor de FAQs:**
- Lista de perguntas/respostas
- Botao adicionar FAQ
- Botao remover FAQ
- Drag and drop para reordenar

**Toolbar Markdown:**
- H2, H3 (headings)
- Lista com marcadores
- Lista numerada
- Negrito, italico
- Link

**Preview:**
- Visualizacao em tempo real do conteudo renderizado

### 3. src/hooks/usePageSEOContent.ts

Hook React Query para buscar conteudo SEO:

```typescript
export function usePageSEOContent(pageSlug: string) {
  return useQuery({
    queryKey: ['page-seo-content', pageSlug],
    queryFn: async () => {
      const { data } = await supabase
        .from('page_seo_content')
        .select('*')
        .eq('page_slug', pageSlug)
        .maybeSingle();
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutos cache
  });
}
```

---

## Arquivos a Modificar

### 1. src/layouts/AdminLayout.tsx

Adicionar item no menu de navegacao:

```typescript
{ title: "Conteudo SEO", url: "/admin/conteudo-seo", icon: FileText }
```

### 2. src/App.tsx

Adicionar rota no bloco admin:

```typescript
<Route path="conteudo-seo" element={<AdminConteudoSEO />} />
```

### 3. Paginas de Categoria (18 arquivos)

Modificar cada pagina para:
1. Importar usePageSEOContent
2. Buscar dados do banco pelo slug
3. Usar dados dinamicos com fallback para estatico

Exemplo de integracao:

```typescript
const { data: seoData } = usePageSEOContent('comprar-backlinks-tecnologia');

// SEOHead usa dados dinamicos ou fallback
<SEOHead
  title={seoData?.meta_title || "Titulo estatico"}
  description={seoData?.meta_description || "Descricao estatica"}
/>

// Conteudo usa dados dinamicos ou fallback
<h1>{seoData?.h1_title || "Titulo H1 estatico"}</h1>
```

---

## Lista de Slugs Suportados

| Slug | Pagina |
|------|--------|
| comprar-backlinks | Listagem principal |
| comprar-backlinks-noticias | Categoria Noticias |
| comprar-backlinks-negocios | Categoria Negocios |
| comprar-backlinks-saude | Categoria Saude |
| comprar-backlinks-educacao | Categoria Educacao |
| comprar-backlinks-tecnologia | Categoria Tecnologia |
| comprar-backlinks-financas | Categoria Financas |
| comprar-backlinks-imoveis | Categoria Imoveis |
| comprar-backlinks-moda | Categoria Moda |
| comprar-backlinks-turismo | Categoria Turismo |
| comprar-backlinks-alimentacao | Categoria Alimentacao |
| comprar-backlinks-pets | Categoria Pets |
| comprar-backlinks-automoveis | Categoria Automoveis |
| comprar-backlinks-esportes | Categoria Esportes |
| comprar-backlinks-entretenimento | Categoria Entretenimento |
| comprar-backlinks-marketing | Categoria Marketing |
| comprar-backlinks-direito | Categoria Direito |
| comprar-backlinks-maternidade | Categoria Maternidade |

---

## Seed de Dados Existentes

Ao criar a tabela, inserir os 18 registros com os metadados e textos que ja existem nas paginas atuais:

```sql
INSERT INTO page_seo_content (page_slug, meta_title, meta_description, meta_keywords, h1_title, h2_subtitle, intro_text, main_content, faqs, canonical_url)
VALUES 
  ('comprar-backlinks', 'Comprar Backlinks de em Grandes Portais | MK', 'Comprar Backlinks de qualidade...', 'comprar backlinks, link building...', 'Comprar Backlinks em Grandes Portais', NULL, NULL, '## Por que comprar backlinks de qualidade?\n\nOs backlinks sao um dos principais...', '[{"question":"O que sao backlinks...","answer":"Backlinks sao links..."}]', 'https://mkart.com.br/comprar-backlinks'),
  -- ... 17 categorias
;
```

---

## Resumo de Entregaveis

| Tipo | Item |
|------|------|
| SQL | Criar tabela page_seo_content com RLS |
| SQL | Seed com 18 registros (dados existentes) |
| Criar | src/pages/admin/AdminConteudoSEO.tsx |
| Criar | src/components/admin/SEOContentEditor.tsx |
| Criar | src/hooks/usePageSEOContent.ts |
| Editar | src/layouts/AdminLayout.tsx - menu |
| Editar | src/App.tsx - rota |
| Editar | 18 paginas de categoria - integracao |

---

## Beneficios

- Textos SEO editaveis sem deploy de codigo
- Metadados completos gerenciaveis (title, description, keywords, canonical)
- FAQs estruturados para Schema.org
- Interface consistente com blog publisher
- Dados existentes preservados como fallback e seed inicial
- Cache de 5 minutos para performance

