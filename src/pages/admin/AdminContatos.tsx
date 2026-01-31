import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Mail, Eye, Trash2, Search, MessageSquare, CheckCircle2, Clock } from "lucide-react";

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  message: string;
  status: string;
  created_at: string;
  read_at: string | null;
  notes: string | null;
}

export default function AdminContatos() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedContact, setSelectedContact] = useState<ContactSubmission | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [notes, setNotes] = useState("");

  const { data: submissions, isLoading } = useQuery({
    queryKey: ["contact-submissions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_submissions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ContactSubmission[];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status, notes, read_at }: { id: string; status?: string; notes?: string; read_at?: string }) => {
      const updateData: Record<string, unknown> = {};
      if (status !== undefined) updateData.status = status;
      if (notes !== undefined) updateData.notes = notes;
      if (read_at !== undefined) updateData.read_at = read_at;

      const { error } = await supabase
        .from("contact_submissions")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact-submissions"] });
      toast({ title: "Contato atualizado!" });
    },
    onError: () => {
      toast({ title: "Erro ao atualizar" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("contact_submissions")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact-submissions"] });
      toast({ title: "Contato excluído!" });
      setSelectedContact(null);
    },
    onError: () => {
      toast({ title: "Erro ao excluir" });
    },
  });

  const handleViewContact = (contact: ContactSubmission) => {
    setSelectedContact(contact);
    setNotes(contact.notes || "");

    // Mark as read if not already
    if (!contact.read_at) {
      updateMutation.mutate({ id: contact.id, read_at: new Date().toISOString() });
    }
  };

  const handleSaveNotes = () => {
    if (selectedContact) {
      updateMutation.mutate({ id: selectedContact.id, notes });
    }
  };

  const handleStatusChange = (status: string) => {
    if (selectedContact) {
      updateMutation.mutate({ id: selectedContact.id, status });
      setSelectedContact({ ...selectedContact, status });
    }
  };

  const getStatusBadge = (status: string, readAt: string | null) => {
    if (status === "respondido") {
      return <Badge variant="default" className="gap-1"><CheckCircle2 className="h-3 w-3" />Respondido</Badge>;
    }
    if (!readAt) {
      return <Badge variant="destructive" className="gap-1"><MessageSquare className="h-3 w-3" />Novo</Badge>;
    }
    return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />Lido</Badge>;
  };

  const filteredSubmissions = submissions?.filter((s) => {
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "novo" && !s.read_at) ||
      (filterStatus === "lido" && s.read_at && s.status !== "respondido") ||
      (filterStatus === "respondido" && s.status === "respondido");

    const matchesSearch =
      !searchTerm ||
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.message.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const newCount = submissions?.filter((s) => !s.read_at).length || 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          Formulários de Contato
          {newCount > 0 && (
            <Badge variant="destructive">{newCount} novo{newCount > 1 ? "s" : ""}</Badge>
          )}
        </h2>
        <p className="text-muted-foreground">
          Mensagens recebidas através do formulário de contato
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <CardTitle>Mensagens</CardTitle>
              <CardDescription>{submissions?.length || 0} contatos recebidos</CardDescription>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-full sm:w-[200px]"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="novo">Novos</SelectItem>
                  <SelectItem value="lido">Lidos</SelectItem>
                  <SelectItem value="respondido">Respondidos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : !filteredSubmissions?.length ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma mensagem encontrada
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Mensagem</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubmissions.map((contact) => (
                  <TableRow key={contact.id} className={!contact.read_at ? "bg-primary/5" : ""}>
                    <TableCell>{getStatusBadge(contact.status, contact.read_at)}</TableCell>
                    <TableCell className="font-medium">{contact.name}</TableCell>
                    <TableCell>{contact.email}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{contact.message}</TableCell>
                    <TableCell>
                      {format(new Date(contact.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleViewContact(contact)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                          <a href={`mailto:${contact.email}`}>
                            <Mail className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <Dialog open={!!selectedContact} onOpenChange={() => setSelectedContact(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Contato</DialogTitle>
            <DialogDescription>
              Mensagem recebida em {selectedContact && format(new Date(selectedContact.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </DialogDescription>
          </DialogHeader>

          {selectedContact && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Nome</label>
                  <p className="font-medium">{selectedContact.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="font-medium">
                    <a href={`mailto:${selectedContact.email}`} className="text-primary hover:underline">
                      {selectedContact.email}
                    </a>
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Mensagem</label>
                <p className="mt-1 p-4 bg-muted rounded-lg whitespace-pre-wrap">{selectedContact.message}</p>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <Select value={selectedContact.status} onValueChange={handleStatusChange}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="novo">Novo</SelectItem>
                      <SelectItem value="lido">Lido</SelectItem>
                      <SelectItem value="respondido">Respondido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Notas Internas</label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Adicione notas sobre este contato..."
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div className="flex justify-between">
                <Button
                  variant="destructive"
                  onClick={() => deleteMutation.mutate(selectedContact.id)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" asChild>
                    <a href={`mailto:${selectedContact.email}`}>
                      <Mail className="h-4 w-4 mr-2" />
                      Responder por Email
                    </a>
                  </Button>
                  <Button onClick={handleSaveNotes} disabled={updateMutation.isPending}>
                    Salvar Notas
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
