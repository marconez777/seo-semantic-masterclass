// scripts/dev-server.js
import { createServer, loadConfigFromFile, mergeConfig } from 'vite';
import path from 'node:path';
import process from 'node:process';
import fs from 'fs';
import { shouldServeStatic } from './crawler-detector.js';

async function main() {
  const mode = process.env.NODE_ENV || 'development';

  // 1) Carrega seu vite.config.ts
  const configFile = await loadConfigFromFile(
    { command: 'serve', mode },
    path.resolve(process.cwd(), 'vite.config.ts')
  );

  const baseCfg = configFile?.config || {};

  // 2) Normaliza host/port (com IPv4 por padrão)
  const envHost =
    process.env.HOST ||
    process.env.VITE_HOST ||
    baseCfg?.server?.host ||
    '0.0.0.0';

  const host =
    envHost === true || envHost === 'true'
      ? '0.0.0.0'
      : envHost === '::'    // evita IPv6 em ambientes que não suportam
      ? '0.0.0.0'
      : envHost;

  const port =
    Number(process.env.PORT) ||
    Number(process.env.VITE_PORT) ||
    Number(baseCfg?.server?.port) ||
    8080; // Changed to 8080 to match previous config

  const hmrHost =
    process.env.HMR_HOST ||
    (baseCfg?.server?.hmr && baseCfg.server.hmr.host) ||
    undefined;

  const hmrPort =
    process.env.HMR_PORT
      ? Number(process.env.HMR_PORT)
      : (baseCfg?.server?.hmr && baseCfg.server.hmr.port) || undefined;

  // 3) Faz merge garantindo que nada "pise" no host/port desejados
  const finalCfg = mergeConfig(baseCfg, {
    server: {
      host,
      port,
      strictPort: true,
      hmr: {
        host: hmrHost,
        port: hmrPort,
        protocol: (baseCfg?.server?.hmr && baseCfg.server.hmr.protocol) || 'ws',
      },
    },
    // evita pegar IPv6 em algumas instalações
    optimizeDeps: {
      force: true,
    },
  });

  // 4) Log de diagnóstico
  console.log('[dev-server] Resolved server config:', {
    host: finalCfg.server.host,
    port: finalCfg.server.port,
    hmr: finalCfg.server.hmr,
  });

  // 5) Cria e inicia
  const server = await createServer(finalCfg);

  // Middleware inteligente para servir páginas prerendering baseado no User-Agent
  server.middlewares.use((req, res, next) => {
    const url = req.url?.split('?')[0] || '';
    const userAgent = req.headers['user-agent'] || '';
    
    const fileName = (url === '/' ? 'index' : url.substring(1).replace(/\//g, '-')) + '.html';
    const prerenderedHtmlPath = path.join(process.cwd(), 'public', 'pages', fileName);

    // Verificar se deve servir versão estática
    if (fs.existsSync(prerenderedHtmlPath) && shouldServeStatic(userAgent)) {
        console.log(`🤖 Crawler detectado! Servindo página estática: ${prerenderedHtmlPath}`);
        const content = fs.readFileSync(prerenderedHtmlPath, 'utf8');
        res.setHeader('Content-Type', 'text/html');
        res.setHeader('Cache-Control', 'public, max-age=3600');
        res.end(content);
        return;
    }
    
    // Para usuários normais, continuar com SPA
    console.log(`👤 Usuário normal: ${url} - Servindo SPA`);

    next();
  });


  await server.listen(); // NÃO passe host/port aqui — use só o config

  server.printUrls();
}

main().catch((err) => {
  console.error('[dev-server] Failed to start:', err);
  process.exit(1);
});