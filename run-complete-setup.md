> [!WARNING]
> **Documento antigo, conferido em 2026-08-28 e parcialmente incorreto.**
> Ele descreve tabelas e colunas que não existem mais no banco.
> A documentação viva do projeto é `CLAUDE.md`, `docs/` e `.claude/rules/`.
> Mantido só como histórico — não use como fonte, e não corrija: leia `docs/`.

# 🚀 EXECUTAR AGORA - Sistema Completo de Prerendering

## Para implementar o prerendering funcionando 100%:

### 1. **Executar configuração completa:**
```bash
node scripts/complete-prerender-setup.js
```

### 2. **Testar o sistema:**
```bash
node scripts/test-prerender.js
```

### 3. **Iniciar servidor de desenvolvimento:**
```bash
node scripts/dev-server.js
```

### 4. **Verificar no navegador:**
1. Acesse: `http://localhost:8080/comprar-backlinks-tecnologia`
2. Pressione `Ctrl+U` (Windows) ou `Cmd+Option+U` (Mac)
3. Verifique se o view-source mostra:
   ```html
   <title>Comprar Backlinks Tecnologia - Sites de Tecnologia DR 50+ | MK Art SEO</title>
   ```

## ✅ Se funcionou corretamente:
- View-source mostra metadados específicos ✅
- Título específico da página ✅  
- Descrição otimizada ✅
- Open Graph tags ✅
- SEO espetacular ✅

## 🎯 Para produção:
```bash
node scripts/prerender.js && vite build && node scripts/build-prerender.js
```

---

**Execute os comandos acima em ordem para ter SEO perfeito!**