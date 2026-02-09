import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MessageCircle, Eye } from "lucide-react";
import OptimizedImage from "@/components/seo/OptimizedImage";

interface PostDb {
  id: string;
  title: string;
  slug: string;
  featured_image_url: string | null;
  seo_description: string | null;
  created_at: string;
  category?: string;
  views?: number;
  comments?: number;
}

interface BlogCardProps {
  post: PostDb;
  variant?: "default" | "featured";
}

const BlogCard = ({ post, variant = "default" }: BlogCardProps) => {
  const cardColors = [
    "from-purple-400 to-purple-600",
    "from-green-400 to-green-600", 
    "from-blue-400 to-blue-600",
    "from-orange-400 to-orange-600",
    "from-red-400 to-red-600",
    "from-indigo-400 to-indigo-600"
  ];
  
  const colorIndex = parseInt(post.id.slice(-1), 16) % cardColors.length;
  const gradientClass = cardColors[colorIndex];

  if (variant === "featured") {
    return (
      <article className="col-span-full">
        <Card className="overflow-hidden group">
          <div className="grid md:grid-cols-2 gap-0">
            <div className="relative">
              <a href={`/blog/${post.slug}`} aria-label={post.title}>
                {post.featured_image_url ? (
                  <OptimizedImage
                    src={post.featured_image_url}
                    alt={`Imagem do post: ${post.title}`}
                    className="h-64 md:h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                ) : (
                  <div className={`h-64 md:h-full w-full bg-gradient-to-br ${gradientClass} flex items-center justify-center group-hover:scale-105 transition-transform duration-300`}>
                    <div className="text-white text-6xl">
                      📝
                    </div>
                  </div>
                )}
              </a>
            </div>
            
            <CardContent className="p-6 flex flex-col justify-center">
              {post.category && (
                <Badge className="mb-3 w-fit bg-primary/10 text-primary border-primary/20">
                  {post.category}
                </Badge>
              )}
              
              <a href={`/blog/${post.slug}`} aria-label={post.title}>
                <h2 className="text-2xl md:text-3xl font-bold leading-tight hover:text-primary transition-colors mb-3 line-clamp-2">
                  {post.title}
                </h2>
              </a>
              
              <p className="text-muted-foreground mb-4 line-clamp-3">
                {post.seo_description || ""}
              </p>
              
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(post.created_at).toLocaleDateString("pt-BR")}
                </span>
                {post.views && (
                  <span className="inline-flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {post.views}
                  </span>
                )}
                {post.comments !== undefined && (
                  <span className="inline-flex items-center gap-1">
                    <MessageCircle className="h-4 w-4" />
                    {post.comments}
                  </span>
                )}
              </div>
            </CardContent>
          </div>
        </Card>
      </article>
    );
  }

  return (
    <article>
      <Card className="overflow-hidden group">
        <div className="grid grid-cols-1 sm:grid-cols-[minmax(200px,_2fr)_3fr] gap-0">
          <div className="relative">
            <a href={`/blog/${post.slug}`} aria-label={post.title}>
              {post.featured_image_url ? (
                <OptimizedImage
                  src={post.featured_image_url}
                  alt={`Imagem do post: ${post.title}`}
                  className="h-48 sm:h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 100vw, 40vw"
                />
              ) : (
                <div className={`h-48 sm:h-full w-full bg-gradient-to-br ${gradientClass} flex items-center justify-center group-hover:scale-105 transition-transform duration-300`}>
                  <div className="text-white text-4xl">
                    📝
                  </div>
                </div>
              )}
            </a>

            {post.category && (
              <Badge className="absolute top-3 left-3 bg-background/90 text-foreground border-border/50 backdrop-blur-sm">
                {post.category}
              </Badge>
            )}
          </div>

          <CardContent className="p-5 flex flex-col justify-center">
            <a href={`/blog/${post.slug}`} aria-label={post.title}>
              <h3 className="text-xl font-bold leading-snug hover:text-primary transition-colors mb-2 line-clamp-2">
                {post.title}
              </h3>
            </a>

            <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
              {post.seo_description || ""}
            </p>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(post.created_at).toLocaleDateString("pt-BR")}
              </span>
              {post.views && (
                <span className="inline-flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {post.views}
                </span>
              )}
            </div>
          </CardContent>
        </div>
      </Card>
    </article>
  );
};

export default BlogCard;