import { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/seo/SEOHead";
import OptimizedImage from "@/components/seo/OptimizedImage";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface PostDb {
  id: string;
  title: string;
  slug: string;
  featured_image_url: string | null;
  seo_description: string | null;
  created_at: string;
}

const Blog = () => {
  const [posts, setPosts] = useState<PostDb[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("id,title,slug,featured_image_url,seo_description,created_at")
        .eq("published", true)
        .order("created_at", { ascending: false });
      if (error) setError(error.message);
      setPosts(data || []);
      setLoading(false);
    })();
  }, []);

  return (
    <>
      <SEOHead
        title="Blog de SEO e Marketing Digital | MK Art"
        description="Insights práticos sobre SEO, backlinks e marketing digital. Guias, tendências e estudos de caso para aumentar tráfego e vendas."
        canonicalUrl="https://mkart.com.br/blog"
        keywords="blog seo, marketing digital, backlinks, link building, tendências seo"
        ogType="website"
      />

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

        <section className="container mx-auto px-4 py-8">
          {loading && <p>Carregando…</p>}
          {error && <p className="text-destructive">{error}</p>}

          {!loading && posts.length === 0 && (
            <p className="text-muted-foreground">Nenhum post publicado ainda.</p>
          )}

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <article key={post.id}>
                <Card className="overflow-hidden">
                  <a href={`/blog/${post.slug}`} aria-label={post.title}>
                    <OptimizedImage
                      src={post.featured_image_url || "/placeholder.svg"}
                      alt={`Imagem do post: ${post.title}`}
                      className="h-48 w-full object-cover"
                      sizes="(max-width: 1024px) 100vw, 33vw"
                    />
                  </a>
                  <CardContent className="p-4">
                    <a href={`/blog/${post.slug}`} aria-label={post.title}>
                      <h3 className="mt-1 text-lg font-semibold leading-snug hover:text-primary transition-colors">
                        {post.title}
                      </h3>
                    </a>
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                      {post.seo_description || ""}
                    </p>
                    <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-4 w-4" /> {new Date(post.created_at).toLocaleDateString("pt-BR")}
                      </span>
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
