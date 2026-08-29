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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

type PostDraft = {
  title: string;
  content: string;
  seoTitle: string;
  seoDesc: string;
  slug: string;
  featuredUrl: string | null;
  publishMode: "now" | "schedule";
  scheduledDate: string | null;
  scheduledTime: string;
  savedAt: number;
};

function isBlankContent(html: string) {
  return !html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
}

function draftAgeLabel(savedAt: number) {
  const mins = Math.max(0, Math.round((Date.now() - savedAt) / 60000));
  if (mins < 1) return "agora há pouco";
  if (mins < 60) return `há ${mins} min`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `há ${hours}h`;
  return `há ${Math.round(hours / 24)}d`;
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
  const [publishMode, setPublishMode] = useState<"now" | "schedule">("now");
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined);
  const [scheduledTime, setScheduledTime] = useState("09:00");

  // Rascunho local: protege contra fechar o navegador, queda de conexão ou reload acidental.
  const draftKey = `mk:blog-draft:${id ?? "novo"}`;
  const [pendingDraft, setPendingDraft] = useState<PostDraft | null>(null);
  const draftReady = useRef(false);

  const latest = useRef<PostDraft>({
    title, content, seoTitle, seoDesc, slug, featuredUrl,
    publishMode, scheduledDate: null, scheduledTime, savedAt: 0,
  });
  latest.current = {
    title, content, seoTitle, seoDesc, slug, featuredUrl, publishMode,
    scheduledDate: scheduledDate ? scheduledDate.toISOString() : null,
    scheduledTime,
    savedAt: 0,
  };

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

        // Detect scheduled post
        if (!data.published && data.published_at) {
          const pubDate = new Date(data.published_at);
          if (pubDate > new Date()) {
            setPublishMode("schedule");
            // Convert UTC to Brasília time for display
            const brasiliaStr = pubDate.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" });
            const brasiliaDate = new Date(brasiliaStr);
            setScheduledDate(brasiliaDate);
            setScheduledTime(
              `${brasiliaDate.getHours().toString().padStart(2, "0")}:${brasiliaDate.getMinutes().toString().padStart(2, "0")}`
            );
          }
        }
      }
      setLoading(false);
    })();
  }, [id, navigate, toast]);

  // Auto slug from title if user hasn't edited slug manually
  const autoSlug = useMemo(() => slugify(title), [title]);
  useEffect(() => {
    if (!slug) setSlug(autoSlug);
  }, [autoSlug]);

  // Procura um rascunho salvo. Em modo edição, espera o post do banco carregar
  // para poder comparar e só avisar quando o rascunho for realmente diferente.
  useEffect(() => {
    if (id && loading) return;
    try {
      const raw = localStorage.getItem(draftKey);
      if (raw) {
        const d = JSON.parse(raw) as PostDraft;
        const current = latest.current;
        const meaningful = !!d && (d.title?.trim() || !isBlankContent(d.content || ""));
        const differs =
          d?.title !== current.title ||
          d?.content !== current.content ||
          d?.seoDesc !== current.seoDesc ||
          d?.slug !== current.slug ||
          d?.featuredUrl !== current.featuredUrl;
        if (meaningful && differs) setPendingDraft(d);
      }
    } catch {
      // localStorage indisponível (aba anônima, storage cheio) — segue sem rascunho
    }
    draftReady.current = true;
  }, [draftKey, id, loading]);

  // Salva o rascunho com debounce a cada alteração.
  useEffect(() => {
    if (!draftReady.current) return;
    if (pendingDraft) return; // não sobrescreve enquanto o usuário decide restaurar ou descartar
    const timer = setTimeout(() => {
      try {
        if (!title.trim() && isBlankContent(content)) localStorage.removeItem(draftKey);
        else localStorage.setItem(draftKey, JSON.stringify({ ...latest.current, savedAt: Date.now() }));
      } catch {
        // storage cheio ou bloqueado — ignora
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [title, content, seoTitle, seoDesc, slug, featuredUrl, publishMode, scheduledDate, scheduledTime, draftKey, pendingDraft]);

  // Grava na hora ao esconder a aba ou fechar a página (o debounce não sobreviveria).
  useEffect(() => {
    const flush = () => {
      if (!draftReady.current || pendingDraft) return;
      const current = latest.current;
      try {
        if (!current.title.trim() && isBlankContent(current.content)) localStorage.removeItem(draftKey);
        else localStorage.setItem(draftKey, JSON.stringify({ ...current, savedAt: Date.now() }));
      } catch {
        // ignora
      }
    };
    const onVisibility = () => { if (document.visibilityState === "hidden") flush(); };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", flush);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", flush);
    };
  }, [draftKey, pendingDraft]);

  const restoreDraft = () => {
    const d = pendingDraft;
    if (!d) return;
    setTitle(d.title ?? "");
    setContent(d.content ?? "");
    setSeoTitle(d.seoTitle ?? "");
    setSeoDesc(d.seoDesc ?? "");
    setSlug(d.slug ?? "");
    setFeaturedUrl(d.featuredUrl ?? null);
    setPublishMode(d.publishMode === "schedule" ? "schedule" : "now");
    setScheduledDate(d.scheduledDate ? new Date(d.scheduledDate) : undefined);
    setScheduledTime(d.scheduledTime || "09:00");
    setPendingDraft(null);
    toast({ title: "Rascunho restaurado", description: "Continue de onde parou." });
  };

  const discardDraft = () => {
    try { localStorage.removeItem(draftKey); } catch { /* ignora */ }
    setPendingDraft(null);
  };

  const clearDraft = () => {
    draftReady.current = false;
    try { localStorage.removeItem(draftKey); } catch { /* ignora */ }
  };


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

  const savePost = async (asDraft = false) => {
    if (!userId) {
      toast({ title: "Sessão inválida", description: "Faça login novamente." });
      return;
    }
    if (!title.trim() || !content.trim() || !slug.trim()) {
      toast({ title: "Campos obrigatórios", description: "Preencha Título, Texto e URL SEO." });
      return;
    }

    if (publishMode === "schedule" && !asDraft) {
      if (!scheduledDate) {
        toast({ title: "Data obrigatória", description: "Selecione a data de agendamento." });
        return;
      }
      const [h, m] = scheduledTime.split(":").map(Number);
      // Build date in Brasília timezone and convert to UTC
      const brasiliaDateStr = `${scheduledDate.getFullYear()}-${(scheduledDate.getMonth() + 1).toString().padStart(2, "0")}-${scheduledDate.getDate().toString().padStart(2, "0")}T${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:00`;
      // America/Sao_Paulo is UTC-3 (no DST since 2019)
      const utcDate = new Date(brasiliaDateStr + "-03:00");
      if (utcDate <= new Date()) {
        toast({ title: "Data inválida", description: "A data de agendamento deve ser no futuro." });
        return;
      }
    }

    setSaving(true);
    try {
      let published = true;
      let published_at: string | undefined = new Date().toISOString();

      if (publishMode === "schedule" && !asDraft) {
        published = false;
        const [h, m] = scheduledTime.split(":").map(Number);
        const brasiliaDateStr = `${scheduledDate!.getFullYear()}-${(scheduledDate!.getMonth() + 1).toString().padStart(2, "0")}-${scheduledDate!.getDate().toString().padStart(2, "0")}T${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:00-03:00`;
        published_at = new Date(brasiliaDateStr).toISOString();
      }

      const postData = {
        user_id: userId,
        title: title.trim(),
        content: content,
        cover_image: featuredUrl,
        excerpt: seoDesc || undefined,
        slug: slugify(slug),
        published,
        published_at,
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
          .insert(postData);
        error = insertError;
      }

      if (error) throw error;

      const msg = publishMode === "schedule" && !asDraft
        ? "Post agendado"
        : id ? "Post atualizado" : "Post publicado";
      toast({
        title: msg,
        description: publishMode === "schedule" && !asDraft
          ? `O post será publicado automaticamente na data agendada.`
          : id ? "Seu post foi atualizado com sucesso." : "Seu post foi salvo com sucesso."
      });
      clearDraft();
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
        canonicalUrl={`https://mkart.com.br/admin/blog/${id ? `editar/${id}` : 'novo'}`}
        noindex={true}
      />

      <main className="container mx-auto px-4 py-10 space-y-8">
        <header className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold">{id ? "Editar Post" : "Novo Post do Blog"}</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate('/admin/blog')}>Voltar</Button>
            <Button onClick={() => savePost()} disabled={saving || !isAdmin}>
              {publishMode === "schedule" ? "Agendar" : id ? "Salvar Alterações" : "Publicar"}
            </Button>
          </div>
        </header>

        {pendingDraft ? (
          <div className="flex flex-col gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm">
              <p className="font-medium">Rascunho não salvo encontrado</p>
              <p className="text-muted-foreground">
                Salvo automaticamente {draftAgeLabel(pendingDraft.savedAt)}
                {pendingDraft.title ? ` — “${pendingDraft.title}”` : ""}.
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Button size="sm" onClick={restoreDraft}>Restaurar</Button>
              <Button size="sm" variant="outline" onClick={discardDraft}>Descartar</Button>
            </div>
          </div>
        ) : null}

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

          {/* Agendamento */}
          <div className="rounded-lg border bg-card p-6 space-y-4">
            <h3 className="text-lg font-medium border-b pb-2">Publicação</h3>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={publishMode === "now" ? "default" : "outline"}
                onClick={() => setPublishMode("now")}
              >
                Publicar Agora
              </Button>
              <Button
                type="button"
                variant={publishMode === "schedule" ? "default" : "outline"}
                onClick={() => setPublishMode("schedule")}
              >
                Agendar
              </Button>
            </div>

            {publishMode === "schedule" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <Label>Data (Horário de Brasília)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !scheduledDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {scheduledDate
                          ? format(scheduledDate, "dd/MM/yyyy", { locale: ptBR })
                          : "Selecione a data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={scheduledDate}
                        onSelect={setScheduledDate}
                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>Hora (Brasília)</Label>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <Input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            )}
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
