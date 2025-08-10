import { useEffect, useMemo, useState } from "react";
import SEOHead from "@/components/seo/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

function PurchasesTable({ userId }: { userId: string }) {
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data, error } = await supabase
        .from('pedidos')
        .select('id, status, total_cents, created_at, abacate_url')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (mounted) {
        if (error) console.error('Erro pedidos', error);
        setRows(data ?? []);
      }
    })();
    return () => { mounted = false; };
  }, [userId]);

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
              <td className="p-3"><Badge variant="outline">N/A</Badge></td>
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
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      const id = session?.user?.id ?? null;
      setUserId(id);
      if (!id) navigate('/auth', { replace: true, state: { from: '/dashboard' } });
    });
    supabase.auth.getSession().then(({ data }) => {
      const id = data.session?.user?.id ?? null;
      setUserId(id);
      if (!id) navigate('/auth', { replace: true, state: { from: '/dashboard' } });
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  if (!userId) return null;

  return (
    <>
      <SEOHead
        title="Dashboard | MK Art SEO"
        description="Veja seus pedidos e favoritos."
        canonicalUrl={`${window.location.origin}/dashboard`}
        keywords="dashboard, pedidos, favoritos"
      />
      <main className="container mx-auto px-4 py-10 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold">Dashboard</h1>
          <Button variant="outline" onClick={() => supabase.auth.signOut()}>Sair</Button>
        </div>
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Pedidos</h2>
          <PurchasesTable userId={userId} />
        </section>
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Favoritos</h2>
          <FavoritesTable userId={userId} />
        </section>
      </main>
    </>
  );
}
