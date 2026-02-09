import { useEffect, useState } from "react";
import SEOHead from "@/components/seo/SEOHead";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Post {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  published_at: string | null;
  created_at: string | null;
}

export default function AdminBlog() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("posts")
      .select("id, title, slug, published, published_at, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Erro ao buscar posts: " + error.message,
      });
    } else {
      setPosts(data || []);
    }
    setLoading(false);
  };

  const deletePost = async () => {
    if (!deleteId) return;

    const { error } = await supabase.from("posts").delete().eq("id", deleteId);

    if (error) {
      toast({
        title: "Erro ao excluir post: " + error.message,
      });
    } else {
      toast({
        title: "Post excluído",
        description: "O artigo foi removido com sucesso.",
      });
      setPosts(posts.filter((p) => p.id !== deleteId));
    }
    setDeleteId(null);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

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
          <Button onClick={() => navigate("/admin/blog/novo")}>
            Novo post do blog
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-10">Carregando posts...</div>
        ) : posts.length === 0 ? (
          <div className="border rounded-md p-8 text-center">
            <p className="text-muted-foreground">Nenhum post encontrado.</p>
            <Button
              variant="link"
              onClick={() => navigate("/admin/blog/novo")}
              className="mt-2"
            >
              Criar meu primeiro post
            </Button>
          </div>
        ) : (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data de Publicação</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post) => {
                  const isScheduled = !post.published && post.published_at && new Date(post.published_at) > new Date();
                  const isDraft = !post.published && !isScheduled;
                  return (
                  <TableRow key={post.id}>
                    <TableCell className="font-medium">{post.title}</TableCell>
                    <TableCell>
                      {post.published ? (
                        <Badge variant="default" className="bg-green-500">
                          Publicado
                        </Badge>
                      ) : isScheduled ? (
                        <Badge variant="default" className="bg-blue-500">
                          Agendado {new Date(post.published_at!).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Rascunho</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {post.published_at
                        ? new Date(post.published_at).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/admin/blog/editar/${post.id}`)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeleteId(post.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o
              artigo do blog.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={deletePost}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}