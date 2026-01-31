import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, ExternalLink, CheckCircle2, AlertCircle } from "lucide-react";
import { useAllPageSEOContent, PAGE_SLUGS, type PageSEOContent } from "@/hooks/usePageSEOContent";
import SEOContentEditor from "@/components/admin/SEOContentEditor";

export default function AdminConteudoSEO() {
  const { data: allContent, isLoading, refetch } = useAllPageSEOContent();
  const [isEditing, setIsEditing] = useState(false);
  const [editingContent, setEditingContent] = useState<PageSEOContent | null>(null);

  const getContentForSlug = (slug: string) => {
    return allContent?.find(c => c.page_slug === slug);
  };

  const handleEdit = (content: PageSEOContent) => {
    setEditingContent(content);
    setIsEditing(true);
  };

  const handleNew = () => {
    setEditingContent(null);
    setIsEditing(true);
  };

  const handleClose = () => {
    setIsEditing(false);
    setEditingContent(null);
  };

  const handleSaved = () => {
    refetch();
    handleClose();
  };

  if (isEditing) {
    return (
      <SEOContentEditor 
        editingContent={editingContent}
        onClose={handleClose}
        onSaved={handleSaved}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Conteúdo SEO</h2>
          <p className="text-muted-foreground">
            Gerencie os textos SEO das páginas de categorias do marketplace
          </p>
        </div>
        <Button onClick={handleNew}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Conteúdo
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Páginas de Categoria</CardTitle>
          <CardDescription>
            18 páginas disponíveis para configuração de conteúdo SEO
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Carregando...
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Página</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Meta Title</TableHead>
                  <TableHead>FAQs</TableHead>
                  <TableHead>Última Atualização</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {PAGE_SLUGS.map((page) => {
                  const content = getContentForSlug(page.slug);
                  const hasContent = !!content?.main_content;
                  const hasMeta = !!content?.meta_title && !!content?.meta_description;
                  
                  return (
                    <TableRow key={page.slug}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{page.label}</span>
                          <a 
                            href={`/${page.slug}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-primary"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                        <span className="text-xs text-muted-foreground">/{page.slug}</span>
                      </TableCell>
                      <TableCell>
                        {hasContent && hasMeta ? (
                          <Badge variant="default" className="gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Completo
                          </Badge>
                        ) : content ? (
                          <Badge variant="secondary" className="gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Parcial
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="gap-1">
                            Pendente
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm truncate max-w-[200px] block">
                          {content?.meta_title || "-"}
                        </span>
                      </TableCell>
                      <TableCell>
                        {content?.faqs?.length || 0} FAQs
                      </TableCell>
                      <TableCell>
                        {content?.updated_at 
                          ? new Date(content.updated_at).toLocaleDateString("pt-BR")
                          : "-"
                        }
                      </TableCell>
                      <TableCell className="text-right">
                        {content ? (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEdit(content)}
                          >
                            <Pencil className="h-4 w-4 mr-1" />
                            Editar
                          </Button>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setEditingContent(null);
                              setIsEditing(true);
                            }}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Configurar
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
