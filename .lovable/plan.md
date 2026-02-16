

## Correcao do erro "Failed to construct URL" na aba Blog

### Problema
Ao adicionar um post com uma URL invalida ou parcial (ex: `meusite.com/post` sem `https://`), o codigo tenta executar `new URL(p.url)` que lanca um `TypeError: Failed to construct 'URL': Invalid URL`, quebrando toda a tabela.

### Solucao
Envolver o `new URL(p.url)` em um bloco try/catch no componente `ConsultingBlogPosts.tsx`. Se a URL for invalida, exibir o texto bruto da URL como fallback em vez de crashar.

### Arquivo alterado
- `src/components/consulting/ConsultingBlogPosts.tsx`

### Detalhe tecnico
Na celula da tabela que renderiza a URL (aproximadamente linha 120), substituir:

```tsx
{new URL(p.url).pathname.slice(0, 40)}
```

Por uma funcao segura que tenta parsear a URL e, caso falhe, retorna o texto original truncado:

```tsx
{(() => {
  try { return new URL(p.url).pathname.slice(0, 40); }
  catch { return (p.url || "").slice(0, 40); }
})()}
```

Nenhuma outra alteracao necessaria.
