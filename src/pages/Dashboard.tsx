import { useEffect, useMemo, useState } from "react";
import SEOHead from "@/components/seo/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ClipboardList, FileCheck2, Heart, UserCircle, Shield } from "lucide-react";

function ProfileSection() {
  const [email, setEmail] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [pwd1, setPwd1] = useState("");
  const [pwd2, setPwd2] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const user = data.user;
      setEmail(user?.email ?? null);
      setName((user?.user_metadata as any)?.name ?? null);
    });
  }, []);

  const changePassword = async () => {
    if (pwd1.length < 6 || pwd1 !== pwd2) return;
    await supabase.auth.updateUser({ password: pwd1 });
    setOpen(false);
    setPwd1(""); setPwd2("");
  };

  return (
    <div className="border rounded-md p-4 bg-card space-y-4">
      <div>
        <p><strong>Nome:</strong> {name ?? "—"}</p>
        <p><strong>E-mail:</strong> {email ?? "—"}</p>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>Alterar senha</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar senha</DialogTitle>
            <DialogDescription>Defina sua nova senha de acesso.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input type="password" placeholder="Nova senha" value={pwd1} onChange={(e) => setPwd1(e.target.value)} />
            <Input type="password" placeholder="Confirmar senha" value={pwd2} onChange={(e) => setPwd2(e.target.value)} />
          </div>
          <DialogFooter>
            <Button onClick={changePassword} disabled={!pwd1 || pwd1 !== pwd2}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FavoritesTable({ userId }: { userId: string }) {
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: favs, error } = await supabase
        .from('favoritos')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) console.error('Erro favoritos', error);
      const backlinkIds = (favs ?? []).map((f) => f.backlink_id);
      let backlinkMap: Record<string,string> = {};
      if (backlinkIds.length) {
        const { data: backs } = await supabase
          .from('backlinks')
          .select('id, site_name, site_url')
          .in('id', backlinkIds);
        (backs ?? []).forEach((b) => { backlinkMap[b.id] = b.site_name || b.site_url; });
      }
      if (mounted) setRows((favs ?? []).map((f) => ({...f, site: backlinkMap[f.backlink_id] })));
    })();
    return () => { mounted = false; };
  }, [userId]);

  return (
    <div className="border rounded-md overflow-x-auto bg-card">
      <table className="w-full text-sm">
        <thead className="bg-muted/60">
          <tr className="text-left">
            <th className="p-3 uppercase font-bold tracking-wide">Site</th>
            <th className="p-3 uppercase font-bold tracking-wide">Adicionado</th>
            <th className="p-3 uppercase font-bold tracking-wide">Ações</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td className="p-4" colSpan={3}>Sem favoritos.</td></tr>
          ) : rows.map((r) => (
            <tr key={r.id} className="border-t">
              <td className="p-3">{r.site ?? r.backlink_id}</td>
              <td className="p-3">{new Date(r.created_at).toLocaleString('pt-BR')}</td>
              <td className="p-3">
                <Button variant="destructive" size="sm" onClick={async () => {
                  const { error } = await supabase.from('favoritos').delete().eq('id', r.id);
                  if (!error) setRows((prev) => prev.filter((x) => x.id !== r.id));
                }}>Remover</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [userId, setUserId] = useState<string | null>(null);
  const [tab, setTab] = useState<string>("favoritos");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      const id = session?.user?.id ?? null;
      setUserId(id);
      if (!id) navigate('/auth', { replace: true, state: { from: '/painel' } });
    });
    supabase.auth.getSession().then(({ data }) => {
      const id = data.session?.user?.id ?? null;
      setUserId(id);
      if (!id) navigate('/auth', { replace: true, state: { from: '/painel' } });
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!userId) return;
    
    // Verificar se o usuário tem role de admin usando nova estrutura
    const checkAdminRole = async () => {
      try {
        const { data } = await supabase.rpc('is_admin', { uid: userId });
        setIsAdmin(!!data);
      } catch (error) {
        console.error('Erro ao verificar role de admin:', error);
        setIsAdmin(false);
      }
    };

    checkAdminRole();
  }, [userId]);

  if (!userId) return null;

  return (
    <>
      <SEOHead
        title="Painel | MK Art SEO"
        description="Veja seus favoritos e perfil."
        canonicalUrl={`${window.location.origin}/painel`}
        keywords="dashboard, favoritos"
      />

      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <Sidebar collapsible="offcanvas" className="w-60">
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Minha Conta</SidebarGroupLabel>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton isActive={tab==='favoritos'} onClick={() => setTab('favoritos')}>
                      <Heart className="mr-2" />
                      <span>Favoritos</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton isActive={tab==='perfil'} onClick={() => setTab('perfil')}>
                      <UserCircle className="mr-2" />
                      <span>Perfil</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  {isAdmin && (
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <a href="/admin">
                          <Shield className="mr-2" />
                          <span>Admin</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                </SidebarMenu>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>

          <SidebarInset>
            <main className="container mx-auto px-4 py-10 space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <a href="/" aria-label="Ir para a página inicial">
                    <img src="/lovable-uploads/cf1b72dd-c973-4cdf-a2f6-fd7ce7ed8d4d.png" alt="Logo MK Art SEO" className="h-8 w-auto" loading="lazy" />
                  </a>
                  <h1 className="text-3xl font-semibold">Painel</h1>
                </div>
                <div className="flex gap-2">
                  <Button asChild>
                    <a href="/comprar-backlinks">Loja de Backlinks</a>
                  </Button>
                  <Button variant="outline" onClick={() => supabase.auth.signOut()}>Sair</Button>
                </div>
              </div>

              <Tabs value={tab} onValueChange={setTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="favoritos">Favoritos</TabsTrigger>
                  <TabsTrigger value="perfil">Perfil</TabsTrigger>
                </TabsList>

                <TabsContent value="favoritos" className="space-y-4">
                  <h2 className="text-xl font-semibold">Favoritos</h2>
                  <FavoritesTable userId={userId} />
                </TabsContent>

                <TabsContent value="perfil" className="space-y-4">
                  <h2 className="text-xl font-semibold">Perfil</h2>
                  <ProfileSection />
                </TabsContent>
              </Tabs>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </>
  );
}