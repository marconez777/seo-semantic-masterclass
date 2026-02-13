import { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/seo/SEOHead";
import StructuredData from "@/components/seo/StructuredData";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import BlogCard from "@/components/blog/BlogCard";
import BlogSidebar from "@/components/blog/BlogSidebar";
import { PaginationBar } from "@/components/ui/pagination-bar";
import { supabase } from "@/integrations/supabase/client";

interface PostDb {
  id: string;
  title: string;
  slug: string;
  cover_image: string | null;
  excerpt: string | null;
  created_at: string | null;
}

const PAGE_SIZE = 15;

const Blog = () => {
  const [posts, setPosts] = useState<PostDb[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        const from = (page - 1) * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;

        const { data, error: queryError, count } = await supabase
          .from("posts")
          .select("id,title,slug,cover_image,excerpt,created_at", { count: "exact" })
          .eq("published", true)
          .order("created_at", { ascending: false })
          .range(from, to)
          .abortSignal(controller.signal);
        
        if (queryError) {
          setError(queryError.message);
        } else {
          setPosts(data || []);
          setTotal(count ?? 0);
        }
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          setError('Erro inesperado ao carregar posts');
        }
      }
      setLoading(false);
    };

    fetchPosts();
    return () => controller.abort();
  }, [page]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <SEOHead
        title="Blog de SEO e Marketing Digital | MK Art"
        description="Insights práticos sobre SEO, backlinks e marketing digital. Guias, tendências e estudos de caso para aumentar tráfego e vendas."
        canonicalUrl="https://mkart.com.br/blog"
        keywords="blog seo, marketing digital, backlinks, link building, tendências seo"
        ogType="website"
      />

      <StructuredData
        type="website"
        data={{
          name: "Blog MK Art SEO",
          url: "https://mkart.com.br/blog",
          description: "Blog especializado em SEO, backlinks e marketing digital com guias práticos e estratégias."
        }}
      />

      <Header />
      <main className="pt-20 min-h-screen">
        {/* Breadcrumbs */}
        <div className="container mx-auto px-4 py-4">
          <Breadcrumbs
            items={[
              { name: "Início", url: "/" },
              { name: "Blog", url: "/blog" }
            ]}
          />
        </div>

        {/* Hero Section */}
        <header className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Blog dos Backlinks
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Aprenda com guias práticos, novidades e estratégias para crescer com SEO e aumentar o tráfego do seu site.
          </p>
        </header>

        {/* Main Content */}
        <section className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Blog Posts */}
            <div className="lg:col-span-2">
              {loading && (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-2 text-muted-foreground">Carregando posts...</span>
                </div>
              )}
              
              {error && (
                <div className="text-center py-12">
                  <p className="text-destructive">Erro ao carregar posts: {error}</p>
                </div>
              )}

              {!loading && posts.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-xl font-semibold mb-2">Nenhum post encontrado</h3>
                  <p className="text-muted-foreground">Em breve publicaremos novos conteúdos sobre SEO e marketing digital.</p>
                </div>
              )}

              <div className="grid gap-8">
                {posts.map((post, index) => (
                  <BlogCard
                    key={post.id}
                    post={{
                      id: post.id,
                      title: post.title,
                      slug: post.slug,
                      featured_image_url: post.cover_image,
                      seo_description: post.excerpt,
                      created_at: post.created_at ?? '',
                    }}
                    variant={index === 0 && page === 1 ? "featured" : "default"}
                  />
                ))}
              </div>

              {total > PAGE_SIZE && (
                <div className="mt-8">
                  <PaginationBar
                    page={page}
                    pageSize={PAGE_SIZE}
                    total={total}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <BlogSidebar />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default Blog;
