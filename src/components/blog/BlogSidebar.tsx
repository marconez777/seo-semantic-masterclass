import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

interface PopularPost {
  title: string;
  slug: string;
  category: string;
  readTime?: string;
  color: string;
}

const popularPosts: PopularPost[] = [];

const BlogSidebar = () => {
  const [email, setEmail] = useState("");
  const [activeTab, setActiveTab] = useState<"popular" | "trending">("popular");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log("Newsletter subscription:", email);
  };

  return (
    <aside className="space-y-6">
      {/* Newsletter Section */}
      <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-bold">Assinar Newsletter</CardTitle>
          <p className="text-sm text-muted-foreground">
            Receba os últimos posts e artigos em seu email
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubscribe} className="space-y-3">
            <Input
              type="email"
              placeholder="Digite seu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-background/50 backdrop-blur-sm"
            />
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90"
            >
              Assinar ✉️
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Popular/Trending Posts */}
      <Card>
        <CardHeader>
          <div className="flex space-x-1 rounded-lg bg-muted p-1">
            <button
              onClick={() => setActiveTab("popular")}
              className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                activeTab === "popular"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Populares
            </button>
            <button
              onClick={() => setActiveTab("trending")}
              className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                activeTab === "trending"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Em Alta
            </button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {popularPosts.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">📝</div>
              <p className="text-sm text-muted-foreground">
                Em breve teremos posts populares aqui
              </p>
            </div>
          ) : (
            popularPosts.map((post, index) => (
              <article key={index} className="flex space-x-3 group">
                <div className={`w-12 h-12 rounded-lg ${post.color} flex-shrink-0 flex items-center justify-center`}>
                  <span className="text-white font-bold text-lg">
                    {post.category.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm leading-snug group-hover:text-primary transition-colors line-clamp-2">
                    <a href={`/blog/${post.slug}`}>
                      {post.title}
                    </a>
                  </h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {post.category}
                    </Badge>
                    {post.readTime && (
                      <span className="text-xs text-muted-foreground">
                        {post.readTime}
                      </span>
                    )}
                  </div>
                </div>
              </article>
            ))
          )}
        </CardContent>
      </Card>

      {/* Ad Space */}
      <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
        <CardContent className="p-6 text-center">
          <div className="mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl">🚀</span>
            </div>
            <h3 className="font-bold text-lg">Consultoria SEO</h3>
            <h4 className="font-bold text-lg">Personalizada</h4>
          </div>
          <Button 
            variant="secondary" 
            size="sm"
            className="bg-white text-blue-600 hover:bg-white/90"
          >
            Contratar
          </Button>
          <div className="mt-4 text-sm opacity-75">
            Ad 300 x 300
          </div>
        </CardContent>
      </Card>
    </aside>
  );
};

export default BlogSidebar;