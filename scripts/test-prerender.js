import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Testando sistema de prerendering...\n');

const pagesDir = path.join(__dirname, '..', 'public', 'pages');
const testRoutes = [
  'index.html',
  'comprar-backlinks.html',
  'comprar-backlinks-tecnologia.html',
  'comprar-backlinks-noticias.html',
  'comprar-backlinks-financas.html'
];

console.log('📊 Status das páginas prerendering:\n');

testRoutes.forEach(route => {
  const filePath = path.join(pagesDir, route);
  const exists = fs.existsSync(filePath);
  
  if (exists) {
    const content = fs.readFileSync(filePath, 'utf8');
    const title = content.match(/<title>(.*?)<\/title>/)?.[1] || 'Sem título';
    const description = content.match(/<meta name="description" content="(.*?)"/)?.[1] || 'Sem descrição';
    
    console.log(`✅ ${route}`);
    console.log(`   📝 Título: ${title.substring(0, 60)}...`);
    console.log(`   📄 Descrição: ${description.substring(0, 80)}...`);
    console.log('');
  } else {
    console.log(`❌ ${route} - Arquivo não encontrado`);
    console.log('');
  }
});

// Testar redirects
console.log('🔗 Verificando configuração de redirects:\n');

const redirectsPath = path.join(__dirname, '..', 'public', '_redirects');
if (fs.existsSync(redirectsPath)) {
  console.log('✅ _redirects configurado');
} else {
  console.log('❌ _redirects não encontrado');
}

const vercelPath = path.join(__dirname, '..', 'public', 'vercel.json');
if (fs.existsSync(vercelPath)) {
  console.log('✅ vercel.json configurado');
} else {
  console.log('❌ vercel.json não encontrado');
}

console.log('\n🎯 Para testar no navegador:');
console.log('   1. Execute: node scripts/dev-server.js');
console.log('   2. Acesse: http://localhost:8080/comprar-backlinks-tecnologia');
console.log('   3. Pressione Ctrl+U para ver o código-fonte');
console.log('   4. Verifique se o título específico aparece no view-source');