import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/seo/SEOHead";
import OptimizedImage from "@/components/seo/OptimizedImage";
import StructuredData from "@/components/seo/StructuredData";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Calendar } from "lucide-react";

interface DbPost {
  id: string;
  title: string;
  slug: string;
  content_md: string;
  featured_image_url: string | null;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
}

const siteBase = "https://mkart.com.br";

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
        .select("id,title,slug,content_md,featured_image_url,seo_title,seo_description,created_at,updated_at")
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

function excerpt(md?: string, len = 150) {
  if (!md) return "";
  const text = md
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/\!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/[\*_>#-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.slice(0, len);
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const { post, loading, error } = usePost(slug);

  const metaTitle = useMemo(() => post?.seo_title || post?.title || "Post do Blog", [post]);
  const metaDesc = useMemo(() => post?.seo_description || excerpt(post?.content_md, 160), [post]);
  const canonical = useMemo(() => `${siteBase}/blog/${slug ?? ""}`.replace(/\/$/, ""), [slug]);

  return (
    <>
      <SEOHead
        title={`${metaTitle} | MK Art`}
        description={metaDesc}
        canonicalUrl={canonical}
        keywords="blog seo, marketing digital, backlinks, link building"
        ogType="article"
      />
      {post && (
        <StructuredData
          type="article"
          data={{
            headline: post.title,
            description: metaDesc,
            datePublished: post.created_at,
            dateModified: post.updated_at,
            image: post.featured_image_url || "/placeholder.svg",
            publisher: "MK Art - Agência de SEO",
            publisherLogo: "/lovable-uploads/cf1b72dd-c973-4cdf-a2f6-fd7ce7ed8d4d.png",
          }}
        />
      )}

      <Header />
      <main className="pt-20">
        <header className="container mx-auto px-4 py-8">
          <nav className="mb-4 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary transition-colors">Início</Link>
            <span className="mx-2">/</span>
            <Link to="/blog" className="hover:text-primary transition-colors">Blog</Link>
          </nav>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            {loading ? "Carregando…" : post?.title || "Post não encontrado"}
          </h1>
          {post && (
            <p className="mt-2 text-muted-foreground inline-flex items-center gap-2">
              <Calendar className="h-4 w-4" /> {new Date(post.created_at).toLocaleDateString("pt-BR")}
            </p>
          )}
        </header>

        {error && (
          <section className="container mx-auto px-4 pb-12">
            <p className="text-destructive">{error}</p>
          </section>
        )}

        {post && (
          <article className="container mx-auto px-4 pb-16">
            {post.featured_image_url && (
              <div className="overflow-hidden rounded-xl border bg-card mb-6">
                <OptimizedImage
                  src={post.featured_image_url}
                  alt={`Imagem do post: ${post.title}`}
                  className="h-72 w-full object-cover"
                  sizes="(max-width: 1024px) 100vw, 960px"
                />
              </div>
            )}

            <div className="prose max-w-none dark:prose-invert">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content_md}</ReactMarkdown>
            </div>
          </article>
        )}
      </main>
      <Footer />
    </>
  );
}
