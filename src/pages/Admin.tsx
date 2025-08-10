import { useEffect, useMemo, useState } from "react";
import SEOHead from "@/components/seo/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";

interface Pedido {
  id: string;
  user_id: string;
  status: string;
  total_cents: number;
  created_at: string;
  abacate_url: string | null;
  customer_email: string | null;
  customer_name: string | null;
  customer_cpf: string | null;
  customer_phone: string | null;
}

interface OrderItem {
  id: string;
  order_id: string;
  backlink_id: string;
  quantity: number;
  price_cents: number;
  anchor_text: string | null;
  target_url: string | null;
  publication_status: "pending" | "in_progress" | "published" | "rejected";
  publication_url: string | null;
  created_at: string;
}

export default function Admin() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [itemsByOrder, setItemsByOrder] = useState<Record<string, OrderItem[]>>({});
  const [siteMap, setSiteMap] = useState<Record<string, { name: string; url: string }>>({});
  const [loading, setLoading] = useState(false);
  const [publinks, setPublinks] = useState<Record<string, string>>({}); // itemId -> url input

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      const id = session?.user?.id ?? null;
      setUserId(id);
      if (!id) navigate('/auth', { replace: true, state: { from: '/admin' } });
    });
    supabase.auth.getSession().then(({ data }) => {
      const id = data.session?.user?.id ?? null;
      setUserId(id);
      if (!id) navigate('/auth', { replace: true, state: { from: '/admin' } });
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      const { data } = await supabase.rpc('has_role', { _user_id: userId, _role: 'admin' });
      setIsAdmin(!!data);
      if (!data) navigate('/painel', { replace: true });
    })();
  }, [userId, navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      setLoading(true);
      // Pedidos (todos)
      const { data: pedidosData, error: pedidosErr } = await supabase
        .from('pedidos')
        .select('*')
        .order('created_at', { ascending: false });
      if (pedidosErr) console.error('Erro ao carregar pedidos', pedidosErr);
      const pedidos = pedidosData ?? [];
      setPedidos(pedidos as any);

      const orderIds = pedidos.map((p: any) => p.id);
      let itemsMap: Record<string, OrderItem[]> = {};
      let backlinkIds: string[] = [];
      if (orderIds.length) {
        const { data: items, error: itemsErr } = await supabase
          .from('order_items')
          .select('*')
          .in('order_id', orderIds);
        if (itemsErr) console.error('Erro ao carregar itens', itemsErr);
        (items ?? []).forEach((it: any) => {
          if (!itemsMap[it.order_id]) itemsMap[it.order_id] = [] as any;
          itemsMap[it.order_id].push(it);
        });
        backlinkIds = Array.from(new Set((items ?? []).map((i: any) => i.backlink_id)));
      }
      setItemsByOrder(itemsMap);

      if (backlinkIds.length) {
        const { data: backs } = await supabase
          .from('backlinks')
          .select('id, site_name, site_url')
          .in('id', backlinkIds);
        const map: Record<string, { name: string; url: string }> = {};
        (backs ?? []).forEach((b: any) => { map[b.id] = { name: b.site_name || b.site_url, url: b.site_url }; });
        setSiteMap(map);
      } else {
        setSiteMap({});
      }
      setLoading(false);
    })();
  }, [isAdmin]);

  const statusBadge = (s: string) => {
    if (s === 'published') return <Badge className="bg-green-600 text-white hover:bg-green-600">Publicado</Badge>;
    if (s === 'in_progress') return <Badge variant="secondary">Em progresso</Badge>;
    if (s === 'rejected') return <Badge variant="destructive">Rejeitado</Badge>;
    return <Badge variant="outline">Pendente</Badge>;
  };

  const setPublished = async (item: OrderItem) => {
    const url = (publinks[item.id] || '').trim();
    if (!url) return;
    const { error } = await supabase
      .from('order_items')
      .update({ publication_url: url, publication_status: 'published' })
      .eq('id', item.id);
    if (error) {
      console.error('Erro ao publicar', error);
      return;
    }
    // update local state
    setItemsByOrder((prev) => {
      const clone = { ...prev };
      const arr = clone[item.order_id]?.map((it) => it.id === item.id ? { ...it, publication_url: url, publication_status: 'published' } as OrderItem : it) || [];
      clone[item.order_id] = arr as OrderItem[];
      return clone;
    });
    setPublinks((p) => ({ ...p, [item.id]: '' }));
  };

  if (!userId || isAdmin === null) return null;

  return (
    <>
      <SEOHead
        title="Admin – Pedidos e Publicações | MK Art SEO"
        description="Painel admin para gerenciar pedidos e publicar links de backlinks."
        canonicalUrl={`${window.location.origin}/admin`}
        keywords="admin, pedidos, backlinks, publicação"
      />

      <main className="container mx-auto px-4 py-10 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold">Admin – Pedidos</h1>
          <Button variant="outline" onClick={() => supabase.auth.signOut()}>Sair</Button>
        </div>

        <section className="space-y-4">
          <div className="border rounded-md overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-accent/40">
                <tr className="text-left">
                  <th className="p-3">Pedido</th>
                  <th className="p-3">Cliente</th>
                  <th className="p-3">Contato</th>
                  <th className="p-3">Criado</th>
                  <th className="p-3">Total</th>
                  <th className="p-3">Pagamento</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td className="p-4" colSpan={6}>Carregando…</td></tr>
                ) : pedidos.length === 0 ? (
                  <tr><td className="p-4" colSpan={6}>Nenhum pedido.</td></tr>
                ) : (
                  pedidos.map((p) => (
                    <tr key={p.id} className="border-t align-top">
                      <td className="p-3">
                        <div className="font-mono text-xs break-all">{p.id}</div>
                        {p.abacate_url && (
                          <a className="text-primary hover:underline" href={p.abacate_url!} target="_blank" rel="noopener noreferrer">Cobrança</a>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="font-medium">{p.customer_name ?? '—'}</div>
                        <div className="text-muted-foreground text-xs">CPF: {p.customer_cpf ?? '—'}</div>
                      </td>
                      <td className="p-3 text-xs">
                        <div>{p.customer_email ?? '—'}</div>
                        <div>{p.customer_phone ?? '—'}</div>
                      </td>
                      <td className="p-3">{new Date(p.created_at).toLocaleString('pt-BR')}</td>
                      <td className="p-3">{(p.total_cents/100).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</td>
                      <td className="p-3"><Badge variant="secondary">{p.status}</Badge></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Itens e Publicações</h2>
          <div className="border rounded-md overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-accent/40">
                <tr className="text-left">
                  <th className="p-3">Pedido</th>
                  <th className="p-3">Site</th>
                  <th className="p-3">Âncora</th>
                  <th className="p-3">URL destino</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Publicação</th>
                  <th className="p-3">Ação</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(itemsByOrder).length === 0 ? (
                  <tr><td className="p-4" colSpan={7}>Sem itens.</td></tr>
                ) : (
                  Object.entries(itemsByOrder).flatMap(([orderId, arr]) => (
                    arr.map((it) => (
                      <tr key={it.id} className="border-t">
                        <td className="p-3 font-mono text-xs break-all">{orderId}</td>
                        <td className="p-3">
                          <div className="font-medium">{siteMap[it.backlink_id]?.name ?? it.backlink_id}</div>
                          {siteMap[it.backlink_id]?.url && (
                            <a href={siteMap[it.backlink_id]!.url} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">{siteMap[it.backlink_id]!.url}</a>
                          )}
                        </td>
                        <td className="p-3">{it.anchor_text ?? '—'}</td>
                        <td className="p-3">
                          {it.target_url ? (
                            <a href={it.target_url} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">{it.target_url}</a>
                          ) : '—'}
                        </td>
                        <td className="p-3">{statusBadge(it.publication_status)}</td>
                        <td className="p-3">
                          {it.publication_url ? (
                            <a href={it.publication_url} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Ver publicação</a>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Input
                              placeholder="https://…"
                              value={publinks[it.id] ?? ''}
                              onChange={(e) => setPublinks((p) => ({ ...p, [it.id]: e.target.value }))}
                              className="w-64"
                            />
                            <Button size="sm" onClick={() => setPublished(it)} disabled={!publinks[it.id]}>Publicar</Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </>
  );
}
