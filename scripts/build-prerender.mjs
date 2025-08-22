#!/usr/bin/env node

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { processTemplate, criticalCSS } from './html-template.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SITE_URL = process.env.SITE_URL;

let generatedPages = [];
let buildReport = {
  timestamp: new Date().toISOString(),
  status: 'starting',
  supabaseConnected: false,
  pagesGenerated: 0,
  categoriesProcessed: 0,
  errors: [],
  warnings: [],
  fallbacksUsed: [],
  pageDetails: []
};

console.log('🚀 [PREBUILD] Iniciando geração de páginas estáticas...');
console.log(`📡 Conectando ao Supabase: ${SUPABASE_URL}`);

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function fetchCategories() {
  console.log('📂 Buscando categorias do Supabase...');
  
  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('slug, title, description, image, schema_data');
    
    if (error) {
      console.error('❌ Erro ao buscar categorias:', error.message);
      buildReport.errors.push(`Supabase error: ${error.message}`);
      throw error;
    }
    
    buildReport.supabaseConnected = true;
    console.log(`✅ ${categories?.length || 0} categorias encontradas`);
    return categories || [];
  } catch (error) {
    console.error('❌ [ERRO] Falha na conexão com Supabase');
    buildReport.errors.push(`Supabase connection failed: ${error.message}`);
    buildReport.supabaseConnected = false;
    
    // FALLBACK: Tentar usar páginas pré-existentes
    const existingPages = checkExistingPages();
    if (existingPages.length > 0) {
      console.log('🔄 [FALLBACK] Usando páginas HTML pré-existentes...');
      buildReport.fallbacksUsed.push('Used existing HTML pages due to Supabase failure');
      buildReport.warnings.push('Supabase unavailable - using existing pages');
      return [];
    }
    
    throw error;
  }
}

function checkExistingPages() {
  console.log('🔍 Verificando páginas HTML pré-existentes...');
  
  const distDir = path.join(__dirname, '..', 'dist');
  if (!fs.existsSync(distDir)) {
    return [];
  }
  
  const existingPages = fs.readdirSync(distDir)
    .filter(file => file.endsWith('.html'))
    .filter(file => file.startsWith('comprar-backlinks-') && file !== 'comprar-backlinks.html');
  
  console.log(`📄 ${existingPages.length} páginas de categoria existentes encontradas`);
  return existingPages;
}

async function fetchBacklinkStats(category) {
  try {
    const { data: backlinks, error } = await supabase
      .from('backlinks_public')
      .select('price_cents, dr, da')
      .eq('category', category)
      .eq('is_active', true);
    
    if (error) {
      buildReport.warnings.push(`Stats error for category ${category}: ${error.message}`);
      throw error;
    }
    
    if (!backlinks || backlinks.length === 0) {
      return { count: 0, avgPrice: 0, avgDR: 0, avgDA: 0 };
    }
    
    const avgPrice = Math.round(backlinks.reduce((sum, b) => sum + (b.price_cents || 0), 0) / backlinks.length / 100);
    const avgDR = Math.round(backlinks.reduce((sum, b) => sum + (b.dr || 0), 0) / backlinks.length);
    const avgDA = Math.round(backlinks.reduce((sum, b) => sum + (b.da || 0), 0) / backlinks.length);
    
    return {
      count: backlinks.length,
      avgPrice,
      avgDR,
      avgDA
    };
  } catch (error) {
    console.warn(`⚠️ Erro ao buscar stats para categoria ${category}:`, error.message);
    buildReport.warnings.push(`Failed to fetch stats for ${category}: ${error.message}`);
    return { count: 0, avgPrice: 0, avgDR: 0, avgDA: 0 };
  }
}

