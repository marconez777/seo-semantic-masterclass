import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { processTemplate } from './html-template.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuração do Supabase
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SITE_URL = process.env.SITE_URL || 'http://localhost:5173';

const supabaseReady = SUPABASE_URL && !SUPABASE_URL.includes('PLACEHOLDER') && SUPABASE_ANON_KEY && !SUPABASE_ANON_KEY.includes('PLACEHOLDER');

let supabase;
if (supabaseReady) {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else {
    console.warn('⚠️  Supabase environment variables not set or are placeholders in your .env file.');
    console.warn('Dynamic category pages will not be generated.');
}


console.log('🚀 Gerando páginas estáticas com SEO específico do Supabase...\n');

// Buscar categorias do Supabase
async function fetchCategories() {
  if (!supabaseReady) return [];
  const { data: categories, error } = await supabase
    .from('categories')
    .select('slug, title, description, image, schema_data, h1, intro, seo_html');
  
  if (error) {
    console.error('Erro ao buscar categorias:', error);
    return [];
  }
  
  console.log(`✅ ${categories.length} categorias encontradas no Supabase`);
  return categories;
}

// Buscar estatísticas de backlinks por categoria
async function fetchBacklinkStats(category) {
  const { data: backlinks, error } = await supabase
    .from('backlinks_public')
    .select('price_cents, dr, da, traffic')
    .eq('category', category)
    .eq('is_active', true);
  
  if (error) {
    console.error(`Erro ao buscar backlinks para ${category}:`, error);
    return { count: 0, avgPrice: 0, avgDr: 0, avgDa: 0 };
  }
  
  const count = backlinks.length;
  const avgPrice = count > 0 ? Math.round(backlinks.reduce((sum, b) => sum + b.price_cents, 0) / count / 100) : 0;
  const avgDr = count > 0 ? Math.round(backlinks.reduce((sum, b) => sum + (b.dr || 0), 0) / count) : 0;
  const avgDa = count > 0 ? Math.round(backlinks.reduce((sum, b) => sum + (b.da || 0), 0) / count) : 0;
  
  return { count, avgPrice, avgDr, avgDa };
}

// Metadados para páginas fixas
const staticPageData = {
  '/': {
    title: 'MK Art SEO - Comprar Backlinks Brasileiros de Qualidade DR 50+',
    description: 'Especialista em backlinks brasileiros de qualidade. Compre links de sites com DR 50+ para melhorar seu posicionamento no Google. Entrega garantida.',
    keywords: 'backlinks brasileiros, comprar backlinks, links de qualidade, seo, posicionamento google',
    schema_data: {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "MK Art SEO",
      "url": SITE_URL,
      "description": "Especialista em backlinks brasileiros de qualidade para melhorar o posicionamento no Google"
    }
  },
  '/comprar-backlinks': {
    title: 'Comprar Backlinks - Sites Brasileiros DR 50+ | MK Art SEO',
    description: 'Compre backlinks de qualidade em sites brasileiros com DR 50+. Melhore seu posicionamento no Google com nossa rede de sites confiáveis.',
    keywords: 'comprar backlinks, backlinks brasileiros, links qualidade, seo brasil',
    schema_data: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "Marketplace de Backlinks",
      "description": "Marketplace de backlinks brasileiros de alta qualidade"
    }
  },
  '/agencia-de-backlinks': {
    title: 'Agência de Backlinks - Serviços Profissionais de Link Building | MK Art SEO',
    description: 'Agência especializada em link building com sites brasileiros DR 50+. Serviços profissionais de SEO e construção de autoridade.',
    keywords: 'agencia backlinks, servicos link building, agencia seo, link building brasil',
    schema_data: {
      "@context": "https://schema.org",
      "@type": "ProfessionalService",
      "name": "MK Art SEO - Agência de Backlinks",
      "description": "Agência especializada em link building e SEO"
    }
  },
  '/consultoria-seo': {
    title: 'Consultoria SEO - Especialista em Posicionamento Google | MK Art SEO',
    description: 'Consultoria SEO especializada em posicionamento no Google. Estratégias personalizadas para melhorar seu ranking e aumentar o tráfego.',
    keywords: 'consultoria seo, consultor seo, posicionamento google, estrategia seo',
    schema_data: {
      "@context": "https://schema.org",
      "@type": "ProfessionalService",
      "name": "Consultoria SEO",
      "description": "Consultoria especializada em SEO e posicionamento no Google"
    }
  },
  '/contato': {
    title: 'Contato - Entre em Contato com a MK Art SEO',
    description: 'Entre em contato conosco para solicitar orçamento de backlinks ou consultoria SEO. Atendimento especializado e personalizado.',
    keywords: 'contato seo, orcamento backlinks, falar com consultor seo',
    schema_data: {
      "@context": "https://schema.org",
      "@type": "ContactPage",
      "name": "Contato",
      "description": "Entre em contato para orçamentos e informações"
    }
  },
  '/blog': {
    title: 'Blog SEO - Dicas e Estratégias de Posicionamento | MK Art SEO',
    description: 'Blog com dicas, estratégias e novidades sobre SEO, backlinks e marketing digital. Conteúdo especializado para melhorar seu ranking.',
    keywords: 'blog seo, dicas seo, estrategias seo, marketing digital',
    schema_data: {
      "@context": "https://schema.org",
      "@type": "Blog",
      "name": "Blog SEO",
      "description": "Blog especializado em SEO e marketing digital"
    }
  }
};

