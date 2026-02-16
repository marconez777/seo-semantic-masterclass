import { useEffect, useState } from "react";
import SEOHead from "@/components/seo/SEOHead";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Search, ExternalLink } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Lead {
  id: string;
  name: string;
  email: string;
  whatsapp: string | null;
  website: string | null;
  status: string;
  notes: string | null;
  created_at: string;
}

export default function AdminLeads() {
  const { toast } = useToast();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchLeads = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("backlink_leads" as any)
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Erro ao buscar leads: " + error.message });
    } else {
      setLeads((data as any) || []);
    }
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("backlink_leads" as any)
      .update({ status } as any)
      .eq("id", id);

    if (error) {
      toast({ title: "Erro ao atualizar status: " + error.message });
    } else {
      setLeads(leads.map((l) => (l.id === id ? { ...l, status } : l)));
    }
  };

  const deleteLead = async () => {
    if (!deleteId) return;
    const { error } = await supabase
      .from("backlink_leads" as any)
      .delete()
      .eq("id", deleteId);

    if (error) {
      toast({ title: "Erro ao excluir lead: " + error.message });
    } else {
      toast({ title: "Lead excluído" });
      setLeads(leads.filter((l) => l.id !== deleteId));
    }
    setDeleteId(null);
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const filtered = leads.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.email.toLowerCase().includes(search.toLowerCase()) ||
      (l.website && l.website.toLowerCase().includes(search.toLowerCase()))
  );

  const statusColor = (s: string) => {
    switch (s) {
      case "novo": return "bg-blue-500";
      case "contatado": return "bg-yellow-500";
      case "enviado": return "bg-green-500";
      default: return "bg-muted";
    }
  };

  return (
    <>
      <SEOHead
        title="Admin – Leads Backlinks Grátis | MK Art SEO"
        description="Gerenciar leads de backlinks grátis."
        canonicalUrl="https://mkart.com.br/admin/leads"
        noindex
      />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Leads – 3 Backlinks Grátis</h2>
          <Badge variant="secondary">{leads.length} leads</Badge>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, email ou site..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {loading ? (
          <div className="text-center py-10">Carregando leads...</div>
        ) : filtered.length === 0 ? (
          <div className="border rounded-md p-8 text-center">
            <p className="text-muted-foreground">Nenhum lead encontrado.</p>
          </div>
        ) : (
          <div className="border rounded-md overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>WhatsApp</TableHead>
                  <TableHead>Site</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium">{lead.name}</TableCell>
                    <TableCell>{lead.email}</TableCell>
                    <TableCell>{lead.whatsapp || "—"}</TableCell>
                    <TableCell>
                      {lead.website ? (
                        (() => {
                          try {
                            const url = new URL(lead.website.startsWith('http') ? lead.website : `https://${lead.website}`);
                            return (
                              <a
                                href={url.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-primary hover:underline"
                              >
                                {url.hostname}
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            );
                          } catch {
                            return <span>{lead.website}</span>;
                          }
                        })()
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={lead.status}
                        onValueChange={(v) => updateStatus(lead.id, v)}
                      >
                        <SelectTrigger className="w-[130px] h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="novo">
                            <Badge className={`${statusColor("novo")} text-white`}>Novo</Badge>
                          </SelectItem>
                          <SelectItem value="contatado">
                            <Badge className={`${statusColor("contatado")} text-white`}>Contatado</Badge>
                          </SelectItem>
                          <SelectItem value="enviado">
                            <Badge className={`${statusColor("enviado")} text-white`}>Enviado</Badge>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {new Date(lead.created_at).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteId(lead.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir lead?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteLead}
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
