import { createServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { shouldServeStatic } from './crawler-detector.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createDevServer() {
  const server = await createServer({
    server: {
      host: "::",
      port: 8080,
    },
    configFile: path.resolve(__dirname, '..', 'vite.config.ts')
  });

  // Middleware inteligente para servir páginas prerendering baseado no User-Agent
  server.middlewares.use((req, res, next) => {
    const url = req.url?.split('?')[0] || '';
    const userAgent = req.headers['user-agent'] || '';
    
    // Lista de rotas que têm páginas prerendering
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

    // Verificar se deve servir versão estática
    if (prerenderRoutes.includes(url) && shouldServeStatic(userAgent)) {
      const fileName = url === '/' ? 'index.html' : `${url.slice(1)}.html`;
      const prerenderPath = path.join(__dirname, '..', 'public', 'pages', fileName);
      
      if (fs.existsSync(prerenderPath)) {
        console.log(`🤖 Crawler detectado! Servindo página estática: ${fileName}`);
        const content = fs.readFileSync(prerenderPath, 'utf8');
        res.setHeader('Content-Type', 'text/html');
        res.setHeader('Cache-Control', 'public, max-age=3600');
        res.end(content);
        return;
      }
    }
    
    // Para usuários normais, continuar com SPA
    if (prerenderRoutes.includes(url)) {
      console.log(`👤 Usuário normal: ${url} - Servindo SPA`);
    }

    next();
  });

  await server.listen();
  console.log('🚀 Servidor de desenvolvimento iniciado com prerendering');
  console.log('📄 Páginas prerendering serão servidas quando disponíveis');
  console.log('🔗 http://localhost:8080');
}

createDevServer().catch(console.error);