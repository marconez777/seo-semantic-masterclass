import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Configurando sistema completo de prerendering...\n');

try {
  // 1. Criar diretório pages se não existir
  const pagesDir = path.join(__dirname, '..', 'public', 'pages');
  if (!fs.existsSync(pagesDir)) {
    fs.mkdirSync(pagesDir, { recursive: true });
    console.log('📁 Diretório public/pages criado');
  }

  // 2. Gerar páginas prerendering
  console.log('📄 Gerando páginas prerendering...');
  execSync('node scripts/prerender.js', { stdio: 'inherit' });

  // 3. Verificar se páginas foram criadas
  const pages = fs.readdirSync(pagesDir);
  const htmlPages = pages.filter(file => file.endsWith('.html'));
  
  console.log(`\n✅ ${htmlPages.length} páginas prerendering criadas:`);
  htmlPages.forEach(page => {
    console.log(`   • ${page}`);
  });

  // 4. Testar uma página
  const testPage = path.join(pagesDir, 'comprar-backlinks-tecnologia.html');
  if (fs.existsSync(testPage)) {
    const content = fs.readFileSync(testPage, 'utf8');
    const hasCorrectTitle = content.includes('<title>Comprar Backlinks Tecnologia');
    const hasCorrectMeta = content.includes('meta name="description"');
    
    console.log('\n🔍 Validação da página de teste:');
    console.log(`   • Título específico: ${hasCorrectTitle ? '✅' : '❌'}`);
    console.log(`   • Meta description: ${hasCorrectMeta ? '✅' : '❌'}`);
  }

  console.log('\n🎉 Sistema de prerendering configurado com sucesso!');
  console.log('\n📋 Próximos passos:');
  console.log('   1. Execute: node scripts/dev-server.js');
  console.log('   2. Acesse: http://localhost:8080/comprar-backlinks-tecnologia');
  console.log('   3. Use "View Source" para verificar metadados');

} catch (error) {
  console.error('❌ Erro durante a configuração:', error);
  process.exit(1);
}