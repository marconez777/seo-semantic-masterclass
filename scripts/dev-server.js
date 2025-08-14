import { createServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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

  // Middleware para servir páginas prerendering em desenvolvimento
  server.middlewares.use((req, res, next) => {
    const url = req.url?.split('?')[0] || '';
    
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

    // Verificar se a rota tem versão prerendering
    if (prerenderRoutes.includes(url)) {
      const fileName = url === '/' ? 'index.html' : `${url.slice(1)}.html`;
      const prerenderPath = path.join(__dirname, '..', 'public', 'pages', fileName);
      
      if (fs.existsSync(prerenderPath)) {
        console.log(`🎯 Servindo página prerendering: ${fileName}`);
        const content = fs.readFileSync(prerenderPath, 'utf8');
        res.setHeader('Content-Type', 'text/html');
        res.end(content);
        return;
      }
    }

    next();
  });

  await server.listen();
  console.log('🚀 Servidor de desenvolvimento iniciado com prerendering');
  console.log('📄 Páginas prerendering serão servidas quando disponíveis');
  console.log('🔗 http://localhost:8080');
}

createDevServer().catch(console.error);