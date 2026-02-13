import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const GOOGLE_REGIONS = [
  { value: "www.google.com.br", label: "Brasil (google.com.br)" },
  { value: "www.google.com", label: "EUA (google.com)" },
  { value: "www.google.pt", label: "Portugal (google.pt)" },
  { value: "www.google.co.uk", label: "Reino Unido (google.co.uk)" },
  { value: "www.google.es", label: "Espanha (google.es)" },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  onCreated: () => void;
  canCreate: boolean;
}

export function NewProjectModal({ open, onOpenChange, userId, onCreated, canCreate }: Props) {
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [region, setRegion] = useState("www.google.com.br");
  const [device, setDevice] = useState("desktop");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !domain.trim()) {
      toast({ title: "Preencha todos os campos obrigatórios" });
      return;
    }

    // Clean domain
    const cleanDomain = domain.replace(/^(https?:\/\/)?(www\.)?/, "").replace(/\/$/, "");

    setLoading(true);
    const { error } = await supabase.from("keyword_projects").insert({
      user_id: userId,
      name: name.trim(),
      domain: cleanDomain,
      region,
      device,
    });
    setLoading(false);

    if (error) {
      toast({ title: "Erro ao criar projeto", description: error.message });
      return;
    }

    toast({ title: "Projeto criado com sucesso!" });
    setName("");
    setDomain("");
    setRegion("www.google.com.br");
    setDevice("desktop");
    onOpenChange(false);
    onCreated();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Projeto de Rastreio</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="project-name">Nome do Projeto</Label>
            <Input id="project-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Meu Site Principal" maxLength={100} />
          </div>

          <div>
            <Label htmlFor="project-domain">Domínio</Label>
            <Input id="project-domain" value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="Ex: meusite.com.br" maxLength={255} />
            <p className="text-xs text-muted-foreground mt-1">Sem http/https ou www</p>
          </div>

          <div>
            <Label>Região Google</Label>
            <Select value={region} onValueChange={setRegion}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {GOOGLE_REGIONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Dispositivo</Label>
            <Select value={device} onValueChange={setDevice}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="desktop">Desktop</SelectItem>
                <SelectItem value="mobile">Mobile</SelectItem>
                <SelectItem value="tablet">Tablet</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={loading || !canCreate}>
            {loading ? "Criando..." : "Criar Projeto"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
