import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import SEOHead from "@/components/seo/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { type Editor } from "@tiptap/react";

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function AdminBlogNew() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();

  const [userId, setUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDesc, setSeoDesc] = useState("");
  const [slug, setSlug] = useState("");
  const [featuredUrl, setFeaturedUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!!id);

  const currentEditorRef = useRef<Editor | null>(null);
  const hiddenFeaturedInput = useRef<HTMLInputElement | null>(null);
  const hiddenInlineImageInput = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      const id = session?.user?.id ?? null;
      setUserId(id);
      if (!id) navigate('/auth', { replace: true, state: { from: '/admin/blog/novo' } });
    });
    supabase.auth.getSession().then(({ data }) => {
      const id = data.session?.user?.id ?? null;
      setUserId(id);
      if (!id) navigate('/auth', { replace: true, state: { from: '/admin/blog/novo' } });
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      // Check is_admin from profiles table
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('user_id', userId)
        .single();
      setIsAdmin(profile?.is_admin ?? false);
    })();
  }, [userId]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        toast({ title: "Erro ao carregar post", description: error.message });
        navigate('/admin/blog');
      } else if (data) {
        setTitle(data.title);
        setContent(data.content || "");
        setSeoTitle(data.title || "");
        setSeoDesc(data.excerpt || "");
        setSlug(data.slug);
        setFeaturedUrl(data.cover_image);
      }
      setLoading(false);
    })();
  }, [id, navigate, toast]);

  // Auto slug from title if user hasn't edited slug manually
  const autoSlug = useMemo(() => slugify(title), [title]);
  useEffect(() => {
    if (!slug) setSlug(autoSlug);
  }, [autoSlug]);


  async function uploadToBucket(file: File): Promise<string> {
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `posts/${new Date().getFullYear()}/${(new Date().getMonth()+1).toString().padStart(2,'0')}/${crypto.randomUUID()}.${ext}`;

    const { error } = await supabase.storage.from('blog').upload(path, file, { upsert: false, contentType: file.type });

    if (error) {
      if (error.message.includes("Bucket not found")) {
        throw new Error("O bucket 'blog' não foi encontrado no seu Supabase Storage. Por favor, crie um bucket público chamado 'blog'.");
      }
      throw error;
    }

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
    } catch (err: any) {
      console.error(err);
      toast({ title: "Falha no upload", description: err.message || "Tente novamente." });
    } finally {
      if (hiddenFeaturedInput.current) hiddenFeaturedInput.current.value = "";
    }
  };

  const handleInlineImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentEditorRef.current) return;
    try {
      const url = await uploadToBucket(file);
      const alt = file.name.replace(/\.[^.]+$/, "");
      currentEditorRef.current.chain().focus().setImage({ src: url, alt }).run();
      toast({ title: "Imagem inserida", description: "Imagem adicionada ao conteúdo." });
    } catch (err: any) {
      console.error(err);
      toast({ title: "Falha no upload", description: err.message || "Tente novamente." });
    } finally {
      if (hiddenInlineImageInput.current) hiddenInlineImageInput.current.value = "";
    }
  };

  const resetForm = () => {
    setTitle("");
    setContent("");
    setSeoTitle("");
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
      const postData = {
        user_id: userId,
        title: title.trim(),
        content: content,
        cover_image: featuredUrl,
        excerpt: seoDesc || undefined,
        slug: slugify(slug),
        published: true,
      };

      let error;
      if (id) {
        const { error: updateError } = await supabase
          .from('posts')
          .update(postData)
          .eq('id', id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('posts')
          .insert({
            ...postData,
            published_at: new Date().toISOString(),
          });
        error = insertError;
      }

      if (error) throw error;
      toast({
        title: id ? "Post atualizado" : "Post publicado",
        description: id ? "Seu post foi atualizado com sucesso." : "Seu post foi salvo com sucesso."
      });
      resetForm();
      navigate('/admin/blog');
    } catch (err: any) {
      console.error(err);
      toast({ title: "Erro ao salvar", description: err.message || "Tente novamente." });
    } finally {
      setSaving(false);
    }
  };

  if (!userId || isAdmin === null || (id && loading)) return null;

  return (
    <>
      <SEOHead
        title={id ? "Editar Post | MK Art SEO" : "Novo Post do Blog | MK Art SEO"}
        description={id ? "Edite um artigo existente no blog." : "Crie e publique um novo artigo no blog."}
        canonicalUrl={`${window.location.origin}/admin/blog/${id ? `editar/${id}` : 'novo'}`}
        noindex
      />

      <main className="container mx-auto px-4 py-10 space-y-8">
        <header className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold">{id ? "Editar Post" : "Novo Post do Blog"}</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate('/admin/blog')}>Voltar</Button>
            <Button onClick={savePost} disabled={saving || !isAdmin}>
              {id ? "Salvar Alterações" : "Publicar"}
            </Button>
          </div>
        </header>

        {!isAdmin ? (
          <div className="rounded-md border p-4 text-sm">
            Seu usuário não possui permissão de administrador para publicar posts.
            <div className="mt-2 font-mono text-xs">user_id: {userId}</div>
          </div>
        ) : null}

        <section className="grid grid-cols-1 gap-6">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Título do Post (Exibição no Site)</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Digite o título que aparecerá no post" />
          </div>

          {/* Seção SEO */}
          <div className="rounded-lg border bg-card p-6 space-y-4">
            <h3 className="text-lg font-medium border-b pb-2">Configurações de SEO</h3>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Título SEO (Aba do Navegador)</label>
              <Input
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder={title || "Digite o título para SEO"}
              />
              <p className="text-xs text-muted-foreground">Se vazio, usará o Título do Post.</p>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Descrição SEO (Meta Description)</label>
              <Textarea
                value={seoDesc}
                onChange={(e) => setSeoDesc(e.target.value)}
                rows={3}
                placeholder="Resumo do post para buscadores (Google)"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">URL SEO (Slug)</label>
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder={autoSlug || "minha-url-seo"} />
              <p className="text-xs text-muted-foreground">URL final: {window.location.origin}/blog/{slugify(slug || autoSlug)}</p>
            </div>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Imagem em destaque do Post</label>
            <div className="flex items-center gap-2">
              <input ref={hiddenFeaturedInput} type="file" accept="image/*" onChange={handleFeaturedUpload} />
            </div>
            {featuredUrl && (
              <img src={featuredUrl} alt="Imagem em destaque do post" className="max-h-48 rounded-md border object-contain" />
            )}
            {!featuredUrl && (
              <div className="h-32 w-full bg-muted flex items-center justify-center rounded-md border border-dashed">
                <p className="text-sm text-muted-foreground">Nenhuma imagem selecionada</p>
              </div>
            )}
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Conteúdo do Post</label>
            <input
              ref={hiddenInlineImageInput}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleInlineImage}
            />
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="Comece a escrever seu post..."
              minHeight="400px"
              onImageUpload={(editor) => {
                currentEditorRef.current = editor;
                hiddenInlineImageInput.current?.click();
              }}
            />
          </div>
        </section>
      </main>
    </>
  );
}
