import { useEffect, useState } from "react";
import SEOHead from "@/components/seo/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

export default function AdminPublicacoes() {
  const [itemsByOrder, setItemsByOrder] = useState<Record<string, OrderItem[]>>({});
  const [siteMap, setSiteMap] = useState<Record<string, { name: string; url: string }>>({});
  const [loading, setLoading] = useState(false);
  const [publinks, setPublinks] = useState<Record<string, string>>({}); // itemId -> url input

  useEffect(() => {
    (async () => {
      setLoading(true);
      // Buscar todos os order items
      const { data: items, error: itemsErr } = await supabase
        .from('order_items')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (itemsErr) console.error('Erro ao carregar itens', itemsErr);
      
      let itemsMap: Record<string, OrderItem[]> = {};
      const backlinkIds = Array.from(new Set((items ?? []).map((i: any) => i.backlink_id)));
      
      (items ?? []).forEach((it: any) => {
        if (!itemsMap[it.order_id]) itemsMap[it.order_id] = [] as any;
        itemsMap[it.order_id].push(it);
      });
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
  }, []);

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

  return (
    <>
      <SEOHead
        title="Admin – Publicações | MK Art SEO"
        description="Painel admin para gerenciar publicações de backlinks."
        canonicalUrl={`${window.location.origin}/admin/publicacoes`}
        keywords="admin, publicações, backlinks"
      />

      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Itens e Publicações</h2>
        
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
              {loading ? (
                <tr><td className="p-4" colSpan={7}>Carregando…</td></tr>
              ) : Object.keys(itemsByOrder).length === 0 ? (
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
      </div>
    </>
  );
}