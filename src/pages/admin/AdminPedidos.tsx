import { useEffect, useState } from "react";
import SEOHead from "@/components/seo/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Pedido {
  id: string;
  user_id: string;
  status: string;
  total_cents: number;
  created_at: string;
}

interface PedidoPII {
  order_id: string;
  customer_email: string | null;
  customer_name: string | null;
  customer_cpf: string | null;
  customer_phone: string | null;
}

import { toast } from "@/hooks/use-toast";
export default function AdminPedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(false);
  const [piiByOrder, setPiiByOrder] = useState<Record<string, PedidoPII>>({});
  const [statusByOrder, setStatusByOrder] = useState<Record<string, string>>({});
  const [updating, setUpdating] = useState<Record<string, boolean>>({});

  const handleStatusChange = (orderId: string, newStatus: string) => {
    setStatusByOrder((prev) => ({ ...prev, [orderId]: newStatus }));
  };

  const handleSave = async (orderId: string) => {
    setUpdating((prev) => ({ ...prev, [orderId]: true }));
    try {
      const { error } = await supabase.functions.invoke("admin-update-order", {
        body: { order_id: orderId, status: statusByOrder[orderId] },
      });
      if (error) throw error;
      toast({ title: "Status atualizado!" });
      // refresh local state
      setPedidos((prev) =>
        prev.map((p) =>
          p.id === orderId ? { ...p, status: statusByOrder[orderId] } : p
        )
      );
    } catch (e) {
      console.error("Falha ao atualizar status", e);
      toast({ title: "Erro ao atualizar status", variant: "destructive" });
    } finally {
      setUpdating((prev) => ({ ...prev, [orderId]: false }));
    }
  };
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

      // Load PII snapshot for each order (admin only) - using secure edge function
      let piiMap: Record<string, PedidoPII> = {};
      if (orderIds.length) {
        try {
          const { data: piiResponse, error: piiErr } = await supabase.functions.invoke('get-pii-data', {
            body: { order_ids: orderIds }
          });
          
          if (piiErr) {
            console.error('Erro ao carregar dados PII via edge function', piiErr);
          } else if (piiResponse?.data) {
            piiResponse.data.forEach((record: any) => {
              piiMap[record.order_id] = record as PedidoPII;
            });
          }
        } catch (error) {
          console.error('Erro ao chamar função segura de PII', error);
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
                <th className="p-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="p-4" colSpan={7}>Carregando…</td></tr>
              ) : pedidos.length === 0 ? (
                <tr><td className="p-4" colSpan={7}>Nenhum pedido.</td></tr>
              ) : (
                pedidos.map((p) => (
                  <tr key={p.id} className="border-t align-top">
                    <td className="p-3">
                      <div className="font-mono text-xs break-all">{p.id}</div>
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
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Select
                          value={statusByOrder[p.id] ?? p.status}
                          onValueChange={(value) => handleStatusChange(p.id, value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pendente</SelectItem>
                            <SelectItem value="paid">Pago</SelectItem>
                            <SelectItem value="cancelled">Cancelado</SelectItem>
                            <SelectItem value="refunded">Reembolsado</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          size="sm"
                          onClick={() => handleSave(p.id)}
                          disabled={
                            updating[p.id] ||
                            !statusByOrder[p.id] ||
                            statusByOrder[p.id] === p.status
                          }
                        >
                          {updating[p.id] ? "Salvando..." : "Salvar"}
                        </Button>
                      </div>
                    </td>
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