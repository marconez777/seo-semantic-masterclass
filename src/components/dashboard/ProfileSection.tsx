import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export function ProfileSection() {
  const [email, setEmail] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [whatsapp, setWhatsapp] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editWhatsapp, setEditWhatsapp] = useState("");
  const [editName, setEditName] = useState("");
  
  const [pwdOpen, setPwdOpen] = useState(false);
  const [pwd1, setPwd1] = useState("");
  const [pwd2, setPwd2] = useState("");
  
  const { toast } = useToast();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setEmail(user.email ?? null);
      setName((user.user_metadata as any)?.name ?? null);

      // Fetch profile from profiles table
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, whatsapp")
        .eq("user_id", user.id)
        .single();

      if (profile) {
        if (profile.full_name) setName(profile.full_name);
        setWhatsapp(profile.whatsapp);
        setEditWhatsapp(profile.whatsapp || "");
        setEditName(profile.full_name || "");
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: editName,
          whatsapp: editWhatsapp,
        })
        .eq("user_id", user.id);

      if (error) {
        toast({
          title: "Erro ao salvar",
          description: error.message,
        });
        return;
      }

      setName(editName);
      setWhatsapp(editWhatsapp);
      toast({ title: "Perfil atualizado com sucesso!" });
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (pwd1.length < 6) {
      toast({
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 6 caracteres",
      });
      return;
    }
    if (pwd1 !== pwd2) {
      toast({
        title: "Senhas não conferem",
      });
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: pwd1 });
    if (error) {
      toast({
        title: "Erro ao alterar senha",
        description: error.message,
      });
    } else {
      toast({ title: "Senha alterada com sucesso!" });
      setPwdOpen(false);
      setPwd1("");
      setPwd2("");
    }
  };

  if (loading) {
    return (
      <div className="border rounded-md p-6 bg-card space-y-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-4 w-40" />
      </div>
    );
  }

  return (
    <div className="border rounded-md p-6 bg-card space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="profile-name">Nome</Label>
          <Input
            id="profile-name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            placeholder="Seu nome completo"
          />
        </div>
        <div>
          <Label htmlFor="profile-email">E-mail</Label>
          <Input
            id="profile-email"
            value={email || ""}
            disabled
            className="bg-muted"
          />
        </div>
        <div>
          <Label htmlFor="profile-whatsapp">WhatsApp</Label>
          <Input
            id="profile-whatsapp"
            value={editWhatsapp}
            onChange={(e) => setEditWhatsapp(e.target.value)}
            placeholder="(11) 99999-9999"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Usado para contato sobre seus pedidos
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <Button onClick={saveProfile} disabled={saving}>
          {saving ? "Salvando..." : "Salvar alterações"}
        </Button>
        <Dialog open={pwdOpen} onOpenChange={setPwdOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">Alterar senha</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Alterar senha</DialogTitle>
              <DialogDescription>
                Defina sua nova senha de acesso.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label htmlFor="pwd1">Nova senha</Label>
                <Input
                  id="pwd1"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={pwd1}
                  onChange={(e) => setPwd1(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="pwd2">Confirmar senha</Label>
                <Input
                  id="pwd2"
                  type="password"
                  placeholder="Confirmar senha"
                  value={pwd2}
                  onChange={(e) => setPwd2(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={changePassword}
                disabled={!pwd1 || pwd1 !== pwd2}
              >
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
