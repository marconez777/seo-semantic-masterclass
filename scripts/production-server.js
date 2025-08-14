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

// Carregar configuração dinâmica das rotas
let prerenderRoutes = [
  '/',
  '/comprar-backlinks',
  '/agencia-de-backlinks',
  '/consultoria-seo',
  '/contato',
  '/blog'
];

// Tentar carregar configuração dinâmica
try {
  const configPath = path.join(__dirname, 'server-config.json');
  if (fs.existsSync(configPath)) {
    const serverConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    prerenderRoutes = serverConfig.prerenderRoutes || prerenderRoutes;
    console.log(`📊 Carregadas ${prerenderRoutes.length} rotas prerendering`);
  }
} catch (error) {
  console.log('⚠️ Usando configuração estática de rotas');
}

// Middleware para detectar crawlers e servir páginas prerendering
app.get('*', (req, res) => {
  const userAgent = req.headers['user-agent'] || '';
  const url = req.path;

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