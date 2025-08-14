#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 [QA SEO] Iniciando verificação de qualidade...\n');

const distDir = path.join(__dirname, '..', 'dist');
const requiredFiles = ['sitemap.xml', 'robots.txt', '_redirects', 'vercel.json'];
const issues = [];
const warnings = [];

function checkRequiredFiles() {
  console.log('📁 Verificando arquivos obrigatórios...');
  
  requiredFiles.forEach(file => {
    const filePath = path.join(distDir, file);
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${file} - OK`);
    } else {
      issues.push(`❌ Arquivo obrigatório ausente: ${file}`);
    }
  });
}

function validateHTML(filePath, fileName) {
  const content = fs.readFileSync(filePath, 'utf8');
  const pageIssues = [];
  
  // Check title
  const titleMatch = content.match(/<title>(.*?)<\/title>/);
  if (!titleMatch || !titleMatch[1] || titleMatch[1].length < 20) {
    pageIssues.push('Título muito curto ou ausente');
  }
  if (titleMatch && titleMatch[1].length > 60) {
    warnings.push(`${fileName}: Título pode estar muito longo (${titleMatch[1].length} chars)`);
  }
  
  // Check meta description
  const descMatch = content.match(/<meta name="description" content="(.*?)"/);
  if (!descMatch || !descMatch[1] || descMatch[1].length < 120) {
    pageIssues.push('Meta description muito curta ou ausente');
  }
  if (descMatch && descMatch[1].length > 160) {
    warnings.push(`${fileName}: Meta description pode estar muito longa (${descMatch[1].length} chars)`);
  }
  
  // Check H1
  const h1Match = content.match(/<h1[^>]*>(.*?)<\/h1>/);
  if (!h1Match || !h1Match[1]) {
    pageIssues.push('H1 ausente');
  }
  
  // Check canonical
  const canonicalMatch = content.match(/<link rel="canonical" href="(.*?)"/);
  if (!canonicalMatch || !canonicalMatch[1]) {
    pageIssues.push('Link canonical ausente');
  }
  
  // Check structured data
  const structuredDataMatch = content.match(/<script type="application\/ld\+json">(.*?)<\/script>/s);
  if (!structuredDataMatch) {
    pageIssues.push('Dados estruturados (JSON-LD) ausentes');
  } else {
    try {
      JSON.parse(structuredDataMatch[1]);
    } catch (e) {
      pageIssues.push('Dados estruturados inválidos (JSON malformado)');
    }
  }
  
  // Check Open Graph
  const ogTitleMatch = content.match(/<meta property="og:title" content="(.*?)"/);
  const ogDescMatch = content.match(/<meta property="og:description" content="(.*?)"/);
  const ogUrlMatch = content.match(/<meta property="og:url" content="(.*?)"/);
  
  if (!ogTitleMatch || !ogDescMatch || !ogUrlMatch) {
    pageIssues.push('Meta tags Open Graph incompletas');
  }
  
  // Check accessibility
  const hasSkipLink = content.includes('href="#main-content"');
  if (!hasSkipLink) {
    warnings.push(`${fileName}: Link "pular para conteúdo" não encontrado`);
  }
  
  const hasLangAttr = content.includes('lang="pt-BR"');
  if (!hasLangAttr) {
    pageIssues.push('Atributo lang ausente no HTML');
  }
  
  return pageIssues;
}

function checkHTMLPages() {
  console.log('\n📄 Verificando páginas HTML...');
  
  const htmlFiles = fs.readdirSync(distDir).filter(file => file.endsWith('.html'));
  
  if (htmlFiles.length === 0) {
    issues.push('❌ Nenhuma página HTML encontrada em /dist');
    return;
  }
  
  console.log(`📊 ${htmlFiles.length} páginas HTML encontradas`);
  
  htmlFiles.forEach(file => {
    const filePath = path.join(distDir, file);
    const pageIssues = validateHTML(filePath, file);
    
    if (pageIssues.length === 0) {
      console.log(`✅ ${file} - SEO OK`);
    } else {
      console.log(`⚠️ ${file} - ${pageIssues.length} problemas:`);
      pageIssues.forEach(issue => {
        console.log(`   • ${issue}`);
        issues.push(`${file}: ${issue}`);
      });
    }
  });
}

function checkSitemap() {
  console.log('\n🗺️ Verificando sitemap.xml...');
  
  const sitemapPath = path.join(distDir, 'sitemap.xml');
  if (!fs.existsSync(sitemapPath)) return;
  
  try {
    const content = fs.readFileSync(sitemapPath, 'utf8');
    const urlCount = (content.match(/<url>/g) || []).length;
    
    if (urlCount === 0) {
      issues.push('Sitemap.xml não contém URLs');
    } else {
      console.log(`✅ Sitemap contém ${urlCount} URLs`);
    }
    
    // Check if sitemap is valid XML
    if (!content.includes('<?xml') || !content.includes('<urlset')) {
      issues.push('Sitemap.xml formato inválido');
    }
  } catch (error) {
    issues.push(`Erro ao ler sitemap.xml: ${error.message}`);
  }
}

function checkRedirects() {
  console.log('\n🔄 Verificando configurações de redirect...');
  
  // Check _redirects (Netlify)
  const redirectsPath = path.join(distDir, '_redirects');
  if (fs.existsSync(redirectsPath)) {
    const content = fs.readFileSync(redirectsPath, 'utf8');
    const rules = content.split('\n').filter(line => line.trim() && !line.startsWith('#'));
    console.log(`✅ _redirects com ${rules.length} regras`);
  }
  
  // Check vercel.json
  const vercelPath = path.join(distDir, 'vercel.json');
  if (fs.existsSync(vercelPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(vercelPath, 'utf8'));
      const rewrites = config.rewrites?.length || 0;
      console.log(`✅ vercel.json com ${rewrites} rewrites`);
    } catch (error) {
      issues.push('vercel.json formato inválido');
    }
  }
}

function generateReport() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 RELATÓRIO DE QA SEO');
  console.log('='.repeat(60));
  
  if (issues.length === 0 && warnings.length === 0) {
    console.log('🎉 PERFEITO! Todas as verificações passaram');
    console.log('✅ Site pronto para produção');
  } else {
    if (issues.length > 0) {
      console.log(`\n❌ PROBLEMAS CRÍTICOS (${issues.length}):`);
      issues.forEach(issue => console.log(`   ${issue}`));
    }
    
    if (warnings.length > 0) {
      console.log(`\n⚠️ AVISOS (${warnings.length}):`);
      warnings.forEach(warning => console.log(`   ${warning}`));
    }
    
    console.log('\n💡 RECOMENDAÇÕES:');
    console.log('   • Corrija os problemas críticos antes do deploy');
    console.log('   • Revisite os avisos para otimização adicional');
    console.log('   • Execute este script novamente após correções');
  }
  
  console.log('\n📋 CHECKLIST FINAL:');
  console.log('   □ Problemas críticos corrigidos');
  console.log('   □ Todas as páginas com SEO válido');
  console.log('   □ Sitemap.xml e robots.txt presentes');
  console.log('   □ Configurações de redirect OK');
  console.log('   □ Deploy autorizado');
  
  if (issues.length > 0) {
    console.log('\n🚫 DEPLOY NÃO RECOMENDADO - Corrija os problemas críticos primeiro');
    process.exit(1);
  } else {
    console.log('\n🚀 DEPLOY AUTORIZADO - Site aprovado no QA');
  }
}

// Execute QA checks
checkRequiredFiles();
checkHTMLPages();
checkSitemap();
checkRedirects();
generateReport();