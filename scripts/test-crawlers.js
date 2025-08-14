import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 Testando sistema de prerendering...\n');

// Simular diferentes User-Agents
const testCases = [
  {
    name: 'Googlebot',
    userAgent: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    expected: 'Static HTML'
  },
  {
    name: 'Facebook Crawler',
    userAgent: 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
    expected: 'Static HTML'
  },
  {
    name: 'Twitter Bot',
    userAgent: 'Twitterbot/1.0',
    expected: 'Static HTML'
  },
  {
    name: 'Regular Browser',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    expected: 'SPA'
  },
  {
    name: 'iPhone Safari',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Mobile/15E148 Safari/604.1',
    expected: 'SPA'
  }
];

// Importar função de detecção
import('./crawler-detector.js').then(({ shouldServeStatic }) => {
  console.log('📊 Resultados dos testes:\n');
  
  testCases.forEach(({ name, userAgent, expected }) => {
    const shouldServe = shouldServeStatic(userAgent);
    const result = shouldServe ? 'Static HTML' : 'SPA';
    const status = result === expected ? '✅' : '❌';
    
    console.log(`${status} ${name}`);
    console.log(`   UA: ${userAgent.substring(0, 60)}...`);
    console.log(`   Esperado: ${expected} | Resultado: ${result}`);
    console.log('');
  });
  
  // Verificar se páginas existem
  console.log('📄 Verificando páginas prerendering:');
  const pagesDir = path.join(__dirname, '..', 'public', 'pages');
  
  if (fs.existsSync(pagesDir)) {
    const pages = fs.readdirSync(pagesDir).filter(f => f.endsWith('.html'));
    console.log(`✅ ${pages.length} páginas encontradas:`);
    pages.slice(0, 5).forEach(page => {
      console.log(`   • ${page}`);
    });
    if (pages.length > 5) {
      console.log(`   ... e mais ${pages.length - 5} páginas`);
    }
  } else {
    console.log('❌ Diretório de páginas não encontrado');
  }
}).catch(console.error);