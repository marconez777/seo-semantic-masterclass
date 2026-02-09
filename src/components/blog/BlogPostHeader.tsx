import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock, User } from "lucide-react";
import OptimizedImage from "@/components/seo/OptimizedImage";

interface BlogPostHeaderProps {
  title: string;
  category?: string;
  author?: string;
  publishDate: string;
  readTime?: string;
  featuredImage?: string | null;
}

const BlogPostHeader = ({
  title,
  category,
  author = "MK Art SEO",
  publishDate,
  readTime,
  featuredImage
}: BlogPostHeaderProps) => {
  const cardColors = [
    "from-purple-400 to-purple-600",
    "from-green-400 to-green-600", 
    "from-blue-400 to-blue-600",
    "from-orange-400 to-orange-600",
    "from-red-400 to-red-600",
    "from-indigo-400 to-indigo-600"
  ];
  
  const colorIndex = Math.floor(Math.random() * cardColors.length);
  const gradientClass = cardColors[colorIndex];

  return (
    <header className="mb-8">
      {/* Category Badge */}
      {category && (
        <div className="mb-4">
          <Badge className="bg-primary/10 text-primary border-primary/20 text-sm">
            {category}
          </Badge>
        </div>
      )}

      {/* Title */}
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-6">
        {title}
      </h1>

      {/* Author and Meta Info */}
      <div className="flex items-center space-x-6 mb-8 text-muted-foreground">
        <div className="flex items-center space-x-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder-avatar.jpg" />
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">Por {author}</span>
        </div>
        
        <div className="flex items-center space-x-1 text-sm">
          <Calendar className="h-4 w-4" />
          <time dateTime={publishDate}>
            {new Date(publishDate).toLocaleDateString("pt-BR", {
              day: "numeric",
              month: "long", 
              year: "numeric"
            })}
          </time>
        </div>

        {readTime && (
          <div className="flex items-center space-x-1 text-sm">
            <Clock className="h-4 w-4" />
            <span>{readTime} min de leitura</span>
          </div>
        )}
      </div>

      {/* Featured Image */}
      <div className="mb-8 rounded-lg overflow-hidden">
        {featuredImage ? (
          <OptimizedImage
            src={featuredImage}
            alt={`Imagem do post: ${title}`}
            className="w-full h-auto max-h-[500px] object-cover"
            sizes="100vw"
          />
        ) : (
          <div className={`w-full h-52 md:h-80 lg:h-96 bg-gradient-to-br ${gradientClass} flex items-center justify-center`}>
            <div className="text-white text-8xl">
              📝
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default BlogPostHeader;