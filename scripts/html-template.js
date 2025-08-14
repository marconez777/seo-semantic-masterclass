export const htmlTemplate = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{TITLE}} | Backlinks Premium</title>
  <meta name="description" content="{{DESCRIPTION}}">
  <link rel="canonical" href="{{CANONICAL}}">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="article">
  <meta property="og:url" content="{{URL}}">
  <meta property="og:title" content="{{TITLE}} | Backlinks Premium">
  <meta property="og:description" content="{{DESCRIPTION}}">
  <meta property="og:site_name" content="Backlinks Premium">
  {{OG_IMAGE_META}}
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="{{URL}}">
  <meta name="twitter:title" content="{{TITLE}} | Backlinks Premium">
  <meta name="twitter:description" content="{{DESCRIPTION}}">
  {{TWITTER_IMAGE_META}}
  
  <!-- Additional SEO -->
  <meta name="robots" content="index, follow">
  <meta name="author" content="Backlinks Premium">
  <link rel="icon" type="image/x-icon" href="/favicon.ico">
  
  <!-- Preconnect to improve performance -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  
  <!-- BEGIN CRITICAL CSS -->
  <style>
    {{CRITICAL_CSS}}
  </style>
  <!-- END CRITICAL CSS -->
  
  <!-- Structured Data -->
  <script type="application/ld+json">{{JSON_LD}}</script>
</head>
<body>
  <!-- Skip to main content for accessibility -->
  <a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded">
    Pular para o conteúdo principal
  </a>

  <!-- Header -->
  <header role="banner" class="header">
    <nav class="nav" role="navigation" aria-label="Navegação principal">
      <div class="nav-container">
        <a href="/" class="logo" aria-label="Backlinks Premium - Página inicial">
          <strong>Backlinks Premium</strong>
        </a>
        <ul class="nav-menu" role="menubar">
          <li role="none">
            <a href="/comprar-backlinks" role="menuitem">Comprar Backlinks</a>
          </li>
          <li role="none">
            <a href="/agencia-de-backlinks" role="menuitem">Agência</a>
          </li>
          <li role="none">
            <a href="/consultoria-seo" role="menuitem">Consultoria SEO</a>
          </li>
          <li role="none">
            <a href="/blog" role="menuitem">Blog</a>
          </li>
          <li role="none">
            <a href="/contato" role="menuitem">Contato</a>
          </li>
        </ul>
      </div>
    </nav>
  </header>

  <!-- Main Content -->
  <main id="main-content" role="main" class="main">
    <article class="article">
      <header class="article-header">
        <h1 class="article-title">{{H1}}</h1>
        <p class="article-intro">{{INTRO}}</p>
      </header>
      
      <section class="content-section" aria-labelledby="content-heading">
        <h2 id="content-heading" class="section-title">Backlinks de Qualidade Premium</h2>
        <p class="section-text">
          Encontre os melhores backlinks para impulsionar seu SEO. Nossa plataforma oferece 
          links de alta qualidade, com métricas transparentes e entrega garantida.
        </p>
        
        <div class="cta-section">
          <a href="/comprar-backlinks" class="cta-button" role="button">
            Ver Backlinks Disponíveis
          </a>
          <a href="/categorias" class="secondary-button" role="button">
            Ver Mais Categorias
          </a>
        </div>
      </section>

      <section class="features-section" aria-labelledby="features-heading">
        <h2 id="features-heading" class="section-title">Por Que Escolher Nossos Backlinks?</h2>
        <div class="features-grid">
          <div class="feature-item">
            <h3 class="feature-title">Alta Autoridade</h3>
            <p class="feature-text">Sites com DR e DA elevados para máximo impacto SEO</p>
          </div>
          <div class="feature-item">
            <h3 class="feature-title">Entrega Rápida</h3>
            <p class="feature-text">Publicação em até 7 dias úteis com comprovante</p>
          </div>
          <div class="feature-item">
            <h3 class="feature-title">Suporte 24/7</h3>
            <p class="feature-text">Equipe especializada sempre disponível para ajudar</p>
          </div>
        </div>
      </section>
    </article>
  </main>

  <!-- Footer -->
  <footer role="contentinfo" class="footer">
    <div class="footer-container">
      <div class="footer-content">
        <div class="footer-section">
          <h3 class="footer-title">Backlinks Premium</h3>
          <p class="footer-text">
            A melhor plataforma para comprar backlinks de qualidade e 
            impulsionar seu ranking no Google.
          </p>
        </div>
        
        <div class="footer-section">
          <h4 class="footer-subtitle">Navegação</h4>
          <nav class="footer-nav" aria-label="Navegação do rodapé">
            <ul class="footer-menu">
              <li><a href="/comprar-backlinks">Comprar Backlinks</a></li>
              <li><a href="/agencia-de-backlinks">Agência</a></li>
              <li><a href="/consultoria-seo">Consultoria SEO</a></li>
              <li><a href="/blog">Blog</a></li>
              <li><a href="/contato">Contato</a></li>
            </ul>
          </nav>
        </div>
        
        <div class="footer-section">
          <h4 class="footer-subtitle">Categorias</h4>
          <nav class="footer-nav" aria-label="Categorias principais">
            <ul class="footer-menu">
              <li><a href="/comprar-backlinks-tecnologia">Tecnologia</a></li>
              <li><a href="/comprar-backlinks-financas">Finanças</a></li>
              <li><a href="/comprar-backlinks-saude">Saúde</a></li>
              <li><a href="/categorias">Ver Todas</a></li>
            </ul>
          </nav>
        </div>
      </div>
      
      <div class="footer-bottom">
        <p class="footer-copyright">
          © 2024 Backlinks Premium. Todos os direitos reservados.
        </p>
      </div>
    </div>
  </footer>
