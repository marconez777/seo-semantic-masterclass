# Documentação - Importação de Sites no Admin

## Visão Geral

O sistema de importação de sites permite que administradores carreguem dados de backlinks em massa através de arquivos CSV ou XLSX. O componente `AdminBacklinksImport.tsx` é responsável por esta funcionalidade.

## Estrutura do Banco de Dados

### Tabela: `backlinks`
```sql
- id: uuid (PK, auto-gerado)
- site_name: text (obrigatório)
- site_url: text (obrigatório) 
- category: text (obrigatório)
- price_cents: integer (obrigatório)
- da: integer (opcional)
- dr: integer (opcional)
- traffic: integer (opcional)
- link_type: text (opcional)
- requirements: text[] (opcional)
- is_active: boolean (padrão: true)
- created_at: timestamp (auto)
- updated_at: timestamp (auto)
```

## Funcionalidades

### 1. Parsing de Arquivos
- **Formatos suportados**: .xlsx, .xls, .csv
- **Biblioteca**: xlsx para processamento
- **Normalização**: Headers são normalizados removendo acentos e espaços

### 2. Mapeamento de Colunas
O sistema reconhece automaticamente várias variações de nomes de colunas:

| Campo | Possíveis Headers |
|-------|-------------------|
| URL | "site url", "url", "site", "dominio", "dominio/host", "domain" |
| Nome | "site name", "nome", "nome do site", "site" |
| Categoria | "categoria", "category" |
| DA | "da", "domain authority" |
| DR | "dr", "domain rating" |
| Tráfego | "trafego", "trafego mensal", "tráfego", "tráfego mensal", "traffic" |
| Preço | "valor", "preco", "preço", "price", "value" |

### 3. Validação de Categorias
Apenas categorias pré-definidas são aceitas:

```typescript
const ALLOWED_CATEGORIES = [
  "Notícias", "Negócios", "Saúde", "Educação", "Tecnologia", 
  "Finanças", "Casa", "Moda", "Turismo", "Alimentação", 
  "Pets", "Automotivo", "Esportes", "Entretenimento", 
  "Marketing", "Direito"
];
```

### 4. Processamento de Valores Monetários
- Reconhece formatos: 1.234,56 ou 1,234.56 ou 1234.56
- Converte automaticamente para centavos
- Remove caracteres não numéricos

### 5. Extração de Domínio
- Se nome do site não fornecido, extrai automaticamente da URL
- Remove prefixo "www." automaticamente
- Adiciona protocolo https:// se necessário

## Interface de Usuário

### Componentes Visuais
1. **Upload de arquivo**: Input para seleção de arquivos
2. **Preview**: Tabela mostrando primeiras 5 linhas
3. **Validação visual**: Linhas com categoria inválida destacadas em vermelho
4. **Progresso**: Contador de linhas importadas/ignoradas
5. **Relatório de erros**: Lista de linhas com categoria inválida

### Estados da Interface
- **Parsing**: Durante leitura do arquivo
- **Importing**: Durante inserção no banco
- **Preview**: Mostra dados carregados
- **Error reporting**: Lista problemas encontrados

## Fluxo de Importação

### 1. Seleção do Arquivo
```typescript
handleFile(e: React.ChangeEvent<HTMLInputElement>)
```
- Lê arquivo usando XLSX.read()
- Converte primeira planilha para JSON
- Mapeia headers para campos conhecidos
- Normaliza e valida dados

### 2. Validação Prévia
- Verifica se URL ou nome estão presentes
- Valida categoria contra lista permitida
- Mostra preview com indicadores visuais

### 3. Inserção em Lotes
```typescript
startImport()
```
- Processa em chunks de 100 linhas
- Ignora linhas com categoria inválida
- Filtra linhas sem URL/nome
- Insere usando `supabase.from("backlinks").insert()`

### 4. Relatório Final
- Conta inseridos vs ignorados
- Lista linhas com problemas
- Exibe toast com resultado

## Possíveis Erros e Soluções

### 1. Erro de Leitura de Arquivo
**Problema**: Arquivo corrompido ou formato inválido
**Solução**: Verificar se arquivo é CSV/XLSX válido

### 2. Categoria Inválida
**Problema**: Categoria não está na lista permitida
**Solução**: Ajustar categoria ou adicionar à lista `ALLOWED_CATEGORIES`

### 3. Dados Obrigatórios Ausentes
**Problema**: site_name, site_url ou category vazios
**Solução**: Preencher campos obrigatórios na planilha

### 4. Erro de Inserção no Banco
**Problema**: Violação de constraint ou erro de RLS
**Solução**: Verificar permissões admin e estrutura da tabela

### 5. Formato de Preço Inválido
**Problema**: Valor monetário não reconhecido
**Solução**: Usar formatos: 100.50, 1.234,56 ou 1234.56

## Melhorias Sugeridas

### 1. Validação Avançada
```typescript
// Adicionar validação de URL
function isValidUrl(url: string): boolean {
  try {
    new URL(url.startsWith('http') ? url : `https://${url}`);
    return true;
  } catch {
    return false;
  }
}
```

### 2. Preview Expandido
- Mostrar mais de 5 linhas no preview
- Filtro para ver apenas linhas com erro
- Edição inline de categorias inválidas

### 3. Backup e Rollback
```typescript
// Backup antes da importação
const backup = await supabase
  .from('backlinks')
  .select('*')
  .order('created_at', { ascending: false })
  .limit(1000);
```

### 4. Validação de Duplicatas
```typescript
// Verificar URLs existentes
const existing = await supabase
  .from('backlinks')
  .select('site_url')
  .in('site_url', urls);
```

### 5. Log de Auditoria
```typescript
// Registrar importações
await supabase
  .from('import_logs')
  .insert({
    user_id: auth.uid(),
    filename: fileName,
    imported_count: ok,
    skipped_count: skip,
    errors: invalidCategoryRows
  });
```

### 6. Exportação de Template
- Gerar arquivo CSV modelo
- Incluir headers corretos
- Adicionar exemplos de dados

## Segurança

### RLS (Row Level Security)
- Apenas admins podem importar: `has_role(auth.uid(), 'admin'::app_role)`
- Dados inseridos com `is_active: true` por padrão
- Backup automático recomendado antes de importações grandes

### Validação de Entrada
- Sanitização de URLs
- Limite de tamanho de arquivo
- Validação de tipos de dados
- Prevenção de SQL injection (através do Supabase)

## Conclusão

O sistema de importação funciona corretamente para o caso de uso atual, mas pode ser melhorado com as sugestões acima. A validação de categorias é rigorosa e pode causar muitas linhas ignoradas se os dados não estiverem padronizados.

**Status**: ✅ Funcionando corretamente
**Principais limitações**: Validação rígida de categorias, sem edição inline
**Recomendação**: Implementar melhorias graduais conforme necessidade