import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Globe, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ClientFormDialog } from "@/components/consulting/ClientFormDialog";

interface ConsultingClient {
  id: string;
  name: string;
  domain: string;
  email: string | null;
  whatsapp: string | null;
  status: string;
  user_id: string | null;
  created_at: string;
}

export default function AdminConsultoria() {
  const navigate = useNavigate();
  const [clients, setClients] = useState<ConsultingClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ConsultingClient | null>(null);

  const fetchClients = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("consulting_clients")
      .select("*")
      .order("created_at", { ascending: false });
    setClients(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchClients(); }, []);

  const handleEdit = (client: ConsultingClient) => {
    setEditingClient(client);
    setDialogOpen(true);
  };

  const handleNew = () => {
    setEditingClient(null);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Clientes de Consultoria</h2>
          <p className="text-muted-foreground text-sm">{clients.length} clientes cadastrados</p>
        </div>
        <Button onClick={handleNew}>
          <Plus className="mr-2 h-4 w-4" /> Novo Cliente
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Domínio</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Carregando...</TableCell>
                </TableRow>
              ) : clients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Nenhum cliente cadastrado</TableCell>
                </TableRow>
              ) : clients.map((client) => (
                <TableRow
                  key={client.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => navigate(`/admin/consultoria/${client.id}`)}
                >
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1 text-sm">
                      <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                      {client.domain}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5 text-sm">
                      {client.email && <span>{client.email}</span>}
                      {client.whatsapp && (
                        <span className="inline-flex items-center gap-1 text-muted-foreground">
                          <MessageSquare className="h-3 w-3" /> {client.whatsapp}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={client.status === "ativo" ? "default" : "secondary"}>
                      {client.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(e) => { e.stopPropagation(); handleEdit(client); }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ClientFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        client={editingClient}
        onSuccess={fetchClients}
      />
    </div>
  );
}
