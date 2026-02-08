import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/seo/SEOHead";
import StructuredData from "@/components/seo/StructuredData";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import BlogPostHeader from "@/components/blog/BlogPostHeader";
import SocialShare from "@/components/blog/SocialShare";
import BlogSidebar from "@/components/blog/BlogSidebar";
import { supabase } from "@/integrations/supabase/client";

interface DbPost {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  cover_image: string | null;
  excerpt: string | null;
  created_at: string | null;
  updated_at: string | null;
  category: string | null;
}

function usePost(slug?: string) {
  const [post, setPost] = useState<DbPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("posts")
        .select("id,title,slug,content,cover_image,excerpt,created_at,updated_at,category")
        .eq("slug", slug)
        .eq("published", true)
        .maybeSingle();
      if (error) setError(error.message);
      setPost(data ?? null);
      setLoading(false);
    })();
  }, [slug]);

  return { post, loading, error };
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const { post, loading, error } = usePost(slug);

  if (loading) {
    return (
      <>
        <Header />
        <main className="pt-20 min-h-screen">
          <div className="container mx-auto px-4 py-8 flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2 text-muted-foreground">Carregando post...</span>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <main className="pt-20 min-h-screen">
          <div className="container mx-auto px-4 py-8 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold mb-2">Erro ao carregar post</h1>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!post) {
    return (
      <>
        <Header />
        <main className="pt-20 min-h-screen">
          <div className="container mx-auto px-4 py-8 text-center">
            <div className="text-6xl mb-4">📄</div>
            <h1 className="text-2xl font-bold mb-2">Post não encontrado</h1>
            <p className="text-muted-foreground">O post que você está procurando não existe.</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const postUrl = `${window.location.origin}/blog/${post.slug}`;

  return (
    <>
      <SEOHead
        title={post.title}
        description={post.excerpt || ""}
        canonicalUrl={postUrl}
        keywords="blog seo, marketing digital, backlinks, link building"
        ogImage={post.cover_image || undefined}
        ogType="article"
      />

      <StructuredData
        type="article"
        data={{
          headline: post.title,
          description: post.excerpt,
          author: "MK Art SEO",
          datePublished: post.created_at,
          dateModified: post.updated_at,
          image: post.cover_image,
          publisher: "MK Art SEO",
          publisherLogo: "https://mkart.com.br/logo.png"
        }}
      />

      <Header />
      <main className="pt-20 min-h-screen">
        {/* Breadcrumbs */}
        <div className="container mx-auto px-4 py-4">
          <Breadcrumbs
            items={[
              { name: "Início", url: "/" },
              { name: "Blog", url: "/blog" },
              { name: post.title, url: `/blog/${post.slug}` }
            ]}
          />
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <article className="lg:col-span-2">
              <BlogPostHeader
                title={post.title}
                category={post.category ?? undefined}
                publishDate={post.created_at ?? ''}
                readTime="8"
                featuredImage={post.cover_image}
              />

              {/* Social Share */}
              <SocialShare
                url={postUrl}
                title={post.title}
                views={5332}
                comments={0}
              />

              {/* Content - supports both HTML and Markdown */}
              <div className="prose prose-lg max-w-none dark:prose-invert mt-8">
                {post.content?.startsWith('<') ? (
                  <div dangerouslySetInnerHTML={{ __html: post.content }} />
                ) : (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {post.content ?? ''}
                  </ReactMarkdown>
                )}
              </div>

              {/* Bottom Social Share */}
              <div className="mt-8">
                <SocialShare
                  url={postUrl}
                  title={post.title}
                  views={5332}
                  comments={0}
                />
              </div>
            </article>

            {/* Sidebar */}
            <aside className="lg:col-span-1">
              <BlogSidebar />
            </aside>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
}
