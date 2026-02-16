import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface ClientFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: {
    id: string;
    name: string;
    domain: string;
    email: string | null;
    whatsapp: string | null;
    status: string;
    user_id: string | null;
  } | null;
  onSuccess: () => void;
}

export function ClientFormDialog({ open, onOpenChange, client, onSuccess }: ClientFormDialogProps) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    domain: "",
    email: "",
    whatsapp: "",
    status: "ativo",
    user_id: "",
  });

  useEffect(() => {
    if (client) {
      setForm({
        name: client.name,
        domain: client.domain,
        email: client.email || "",
        whatsapp: client.whatsapp || "",
        status: client.status,
        user_id: client.user_id || "",
      });
    } else {
      setForm({ name: "", domain: "", email: "", whatsapp: "", status: "ativo", user_id: "" });
    }
  }, [client, open]);

  const handleSave = async () => {
    if (!form.name.trim() || !form.domain.trim()) {
      toast({ title: "Preencha nome e domínio" });
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      domain: form.domain.trim(),
      email: form.email.trim() || null,
      whatsapp: form.whatsapp.trim() || null,
      status: form.status,
      user_id: form.user_id.trim() || null,
    };

    let error;
    if (client) {
      ({ error } = await supabase.from("consulting_clients").update(payload).eq("id", client.id));
    } else {
      ({ error } = await supabase.from("consulting_clients").insert(payload));
    }

    setSaving(false);
    if (error) {
      toast({ title: "Erro ao salvar", description: error.message });
    } else {
      toast({ title: client ? "Cliente atualizado" : "Cliente criado" });
      onOpenChange(false);
      onSuccess();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{client ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Nome *</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nome do cliente" />
          </div>
          <div>
            <Label>Domínio *</Label>
            <Input value={form.domain} onChange={(e) => setForm({ ...form, domain: e.target.value })} placeholder="exemplo.com.br" />
          </div>
          <div>
            <Label>Email</Label>
            <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@exemplo.com" />
          </div>
          <div>
            <Label>WhatsApp</Label>
            <Input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} placeholder="(11) 99999-9999" />
          </div>
          <div>
            <Label>User ID (vincular conta)</Label>
            <Input value={form.user_id} onChange={(e) => setForm({ ...form, user_id: e.target.value })} placeholder="UUID do usuário (opcional)" />
          </div>
          <div>
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="inativo">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
