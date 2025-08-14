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
  
  // Lista de rotas prerendering
  const prerenderRoutes = [
    '/',
    '/comprar-backlinks',
    '/comprar-backlinks-tecnologia',
    '/comprar-backlinks-noticias',
    '/comprar-backlinks-financas',
    '/comprar-backlinks-negocios',
    '/comprar-backlinks-moda',
    '/comprar-backlinks-educacao',
    '/comprar-backlinks-turismo',
    '/comprar-backlinks-automoveis',
    '/comprar-backlinks-saude',
    '/comprar-backlinks-direito',
    '/comprar-backlinks-alimentacao',
    '/comprar-backlinks-pets',
    '/comprar-backlinks-esportes',
    '/comprar-backlinks-entretenimento',
    '/comprar-backlinks-marketing',
    '/comprar-backlinks-imoveis',
    '/comprar-backlinks-maternidade',
    '/agencia-de-backlinks',
    '/consultoria-seo',
    '/contato',
    '/blog'
  ];

  // Se é um crawler e temos uma página prerendering, servir estática
  if (prerenderRoutes.includes(url) && shouldServeStatic(userAgent)) {
    const fileName = url === '/' ? 'index.html' : `${url.slice(1)}.html`;
    const prerenderPath = path.join(__dirname, '..', 'dist', fileName);
    
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