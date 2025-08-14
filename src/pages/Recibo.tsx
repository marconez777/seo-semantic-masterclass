import { useEffect, useMemo, useState } from "react";
import SEOHead from "@/components/seo/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import { useParams, Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

export default function Recibo() {
  const { orderId } = useParams();
  const [order, setOrder] = useState<any | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [siteMap, setSiteMap] = useState<Record<string, { name: string; url: string }>>({});
  const [pii, setPii] = useState<any | null>(null);

  useEffect(() => {
    if (!orderId) return;
    let mounted = true;
    (async () => {
      const { data: pedido } = await supabase
        .from('pedidos')
        .select('*')
        .eq('id', orderId)
        .maybeSingle();
      if (!pedido) return;
      const { data: it } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);
      // Load PII data using secure edge function
      try {
        const { data: piiResponse, error: piiErr } = await supabase.functions.invoke('get-pii-data', {
          body: { single_order_id: orderId }
        });
        
        if (piiErr) {
          console.error('Erro ao carregar dados PII via edge function', piiErr);
        } else if (piiResponse?.data && piiResponse.data.length > 0) {
          setPii(piiResponse.data[0]);
        }
      } catch (error) {
        console.error('Erro ao chamar função segura de PII', error);
      }
      const backlinkIds = Array.from(new Set((it ?? []).map((i) => i.backlink_id)));
      let m: Record<string, { name: string; url: string }> = {};
      if (backlinkIds.length) {
        const { data: backs } = await supabase
          .from('backlinks')
          .select('id, site_name, site_url')
          .in('id', backlinkIds);
        (backs ?? []).forEach((b) => { m[b.id] = { name: b.site_name, url: b.site_url }; });
      }
      if (mounted) { setOrder(pedido); setItems(it ?? []); setSiteMap(m); }
    })();
    return () => { mounted = false; };
  }, [orderId]);

  const total = useMemo(() => (items.reduce((acc, i) => acc + i.price_cents * i.quantity, 0) / 100), [items]);

  if (!order) return null;

  return (
    <>
      <SEOHead
        title={`Recibo do Pedido ${order.id} | MK Art SEO`}
        description={`Recibo do pedido realizado em ${new Date(order.created_at).toLocaleString('pt-BR')}`}
        canonicalUrl={`${window.location.origin}/recibo/${order.id}`}
        keywords="recibo, pedido, pagamento"
      />
      <main className="container mx-auto px-4 py-10 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Recibo do Pedido</h1>
          <Badge variant={order.status === 'paid' ? 'paid' : 'pending'}>
            {order.status === 'paid' ? 'Pago' : 'Pendente'}
          </Badge>
        </div>
        <div className="border rounded-md p-4 bg-card">
          <div className="grid gap-2 sm:grid-cols-2">
            <p><strong>Nº do pedido:</strong> {order.id}</p>
            <p><strong>Data/hora:</strong> {new Date(order.created_at).toLocaleString('pt-BR')}</p>
            <p><strong>Cliente:</strong> {pii?.customer_name ?? '—'}</p>
            <p><strong>E-mail:</strong> {pii?.customer_email ?? '—'}</p>
          </div>
        </div>

        <div className="border rounded-md bg-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/60">
              <tr className="text-left">
                <th className="p-3 uppercase font-bold tracking-wide">Site</th>
                <th className="p-3 uppercase font-bold tracking-wide">Âncora</th>
                <th className="p-3 uppercase font-bold tracking-wide">URL destino</th>
                <th className="p-3 uppercase font-bold tracking-wide">Qtd</th>
                <th className="p-3 uppercase font-bold tracking-wide">Preço</th>
              </tr>
            </thead>
            <tbody>
              {items.map((i) => (
                <tr key={i.id} className="border-t">
                  <td className="p-3">{siteMap[i.backlink_id]?.name ?? i.backlink_id}</td>
                  <td className="p-3">{i.anchor_text ?? '—'}</td>
                  <td className="p-3">{i.target_url ?? '—'}</td>
                  <td className="p-3">{i.quantity}</td>
                  <td className="p-3">{(i.price_cents/100).toLocaleString('pt-BR',{ style:'currency', currency:'BRL' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end">
          <div className="text-right">
            <p className="text-lg font-semibold">Total: {total.toLocaleString('pt-BR',{ style:'currency', currency:'BRL' })}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <Link to="/painel" className="underline text-primary">Voltar ao painel</Link>
          <button onClick={() => window.print()} className="underline text-primary">Imprimir</button>
        </div>
      </main>
    </>
  );
}
