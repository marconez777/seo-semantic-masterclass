import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PopularPost {
  title: string;
  slug: string;
  category: string;
  readTime?: string;
  color: string;
}

const popularPosts: PopularPost[] = [];

const BlogSidebar = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [website, setWebsite] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState<"popular" | "trending">("popular");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !whatsapp.trim() || !website.trim()) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from("backlink_leads" as any).insert({
        name: name.trim(),
        email: email.trim(),
        whatsapp: whatsapp.trim(),
        website: website.trim(),
      } as any);
      if (error) throw error;
      setSubmitted(true);
      toast({ title: "Cadastro realizado!", description: "Em breve você receberá seus 3 backlinks grátis." });
    } catch (err: any) {
      toast({ title: "Erro ao cadastrar", description: err.message || "Tente novamente." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <aside className="space-y-6">
      {/* Free Backlinks CTA */}
      <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-bold">3 Backlinks Grátis</CardTitle>
          <p className="text-sm text-muted-foreground">
            Cadastre-se e receba 3 backlinks DR 20 a 30 totalmente grátis.
          </p>
        </CardHeader>
        <CardContent>
          {submitted ? (
            <div className="text-center py-4">
              <div className="text-3xl mb-2">🎉</div>
              <p className="text-sm font-medium text-foreground">Cadastro realizado com sucesso!</p>
              <p className="text-xs text-muted-foreground mt-1">Em breve entraremos em contato.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <Input
                type="text"
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-background/50 backdrop-blur-sm"
              />
              <Input
                type="email"
                placeholder="Seu e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-background/50 backdrop-blur-sm"
              />
              <Input
                type="text"
                placeholder="WhatsApp"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                required
                className="bg-background/50 backdrop-blur-sm"
              />
              <Input
                type="url"
                placeholder="URL do seu site"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                required
                className="bg-background/50 backdrop-blur-sm"
              />
              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90"
              >
                {submitting ? "Enviando..." : "3 Backlinks Grátis 🎁"}
              </Button>
            </form>
          )}
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