// Função principal
async function generateStaticPages() {
  // Criar diretório de páginas se não existir
  const pagesDir = path.join(__dirname, '..', 'public', 'pages');
  if (!fs.existsSync(pagesDir)) {
    fs.mkdirSync(pagesDir, { recursive: true });
  }

  // 1. Gerar páginas estáticas fixas
  console.log('📄 Gerando páginas estáticas fixas...');
  for (const [path, data] of Object.entries(staticPageData)) {
    const fileName = path === '/' ? 'index.html' : path.replace('/', '') + '.html';
    const filePath = path.join(pagesDir, fileName);
    
    const pageData = {
      title: data.title,
      description: data.description,
      canonical: `${SITE_URL}${path}`,
      url: `${SITE_URL}${path}`,
      h1: data.title,
      intro: '',
      seoBody: '',
      jsonLd: JSON.stringify(data.schema_data, null, 2)
    };
    
    const htmlContent = processTemplate(pageData);
    fs.writeFileSync(filePath, htmlContent);
    console.log(`✅ Gerado: ${fileName}`);
  }

  // 2. Gerar páginas dinâmicas de categorias do Supabase
  console.log('\n📊 Gerando páginas de categorias do Supabase...');
  const categories = await fetchCategories();
  
  for (const category of categories) {
    const stats = await fetchBacklinkStats(category.slug);
    
    const urlPath = `/comprar-backlinks-${category.slug}`;
    const canonical = `${SITE_URL}${urlPath}`;
    
    const pageData = {
      title: `Comprar Backlinks ${category.title} - Backlinks Premium`,
      description: `Compre backlinks de qualidade para ${category.title.toLowerCase()}. ${stats.count} sites disponíveis com DR médio de ${stats.avgDr} e preços a partir de R$ ${(stats.avgPrice * 0.8).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}.`,
      canonical,
      url: canonical,
      h1: category.h1 || `Comprar Backlinks ${category.title}`,
      intro: category.intro || '',
      seoBody: category.seo_html || '',
      jsonLd: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": `Backlinks ${category.title}`,
        "description": category.description,
        "url": canonical,
        "offers": {
          "@type": "AggregateOffer",
          "offerCount": stats.count,
          "lowPrice": stats.avgPrice > 0 ? Math.round(stats.avgPrice * 0.8) : 50,
          "highPrice": stats.avgPrice > 0 ? Math.round(stats.avgPrice * 1.2) : 200,
          "priceCurrency": "BRL"
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.8",
          "reviewCount": stats.count,
          "bestRating": "5",
          "worstRating": "1"
        },
        ...category.schema_data
      }, null, 2)
    };

    const fileName = `comprar-backlinks-${category.slug}.html`;
    const filePath = path.join(pagesDir, fileName);
    const htmlContent = processTemplate(pageData);
    
    fs.writeFileSync(filePath, htmlContent);
    console.log(`✅ Gerado: ${fileName} (${stats.count} backlinks, DR médio: ${stats.avgDr})`);
  }

  console.log(`\n🎉 Prerendering concluído! ${Object.keys(staticPageData).length + categories.length} páginas geradas em /public/pages/`);
  console.log('📈 Páginas incluem metadados específicos, structured data e otimizações para SEO');
}

// Executar geração
generateStaticPages().catch(console.error);