</body>
</html>`;

export const criticalCSS = `
/* Critical CSS - Above the fold styles only */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #fff;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.focus\\:not-sr-only:focus {
  position: static;
  width: auto;
  height: auto;
  padding: 0.5rem 1rem;
  margin: 0;
  overflow: visible;
  clip: auto;
  white-space: normal;
}

/* Header */
.header {
  background-color: #fff;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 64px;
}

.logo {
  text-decoration: none;
  color: #1f2937;
  font-size: 1.25rem;
  font-weight: 700;
}

.nav-menu {
  display: flex;
  list-style: none;
  gap: 2rem;
}

.nav-menu a {
  text-decoration: none;
  color: #4b5563;
  font-weight: 500;
  transition: color 0.2s;
}

.nav-menu a:hover {
  color: #3b82f6;
}

/* Main Content */
.main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.article-header {
  text-align: center;
  margin-bottom: 3rem;
}

.article-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: #1f2937;
  margin-bottom: 1rem;
  line-height: 1.2;
}

.article-intro {
  font-size: 1.25rem;
  color: #6b7280;
  max-width: 600px;
  margin: 0 auto;
}

.content-section {
  margin-bottom: 3rem;
}

.section-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1rem;
  text-align: center;
}

.section-text {
  font-size: 1.125rem;
  color: #4b5563;
  text-align: center;
  max-width: 700px;
  margin: 0 auto 2rem;
}

.cta-section {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.cta-button {
  display: inline-block;
  background-color: #3b82f6;
  color: white;
  padding: 0.75rem 2rem;
  border-radius: 0.5rem;
  text-decoration: none;
  font-weight: 600;
  transition: background-color 0.2s;
}

.cta-button:hover {
  background-color: #2563eb;
}

.secondary-button {
  display: inline-block;
  background-color: transparent;
  color: #3b82f6;
  padding: 0.75rem 2rem;
  border: 2px solid #3b82f6;
  border-radius: 0.5rem;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s;
}

.secondary-button:hover {
  background-color: #3b82f6;
  color: white;
}

.features-section {
  margin-top: 4rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.feature-item {
  text-align: center;
  padding: 1.5rem;
  border-radius: 0.5rem;
  background-color: #f9fafb;
}

.feature-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.feature-text {
  color: #6b7280;
}

/* Footer */
.footer {
  background-color: #1f2937;
  color: #d1d5db;
  margin-top: 4rem;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 3rem 1rem 1rem;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.footer-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
  margin-bottom: 1rem;
}

.footer-subtitle {
  font-size: 1rem;
  font-weight: 600;
  color: white;
  margin-bottom: 1rem;
}

.footer-text {
  color: #d1d5db;
  line-height: 1.6;
}

.footer-menu {
  list-style: none;
}

.footer-menu li {
  margin-bottom: 0.5rem;
}

.footer-menu a {
  color: #d1d5db;
  text-decoration: none;
  transition: color 0.2s;
}

.footer-menu a:hover {
  color: #60a5fa;
}

.footer-bottom {
  border-top: 1px solid #374151;
  padding-top: 1rem;
  text-align: center;
}

.footer-copyright {
  color: #9ca3af;
  font-size: 0.875rem;
}

/* Responsive */
@media (max-width: 768px) {
  .nav-menu {
    display: none;
  }
  
  .article-title {
    font-size: 2rem;
  }
  
  .cta-section {
    flex-direction: column;
    align-items: center;
  }
  
  .cta-button,
  .secondary-button {
    width: 100%;
    max-width: 300px;
    text-align: center;
  }
}
`;

export function processTemplate(data) {
  let html = htmlTemplate;
  
  // Replace basic placeholders
  html = html.replace(/{{TITLE}}/g, data.title || '');
  html = html.replace(/{{DESCRIPTION}}/g, data.description || '');
  html = html.replace(/{{CANONICAL}}/g, data.canonical || '');
  html = html.replace(/{{URL}}/g, data.url || '');
  html = html.replace(/{{H1}}/g, data.h1 || data.title || '');
  html = html.replace(/{{INTRO}}/g, data.intro || '');
  html = html.replace(/{{JSON_LD}}/g, data.jsonLd || '{}');
  
  // Handle conditional OG_IMAGE
  if (data.ogImage && data.ogImage.trim()) {
    html = html.replace('{{OG_IMAGE_META}}', `<meta property="og:image" content="${data.ogImage}">`);
    html = html.replace('{{TWITTER_IMAGE_META}}', `<meta name="twitter:image" content="${data.ogImage}">`);
  } else {
    html = html.replace('{{OG_IMAGE_META}}', '');
    html = html.replace('{{TWITTER_IMAGE_META}}', '');
  }
  
  // Replace critical CSS
  html = html.replace('{{CRITICAL_CSS}}', data.criticalCSS || criticalCSS);
  
  return html;
}