const staticPages = {
  'index': {
    title: 'Comprar Backlinks de Qualidade Premium - SEO Profissional',
    description: 'Compre backlinks de alta qualidade para impulsionar seu SEO. Sites com DR e DA elevados, entrega rápida e suporte especializado 24/7.',
    h1: 'Backlinks Premium de Alta Qualidade',
    intro: 'Impulsione seu ranking no Google com nossos backlinks de sites com alta autoridade de domínio.',
    canonical: `${SITE_URL}/`,
    url: `${SITE_URL}/`,
    jsonLd: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Backlinks Premium",
      "url": SITE_URL,
      "description": "Plataforma para comprar backlinks de qualidade premium",
      "potentialAction": {
        "@type": "SearchAction",
        "target": `${SITE_URL}/comprar-backlinks?q={search_term_string}`,
        "query-input": "required name=search_term_string"
      }
    })
  },
  'comprar-backlinks': {
    title: 'Comprar Backlinks - Marketplace de Links de Qualidade',
    description: 'Marketplace completo para comprar backlinks de qualidade. Filtros por categoria, DR, DA e preço. Entrega garantida em até 7 dias.',
    h1: 'Marketplace de Backlinks Premium',
    intro: 'Encontre os melhores backlinks para sua estratégia de SEO com filtros avançados e métricas transparentes.',
    canonical: `${SITE_URL}/comprar-backlinks`,
    url: `${SITE_URL}/comprar-backlinks`
  },
  'agencia-de-backlinks': {
    title: 'Agência de Backlinks Especializada - Serviço Premium',
    description: 'Agência especializada em link building com estratégias personalizadas. Aumente sua autoridade de domínio com nossa consultoria.',
    h1: 'Agência de Backlinks Especializada',
    intro: 'Estratégias personalizadas de link building para empresas que buscam resultados excepcionais.',
    canonical: `${SITE_URL}/agencia-de-backlinks`,
    url: `${SITE_URL}/agencia-de-backlinks`
  },
  'consultoria-seo': {
    title: 'Consultoria SEO Especializada - Estratégias de Ranking',
    description: 'Consultoria SEO completa com auditoria técnica, estratégia de conteúdo e link building. Resultados comprovados.',
    h1: 'Consultoria SEO Profissional',
    intro: 'Auditoria completa e estratégias personalizadas para maximizar seu posicionamento no Google.',
    canonical: `${SITE_URL}/consultoria-seo`,
    url: `${SITE_URL}/consultoria-seo`
  },
  'contato': {
    title: 'Contato - Backlinks Premium | Suporte Especializado',
    description: 'Entre em contato com nossa equipe especializada. Suporte 24/7 para tirar suas dúvidas sobre backlinks e SEO.',
    h1: 'Entre em Contato Conosco',
    intro: 'Nossa equipe está pronta para ajudar você a alcançar os melhores resultados em SEO.',
    canonical: `${SITE_URL}/contato`,
    url: `${SITE_URL}/contato`
  },
  'blog': {
    title: 'Blog SEO - Dicas e Estratégias de Link Building',
    description: 'Blog especializado em SEO e link building. Aprenda as melhores práticas para impulsionar seu site no Google.',
    h1: 'Blog de SEO e Link Building',
    intro: 'Conteúdo especializado para você dominar as estratégias de SEO e link building.',
    canonical: `${SITE_URL}/blog`,
    url: `${SITE_URL}/blog`
  }
};

async function generateStaticPages() {
  console.log('📄 Gerando páginas estáticas...');
  
  const pagesDir = path.join(__dirname, '..', 'dist');
  
  // Ensure dist directory exists
  if (!fs.existsSync(pagesDir)) {
    fs.mkdirSync(pagesDir, { recursive: true });
    console.log('📁 Diretório /dist criado');
  }
  
  // Generate static pages
  for (const [slug, pageData] of Object.entries(staticPages)) {
    try {
      const fileName = slug === 'index' ? 'index.html' : `${slug}.html`;
      const filePath = path.join(pagesDir, fileName);
      
      const html = processTemplate({
        ...pageData,
        criticalCSS,
        ogImage: '', // Will be handled by template
        jsonLd: pageData.jsonLd || JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": pageData.title,
          "description": pageData.description,
          "url": pageData.url || `${SITE_URL}/${slug}`
        })
      });
      
      fs.writeFileSync(filePath, html, 'utf8');
      generatedPages.push(fileName);
      buildReport.pagesGenerated++;
      buildReport.pageDetails.push({
        file: fileName,
        type: 'static',
        status: 'success',
        size: html.length
      });
      console.log(`✅ Página gerada: ${fileName}`);
    } catch (error) {
      console.error(`❌ Erro ao gerar página ${slug}:`, error.message);
      buildReport.errors.push(`Failed to generate static page ${slug}: ${error.message}`);
      buildReport.pageDetails.push({
        file: `${slug}.html`,
        type: 'static',
        status: 'error',
        error: error.message
      });
    }
  }
}

