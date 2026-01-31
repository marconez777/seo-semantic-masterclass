import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { RichTextEditor } from "@/components/ui/rich-text-editor";

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function AdminBlogPublisher() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [seoDesc, setSeoDesc] = useState("");
  const [slug, setSlug] = useState("");
  const [featuredUrl, setFeaturedUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [userId, setUserId] = useState<string | null>(null);

  const hiddenFeaturedInput = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  // Auto slug from title if user hasn't edited slug manually
  const autoSlug = useMemo(() => slugify(title), [title]);
  useEffect(() => {
    if (!slug) setSlug(autoSlug);
  }, [autoSlug]);

  async function uploadToBucket(file: File): Promise<string> {
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `posts/${new Date().getFullYear()}/${(new Date().getMonth()+1)
      .toString()
      .padStart(2,'0')}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from('blog').upload(path, file, { upsert: false, contentType: file.type });
    if (error) throw error;
    const { data } = supabase.storage.from('blog').getPublicUrl(path);
    return data.publicUrl;
  }

  const handleFeaturedUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadToBucket(file);
      setFeaturedUrl(url);
      toast({ title: "Imagem enviada", description: "Imagem em destaque atualizada." });
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Tente novamente.";
      toast({ title: "Falha no upload", description: message });
    } finally {
      if (hiddenFeaturedInput.current) hiddenFeaturedInput.current.value = "";
    }
  };

  const resetForm = () => {
    setTitle("");
    setContent("");
    setSeoDesc("");
    setSlug("");
    setFeaturedUrl(null);
  };

  const savePost = async () => {
    if (!userId) {
      toast({ title: "Sessão inválida", description: "Faça login novamente." });
      return;
    }
    if (!title.trim() || !content.trim() || !slug.trim()) {
      toast({ title: "Campos obrigatórios", description: "Preencha Título, Texto e URL SEO." });
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.from('posts').insert({
        user_id: userId,
        title: title.trim(),
        content: content,
        cover_image: featuredUrl,
        excerpt: seoDesc || undefined,
        slug: slugify(slug),
        published: true,
        published_at: new Date().toISOString(),
      });
      if (error) throw error;
      toast({ title: "Post publicado", description: "Seu post foi salvo com sucesso." });
      resetForm();
      setOpen(false);
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Tente novamente.";
      toast({ title: "Erro ao salvar", description: message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Publicar Post no Blog</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Adicionar novo post</Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Novo Post</DialogTitle>
              <DialogDescription>Preencha as informações e publique no blog.</DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Título do Post</label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Digite o título" />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">Texto do Post</label>
                <RichTextEditor
                  value={content}
                  onChange={setContent}
                  placeholder="Comece a escrever seu post..."
                  minHeight="300px"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">Imagem em destaque do Post</label>
                <div className="flex items-center gap-2">
                  <input ref={hiddenFeaturedInput} type="file" accept="image/*" onChange={handleFeaturedUpload} />
                </div>
                {featuredUrl && (
                  <img src={featuredUrl} alt="Imagem em destaque" className="max-h-40 rounded-md border object-contain" />
                )}
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">Descrição SEO (Excerpt)</label>
                <Textarea value={seoDesc} onChange={(e) => setSeoDesc(e.target.value)} rows={3} placeholder="Até ~160 caracteres" />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">URL SEO (Slug)</label>
                <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder={autoSlug || "minha-url-seo"} />
                <p className="text-xs text-muted-foreground">URL final: {window.location.origin}/blog/{slugify(slug || autoSlug)}</p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button variant="secondary" onClick={() => setOpen(false)} disabled={saving}>Cancelar</Button>
                <Button onClick={savePost} disabled={saving}>Publicar</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
