import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lista de todas as rotas importantes para prerender
const routes = [
  {
    path: '/',
    title: 'MK Art SEO - Comprar Backlinks Brasileiros de Qualidade DR 50+',
    description: 'Especialista em backlinks brasileiros de qualidade. Compre links de sites com DR 50+ para melhorar seu posicionamento no Google. Entrega garantida.',
    keywords: 'backlinks brasileiros, comprar backlinks, links de qualidade, seo, posicionamento google'
  },
  {
    path: '/comprar-backlinks',
    title: 'Comprar Backlinks - Sites Brasileiros DR 50+ | MK Art SEO',
    description: 'Compre backlinks de qualidade em sites brasileiros com DR 50+. Melhore seu posicionamento no Google com nossa rede de sites confiáveis.',
    keywords: 'comprar backlinks, backlinks brasileiros, links qualidade, seo brasil'
  },
  {
    path: '/comprar-backlinks-tecnologia',
    title: 'Comprar Backlinks Tecnologia - Sites de Tecnologia DR 50+ | MK Art SEO',
    description: 'Compre backlinks de qualidade em sites de tecnologia com DR 50+. Melhore seu posicionamento no Google com links de sites confiáveis do nicho tech.',
    keywords: 'backlinks tecnologia, comprar backlinks tech, links sites tecnologia, seo tecnologia'
  },
  {
    path: '/comprar-backlinks-noticias',
    title: 'Comprar Backlinks Notícias - Sites de Notícias DR 50+ | MK Art SEO',
    description: 'Compre backlinks de qualidade em sites de notícias com DR 50+. Ganhe autoridade com links de portais de notícias confiáveis e respeitados.',
    keywords: 'backlinks noticias, comprar backlinks jornais, links sites noticias, seo jornalismo'
  },
  {
    path: '/comprar-backlinks-financas',
    title: 'Comprar Backlinks Finanças - Sites Financeiros DR 50+ | MK Art SEO',
    description: 'Compre backlinks de qualidade em sites de finanças com DR 50+. Melhore seu SEO no nicho financeiro com links de sites especializados.',
    keywords: 'backlinks financas, comprar backlinks financeiros, links sites financas, seo financeiro'
  },
  {
    path: '/comprar-backlinks-negocios',
    title: 'Comprar Backlinks Negócios - Sites Empresariais DR 50+ | MK Art SEO',
    description: 'Compre backlinks de qualidade em sites de negócios com DR 50+. Fortaleça sua autoridade empresarial com links de sites corporativos.',
    keywords: 'backlinks negocios, comprar backlinks empresariais, links sites negocios, seo empresarial'
  },
  {
    path: '/comprar-backlinks-moda',
    title: 'Comprar Backlinks Moda - Sites de Moda DR 50+ | MK Art SEO',
    description: 'Compre backlinks de qualidade em sites de moda com DR 50+. Melhore seu posicionamento no nicho fashion com links especializados.',
    keywords: 'backlinks moda, comprar backlinks fashion, links sites moda, seo moda'
  },
  {
    path: '/comprar-backlinks-educacao',
    title: 'Comprar Backlinks Educação - Sites Educacionais DR 50+ | MK Art SEO',
    description: 'Compre backlinks de qualidade em sites de educação com DR 50+. Ganhe autoridade educacional com links de portais especializados.',
    keywords: 'backlinks educacao, comprar backlinks educacionais, links sites educacao, seo educacional'
  },
  {
    path: '/comprar-backlinks-turismo',
    title: 'Comprar Backlinks Turismo - Sites de Viagem DR 50+ | MK Art SEO',
    description: 'Compre backlinks de qualidade em sites de turismo com DR 50+. Melhore seu SEO no nicho de viagens com links especializados.',
    keywords: 'backlinks turismo, comprar backlinks viagem, links sites turismo, seo turismo'
  },
  {
    path: '/comprar-backlinks-automoveis',
    title: 'Comprar Backlinks Automóveis - Sites Automotivos DR 50+ | MK Art SEO',
    description: 'Compre backlinks de qualidade em sites automotivos com DR 50+. Fortaleça sua presença no nicho automotivo com links especializados.',
    keywords: 'backlinks automoveis, comprar backlinks automotivos, links sites carros, seo automotivo'
  },
  {
    path: '/comprar-backlinks-saude',
    title: 'Comprar Backlinks Saúde - Sites de Saúde DR 50+ | MK Art SEO',
    description: 'Compre backlinks de qualidade em sites de saúde com DR 50+. Melhore sua autoridade no nicho médico com links confiáveis.',
    keywords: 'backlinks saude, comprar backlinks medicos, links sites saude, seo medico'
  },
  {
    path: '/comprar-backlinks-direito',
    title: 'Comprar Backlinks Direito - Sites Jurídicos DR 50+ | MK Art SEO',
    description: 'Compre backlinks de qualidade em sites jurídicos com DR 50+. Fortaleça sua autoridade legal com links de sites especializados.',
    keywords: 'backlinks direito, comprar backlinks juridicos, links sites direito, seo juridico'
  },
  {
    path: '/comprar-backlinks-alimentacao',
    title: 'Comprar Backlinks Alimentação - Sites de Gastronomia DR 50+ | MK Art SEO',
    description: 'Compre backlinks de qualidade em sites de alimentação com DR 50+. Melhore seu SEO no nicho gastronômico com links especializados.',
    keywords: 'backlinks alimentacao, comprar backlinks gastronomia, links sites culinaria, seo gastronomia'
  },
  {
    path: '/comprar-backlinks-pets',
    title: 'Comprar Backlinks Pets - Sites de Animais DR 50+ | MK Art SEO',
    description: 'Compre backlinks de qualidade em sites de pets com DR 50+. Fortaleça sua presença no nicho pet com links especializados.',
    keywords: 'backlinks pets, comprar backlinks animais, links sites pets, seo pet'
  },
  {
    path: '/comprar-backlinks-esportes',
    title: 'Comprar Backlinks Esportes - Sites Esportivos DR 50+ | MK Art SEO',
    description: 'Compre backlinks de qualidade em sites de esportes com DR 50+. Melhore seu SEO no nicho esportivo com links especializados.',
    keywords: 'backlinks esportes, comprar backlinks esportivos, links sites esportes, seo esportivo'
  },
  {
    path: '/comprar-backlinks-entretenimento',
    title: 'Comprar Backlinks Entretenimento - Sites de Entretenimento DR 50+ | MK Art SEO',
    description: 'Compre backlinks de qualidade em sites de entretenimento com DR 50+. Fortaleça sua presença no nicho de entretenimento.',
    keywords: 'backlinks entretenimento, comprar backlinks diversao, links sites entretenimento, seo entretenimento'
  },
  {
    path: '/comprar-backlinks-marketing',
    title: 'Comprar Backlinks Marketing - Sites de Marketing DR 50+ | MK Art SEO',
    description: 'Compre backlinks de qualidade em sites de marketing com DR 50+. Melhore seu SEO no nicho de marketing digital.',
    keywords: 'backlinks marketing, comprar backlinks marketing digital, links sites marketing, seo marketing'
  },
  {
    path: '/comprar-backlinks-imoveis',
    title: 'Comprar Backlinks Imóveis - Sites Imobiliários DR 50+ | MK Art SEO',
    description: 'Compre backlinks de qualidade em sites imobiliários com DR 50+. Fortaleça sua presença no mercado imobiliário.',
    keywords: 'backlinks imoveis, comprar backlinks imobiliarios, links sites imoveis, seo imobiliario'
  },
  {
    path: '/comprar-backlinks-maternidade',
    title: 'Comprar Backlinks Maternidade - Sites de Maternidade DR 50+ | MK Art SEO',
    description: 'Compre backlinks de qualidade em sites de maternidade com DR 50+. Melhore seu SEO no nicho materno infantil.',
    keywords: 'backlinks maternidade, comprar backlinks materno, links sites maternidade, seo materno'
  },
  {
    path: '/agencia-de-backlinks',
    title: 'Agência de Backlinks - Serviços Profissionais de Link Building | MK Art SEO',
    description: 'Agência especializada em link building com sites brasileiros DR 50+. Serviços profissionais de SEO e construção de autoridade.',
    keywords: 'agencia backlinks, servicos link building, agencia seo, link building brasil'
  },
  {
    path: '/consultoria-seo',
    title: 'Consultoria SEO - Especialista em Posicionamento Google | MK Art SEO',
    description: 'Consultoria SEO especializada em posicionamento no Google. Estratégias personalizadas para melhorar seu ranking e aumentar o tráfego.',
    keywords: 'consultoria seo, consultor seo, posicionamento google, estrategia seo'
  },
  {
    path: '/contato',
    title: 'Contato - Entre em Contato com a MK Art SEO',
    description: 'Entre em contato conosco para solicitar orçamento de backlinks ou consultoria SEO. Atendimento especializado e personalizado.',
    keywords: 'contato seo, orcamento backlinks, falar com consultor seo'
  },
  {
    path: '/blog',
    title: 'Blog SEO - Dicas e Estratégias de Posicionamento | MK Art SEO',
    description: 'Blog com dicas, estratégias e novidades sobre SEO, backlinks e marketing digital. Conteúdo especializado para melhorar seu ranking.',
    keywords: 'blog seo, dicas seo, estrategias seo, marketing digital'
  }
];

