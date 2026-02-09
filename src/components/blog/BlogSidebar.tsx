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
  const {
    toast
  } = useToast();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimName = name.trim();
    const trimEmail = email.trim();
    const trimWhatsapp = whatsapp.trim();
    const trimWebsite = website.trim();
    if (!trimName || !trimEmail || !trimWhatsapp || !trimWebsite) return;
    if (trimName.length < 2 || trimName.length > 100) {
      toast({ title: "Nome inválido", description: "O nome deve ter entre 2 e 100 caracteres." }); return;
    }
    if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(trimEmail)) {
      toast({ title: "Email inválido", description: "Insira um email válido." }); return;
    }
    if (trimWebsite.length < 5 || trimWebsite.length > 500) {
      toast({ title: "URL inválida", description: "A URL deve ter entre 5 e 500 caracteres." }); return;
    }
    setSubmitting(true);
    try {
      const {
        error
      } = await supabase.from("backlink_leads" as any).insert({
        name: trimName,
        email: trimEmail,
        whatsapp: trimWhatsapp,
        website: trimWebsite
      } as any);
      if (error) throw error;
      setSubmitted(true);
      toast({
        title: "Cadastro realizado!",
        description: "Em breve você receberá seus 3 backlinks grátis."
      });
    } catch (err: any) {
      toast({
        title: "Erro ao cadastrar",
        description: err.message || "Tente novamente."
      });
    } finally {
      setSubmitting(false);
    }
  };
  return <aside className="space-y-6">
      {/* Free Backlinks CTA */}
      <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-bold">                Grátis: 3 Backlinks DR 30      </CardTitle>
          <p className="text-sm text-muted-foreground">
            Cadastre-se e receba 3 backlinks DR 20 a 30 totalmente grátis.
          </p>
        </CardHeader>
        <CardContent>
          {submitted ? <div className="text-center py-4">
              <div className="text-3xl mb-2">🎉</div>
              <p className="text-sm font-medium text-foreground">Cadastro realizado com sucesso!</p>
              <p className="text-xs text-muted-foreground mt-1">Em breve entraremos em contato.</p>
            </div> : <form onSubmit={handleSubmit} className="space-y-3">
              <Input type="text" placeholder="Seu nome" value={name} onChange={e => setName(e.target.value)} required className="bg-background/50 backdrop-blur-sm" />
              <Input type="email" placeholder="Seu e-mail" value={email} onChange={e => setEmail(e.target.value)} required className="bg-background/50 backdrop-blur-sm" />
              <Input type="text" placeholder="WhatsApp" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} required className="bg-background/50 backdrop-blur-sm" />
              <Input type="text" placeholder="URL do seu site" value={website} onChange={e => setWebsite(e.target.value)} required className="bg-background/50 backdrop-blur-sm" />
              <Button type="submit" disabled={submitting} className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90">
                {submitting ? "Enviando..." : "3 Backlinks Grátis 🎁"}
              </Button>
            </form>}
        </CardContent>
      </Card>

      {/* Casos de Sucesso - YouTube */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">Casos de Sucesso</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {["B35Poq_3xDM", "OWWQfH-V1Iw", "iX7ShYZVxgo", "k6YKZKLEdp8", "eRZUTQthZGI", "3oUqxXYuRxI"].map(videoId => <div key={videoId} className="aspect-video w-full rounded-lg overflow-hidden">
              <iframe src={`https://www.youtube.com/embed/${videoId}`} title="Caso de Sucesso" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="w-full h-full" loading="lazy" />
            </div>)}
        </CardContent>
      </Card>
    </aside>;
};
export default BlogSidebar;