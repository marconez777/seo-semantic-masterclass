import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  type PageSEOContent, 
  type FAQ,
  PAGE_SLUGS, 
  useSavePageSEOContent,
  usePageSEOContent
} from "@/hooks/usePageSEOContent";
import { RichTextEditor } from "@/components/ui/rich-text-editor";

interface SEOContentEditorProps {
  editingContent?: PageSEOContent | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function SEOContentEditor({ editingContent, onClose, onSaved }: SEOContentEditorProps) {
  const { toast } = useToast();
  const saveMutation = useSavePageSEOContent();

  // Form state
  const [pageSlug, setPageSlug] = useState(editingContent?.page_slug || "");
  const [metaTitle, setMetaTitle] = useState(editingContent?.meta_title || "");
  const [metaDescription, setMetaDescription] = useState(editingContent?.meta_description || "");
  const [metaKeywords, setMetaKeywords] = useState(editingContent?.meta_keywords || "");
  const [h1Title, setH1Title] = useState(editingContent?.h1_title || "");
  const [h2Subtitle, setH2Subtitle] = useState(editingContent?.h2_subtitle || "");
  const [introText, setIntroText] = useState(editingContent?.intro_text || "");
  const [mainContent, setMainContent] = useState(editingContent?.main_content || "");
  const [faqs, setFaqs] = useState<FAQ[]>(editingContent?.faqs || []);
  const [canonicalUrl, setCanonicalUrl] = useState(editingContent?.canonical_url || "");

  // Load existing content when slug changes (for new entries)
  const { data: existingContent } = usePageSEOContent(pageSlug);
  
  useEffect(() => {
    if (!editingContent && existingContent) {
      setMetaTitle(existingContent.meta_title || "");
      setMetaDescription(existingContent.meta_description || "");
      setMetaKeywords(existingContent.meta_keywords || "");
      setH1Title(existingContent.h1_title || "");
      setH2Subtitle(existingContent.h2_subtitle || "");
      setIntroText(existingContent.intro_text || "");
      setMainContent(existingContent.main_content || "");
      setFaqs(existingContent.faqs || []);
      setCanonicalUrl(existingContent.canonical_url || "");
    }
  }, [existingContent, editingContent]);

  const addFaq = () => setFaqs([...faqs, { question: "", answer: "" }]);
  const removeFaq = (index: number) => setFaqs(faqs.filter((_, i) => i !== index));
  const updateFaq = (index: number, field: "question" | "answer", value: string) => {
    const updated = [...faqs];
    updated[index] = { ...updated[index], [field]: value };
    setFaqs(updated);
  };

  const handleSave = async () => {
    if (!pageSlug) {
      toast({ title: "Erro", description: "Selecione uma página." });
      return;
    }

    try {
      await saveMutation.mutateAsync({
        id: editingContent?.id || existingContent?.id,
        page_slug: pageSlug,
        meta_title: metaTitle || null,
        meta_description: metaDescription || null,
        meta_keywords: metaKeywords || null,
        h1_title: h1Title || null,
        h2_subtitle: h2Subtitle || null,
        intro_text: introText || null,
        main_content: mainContent || null,
        faqs: faqs.filter(f => f.question.trim() && f.answer.trim()),
        canonical_url: canonicalUrl || null,
      });
      toast({ title: "Sucesso", description: "Conteúdo SEO salvo com sucesso!" });
      onSaved();
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Erro ao salvar.";
      toast({ title: "Erro", description: message });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          {editingContent ? "Editar Conteúdo SEO" : "Novo Conteúdo SEO"}
        </h2>
        <Button variant="outline" onClick={onClose}>Voltar</Button>
      </div>

      <Tabs defaultValue="meta" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="meta">Metadados</TabsTrigger>
          <TabsTrigger value="content">Conteúdo</TabsTrigger>
          <TabsTrigger value="faqs">FAQs</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="meta" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuração da Página</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Página</Label>
                <Select 
                  value={pageSlug} 
                  onValueChange={setPageSlug}
                  disabled={!!editingContent}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a página" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAGE_SLUGS.map((p) => (
                      <SelectItem key={p.slug} value={p.slug}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Meta Title <span className="text-muted-foreground text-xs">({metaTitle.length}/60)</span></Label>
                <Input 
                  value={metaTitle} 
                  onChange={(e) => setMetaTitle(e.target.value)} 
                  placeholder="Título para SEO (até 60 caracteres)"
                  maxLength={70}
                />
              </div>

              <div className="space-y-2">
                <Label>Meta Description <span className="text-muted-foreground text-xs">({metaDescription.length}/160)</span></Label>
                <Textarea 
                  value={metaDescription} 
                  onChange={(e) => setMetaDescription(e.target.value)} 
                  placeholder="Descrição para SEO (até 160 caracteres)"
                  rows={3}
                  maxLength={170}
                />
              </div>

              <div className="space-y-2">
                <Label>Meta Keywords</Label>
                <Input 
                  value={metaKeywords} 
                  onChange={(e) => setMetaKeywords(e.target.value)} 
                  placeholder="palavras, chave, separadas, por, vírgula"
                />
              </div>

              <div className="space-y-2">
                <Label>URL Canônica</Label>
                <Input 
                  value={canonicalUrl} 
                  onChange={(e) => setCanonicalUrl(e.target.value)} 
                  placeholder="https://mkart.com.br/comprar-backlinks"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cabeçalhos e Texto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>H1 - Título Principal</Label>
                <Input 
                  value={h1Title} 
                  onChange={(e) => setH1Title(e.target.value)} 
                  placeholder="Título H1 da página"
                />
              </div>

              <div className="space-y-2">
                <Label>H2 - Subtítulo</Label>
                <Input 
                  value={h2Subtitle} 
                  onChange={(e) => setH2Subtitle(e.target.value)} 
                  placeholder="Subtítulo H2 (opcional)"
                />
              </div>

              <div className="space-y-2">
                <Label>Texto Introdutório</Label>
                <Textarea 
                  value={introText} 
                  onChange={(e) => setIntroText(e.target.value)} 
                  placeholder="Parágrafo curto de introdução"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Conteúdo Principal</Label>
                <RichTextEditor
                  value={mainContent}
                  onChange={setMainContent}
                  placeholder="Comece a escrever seu conteúdo SEO..."
                  minHeight="350px"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faqs" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Perguntas Frequentes (FAQs)</CardTitle>
              <Button onClick={addFaq} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar FAQ
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {faqs.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Nenhuma FAQ cadastrada. Clique em "Adicionar FAQ" para começar.
                </p>
              ) : (
                faqs.map((faq, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start gap-2">
                      <GripVertical className="h-5 w-5 text-muted-foreground mt-2 cursor-grab" />
                      <div className="flex-1 space-y-3">
                        <div className="space-y-2">
                          <Label>Pergunta {index + 1}</Label>
                          <Input 
                            value={faq.question}
                            onChange={(e) => updateFaq(index, "question", e.target.value)}
                            placeholder="Ex: O que são backlinks?"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Resposta</Label>
                          <Textarea 
                            value={faq.answer}
                            onChange={(e) => updateFaq(index, "answer", e.target.value)}
                            placeholder="Resposta completa para a pergunta..."
                            rows={3}
                          />
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => removeFaq(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Preview do Conteúdo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Meta Preview */}
              <div className="border rounded-lg p-4 bg-muted/30">
                <p className="text-sm text-muted-foreground mb-1">Como aparece no Google:</p>
                <p className="text-primary text-lg font-medium truncate">{metaTitle || "Título não definido"}</p>
                <p className="text-sm text-muted-foreground">{canonicalUrl || "https://mkart.com.br/..."}</p>
                <p className="text-sm text-muted-foreground line-clamp-2">{metaDescription || "Descrição não definida"}</p>
              </div>

              {/* Content Preview */}
              <div className="space-y-4">
                {h1Title && <h1 className="text-3xl font-bold">{h1Title}</h1>}
                {h2Subtitle && <h2 className="text-xl font-semibold text-muted-foreground">{h2Subtitle}</h2>}
                {introText && <p className="text-muted-foreground">{introText}</p>}
                
                {mainContent && (
                  <div 
                    className="prose prose-sm max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: mainContent }}
                  />
                )}
              </div>

              {/* FAQs Preview */}
              {faqs.length > 0 && (
                <div className="space-y-4 border-t pt-4">
                  <h3 className="text-xl font-semibold">Perguntas Frequentes</h3>
                  {faqs.filter(f => f.question && f.answer).map((faq, i) => (
                    <div key={i} className="border-l-2 border-primary pl-4">
                      <p className="font-medium">{faq.question}</p>
                      <p className="text-muted-foreground text-sm mt-1">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex items-center justify-end gap-2 pt-4 border-t">
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave} disabled={saveMutation.isPending}>
          {saveMutation.isPending ? "Salvando..." : "Salvar Conteúdo"}
        </Button>
      </div>
    </div>
  );
}
