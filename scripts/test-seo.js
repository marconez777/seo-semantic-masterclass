import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Testando páginas SEO geradas...\n');

const pagesDir = path.join(__dirname, '..', 'public', 'pages');

// Função para extrair meta tags de um arquivo HTML
function extractMetaTags(filePath) {
  if (!fs.existsSync(filePath)) {
    return { error: 'Arquivo não encontrado' };
  }

  const content = fs.readFileSync(filePath, 'utf8');
  
  const title = content.match(/<title>(.*?)<\/title>/)?.[1] || 'Sem título';
  const description = content.match(/<meta name="description" content="(.*?)"/)?.[1] || 'Sem descrição';
  const canonical = content.match(/<link rel="canonical" href="(.*?)"/)?.[1] || 'Sem canonical';
  const ogTitle = content.match(/<meta property="og:title" content="(.*?)"/)?.[1] || 'Sem OG title';
  const ogDescription = content.match(/<meta property="og:description" content="(.*?)"/)?.[1] || 'Sem OG description';
  const ogImage = content.match(/<meta property="og:image" content="(.*?)"/)?.[1] || 'Sem OG image';
  
  // Verificar structured data
  const structuredDataMatches = content.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g) || [];
  const hasOrganization = content.includes('"@type": "Organization"');
  const hasWebsite = content.includes('"@type": "WebSite"');
  const hasCollectionPage = content.includes('"@type": "CollectionPage"');
  
  return {
    title,
    description,
    canonical,
    ogTitle,
    ogDescription,
    ogImage,
    structuredDataCount: structuredDataMatches.length,
    hasOrganization,
    hasWebsite,
    hasCollectionPage,
    titleLength: title.length,
    descriptionLength: description.length
  };
}

// Páginas para testar
const testPages = [
  'index.html',
  'comprar-backlinks.html',
  'comprar-backlinks-tecnologia.html',
  'comprar-backlinks-financas.html',
  'comprar-backlinks-automoveis.html',
  'agencia-de-backlinks.html',
  'consultoria-seo.html',
  'contato.html',
  'blog.html'
];

console.log('📊 Resultados da análise SEO:\n');

testPages.forEach(page => {
  const filePath = path.join(pagesDir, page);
  const meta = extractMetaTags(filePath);
  
  if (meta.error) {
    console.log(`❌ ${page} - ${meta.error}`);
    return;
  }
  
  console.log(`✅ ${page}`);
  console.log(`   📝 Título: ${meta.title.substring(0, 80)}${meta.title.length > 80 ? '...' : ''} (${meta.titleLength} chars)`);
  console.log(`   📄 Descrição: ${meta.description.substring(0, 80)}${meta.description.length > 80 ? '...' : ''} (${meta.descriptionLength} chars)`);
  console.log(`   🔗 Canonical: ${meta.canonical}`);
  console.log(`   🖼️  OG Image: ${meta.ogImage}`);
  console.log(`   📊 Structured Data: ${meta.structuredDataCount} scripts`);
  console.log(`   🏢 Organization: ${meta.hasOrganization ? '✅' : '❌'}`);
  console.log(`   🌐 Website: ${meta.hasWebsite ? '✅' : '❌'}`);
  console.log(`   📚 Collection: ${meta.hasCollectionPage ? '✅' : '❌'}`);
  
  // Verificar se o SEO está otimizado
  const issues = [];
  if (meta.titleLength > 60) issues.push('Título muito longo');
  if (meta.titleLength < 30) issues.push('Título muito curto');
  if (meta.descriptionLength > 160) issues.push('Descrição muito longa');
  if (meta.descriptionLength < 120) issues.push('Descrição muito curta');
  if (!meta.hasOrganization) issues.push('Falta Organization schema');
  
  if (issues.length > 0) {
    console.log(`   ⚠️  Avisos: ${issues.join(', ')}`);
  } else {
    console.log(`   🎯 SEO Perfeito!`);
  }
  
  console.log('');
});

// Testar configurações de redirect
console.log('🔧 Verificando configurações de redirecionamento:\n');

const redirectsPath = path.join(__dirname, '..', 'public', '_redirects');
const vercelPath = path.join(__dirname, '..', 'public', 'vercel.json');
const serverConfigPath = path.join(__dirname, 'server-config.json');

console.log(`📄 _redirects: ${fs.existsSync(redirectsPath) ? '✅ Existe' : '❌ Não encontrado'}`);
console.log(`📄 vercel.json: ${fs.existsSync(vercelPath) ? '✅ Existe' : '❌ Não encontrado'}`);
console.log(`📄 server-config.json: ${fs.existsSync(serverConfigPath) ? '✅ Existe' : '❌ Não encontrado'}`);

console.log(`\n🎯 Para testar no navegador:`);
console.log(`   1. Execute: node scripts/build-prerender.js`);
console.log(`   2. Execute: node scripts/dev-server.js`);
console.log(`   3. Acesse: http://localhost:8080/comprar-backlinks-tecnologia`);
console.log(`   4. Abra DevTools → Network → User Agent → Googlebot`);
console.log(`   5. Recarregue e veja o HTML estático sendo servido`);
console.log(`\n📱 Ou teste via cURL:`);
console.log(`   curl -A "Googlebot" http://localhost:8080/comprar-backlinks-tecnologia`);