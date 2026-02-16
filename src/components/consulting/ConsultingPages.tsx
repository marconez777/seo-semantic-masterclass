import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, ChevronDown, ChevronRight, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface PageKeyword {
  id: string;
  keyword: string;
  repartition: number;
  page_id: string;
}

interface PageItem {
  id: string;
  page_url: string | null;
  seo_title: string | null;
  seo_description: string | null;
  main_keyword: string | null;
  position: number | null;
  client_id: string;
  keywords: PageKeyword[];
}

interface Props {
  clientId: string;
  readOnly: boolean;
}

export function ConsultingPages({ clientId, readOnly }: Props) {
  const { toast } = useToast();
  const [pages, setPages] = useState<PageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [openPages, setOpenPages] = useState<Set<string>>(new Set());
  const [editingPage, setEditingPage] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ page_url: "", seo_title: "", seo_description: "", main_keyword: "" });
  const [newKwText, setNewKwText] = useState<Record<string, string>>({});
  const [newKwRep, setNewKwRep] = useState<Record<string, string>>({});
  const [addingPage, setAddingPage] = useState(false);
  const [newPage, setNewPage] = useState({ page_url: "", seo_title: "", seo_description: "", main_keyword: "" });

  const fetchPages = async () => {
    setLoading(true);
    const { data: pagesData } = await supabase
      .from("consulting_pages")
      .select("*")
      .eq("client_id", clientId)
      .order("position", { ascending: true });

    if (!pagesData || pagesData.length === 0) {
      setPages([]);
      setLoading(false);
      return;
    }

    const pageIds = pagesData.map(p => p.id);
    const { data: kwData } = await supabase
      .from("consulting_page_keywords")
      .select("*")
      .in("page_id", pageIds);

    const kwMap: Record<string, PageKeyword[]> = {};
    (kwData || []).forEach(kw => {
      if (!kwMap[kw.page_id]) kwMap[kw.page_id] = [];
      kwMap[kw.page_id].push(kw);
    });

    setPages(pagesData.map(p => ({ ...p, keywords: kwMap[p.id] || [] })));
    setLoading(false);
  };

  useEffect(() => { fetchPages(); }, [clientId]);

  const togglePage = (id: string) => {
    setOpenPages(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleAddPage = async () => {
    const { error } = await supabase.from("consulting_pages").insert({
      client_id: clientId,
      page_url: newPage.page_url || null,
      seo_title: newPage.seo_title || null,
      seo_description: newPage.seo_description || null,
      main_keyword: newPage.main_keyword || null,
      position: pages.length + 1,
    });
    if (error) {
      toast({ title: "Erro", description: error.message });
    } else {
      setNewPage({ page_url: "", seo_title: "", seo_description: "", main_keyword: "" });
      setAddingPage(false);
      fetchPages();
    }
  };

  const handleDeletePage = async (id: string) => {
    await supabase.from("consulting_page_keywords").delete().eq("page_id", id);
    await supabase.from("consulting_pages").delete().eq("id", id);
    fetchPages();
  };

  const startEditPage = (p: PageItem) => {
    setEditingPage(p.id);
    setEditForm({
      page_url: p.page_url || "",
      seo_title: p.seo_title || "",
      seo_description: p.seo_description || "",
      main_keyword: p.main_keyword || "",
    });
  };

  const saveEditPage = async () => {
    if (!editingPage) return;
    const { error } = await supabase.from("consulting_pages").update({
      page_url: editForm.page_url || null,
      seo_title: editForm.seo_title || null,
      seo_description: editForm.seo_description || null,
      main_keyword: editForm.main_keyword || null,
    }).eq("id", editingPage);
    if (error) {
      toast({ title: "Erro", description: error.message });
    } else {
      setEditingPage(null);
      fetchPages();
    }
  };

  const handleAddKeyword = async (pageId: string) => {
    const kw = (newKwText[pageId] || "").trim();
    if (!kw) return;
    const rep = parseFloat(newKwRep[pageId] || "0") || 0;
    const { error } = await supabase.from("consulting_page_keywords").insert({
      page_id: pageId,
      keyword: kw,
      repartition: rep,
    });
    if (error) {
      toast({ title: "Erro", description: error.message });
    } else {
      setNewKwText(prev => ({ ...prev, [pageId]: "" }));
      setNewKwRep(prev => ({ ...prev, [pageId]: "" }));
      fetchPages();
    }
  };

  const handleDeleteKeyword = async (kwId: string) => {
    await supabase.from("consulting_page_keywords").delete().eq("id", kwId);
    fetchPages();
  };

  if (loading) return <div className="py-8 text-center text-muted-foreground">Carregando...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Páginas ({pages.length})</h3>
        {!readOnly && (
          <Button size="sm" onClick={() => setAddingPage(!addingPage)}>
            <Plus className="h-4 w-4 mr-1" /> Nova Página
          </Button>
        )}
      </div>

      {addingPage && !readOnly && (
        <Card>
          <CardContent className="pt-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label>Palavra-chave principal</Label>
                <Input value={newPage.main_keyword} onChange={e => setNewPage(v => ({ ...v, main_keyword: e.target.value }))} placeholder="ex: consultoria seo" />
              </div>
              <div>
                <Label>URL da página</Label>
                <Input value={newPage.page_url} onChange={e => setNewPage(v => ({ ...v, page_url: e.target.value }))} placeholder="https://site.com/pagina" />
              </div>
              <div>
                <Label>Título SEO</Label>
                <Input value={newPage.seo_title} onChange={e => setNewPage(v => ({ ...v, seo_title: e.target.value }))} placeholder="Título da página para SEO" />
              </div>
              <div>
                <Label>Descrição SEO</Label>
                <Input value={newPage.seo_description} onChange={e => setNewPage(v => ({ ...v, seo_description: e.target.value }))} placeholder="Meta description" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAddPage}>Salvar</Button>
              <Button size="sm" variant="ghost" onClick={() => setAddingPage(false)}>Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {pages.length === 0 && !addingPage && (
        <div className="py-12 text-center text-muted-foreground">Nenhuma página cadastrada</div>
      )}

      {pages.map((page, idx) => (
        <Collapsible key={page.id} open={openPages.has(page.id)} onOpenChange={() => togglePage(page.id)}>
          <Card>
            <CardHeader className="py-3 px-4">
              <div className="flex items-center justify-between">
                <CollapsibleTrigger asChild>
                  <button className="flex items-center gap-2 text-left hover:text-primary transition-colors">
                    {openPages.has(page.id) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    <span className="font-semibold">Página {idx + 1}: {page.main_keyword || "Sem palavra-chave"}</span>
                  </button>
                </CollapsibleTrigger>
                {!readOnly && (
                  <Button size="icon" variant="ghost" onClick={() => handleDeletePage(page.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CollapsibleContent>
              <CardContent className="pt-0 space-y-4">
                {editingPage === page.id && !readOnly ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div><Label>Palavra-chave principal</Label><Input value={editForm.main_keyword} onChange={e => setEditForm(v => ({ ...v, main_keyword: e.target.value }))} /></div>
                      <div><Label>URL</Label><Input value={editForm.page_url} onChange={e => setEditForm(v => ({ ...v, page_url: e.target.value }))} /></div>
                      <div><Label>Título SEO</Label><Input value={editForm.seo_title} onChange={e => setEditForm(v => ({ ...v, seo_title: e.target.value }))} /></div>
                      <div><Label>Descrição SEO</Label><Input value={editForm.seo_description} onChange={e => setEditForm(v => ({ ...v, seo_description: e.target.value }))} /></div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={saveEditPage}><Save className="h-4 w-4 mr-1" /> Salvar</Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingPage(null)}>Cancelar</Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 text-sm">
                      <div><span className="text-muted-foreground">Keyword:</span> <strong>{page.main_keyword || "—"}</strong></div>
                      <div><span className="text-muted-foreground">URL:</span> {page.page_url ? <a href={page.page_url} target="_blank" rel="noopener noreferrer" className="text-primary underline">{page.page_url}</a> : "—"}</div>
                      <div><span className="text-muted-foreground">Title:</span> {page.seo_title || "—"}</div>
                      <div><span className="text-muted-foreground">Description:</span> {page.seo_description || "—"}</div>
                    </div>
                    {!readOnly && (
                      <Button size="sm" variant="outline" onClick={() => startEditPage(page)}>Editar metadados</Button>
                    )}
                  </div>
                )}

                {/* Secondary keywords */}
                <div>
                  <h4 className="text-sm font-semibold mb-2">Palavras secundárias ({page.keywords.length})</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Palavra-chave</TableHead>
                        <TableHead className="w-32">Repartição (%)</TableHead>
                        {!readOnly && <TableHead className="w-16" />}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {page.keywords.map(kw => (
                        <TableRow key={kw.id}>
                          <TableCell>{kw.keyword}</TableCell>
                          <TableCell>{Number(kw.repartition).toFixed(2)}%</TableCell>
                          {!readOnly && (
                            <TableCell>
                              <Button size="icon" variant="ghost" onClick={() => handleDeleteKeyword(kw.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                      {!readOnly && (
                        <TableRow>
                          <TableCell>
                            <Input
                              value={newKwText[page.id] || ""}
                              onChange={e => setNewKwText(prev => ({ ...prev, [page.id]: e.target.value }))}
                              placeholder="Nova palavra secundária"
                              className="h-8"
                              onKeyDown={e => e.key === "Enter" && handleAddKeyword(page.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={newKwRep[page.id] || ""}
                              onChange={e => setNewKwRep(prev => ({ ...prev, [page.id]: e.target.value }))}
                              placeholder="0.00"
                              className="h-8"
                              type="number"
                              step="0.01"
                            />
                          </TableCell>
                          <TableCell>
                            <Button size="icon" variant="ghost" onClick={() => handleAddKeyword(page.id)}>
                              <Plus className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      )}
                      {page.keywords.length === 0 && readOnly && (
                        <TableRow><TableCell colSpan={2} className="text-center text-muted-foreground py-4">Nenhuma palavra secundária</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      ))}
    </div>
  );
}
