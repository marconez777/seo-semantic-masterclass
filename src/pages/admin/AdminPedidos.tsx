import { useEffect, useState } from "react";
import SEOHead from "@/components/seo/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

interface Pedido {
  id: string;
  user_id: string;
  status: string;
  total_cents: number;
  created_at: string;
  abacate_url: string | null;
}

interface PedidoPII {
  order_id: string;
  customer_email: string | null;
  customer_name: string | null;
  customer_cpf: string | null;
  customer_phone: string | null;
}

export default function AdminPedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(false);
  const [piiByOrder, setPiiByOrder] = useState<Record<string, PedidoPII>>({});

  useEffect(() => {
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

      // Load PII snapshot for each order (admin only) - now using decryption
      let piiMap: Record<string, PedidoPII> = {};
      if (orderIds.length) {
        const { data: piiList, error: piiErr } = await supabase
          .from('pedidos_pii')
          .select('order_id, customer_email, customer_name, customer_cpf, customer_phone')
          .in('order_id', orderIds);
        if (piiErr) console.error('Erro ao carregar dados PII', piiErr);
        
        // Decrypt the PII data for admin view
        for (const record of piiList ?? []) {
          const decryptedRecord = { ...record };
          
          // Decrypt each field if it exists
          if (record.customer_email) {
            const { data: decryptedEmail } = await supabase.rpc('decrypt_pii', { encrypted_data: record.customer_email });
            decryptedRecord.customer_email = decryptedEmail;
          }
          if (record.customer_name) {
            const { data: decryptedName } = await supabase.rpc('decrypt_pii', { encrypted_data: record.customer_name });
            decryptedRecord.customer_name = decryptedName;
          }
          if (record.customer_cpf) {
            const { data: decryptedCpf } = await supabase.rpc('decrypt_pii', { encrypted_data: record.customer_cpf });
            decryptedRecord.customer_cpf = decryptedCpf;
          }
          if (record.customer_phone) {
            const { data: decryptedPhone } = await supabase.rpc('decrypt_pii', { encrypted_data: record.customer_phone });
            decryptedRecord.customer_phone = decryptedPhone;
          }
          
          piiMap[record.order_id] = decryptedRecord as PedidoPII;
        }
      }
      setPiiByOrder(piiMap);
      setLoading(false);
    })();
  }, []);

  return (
    <>
      <SEOHead
        title="Admin – Pedidos | MK Art SEO"
        description="Painel admin para gerenciar pedidos."
        canonicalUrl={`${window.location.origin}/admin`}
        keywords="admin, pedidos"
      />

      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Pedidos</h2>
        
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
                      {(() => { const pii = piiByOrder[p.id]; return (
                        <>
                          <div className="font-medium">{pii?.customer_name ?? '—'}</div>
                          <div className="text-muted-foreground text-xs">CPF: {pii?.customer_cpf ?? '—'}</div>
                        </>
                      ); })()}
                    </td>
                    <td className="p-3 text-xs">
                      {(() => { const pii = piiByOrder[p.id]; return (
                        <>
                          <div>{pii?.customer_email ?? '—'}</div>
                          <div>{pii?.customer_phone ?? '—'}</div>
                        </>
                      ); })()}
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
      </div>
    </>
  );
}