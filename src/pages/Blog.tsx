import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/seo/SEOHead";
import OptimizedImage from "@/components/seo/OptimizedImage";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import StructuredData from "@/components/seo/StructuredData";
import { Calendar, Clock, Eye, MessageSquare } from "lucide-react";

interface Post {
  id: string;
  title: string;
  category: string;
  image: string;
  alt: string;
  author: string;
  date: string; // ISO
  readTime: string;
  views: number;
  comments: number;
  featured?: boolean;
}

const posts: Post[] = [
  {
    id: "black-friday-seo",
    title: "Estratégias de SEO para Black Friday: guias e táticas práticas",
    category: "Gadget",
    image: "/placeholder.svg",
    alt: "Estratégias de SEO para Black Friday em destaque",
    author: "Equipe MK Art",
    date: "2024-08-09",
    readTime: "2 min",
    views: 3776,
    comments: 6,
    featured: true,
  },
  {
    id: "podcast-seo-noticias",
    title: "Resumo semanal de SEO: atualizações e tendências que importam",
    category: "Health",
    image: "/placeholder.svg",
    alt: "Resumo semanal de SEO com gráficos coloridos",
    author: "Equipe MK Art",
    date: "2024-08-10",
    readTime: "2 min",
    views: 1205,
    comments: 4,
    featured: true,
  },
  {
    id: "yen-backlinks",
    title: "Como flutuações de mercado afetam estratégias de link building",
    category: "Gadget",
    image: "/placeholder.svg",
    alt: "Backlinks e mercado com esfera 3D",
    author: "Equipe MK Art",
    date: "2024-08-08",
    readTime: "2 min",
    views: 7887,
    comments: 3,
  },
  {
    id: "intel-antitrust-seo",
    title: "SEO técnico: o que aprendemos com grandes updates e concorrência",
    category: "Social",
    image: "/placeholder.svg",
    alt: "SEO técnico com formas geométricas 3D",
    author: "Equipe MK Art",
    date: "2024-08-07",
    readTime: "2 min",
    views: 3815,
    comments: 3,
  },
  {
    id: "streaming-video-seo",
    title: "Vídeo e SEO: quando publicar, como otimizar e medir",
    category: "Lifestyle",
    image: "/placeholder.svg",
    alt: "Tendências de vídeo com formas suaves",
    author: "Equipe MK Art",
    date: "2024-08-06",
    readTime: "2 min",
    views: 621,
    comments: 3,
  },
];

const Blog = () => {
  const featured = posts.filter((p) => p.featured);
  const regular = posts.filter((p) => !p.featured);
  const first = featured[0];

  return (
    <>
      <SEOHead
        title="Blog de SEO e Marketing Digital | MK Art"
        description="Insights práticos sobre SEO, backlinks e marketing digital. Guias, tendências e estudos de caso para aumentar tráfego e vendas."
        canonicalUrl="https://mkart.com.br/blog"
        keywords="blog seo, marketing digital, backlinks, link building, tendências seo"
        ogType="website"
      />
      {first && (
        <StructuredData
          type="article"
          data={{
            headline: first.title,
            description:
              "Artigo em destaque no blog da MK Art sobre SEO e marketing digital.",
            author: first.author,
            datePublished: first.date,
            dateModified: first.date,
            image: first.image,
            publisher: "MK Art - Agência de SEO",
            publisherLogo: "/lovable-uploads/cf1b72dd-c973-4cdf-a2f6-fd7ce7ed8d4d.png",
          }}
        />
      )}

      <Header />
      <main className="pt-20">
        <header className="container mx-auto px-4 py-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Blog de SEO e Marketing Digital
          </h1>
          <p className="mt-2 text-muted-foreground max-w-2xl">
            Aprenda com guias práticos, novidades e estratégias para crescer com SEO.
          </p>
        </header>

        {/* Destaques */}
        <section className="container mx-auto px-4">
          <div className="grid gap-6 lg:grid-cols-3">
            {featured.map((post, idx) => (
              <article
                key={post.id}
                className={idx === 0 ? "lg:col-span-2" : "lg:col-span-1"}
              >
                <a href="#" aria-label={post.title} className="block group">
                  <div className="relative overflow-hidden rounded-xl border bg-card">
                    <OptimizedImage
                      src={post.image}
                      alt={post.alt}
                      className="h-64 w-full object-cover group-hover:scale-[1.02] transition-transform"
                      sizes="(max-width: 1024px) 100vw, 66vw"
                    />
                    <div className="p-5 md:p-6">
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary">{post.category}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {post.readTime}
                        </span>
                      </div>
                      <h2 className="mt-3 text-xl md:text-2xl font-semibold group-hover:text-primary transition-colors">
                        {post.title}
                      </h2>
                      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-1"><Eye className="h-4 w-4" /> {post.views}</span>
                        <span className="inline-flex items-center gap-1"><MessageSquare className="h-4 w-4" /> {post.comments}</span>
                        <span className="inline-flex items-center gap-1"><Calendar className="h-4 w-4" /> {new Date(post.date).toLocaleDateString("pt-BR")}</span>
                        <span className="inline-flex items-center gap-1"><Clock className="h-4 w-4" /> {post.readTime}</span>
                      </div>
                    </div>
                  </div>
                </a>
              </article>
            ))}
          </div>
        </section>

        {/* Lista */}
        <section className="container mx-auto px-4 py-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {regular.map((post) => (
              <article key={post.id}>
                <Card className="overflow-hidden">
                  <a href="#" aria-label={post.title}>
                    <OptimizedImage
                      src={post.image}
                      alt={post.alt}
                      className="h-48 w-full object-cover"
                      sizes="(max-width: 1024px) 100vw, 33vw"
                    />
                  </a>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">{post.category}</Badge>
                      <span className="text-xs text-muted-foreground">{post.readTime}</span>
                    </div>
                    <a href="#" aria-label={post.title}>
                      <h3 className="mt-3 text-lg font-semibold leading-snug hover:text-primary transition-colors">
                        {post.title}
                      </h3>
                    </a>
                    <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1"><Eye className="h-4 w-4" /> {post.views}</span>
                      <span className="inline-flex items-center gap-1"><MessageSquare className="h-4 w-4" /> {post.comments}</span>
                      <span className="inline-flex items-center gap-1"><Calendar className="h-4 w-4" /> {new Date(post.date).toLocaleDateString("pt-BR")}</span>
                    </div>
                  </CardContent>
                </Card>
              </article>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default Blog;
