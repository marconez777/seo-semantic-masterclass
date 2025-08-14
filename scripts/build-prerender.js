import { build } from 'vite';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function buildWithPrerender() {
  console.log('🚀 Iniciando build com prerendering...\n');
  
  try {
    // 1. Gerar páginas estáticas customizadas
    console.log('📄 Gerando páginas estáticas...');
    execSync('node scripts/prerender.js', { stdio: 'inherit' });
    
    // 2. Build da aplicação
    console.log('⚡ Executando build do Vite...');
    await build();
    
    // 3. Copiar páginas prerendering para dist
    console.log('📋 Copiando páginas prerendering...');
    const pagesDir = path.join(__dirname, '..', 'public', 'pages');
    const distDir = path.join(__dirname, '..', 'dist');
    
    if (fs.existsSync(pagesDir)) {
      const pages = fs.readdirSync(pagesDir);
      for (const page of pages) {
        if (page.endsWith('.html')) {
          const sourcePath = path.join(pagesDir, page);
          const destPath = path.join(distDir, page);
          fs.copyFileSync(sourcePath, destPath);
          console.log(`✅ Copiado: ${page}`);
        }
      }
    }
    
    // 4. Criar configuração de servidor para produção
    const nginxConfig = `
# Configuração Nginx para servir páginas prerendering
location / {
    try_files $uri $uri.html $uri/ /index.html;
}

# Cache para páginas estáticas
location ~* \\.(html)$ {
    expires 1h;
    add_header Cache-Control "public, immutable";
}
`;
    
    fs.writeFileSync(path.join(distDir, 'nginx.conf'), nginxConfig);
    
    // 5. Criar _redirects para Netlify/Vercel
    const redirectsContent = fs.readFileSync(path.join(__dirname, '..', 'public', '_redirects'), 'utf8');
    fs.writeFileSync(path.join(distDir, '_redirects'), redirectsContent);
    
    console.log('\n🎉 Build com prerendering concluído com sucesso!');
    console.log('📁 Arquivos disponíveis em /dist');
    console.log('🌐 Páginas prerendering prontas para SEO');
    
  } catch (error) {
    console.error('❌ Erro durante o build:', error);
    process.exit(1);
  }
}

buildWithPrerender();