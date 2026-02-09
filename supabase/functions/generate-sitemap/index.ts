import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const BASE_URL = 'https://mkart.com.br'

const staticPages = [
  { loc: '/', changefreq: 'weekly', priority: '1.0' },
  { loc: '/comprar-backlinks', changefreq: 'weekly', priority: '0.9' },
  { loc: '/blog', changefreq: 'daily', priority: '0.8' },
  { loc: '/agencia-de-backlinks', changefreq: 'monthly', priority: '0.7' },
  { loc: '/consultoria-seo', changefreq: 'monthly', priority: '0.7' },
  { loc: '/consultoria-seo-saas', changefreq: 'monthly', priority: '0.7' },
  { loc: '/contato', changefreq: 'monthly', priority: '0.6' },
  { loc: '/comprar-backlinks-tecnologia', changefreq: 'weekly', priority: '0.8' },
  { loc: '/comprar-backlinks-financas', changefreq: 'weekly', priority: '0.8' },
  { loc: '/comprar-backlinks-saude', changefreq: 'weekly', priority: '0.8' },
  { loc: '/comprar-backlinks-moda', changefreq: 'weekly', priority: '0.8' },
  { loc: '/comprar-backlinks-noticias', changefreq: 'weekly', priority: '0.8' },
  { loc: '/comprar-backlinks-negocios', changefreq: 'weekly', priority: '0.8' },
  { loc: '/comprar-backlinks-educacao', changefreq: 'weekly', priority: '0.8' },
  { loc: '/comprar-backlinks-turismo', changefreq: 'weekly', priority: '0.8' },
  { loc: '/comprar-backlinks-automoveis', changefreq: 'weekly', priority: '0.8' },
  { loc: '/comprar-backlinks-alimentacao', changefreq: 'weekly', priority: '0.8' },
  { loc: '/comprar-backlinks-pets', changefreq: 'weekly', priority: '0.8' },
  { loc: '/comprar-backlinks-esportes', changefreq: 'weekly', priority: '0.8' },
  { loc: '/comprar-backlinks-entretenimento', changefreq: 'weekly', priority: '0.8' },
  { loc: '/comprar-backlinks-marketing', changefreq: 'weekly', priority: '0.8' },
  { loc: '/comprar-backlinks-direito', changefreq: 'weekly', priority: '0.8' },
  { loc: '/comprar-backlinks-imoveis', changefreq: 'weekly', priority: '0.8' },
  { loc: '/comprar-backlinks-maternidade', changefreq: 'weekly', priority: '0.8' },
]

function toDate(d: string | null) {
  if (!d) return new Date().toISOString().split('T')[0]
  return new Date(d).toISOString().split('T')[0]
}

function escapeXml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')
}

Deno.serve(async () => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Fetch published blog posts
    const { data: posts } = await supabase
      .from('posts')
      .select('slug, updated_at, published_at')
      .eq('published', true)
      .order('published_at', { ascending: false })

    // Fetch SEO pages
    const { data: seoPages } = await supabase
      .from('page_seo_content')
      .select('page_slug, updated_at')

    const today = new Date().toISOString().split('T')[0]

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`

    // Static pages
    for (const page of staticPages) {
      xml += `  <url>
    <loc>${escapeXml(BASE_URL + page.loc)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`
    }

    // Blog posts
    if (posts) {
      for (const post of posts) {
        xml += `  <url>
    <loc>${escapeXml(BASE_URL + '/blog/' + post.slug)}</loc>
    <lastmod>${toDate(post.updated_at || post.published_at)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
`
      }
    }

    // Dynamic SEO pages (categories managed via admin)
    if (seoPages) {
      const staticSlugs = new Set(staticPages.map(p => p.loc.replace('/', '')))
      for (const page of seoPages) {
        // Skip if already in static pages
        if (staticSlugs.has(page.page_slug) || page.page_slug === '' || page.page_slug === '/') continue
        const slug = page.page_slug.startsWith('/') ? page.page_slug : '/' + page.page_slug
        xml += `  <url>
    <loc>${escapeXml(BASE_URL + slug)}</loc>
    <lastmod>${toDate(page.updated_at)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
`
      }
    }

    xml += `</urlset>`

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (error) {
    console.error('Sitemap generation error:', error)
    return new Response('Error generating sitemap', { status: 500 })
  }
})