async function generateCategoryPages() {
  console.log('🏷️ Gerando páginas de categorias...');
  
  try {
    const categories = await fetchCategories();
    const pagesDir = path.join(__dirname, '..', 'dist');
    
    if (categories.length === 0 && buildReport.supabaseConnected === false) {
      console.log('⚠️ Supabase indisponível - mantendo páginas existentes');
      return;
    }
    
    for (const category of categories) {
      try {
        const stats = await fetchBacklinkStats(category.slug);
        const fileName = `comprar-backlinks-${category.slug}.html`;
        const filePath = path.join(pagesDir, fileName);
        
        const pageData = {
          title: `Comprar Backlinks ${category.title} - ${stats.count} Sites DR ${stats.avgDR}+`,
          description: `${stats.count} backlinks de ${category.title} disponíveis. DR médio ${stats.avgDR}, preços a partir de R$ ${stats.avgPrice}. ${category.description}`,
          h1: `Backlinks de ${category.title}`,
          intro: `${stats.count} sites de alta qualidade na categoria ${category.title}. DR médio de ${stats.avgDR} e entrega garantida.`,
          canonical: `${SITE_URL}/comprar-backlinks-${category.slug}`,
          url: `${SITE_URL}/comprar-backlinks-${category.slug}`,
          ogImage: category.image || '',
          criticalCSS,
          jsonLd: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": `Backlinks ${category.title}`,
            "description": category.description,
            "url": `${SITE_URL}/comprar-backlinks-${category.slug}`,
            "mainEntity": {
              "@type": "ItemList",
              "numberOfItems": stats.count,
              "itemListElement": [{
                "@type": "Product",
                "name": `Backlinks ${category.title}`,
                "category": category.title,
                "offers": {
                  "@type": "AggregateOffer",
                  "lowPrice": Math.max(1, stats.avgPrice - 50),
                  "highPrice": stats.avgPrice + 100,
                  "priceCurrency": "BRL"
                }
              }]
            },
            ...(category.schema_data && typeof category.schema_data === 'object' ? category.schema_data : {})
          })
        };
        
        const html = processTemplate(pageData);
        fs.writeFileSync(filePath, html, 'utf8');
        generatedPages.push(fileName);
        buildReport.pagesGenerated++;
        buildReport.categoriesProcessed++;
        buildReport.pageDetails.push({
          file: fileName,
          type: 'category',
          status: 'success',
          category: category.slug,
          backlinks: stats.count,
          size: html.length
        });
        console.log(`✅ Categoria gerada: ${fileName} (${stats.count} backlinks)`);
      } catch (error) {
        console.error(`❌ Erro ao gerar categoria ${category.slug}:`, error.message);
        buildReport.errors.push(`Failed to generate category ${category.slug}: ${error.message}`);
        buildReport.pageDetails.push({
          file: `comprar-backlinks-${category.slug}.html`,
          type: 'category',
          status: 'error',
          category: category.slug,
          error: error.message
        });
        // Continue com próxima categoria instead of failing completely
        continue;
      }
    }
  } catch (error) {
    console.error('❌ Erro ao gerar páginas de categorias:', error.message);
    buildReport.errors.push(`Category pages generation failed: ${error.message}`);
  }
}

