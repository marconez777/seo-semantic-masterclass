import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ConsultingKeywords } from "@/components/consulting/ConsultingKeywords";
import { ConsultingPages } from "@/components/consulting/ConsultingPages";
import { ConsultingBacklinks } from "@/components/consulting/ConsultingBacklinks";

export default function AdminConsultoriaClient() {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clientId) return;
    supabase
      .from("consulting_clients")
      .select("*")
      .eq("id", clientId)
      .maybeSingle()
      .then(({ data }) => {
        setClient(data);
        setLoading(false);
      });
  }, [clientId]);

  if (loading) return <div className="p-6 text-muted-foreground">Carregando...</div>;
  if (!client) return <div className="p-6 text-muted-foreground">Cliente não encontrado.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/consultoria")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold">{client.name}</h2>
          <p className="text-sm text-muted-foreground inline-flex items-center gap-1">
            <Globe className="h-3.5 w-3.5" /> {client.domain}
            <Badge variant={client.status === "ativo" ? "default" : "secondary"} className="ml-2">{client.status}</Badge>
          </p>
        </div>
      </div>

      <Tabs defaultValue="palavras">
        <TabsList>
          <TabsTrigger value="palavras">Palavras</TabsTrigger>
          <TabsTrigger value="paginas">Páginas</TabsTrigger>
          <TabsTrigger value="backlinks">Backlinks</TabsTrigger>
          <TabsTrigger value="blog">Blog</TabsTrigger>
          <TabsTrigger value="tarefas">Tarefas</TabsTrigger>
        </TabsList>
        <TabsContent value="palavras">
          <ConsultingKeywords clientId={client.id} readOnly={false} />
        </TabsContent>
        <TabsContent value="paginas">
          <ConsultingPages clientId={client.id} readOnly={false} />
        </TabsContent>
        <TabsContent value="backlinks">
          <ConsultingBacklinks clientId={client.id} readOnly={false} />
        </TabsContent>
        <TabsContent value="blog">
          <div className="py-12 text-center text-muted-foreground">Em breve — Fase 5</div>
        </TabsContent>
        <TabsContent value="tarefas">
          <div className="py-12 text-center text-muted-foreground">Em breve — Fase 6</div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