// Template base HTML com metadados SEO
const createHTML = (route) => `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    
    <!-- SEO Meta Tags -->
    <title>${route.title}</title>
    <meta name="description" content="${route.description}" />
    <meta name="keywords" content="${route.keywords}" />
    <meta name="author" content="MK Art SEO" />
    <meta name="robots" content="index, follow" />
    
    <!-- Open Graph -->
    <meta property="og:title" content="${route.title}" />
    <meta property="og:description" content="${route.description}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://mkart.com.br${route.path}" />
    <meta property="og:site_name" content="MK Art SEO" />
    <meta property="og:locale" content="pt_BR" />
    <meta property="og:image" content="https://mkart.com.br/LOGOMK.png" />
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${route.title}" />
    <meta name="twitter:description" content="${route.description}" />
    <meta name="twitter:image" content="https://mkart.com.br/LOGOMK.png" />
    
    <!-- Canonical URL -->
    <link rel="canonical" href="https://mkart.com.br${route.path}" />
    
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
    
    <!-- Structured Data - Website -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "MK Art SEO",
      "url": "https://mkart.com.br",
      "description": "Compre backlinks brasileiros de alta qualidade para seu site",
      "potentialAction": {
        "@type": "SearchAction",
        "@target": "https://mkart.com.br/comprar-backlinks?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    }
    </script>
    
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

// Criar diretório de páginas se não existir
const pagesDir = path.join(__dirname, '..', 'public', 'pages');
if (!fs.existsSync(pagesDir)) {
  fs.mkdirSync(pagesDir, { recursive: true });
}

// Gerar arquivos HTML para cada rota
routes.forEach(route => {
  const fileName = route.path.replace('/', '') + '.html';
  const filePath = path.join(pagesDir, fileName);
  const htmlContent = createHTML(route);
  
  fs.writeFileSync(filePath, htmlContent);
  console.log(`✅ Gerado: ${fileName}`);
});

console.log(`\n🎉 Prerendering concluído! ${routes.length} páginas geradas em /public/pages/`);