import { useEffect, useMemo, useState } from "react";
import SEOHead from "@/components/seo/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
function PurchasesTable({ userId }: { userId: string }) {
  const [rows, setRows] = useState<any[]>([]);
  const [pubSummary, setPubSummary] = useState<Record<string, { total: number; published: number; inProgress: number; rejected: number }>>({});

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

      // compute publication summary per order
      const orderIds = pedidos.map((p) => p.id);
      let summary: Record<string, { total: number; published: number; inProgress: number; rejected: number }> = {};
      if (orderIds.length) {
        const { data: items, error: itemsErr } = await supabase
          .from('order_items')
          .select('order_id, publication_status')
          .in('order_id', orderIds);
        if (itemsErr) console.error('Erro order_items', itemsErr);
        (items ?? []).forEach((it) => {
          const k = it.order_id;
          if (!summary[k]) summary[k] = { total: 0, published: 0, inProgress: 0, rejected: 0 };
          summary[k].total += 1;
          if (it.publication_status === 'published') summary[k].published += 1;
          else if (it.publication_status === 'in_progress') summary[k].inProgress += 1;
          else if (it.publication_status === 'rejected') summary[k].rejected += 1;
        });
      }

      if (mounted) {
        setRows(pedidos);
        setPubSummary(summary);
      }
    })();
    return () => { mounted = false; };
  }, [userId]);

  const renderPubBadge = (orderId: string) => {
    const s = pubSummary[orderId];
    if (!s || s.total === 0) return <Badge variant="outline">—</Badge>;
    if (s.published === s.total) return <Badge className="bg-green-600 text-white hover:bg-green-600">Publicados</Badge>;
    if (s.rejected > 0) return <Badge variant="destructive">Rejeitado</Badge>;
    if (s.inProgress > 0) return <Badge variant="secondary">Em progresso</Badge>;
    return <Badge variant="secondary">Pendente</Badge>;
  };

  return (
    <div className="border rounded-md overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-accent/40">
          <tr className="text-left">
            <th className="p-3">Pedido</th>
            <th className="p-3">Criado em</th>
            <th className="p-3">Total</th>
            <th className="p-3">Pagamento</th>
            <th className="p-3">Publicação</th>
            <th className="p-3">Ações</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td className="p-4" colSpan={6}>Nenhum pedido.</td></tr>
          ) : rows.map((r) => (
            <tr key={r.id} className="border-t">
              <td className="p-3">{r.id}</td>
              <td className="p-3">{new Date(r.created_at).toLocaleString('pt-BR')}</td>
              <td className="p-3">{(r.total_cents/100).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</td>
              <td className="p-3"><Badge variant="secondary">{r.status}</Badge></td>
              <td className="p-3">{renderPubBadge(r.id)}</td>
              <td className="p-3">
                {r.abacate_url ? (
                  <a className="text-primary hover:underline" href={r.abacate_url} target="_blank" rel="noopener noreferrer">Ver cobrança</a>
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
    if (s === 'published') return <Badge className="bg-green-600 text-white hover:bg-green-600">Publicado</Badge>;
    if (s === 'in_progress') return <Badge variant="secondary">Em progresso</Badge>;
    if (s === 'rejected') return <Badge variant="destructive">Rejeitado</Badge>;
    return <Badge variant="outline">Pendente</Badge>;
  }

  return (
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
                  <a href={r.target_url} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                    {r.target_url}
                  </a>
                ) : '—'}
              </td>
              <td className="p-3">{statusBadge(r.publication_status)}</td>
              <td className="p-3">
                {r.publication_url ? (
                  <a href={r.publication_url} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
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
    <div className="border rounded-md overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-accent/40">
          <tr className="text-left">
            <th className="p-3">Site</th>
            <th className="p-3">Adicionado</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td className="p-4" colSpan={2}>Sem favoritos.</td></tr>
          ) : rows.map((r) => (
            <tr key={r.id} className="border-t">
              <td className="p-3">{r.site ?? r.backlink_id}</td>
              <td className="p-3">{new Date(r.created_at).toLocaleString('pt-BR')}</td>
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

  if (!userId) return null;

  return (
    <>
      <SEOHead
        title="Painel | MK Art SEO"
        description="Veja seus pedidos e favoritos."
        canonicalUrl={`${window.location.origin}/painel`}
        keywords="dashboard, pedidos, favoritos"
      />
      <main className="container mx-auto px-4 py-10 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold">Painel</h1>
          <Button variant="outline" onClick={() => supabase.auth.signOut()}>Sair</Button>
        </div>
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Pedidos</h2>
          <PurchasesTable userId={userId} />
        </section>
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Publicações</h2>
          <PublicationsTable userId={userId} />
        </section>
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Favoritos</h2>
          <FavoritesTable userId={userId} />
        </section>
      </main>
    </>
  );
}
