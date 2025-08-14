import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Validando SEO das páginas prerendering...\n');

const pagesDir = path.join(__dirname, '..', 'public', 'pages');
const testPages = [
  'comprar-backlinks-tecnologia.html',
  'comprar-backlinks-noticias.html',
  'comprar-backlinks-financas.html'
];

testPages.forEach(page => {
  const filePath = path.join(pagesDir, page);
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ ${page} - Arquivo não encontrado`);
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Extrair dados SEO
  const title = content.match(/<title>(.*?)<\/title>/)?.[1] || 'Sem título';
  const description = content.match(/<meta name="description" content="(.*?)"/)?.[1] || 'Sem descrição';
  const ogTitle = content.match(/<meta property="og:title" content="(.*?)"/)?.[1] || 'Sem OG title';
  const ogDescription = content.match(/<meta property="og:description" content="(.*?)"/)?.[1] || 'Sem OG description';
  const canonical = content.match(/<link rel="canonical" href="(.*?)"/)?.[1] || 'Sem canonical';
  
  // Verificar dados estruturados
  const hasStructuredData = content.includes('application/ld+json');
  const hasOrganization = content.includes('"@type": "Organization"');
  const hasWebsite = content.includes('"@type": "WebSite"');
  
  console.log(`✅ ${page}`);
  console.log(`   📝 Título: ${title.substring(0, 60)}...`);
  console.log(`   📄 Descrição: ${description.substring(0, 60)}...`);
  console.log(`   🔗 Canonical: ${canonical}`);
  console.log(`   📊 Structured Data: ${hasStructuredData ? '✅' : '❌'}`);
  console.log(`   🏢 Organization Schema: ${hasOrganization ? '✅' : '❌'}`);
  console.log(`   🌐 Website Schema: ${hasWebsite ? '✅' : '❌'}`);
  console.log(`   📱 Open Graph: ${ogTitle !== 'Sem OG title' ? '✅' : '❌'}`);
  console.log('');
});

console.log('🎯 Para testar no navegador:');
console.log('   1. Execute: node scripts/dev-server.js');
console.log('   2. Acesse: http://localhost:8080/comprar-backlinks-tecnologia');
console.log('   3. Pressione F12 → Network → Simule "Googlebot"');
console.log('   4. Recarregue e veja o HTML estático sendo servido');