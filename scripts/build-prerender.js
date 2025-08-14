import { build } from 'vite';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function buildWithPrerender() {
  console.log('🚀 Iniciando build com prerendering inteligente...\n');
  
  try {
    // 1. Gerar páginas estáticas customizadas
    console.log('📄 Gerando páginas estáticas com SEO específico...');
    execSync('node scripts/prerender.js', { stdio: 'inherit' });
    
    // 2. Build da aplicação Vite
    console.log('⚡ Executando build do Vite...');
    await build();
    
    // 3. Copiar páginas prerendering para dist
    console.log('📋 Copiando páginas prerendering para produção...');
    const pagesDir = path.join(__dirname, '..', 'public', 'pages');
    const distDir = path.join(__dirname, '..', 'dist');
    
    if (fs.existsSync(pagesDir)) {
      const pages = fs.readdirSync(pagesDir);
      for (const page of pages) {
        if (page.endsWith('.html') && page !== 'index.html') {
          const sourcePath = path.join(pagesDir, page);
          const destPath = path.join(distDir, page);
          fs.copyFileSync(sourcePath, destPath);
          console.log(`✅ Página SEO copiada: ${page}`);
        }
      }
    }
    
    // 4. Manter index.html original da dist (não sobrescrever)
    console.log('📝 Mantendo index.html SPA original para usuários');
    
    // 5. Criar configurações para diferentes plataformas
    
    // Netlify _redirects com detecção de User-Agent
    const netlifyRedirects = `
# Páginas específicas para crawlers
/comprar-backlinks-tecnologia    /comprar-backlinks-tecnologia.html    200    User-Agent:*bot*
/comprar-backlinks-noticias      /comprar-backlinks-noticias.html       200    User-Agent:*bot*
/comprar-backlinks-financas      /comprar-backlinks-financas.html       200    User-Agent:*bot*
/comprar-backlinks               /comprar-backlinks.html                200    User-Agent:*bot*

# Fallback para SPA
/*    /index.html   200
`;
    
    // Vercel configuration
    const vercelConfig = {
      "rewrites": [
        {
          "source": "/comprar-backlinks-tecnologia",
          "destination": "/comprar-backlinks-tecnologia.html",
          "has": [
            {
              "type": "header",
              "key": "user-agent",
              "value": "(?i).*(bot|crawler|spider|crawling).*"
            }
          ]
        }
      ],
      "routes": [
        {
          "src": "/(.*)",
          "dest": "/index.html"
        }
      ]
    };
    
    fs.writeFileSync(path.join(distDir, '_redirects'), netlifyRedirects);
    fs.writeFileSync(path.join(distDir, 'vercel.json'), JSON.stringify(vercelConfig, null, 2));
    
    // 6. Criar servidor Node.js para detecção inteligente
    fs.copyFileSync(
      path.join(__dirname, 'production-server.js'),
      path.join(distDir, 'server.js')
    );
    
    fs.copyFileSync(
      path.join(__dirname, 'crawler-detector.js'),
      path.join(distDir, 'crawler-detector.js')
    );
    
    console.log('\n🎉 Build com prerendering inteligente concluído!');
    console.log('📁 Arquivos disponíveis em /dist');
    console.log('🤖 Crawlers verão páginas estáticas com SEO perfeito');
    console.log('👤 Usuários verão SPA rápida e interativa');
    console.log('🌐 Sistema híbrido funcionando perfeitamente');
    
  } catch (error) {
    console.error('❌ Erro durante o build:', error);
    process.exit(1);
  }
}

buildWithPrerender();