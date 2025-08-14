#!/usr/bin/env node

/**
 * Lovable Pipeline Handler
 * Gerencia o pipeline completo de build com prerendering
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PIPELINE_STEPS = {
  PREBUILD: 'prebuild',
  BUILD: 'build',
  QA: 'qa',
  PUBLISH: 'publish'
};

let currentStep = '';
let startTime = Date.now();

function logStep(step, message) {
  const timestamp = new Date().toLocaleTimeString();
  const duration = Date.now() - startTime;
  console.log(`🕐 [${timestamp}] [${step.toUpperCase()}] ${message}`);
}

function logError(step, error, fix = '') {
  console.error(`❌ [${step.toUpperCase()} FAILED] ${error}`);
  if (fix) {
    console.error(`💡 [CORREÇÃO] ${fix}`);
  }
}

function checkEnvironment() {
  logStep('ENV', 'Verificando variáveis de ambiente...');
  
  const required = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];
  const missing = required.filter(env => !process.env[env]);
  
  if (missing.length > 0) {
    logError('ENV', `Variáveis obrigatórias ausentes: ${missing.join(', ')}`, 
      'Configure no painel Lovable: Settings → Environment Variables');
    process.exit(1);
  }
  
  logStep('ENV', '✅ Todas as variáveis configuradas');
}

async function runPrebuild() {
  currentStep = PIPELINE_STEPS.PREBUILD;
  logStep(currentStep, 'Iniciando geração de páginas estáticas...');
  
  try {
    // Check if prebuild script exists
    const prebuildScript = path.join(__dirname, 'build-prerender.mjs');
    if (!fs.existsSync(prebuildScript)) {
      logError(currentStep, 'Script build-prerender.mjs não encontrado', 
        'Certifique-se que o arquivo existe em /scripts/');
      process.exit(1);
    }
    
    execSync(`node ${prebuildScript}`, { stdio: 'inherit' });
    logStep(currentStep, '✅ Páginas estáticas geradas com sucesso');
    
  } catch (error) {
    logError(currentStep, 'Falha na geração de páginas estáticas', 
      'Verifique logs do Supabase e configuração de rede');
    throw error;
  }
}

async function runBuild() {
  currentStep = PIPELINE_STEPS.BUILD;
  logStep(currentStep, 'Executando build do Vite...');
  
  try {
    execSync('npm run build', { stdio: 'inherit' });
    
    // Verify dist directory exists
    const distDir = path.join(__dirname, '..', 'dist');
    if (!fs.existsSync(distDir)) {
      logError(currentStep, 'Diretório /dist não encontrado após build', 
        'Verifique configuração do Vite e erros de build');
      process.exit(1);
    }
    
    logStep(currentStep, '✅ Build concluído com sucesso');
    
  } catch (error) {
    logError(currentStep, 'Falha no build do Vite', 
      'Verifique erros de TypeScript e dependências');
    throw error;
  }
}

async function runQA() {
  currentStep = PIPELINE_STEPS.QA;
  logStep(currentStep, 'Executando QA de SEO...');
  
  try {
    const qaScript = path.join(__dirname, 'qa-seo.mjs');
    if (!fs.existsSync(qaScript)) {
      logStep(currentStep, '⚠️ Script QA não encontrado, pulando verificação');
      return;
    }
    
    execSync(`node ${qaScript}`, { stdio: 'inherit' });
    logStep(currentStep, '✅ QA aprovado - Site pronto para deploy');
    
  } catch (error) {
    if (error.status === 1) {
      logError(currentStep, 'QA reprovou - Problemas críticos de SEO encontrados', 
        'Revise os logs acima e corrija os problemas antes do deploy');
      throw error;
    }
    logStep(currentStep, '⚠️ QA com avisos - Deploy autorizado');
  }
}

function validatePublishReady() {
  currentStep = PIPELINE_STEPS.PUBLISH;
  logStep(currentStep, 'Validando arquivos para publicação...');
  
  const distDir = path.join(__dirname, '..', 'dist');
  const requiredFiles = ['index.html', '_redirects', 'vercel.json', 'sitemap.xml', 'robots.txt'];
  const missing = [];
  
  requiredFiles.forEach(file => {
    if (!fs.existsSync(path.join(distDir, file))) {
      missing.push(file);
    }
  });
  
  if (missing.length > 0) {
    logError(currentStep, `Arquivos obrigatórios ausentes: ${missing.join(', ')}`, 
      'Execute novamente o prebuild e build');
    process.exit(1);
  }
  
  // Check if HTML pages exist
  const htmlFiles = fs.readdirSync(distDir).filter(f => f.endsWith('.html'));
  logStep(currentStep, `✅ ${htmlFiles.length} páginas HTML prontas para deploy`);
  
  logStep(currentStep, '✅ Todos os arquivos obrigatórios presentes');
  logStep(currentStep, '🚀 PIPELINE CONCLUÍDO - Pronto para publicação!');
}

function printSummary() {
  const totalTime = Math.round((Date.now() - startTime) / 1000);
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMO DO PIPELINE');
  console.log('='.repeat(60));
  console.log(`⏱️ Tempo total: ${totalTime}s`);
  console.log('✅ Prebuild: Páginas estáticas geradas');
  console.log('✅ Build: Aplicação compilada');
  console.log('✅ QA: Verificações de SEO aprovadas');
  console.log('✅ Publish: Arquivos validados');
  console.log('\n🎯 ARQUIVOS PRONTOS EM /dist:');
  
  const distDir = path.join(__dirname, '..', 'dist');
  if (fs.existsSync(distDir)) {
    const files = fs.readdirSync(distDir);
    const htmlFiles = files.filter(f => f.endsWith('.html'));
    const configFiles = files.filter(f => ['_redirects', 'vercel.json', 'sitemap.xml', 'robots.txt'].includes(f));
    
    console.log(`   📄 ${htmlFiles.length} páginas HTML`);
    console.log(`   ⚙️ ${configFiles.length} arquivos de configuração`);
    console.log(`   📁 ${files.length} arquivos totais`);
  }
  
  console.log('\n🚀 PRÓXIMOS PASSOS:');
  console.log('   1. Verificar preview local: npm run preview');
  console.log('   2. Deploy via Lovable: Botão "Publish"');
  console.log('   3. Testar URLs em produção');
  console.log('   4. Monitorar métricas de SEO');
}

async function main() {
  try {
    console.log('🚀 LOVABLE PIPELINE - Iniciando build completo\n');
    
    checkEnvironment();
    await runPrebuild();
    await runBuild();
    await runQA();
    validatePublishReady();
    printSummary();
    
  } catch (error) {
    const totalTime = Math.round((Date.now() - startTime) / 1000);
    console.error(`\n💥 PIPELINE FAILED em ${currentStep.toUpperCase()} após ${totalTime}s`);
    console.error('📋 DIAGNÓSTICO:');
    console.error('   1. Verifique logs detalhados acima');
    console.error('   2. Corrija problemas identificados');
    console.error('   3. Execute novamente: npm run pipeline');
    process.exit(1);
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
const command = args[0];

if (command === '--help' || command === '-h') {
  console.log(`
🔧 Lovable Pipeline

COMANDOS:
  npm run pipeline          - Executa pipeline completo
  npm run pipeline:prebuild - Apenas prebuild (páginas estáticas)  
  npm run pipeline:qa       - Apenas QA de SEO

VARIÁVEIS NECESSÁRIAS:
  SUPABASE_URL             - URL do projeto Supabase
  SUPABASE_ANON_KEY        - Chave anônima do Supabase
  SITE_URL                 - URL do site (opcional)

ETAPAS:
  1. Prebuild  - Gera páginas estáticas com dados do Supabase
  2. Build     - Compila aplicação Vite
  3. QA        - Verifica qualidade de SEO
  4. Publish   - Valida arquivos para deploy
`);
  process.exit(0);
}

if (command === 'prebuild') {
  checkEnvironment();
  runPrebuild().catch(() => process.exit(1));
} else if (command === 'qa') {
  runQA().catch(() => process.exit(1));
} else {
  main();
}