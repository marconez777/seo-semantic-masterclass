import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuração do Supabase
const SUPABASE_URL = "https://lvinoytvsyloccajnrwp.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2aW5veXR2c3lsb2NjYWpucndwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3ODgwNDUsImV4cCI6MjA3MDM2NDA0NX0.SlXouoiD_epPlYwPJVodUMOg7tK0NIWJwD2s70rmAsc";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('🚀 Gerando páginas estáticas com SEO específico do Supabase...\n');

// Buscar categorias do Supabase
async function fetchCategories() {
  const { data: categories, error } = await supabase
    .from('categories')
    .select('slug, title, description, image, schema_data');
  
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
      "url": "https://mkart.com.br",
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

// Template base HTML com metadados SEO otimizados
const createHTML = (pageData) => `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    
    <!-- SEO Meta Tags -->
    <title>${pageData.title}</title>
    <meta name="description" content="${pageData.description}" />
    <meta name="keywords" content="${pageData.keywords || ''}" />
    <meta name="author" content="MK Art SEO" />
    <meta name="robots" content="index, follow" />
    
    <!-- Open Graph -->
    <meta property="og:title" content="${pageData.title}" />
    <meta property="og:description" content="${pageData.description}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://mkart.com.br${pageData.path}" />
    <meta property="og:site_name" content="MK Art SEO" />
    <meta property="og:locale" content="pt_BR" />
    <meta property="og:image" content="${pageData.image || 'https://mkart.com.br/LOGOMK.png'}" />
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${pageData.title}" />
    <meta name="twitter:description" content="${pageData.description}" />
    <meta name="twitter:image" content="${pageData.image || 'https://mkart.com.br/LOGOMK.png'}" />
    
    <!-- Canonical URL -->
    <link rel="canonical" href="https://mkart.com.br${pageData.path}" />
    
    <!-- Favicon -->
    <link rel="icon" type="image/png" href="/lovable-uploads/0864d7e5-3590-4961-8de4-16e3f0249326.png" />
    
    <!-- Theme Color -->
    <meta name="theme-color" content="#0066ff" />
    
    <!-- Structured Data - Organization -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "MK Art SEO",
      "url": "https://mkart.com.br",
      "logo": "https://mkart.com.br/LOGOMK.png",
      "description": "Especialista em backlinks brasileiros de qualidade para melhorar o posicionamento no Google",
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "Customer Service",
        "availableLanguage": "Portuguese"
      },
      "sameAs": [
        "https://wa.me/5511999999999"
      ]
    }
    </script>
    
    <!-- Structured Data - Specific Page -->
    ${pageData.schema_data ? `<script type="application/ld+json">
    ${JSON.stringify(pageData.schema_data, null, 2)}
    </script>` : ''}
    
    <!-- Preconnect for Performance -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
    <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
  </head>

  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;

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
      ...data,
      path: path
    };
    
    const htmlContent = createHTML(pageData);
    fs.writeFileSync(filePath, htmlContent);
    console.log(`✅ Gerado: ${fileName}`);
  }

  // 2. Gerar páginas dinâmicas de categorias do Supabase
  console.log('\n📊 Gerando páginas de categorias do Supabase...');
  const categories = await fetchCategories();
  
  for (const category of categories) {
    const stats = await fetchBacklinkStats(category.slug);
    
    const pageData = {
      path: `/comprar-backlinks-${category.slug}`,
      title: category.title,
      description: category.description,
      keywords: `backlinks ${category.slug}, comprar backlinks ${category.slug}, links ${category.slug}, seo ${category.slug}`,
      image: category.image || 'https://mkart.com.br/LOGOMK.png',
      schema_data: {
        ...category.schema_data,
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
        }
      }
    };
    
    const fileName = `comprar-backlinks-${category.slug}.html`;
    const filePath = path.join(pagesDir, fileName);
    const htmlContent = createHTML(pageData);
    
    fs.writeFileSync(filePath, htmlContent);
    console.log(`✅ Gerado: ${fileName} (${stats.count} backlinks, DR médio: ${stats.avgDr})`);
  }

  console.log(`\n🎉 Prerendering concluído! ${Object.keys(staticPageData).length + categories.length} páginas geradas em /public/pages/`);
  console.log('📈 Páginas incluem metadados específicos, structured data e otimizações para SEO');
}

// Executar geração
generateStaticPages().catch(console.error);