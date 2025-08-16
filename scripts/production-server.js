import express from 'express';
import { shouldServeStatic } from './crawler-detector.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, '..', 'dist')));

// Middleware para detectar crawlers e servir páginas prerendering
app.get('*', (req, res) => {
  const userAgent = req.headers['user-agent'] || '';
  const url = req.path;

  // Se é um crawler, tentar servir a página estática correspondente
  if (shouldServeStatic(userAgent)) {
    const fileName = (url === '/' ? 'index' : url.substring(1).replace(/\//g, '-')) + '.html';
    const prerenderPath = path.join(__dirname, '..', 'dist', 'pages', fileName);
    
    if (fs.existsSync(prerenderPath)) {
      console.log(`🤖 Servindo página estática para crawler: ${fileName}`);
      res.setHeader('Cache-Control', 'public, max-age=3600');
      return res.sendFile(prerenderPath);
    }
  }

  // Para usuários normais ou rotas sem prerendering, servir SPA
  console.log(`👤 Servindo SPA para: ${url}`);
  res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`🤖 Crawlers verão páginas estáticas com SEO perfeito`);
  console.log(`👤 Usuários verão SPA com experiência rápida`);
});