async function generateSupportFiles() {
  console.log('🔧 Gerando arquivos de suporte...');
  
  const distDir = path.join(__dirname, '..', 'dist');
  
  try {
    // Generate sitemap.xml
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  ${Object.keys(staticPages).filter(slug => slug !== 'index').map(slug => `
  <url>
    <loc>${SITE_URL}/${slug}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('')}
</urlset>`;
    
    fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemap);
    console.log('✅ sitemap.xml gerado');
    
    // Generate robots.txt
    const robots = `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml`;
    
    fs.writeFileSync(path.join(distDir, 'robots.txt'), robots);
    console.log('✅ robots.txt gerado');
    
    // Generate _redirects for Netlify
    const redirects = `# Prerendered pages
${generatedPages.map(page => `/${page.replace('.html', '')} /${page} 200`).join('\n')}

# SPA fallback
/* /index.html 200`;
    
    fs.writeFileSync(path.join(distDir, '_redirects'), redirects);
    console.log('✅ _redirects gerado');
    
    // Generate vercel.json
    const vercelConfig = {
      "rewrites": [
        ...generatedPages.filter(p => p !== 'index.html').map(page => ({
          "source": `/${page.replace('.html', '')}`,
          "destination": `/${page}`
        })),
        {
          "source": "/(.*)",
          "destination": "/index.html"
        }
      ]
    };
    
    fs.writeFileSync(path.join(distDir, 'vercel.json'), JSON.stringify(vercelConfig, null, 2));
    console.log('✅ vercel.json gerado');
    
  } catch (error) {
    console.error('❌ Erro ao gerar arquivos de suporte:', error.message);
  }
}

function saveBuildReport() {
  const distDir = path.join(__dirname, '..', 'dist');
  buildReport.status = buildReport.errors.length > 0 ? 'completed_with_errors' : 'completed';
  buildReport.completedAt = new Date().toISOString();
  buildReport.summary = {
    totalPages: generatedPages.length,
    staticPages: buildReport.pageDetails.filter(p => p.type === 'static').length,
    categoryPages: buildReport.pageDetails.filter(p => p.type === 'category').length,
    errors: buildReport.errors.length,
    warnings: buildReport.warnings.length,
    fallbacks: buildReport.fallbacksUsed.length
  };
  
  const reportPath = path.join(distDir, 'seo-build-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(buildReport, null, 2));
  console.log('📊 Relatório salvo: seo-build-report.json');
}
async function main() {
  try {
    console.log('🎯 [PREBUILD] Verificando variáveis de ambiente...');
    
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.error('❌ [ERRO CRÍTICO] Variáveis de ambiente obrigatórias:');
      console.error('   • SUPABASE_URL');
      console.error('   • SUPABASE_ANON_KEY');
      console.error('💡 Configure estas variáveis no painel do Lovable');
      buildReport.status = 'failed';
      buildReport.errors.push('Missing required environment variables');
      process.exit(1);
    }
    
    console.log('✅ Variáveis de ambiente configuradas');
    buildReport.status = 'running';
    
    await generateStaticPages();
    await generateCategoryPages();
    await generateSupportFiles();
    saveBuildReport();
    
    if (buildReport.errors.length > 0) {
      console.log('\n⚠️ [PREBUILD CONCLUÍDO COM AVISOS]');
      console.log(`❌ ${buildReport.errors.length} erros encontrados`);
      console.log(`⚠️ ${buildReport.warnings.length} avisos`);
      console.log(`🔄 ${buildReport.fallbacksUsed.length} fallbacks utilizados`);
    } else {
      console.log('\n🎉 [PREBUILD CONCLUÍDO] Páginas estáticas geradas com sucesso!');
    }
    
    console.log(`📊 Total de páginas: ${generatedPages.length}`);
    console.log(`📁 Arquivos disponíveis em /dist`);
    console.log(`📋 Relatório: dist/seo-build-report.json`);
    
  } catch (error) {
    const errorMsg = `PREBUILD FAILED: ${error.message}`;
    console.error(`\n❌ [${errorMsg}]`);
    buildReport.status = 'failed';
    buildReport.errors.push(errorMsg);
    saveBuildReport();
    
    // Don't exit with error if we have fallbacks
    if (buildReport.fallbacksUsed.length > 0) {
      console.error('🔄 Continuando com fallbacks...');
      console.error('💡 Verifique o relatório para detalhes');
    } else {
      console.error('💡 Verifique a configuração do Supabase e tente novamente');
      process.exit(1);
    }
  }
}

main();