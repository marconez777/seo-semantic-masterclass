import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuração do Supabase
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

const supabaseReady = SUPABASE_URL && !SUPABASE_URL.includes('PLACEHOLDER') && SUPABASE_ANON_KEY && !SUPABASE_ANON_KEY.includes('PLACEHOLDER');

let supabase;
if (supabaseReady) {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else {
    console.warn('⚠️  Supabase environment variables not set or are placeholders in your .env file.');
    console.warn('Dynamic category routes will not be included in the redirects.');
}


async function generateRedirectConfigs() {
  console.log('🔧 Gerando configurações de redirecionamento...\n');

  let categories = [];
  if (supabaseReady) {
      // Buscar categorias do Supabase
      const { data, error } = await supabase
        .from('categories')
        .select('slug');

      if (error) {
        console.error('Erro ao buscar categorias:', error);
        // Don't stop the whole script, just proceed without categories
      } else {
        categories = data || [];
      }
  }

  // Páginas estáticas fixas
  const staticPages = [
    '',  // homepage
    'comprar-backlinks',
    'agencia-de-backlinks',
    'consultoria-seo',
    'contato',
    'blog'
  ];

  // Todas as páginas (fixas + categorias)
  const allPages = [
    ...staticPages,
    ...categories.map(cat => `comprar-backlinks-${cat.slug}`)
  ];

  // 1. Gerar _redirects para Netlify
  const netlifyRedirects = [
    '# Redirecionamentos para crawlers (bots)',
    '# Detecta User-Agent com "bot", "crawler", "spider" etc.',
    ''
  ];

  // Adicionar redirect para cada página
  allPages.forEach(page => {
    const path = page === '' ? '/' : `/${page}`;
    const file = page === '' ? 'index.html' : `${page}.html`;
    netlifyRedirects.push(`${path}    /${file}    200    User-Agent:*bot*`);
    netlifyRedirects.push(`${path}    /${file}    200    User-Agent:*crawler*`);
    netlifyRedirects.push(`${path}    /${file}    200    User-Agent:*spider*`);
  });

  netlifyRedirects.push('');
  netlifyRedirects.push('# Fallback para SPA (usuários normais)');
  netlifyRedirects.push('/*    /index.html   200');

  // 2. Gerar vercel.json para Vercel
  const vercelConfig = {
    "rewrites": []
  };

  // Adicionar rewrite para cada página
  allPages.forEach(page => {
    const path = page === '' ? '/' : `/${page}`;
    const file = page === '' ? '/pages/index.html' : `/pages/${page}.html`;
    
    vercelConfig.rewrites.push({
      "source": path,
      "destination": file,
      "has": [
        {
          "type": "header",
          "key": "user-agent",
          "value": "(?i).*(bot|crawler|spider|crawling|googlebot|bingbot|slurp|duckduckbot).*"
        }
      ]
    });
  });

  // Fallback para SPA
  vercelConfig.rewrites.push({
    "source": "/(.*)",
    "destination": "/index.html"
  });

  // 3. Gerar configuração para servidor Node.js
  const serverConfig = {
    prerenderRoutes: allPages.map(page => page === '' ? '/' : `/${page}`),
    categoryRoutes: categories.map(cat => `/comprar-backlinks-${cat.slug}`)
  };

  // 4. Salvar arquivos de configuração
  const distDir = path.join(__dirname, '..', 'dist');
  const publicDir = path.join(__dirname, '..', 'public');

  // Criar diretórios se não existirem
  [distDir, publicDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  // Salvar _redirects
  fs.writeFileSync(path.join(publicDir, '_redirects'), netlifyRedirects.join('\n'));
  fs.writeFileSync(path.join(distDir, '_redirects'), netlifyRedirects.join('\n'));
  console.log('✅ _redirects gerado para Netlify');

  // Salvar vercel.json
  fs.writeFileSync(path.join(publicDir, 'vercel.json'), JSON.stringify(vercelConfig, null, 2));
  fs.writeFileSync(path.join(distDir, 'vercel.json'), JSON.stringify(vercelConfig, null, 2));
  console.log('✅ vercel.json gerado para Vercel');

  // Salvar configuração do servidor
  fs.writeFileSync(
    path.join(__dirname, 'server-config.json'), 
    JSON.stringify(serverConfig, null, 2)
  );
  console.log('✅ Configuração do servidor gerada');

  console.log(`\n🎯 Configurações criadas para ${allPages.length} páginas:`);
  console.log(`   📄 ${staticPages.length} páginas estáticas`);
  console.log(`   📊 ${categories.length} categorias dinâmicas`);
  console.log(`   🤖 Crawlers → HTML estático`);
  console.log(`   👤 Usuários → SPA React`);
}

generateRedirectConfigs().catch(console.error);