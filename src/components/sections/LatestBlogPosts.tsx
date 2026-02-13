import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import OptimizedImage from "@/components/seo/OptimizedImage";
import { supabase } from "@/integrations/supabase/client";

interface PostDb {
  id: string;
  title: string;
  slug: string;
  cover_image: string | null;
  excerpt: string | null;
  created_at: string | null;
}

const cardColors = [
  "from-purple-400 to-purple-600",
  "from-green-400 to-green-600",
  "from-blue-400 to-blue-600",
  "from-orange-400 to-orange-600",
  "from-red-400 to-red-600",
  "from-indigo-400 to-indigo-600",
];

const LatestBlogPosts = () => {
  const [posts, setPosts] = useState<PostDb[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatest = async () => {
      const { data } = await supabase
        .from("posts")
        .select("id,title,slug,cover_image,excerpt,created_at")
        .eq("published", true)
        .order("created_at", { ascending: false })
        .limit(3);

      setPosts(data || []);
      setLoading(false);
    };
    fetchLatest();
  }, []);

  if (loading || posts.length === 0) return null;

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">
          Últimos Posts do Blog
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {posts.map((post) => {
            const colorIndex = parseInt(post.id.slice(-1), 16) % cardColors.length;
            return (
              <article key={post.id}>
                <Card className="overflow-hidden group h-full flex flex-col">
                  <a href={`/blog/${post.slug}`} aria-label={post.title}>
                    {post.cover_image ? (
                      <OptimizedImage
                        src={post.cover_image}
                        alt={`Imagem do post: ${post.title}`}
                        className="h-48 w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    ) : (
                      <div
                        className={`h-48 w-full bg-gradient-to-br ${cardColors[colorIndex]} flex items-center justify-center group-hover:scale-105 transition-transform duration-300`}
                      >
                        <span className="text-white text-5xl">📝</span>
                      </div>
                    )}
                  </a>

                  <CardContent className="p-5 flex flex-col flex-1">
                    <a href={`/blog/${post.slug}`} aria-label={post.title}>
                      <h3 className="text-lg font-bold leading-snug hover:text-primary transition-colors mb-2 line-clamp-2">
                        {post.title}
                      </h3>
                    </a>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-1">
                      {post.excerpt || ""}
                    </p>
                    <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {post.created_at
                        ? new Date(post.created_at).toLocaleDateString("pt-BR")
                        : ""}
                    </span>
                  </CardContent>
                </Card>
              </article>
            );
          })}
        </div>

        <div className="text-center mt-10">
          <Button asChild variant="outline" size="lg">
            <Link to="/blog">Ver todos os posts</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default LatestBlogPosts;
