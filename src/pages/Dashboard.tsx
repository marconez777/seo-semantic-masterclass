import { useEffect, useMemo, useState } from "react";
import SEOHead from "@/components/seo/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
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


function PurchasesTable({ userId }: { userId: string }) {
  const [rows, setRows] = useState<any[]>([]);
  const [pubSummary, setPubSummary] = useState<Record<string, { total: number; published: number; inProgress: number; rejected: number }>>({});
  const [orderSites, setOrderSites] = useState<Record<string, string[]>>({});

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data, error } = await supabase
        .from('pedidos')
        .select('id, status, total_cents, created_at, abacate_url')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) console.error('Erro pedidos', error);
      const pedidos = data ?? [];

      // compute publication summary per order and get sites
      const orderIds = pedidos.map((p) => p.id);
      let summary: Record<string, { total: number; published: number; inProgress: number; rejected: number }> = {};
      let sites: Record<string, string[]> = {};
      
      if (orderIds.length) {
        const { data: items, error: itemsErr } = await supabase
          .from('order_items')
          .select('order_id, publication_status, backlink_id')
          .in('order_id', orderIds);
        if (itemsErr) console.error('Erro order_items', itemsErr);
        
        // Get unique backlink IDs
        const backlinkIds = Array.from(new Set((items ?? []).map((i) => i.backlink_id)));
        let backlinkMap: Record<string, string> = {};
        
        if (backlinkIds.length) {
          const { data: backs } = await supabase
            .from('backlinks_public')
            .select('id, site_name')
            .in('id', backlinkIds);
          (backs ?? []).forEach((b) => { backlinkMap[b.id] = b.site_name; });
        }
        
        (items ?? []).forEach((it) => {
          const k = it.order_id;
          if (!summary[k]) summary[k] = { total: 0, published: 0, inProgress: 0, rejected: 0 };
          if (!sites[k]) sites[k] = [];
          
          summary[k].total += 1;
          if (it.publication_status === 'published') summary[k].published += 1;
          else if (it.publication_status === 'in_progress') summary[k].inProgress += 1;
          else if (it.publication_status === 'rejected') summary[k].rejected += 1;
          
          // Add site name if not already added
          const siteName = backlinkMap[it.backlink_id];
          if (siteName && !sites[k].includes(siteName)) {
            sites[k].push(siteName);
          }
        });
      }

      if (mounted) {
        setRows(pedidos);
        setPubSummary(summary);
        setOrderSites(sites);
      }
    })();
    return () => { mounted = false; };
  }, [userId]);

  const renderPubBadge = (orderId: string) => {
    const s = pubSummary[orderId];
    if (!s || s.total === 0) return <Badge className="bg-muted text-muted-foreground border">—</Badge>;
    if (s.published === s.total) return <Badge className="bg-secondary/15 text-secondary border-secondary/20">Publicado</Badge>;
    if (s.rejected > 0) return <Badge className="bg-destructive/15 text-destructive border-destructive/20">Rejeitado</Badge>;
    // Para publicações em progresso ou pendentes, usar laranja
    return <Badge className="bg-warning/15 text-warning border-warning/20">Pendente</Badge>;
  };

  const renderOrderStatusBadge = (s: string) => {
    const map: Record<string, { label: string; cls: string }> = {
      pending: { label: 'Pendente', cls: 'bg-warning/15 text-warning border-warning/20' },
      paid: { label: 'Pago', cls: 'bg-secondary/15 text-secondary border-secondary/20' },
      cancelled: { label: 'Cancelado', cls: 'bg-destructive/15 text-destructive border-destructive/20' },
      refunded: { label: 'Reembolsado', cls: 'bg-muted text-muted-foreground border' },
    };
    const cfg = map[s] ?? { label: s, cls: 'bg-muted text-foreground border' };
    return <Badge className={cfg.cls}>{cfg.label}</Badge>;
  };

  const renderSites = (orderId: string) => {
    const sites = orderSites[orderId] || [];
    if (sites.length === 0) return <span className="text-muted-foreground">—</span>;
    if (sites.length === 1) return <span>{sites[0]}</span>;
    return <span>{sites.slice(0, 2).join(', ')}{sites.length > 2 ? ` +${sites.length - 2}` : ''}</span>;
  };
  return (
    <div className="border rounded-md overflow-x-auto bg-card">
      <table className="w-full text-sm">
        <thead className="bg-muted/60">
          <tr className="text-left">
            <th className="p-3 uppercase font-bold tracking-wide">Pedido</th>
            <th className="p-3 uppercase font-bold tracking-wide">Criado em</th>
            <th className="p-3 uppercase font-bold tracking-wide">Site</th>
            <th className="p-3 uppercase font-bold tracking-wide">Total</th>
            <th className="p-3 uppercase font-bold tracking-wide">Pagamento</th>
            <th className="p-3 uppercase font-bold tracking-wide">Publicação</th>
            <th className="p-3 uppercase font-bold tracking-wide">Ações</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td className="p-4" colSpan={7}>Nenhum pedido.</td></tr>
          ) : rows.map((r) => (
            <tr key={r.id} className="border-t">
              <td className="p-3">{r.id}</td>
              <td className="p-3">{new Date(r.created_at).toLocaleString('pt-BR')}</td>
              <td className="p-3">{renderSites(r.id)}</td>
              <td className="p-3">{(r.total_cents/100).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</td>
              <td className="p-3">{renderOrderStatusBadge(r.status)}</td>
              <td className="p-3">{renderPubBadge(r.id)}</td>
              <td className="p-3">
                {r.status === 'paid' ? (
                  <a className="story-link text-primary" href={`/recibo/${r.id}`} target="_blank" rel="noopener noreferrer">Ver recibo</a>
                ) : r.abacate_url ? (
                  <a className="story-link text-primary" href={r.abacate_url} target="_blank" rel="noopener noreferrer">Ver cobrança</a>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PublicationsTable({ userId }: { userId: string }) {
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      // Fetch order items for this user (RLS ensures only own items are visible)
      const { data: items, error } = await supabase
        .from('order_items')
        .select('id, order_id, backlink_id, anchor_text, target_url, publication_status, publication_url, created_at')
        .order('created_at', { ascending: false });
      if (error) console.error('Erro itens/publicações', error);

      const backlinkIds = Array.from(new Set((items ?? []).map((i) => i.backlink_id)));
      let backlinkMap: Record<string, { site: string }> = {};
      if (backlinkIds.length) {
        const { data: backs } = await supabase
          .from('backlinks')
          .select('id, site_name, site_url')
          .in('id', backlinkIds);
        (backs ?? []).forEach((b) => { backlinkMap[b.id] = { site: b.site_name || b.site_url }; });
      }

      if (mounted) {
        setRows((items ?? []).map((i) => ({ ...i, site: backlinkMap[i.backlink_id]?.site })));
      }
    })();
    return () => { mounted = false; };
  }, [userId]);

  const statusBadge = (s: string) => {
    if (s === 'published') return <Badge className="bg-secondary/15 text-secondary border-secondary/20">Publicado</Badge>;
    if (s === 'in_progress') return <Badge className="bg-warning/15 text-warning border-warning/20">Pendente</Badge>;
    if (s === 'rejected') return <Badge className="bg-destructive/15 text-destructive border-destructive/20">Rejeitado</Badge>;
    return <Badge className="bg-warning/15 text-warning border-warning/20">Pendente</Badge>;
  }

  return (
    <div className="border rounded-md overflow-x-auto bg-card">
      <table className="w-full text-sm">
        <thead className="bg-muted/60">
          <tr className="text-left">
            <th className="p-3 uppercase font-bold tracking-wide">Pedido</th>
            <th className="p-3 uppercase font-bold tracking-wide">Site</th>
            <th className="p-3 uppercase font-bold tracking-wide">Âncora</th>
            <th className="p-3 uppercase font-bold tracking-wide">URL destino</th>
            <th className="p-3 uppercase font-bold tracking-wide">Status</th>
            <th className="p-3 uppercase font-bold tracking-wide">Publicação</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td className="p-4" colSpan={6}>Sem publicações.</td></tr>
          ) : rows.map((r) => (
            <tr key={r.id} className="border-t">
              <td className="p-3">{r.order_id}</td>
              <td className="p-3">{r.site ?? r.backlink_id}</td>
              <td className="p-3">{r.anchor_text ?? '—'}</td>
              <td className="p-3">
                {r.target_url ? (
                  <a href={r.target_url} className="story-link text-primary" target="_blank" rel="noopener noreferrer">
                    {r.target_url}
                  </a>
                ) : '—'}
              </td>
              <td className="p-3">{statusBadge(r.publication_status)}</td>
              <td className="p-3">
                {r.publication_url ? (
                  <a href={r.publication_url} className="story-link text-primary" target="_blank" rel="noopener noreferrer">
                    Ver publicação
                  </a>
                ) : <span className="text-muted-foreground">—</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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
  const { clearCart } = useCart();
  const [userId, setUserId] = useState<string | null>(null);
  const [tab, setTab] = useState<string>("pedidos");
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('paid') === '1') {
      clearCart();
    }
  }, [location.search, clearCart]);
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
    
    // Verificar se o usuário tem role de admin usando RBAC
    const checkAdminRole = async () => {
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .eq('role', 'admin')
          .single();
        
        if (error && error.code !== 'PGRST116') {
          console.error('Erro ao verificar role de admin:', error);
          setIsAdmin(false);
          return;
        }
        
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
        description="Veja seus pedidos e favoritos."
        canonicalUrl={`${window.location.origin}/painel`}
        keywords="dashboard, pedidos, favoritos"
      />

      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <Sidebar collapsible="offcanvas" className="w-60">
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Minha Conta</SidebarGroupLabel>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton isActive={tab==='pedidos'} onClick={() => setTab('pedidos')}>
                      <ClipboardList className="mr-2" />
                      <span>Pedidos</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton isActive={tab==='publicacoes'} onClick={() => setTab('publicacoes')}>
                      <FileCheck2 className="mr-2" />
                      <span>Publicações</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
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
                  <TabsTrigger value="pedidos">Pedidos</TabsTrigger>
                  <TabsTrigger value="publicacoes">Publicações</TabsTrigger>
                  <TabsTrigger value="favoritos">Favoritos</TabsTrigger>
                  <TabsTrigger value="perfil">Perfil</TabsTrigger>
                </TabsList>

                <TabsContent value="pedidos" className="space-y-4">
                  <h2 className="text-xl font-semibold">Pedidos</h2>
                  <PurchasesTable userId={userId} />
                </TabsContent>

                <TabsContent value="publicacoes" className="space-y-4">
                  <h2 className="text-xl font-semibold">Publicações</h2>
                  <PublicationsTable userId={userId} />
                </TabsContent>

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
