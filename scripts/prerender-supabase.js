import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { processTemplate } from './html-template.js';
import { seoContent } from '../src/lib/seo-content.js';

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
    .select('slug, title, description, image, schema_data, h1, intro, seo_html');
  
  if (error) {
    console.error('Erro ao buscar categorias:', error);
    return [];
  }
  
  console.log(`✅ ${categories.length} categorias encontradas no Supabase`);
  return categories;
}

// Metadados para páginas fixas
const staticPageData = {
  '/': {
    title: 'MK Art SEO - Comprar Backlinks Brasileiros de Qualidade DR 50+',
    description: 'Especialista em backlinks brasileiros de qualidade. Compre links de sites com DR 50+ para melhorar seu posicionamento no Google. Entrega garantida.',
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
  for (const [pagePath, data] of Object.entries(staticPageData)) {
    const fileName = pagePath === '/' ? 'index.html' : pagePath.replace('/', '') + '.html';
    const filePath = path.join(pagesDir, fileName);
    
    const templateData = {
      title: data.title,
      description: data.description,
      canonical: `https://mkart.com.br${pagePath}`,
      url: `https://mkart.com.br${pagePath}`,
      h1: data.title,
      intro: data.description,
      jsonLd: JSON.stringify(data.schema_data, null, 2),
      ogImage: 'https://mkart.com.br/LOGOMK.png',
      seoBody: '' // No extra content for static pages
    };
    
    const htmlContent = processTemplate(templateData);
    fs.writeFileSync(filePath, htmlContent);
    console.log(`✅ Gerado: ${fileName}`);
  }

  // 2. Gerar páginas dinâmicas de categorias do Supabase
  console.log('\n📊 Gerando páginas de categorias do Supabase...');
  const categories = await fetchCategories();
  
  for (const category of categories) {
    const pagePath = `/comprar-backlinks-${category.slug}`;
    
    const templateData = {
      title: category.title,
      description: category.description,
      canonical: `https://mkart.com.br${pagePath}`,
      url: `https://mkart.com.br${pagePath}`,
      h1: category.h1 || category.title,
      intro: category.intro || category.description,
      jsonLd: JSON.stringify(category.schema_data, null, 2),
      ogImage: category.image || 'https://mkart.com.br/LOGOMK.png',
      seoBody: category.seo_html || seoContent[category.slug] || ''
    };

    const fileName = `comprar-backlinks-${category.slug}.html`;
    const filePath = path.join(pagesDir, fileName);
    const htmlContent = processTemplate(templateData);
    
    fs.writeFileSync(filePath, htmlContent);
    console.log(`✅ Gerado: ${fileName}`);
  }

  console.log(`\n🎉 Prerendering concluído! ${Object.keys(staticPageData).length + categories.length} páginas geradas em /public/pages/`);
  console.log('📈 Páginas incluem metadados específicos, structured data e otimizações para SEO');
}

// Executar geração
generateStaticPages().catch(console.error);