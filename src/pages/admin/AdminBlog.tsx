import SEOHead from "@/components/seo/SEOHead";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function AdminBlog() {
  const navigate = useNavigate();

  return (
    <>
      <SEOHead
        title="Admin – Blog | MK Art SEO"
        description="Painel admin para gerenciar blog."
        canonicalUrl={`${window.location.origin}/admin/blog`}
        keywords="admin, blog, posts"
      />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Blog</h2>
          <Button onClick={() => navigate('/admin/blog/novo')}>
            Novo post do blog
          </Button>
        </div>
        
        <div className="border rounded-md p-8 text-center">
          <p className="text-muted-foreground">
            Funcionalidade de gerenciamento de blog em desenvolvimento.
          </p>
          <p className="text-muted-foreground mt-2">
            Por enquanto, você pode criar novos posts usando o botão acima.
          </p>
        </div>
      </div>
    </>
  );
}